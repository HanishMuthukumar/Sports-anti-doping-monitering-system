import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from accounts.models import User, Role


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user(db):
    user = User.objects.create(
        email='testuser@demo.sadms',
        username='testuser',
        first_name='Test',
        last_name='User',
        role=Role.ATHLETE,
    )
    user.set_password('Password@123')
    user.save()
    return user


@pytest.mark.django_db
class TestAuthentication:
    def test_health_check(self, api_client):
        response = api_client.get('/api/health/')
        assert response.status_code == 200
        assert response.json() == {'status': 'ok'}

    def test_login_success(self, api_client, test_user):
        response = api_client.post('/api/auth/login/', {
            'email': 'testuser@demo.sadms',
            'password': 'Password@123',
        })
        assert response.status_code == 200
        data = response.json()
        assert 'access' in data
        assert 'refresh' in data
        assert data['user']['email'] == 'testuser@demo.sadms'
        assert data['user']['role'] == Role.ATHLETE

    def test_login_invalid_password(self, api_client, test_user):
        response = api_client.post('/api/auth/login/', {
            'email': 'testuser@demo.sadms',
            'password': 'WrongPassword',
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, api_client, db):
        response = api_client.post('/api/auth/login/', {
            'email': 'nobody@demo.sadms',
            'password': 'Password@123',
        })
        assert response.status_code == 401

    def test_me_authenticated(self, api_client, test_user):
        login_resp = api_client.post('/api/auth/login/', {
            'email': 'testuser@demo.sadms',
            'password': 'Password@123',
        })
        token = login_resp.json()['access']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = api_client.get('/api/auth/me/')
        assert response.status_code == 200
        assert response.json()['email'] == 'testuser@demo.sadms'

    def test_me_unauthenticated(self, api_client):
        response = api_client.get('/api/auth/me/')
        assert response.status_code == 401

    def test_refresh_token(self, api_client, test_user):
        login_resp = api_client.post('/api/auth/login/', {
            'email': 'testuser@demo.sadms',
            'password': 'Password@123',
        })
        refresh_token = login_resp.json()['refresh']

        response = api_client.post('/api/auth/refresh/', {
            'refresh': refresh_token,
        })
        assert response.status_code == 200
        assert 'access' in response.json()

    def test_logout_blacklists_token(self, api_client, test_user):
        login_resp = api_client.post('/api/auth/login/', {
            'email': 'testuser@demo.sadms',
            'password': 'Password@123',
        })
        access_token = login_resp.json()['access']
        refresh_token = login_resp.json()['refresh']

        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_resp = api_client.post('/api/auth/logout/', {
            'refresh': refresh_token,
        })
        assert logout_resp.status_code == 200

        # Attempt to refresh using blacklisted token must fail
        refresh_resp = api_client.post('/api/auth/refresh/', {
            'refresh': refresh_token,
        })
        assert refresh_resp.status_code == 401
