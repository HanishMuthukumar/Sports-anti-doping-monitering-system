import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, Role
from athletes.models import Athlete
from officers.models import DopingControlOfficer
from doping_tests.models import DopingTest, TestStatus, TestType


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_users(db):
    def make_user(email, role):
        u = User.objects.create(
            email=email,
            username=email.split('@')[0],
            first_name='Role',
            last_name=role,
            role=role,
        )
        u.set_password('Password@123')
        u.save()
        return u

    admin = make_user('admin@test.sadms', Role.ADMINISTRATOR)
    athlete_u1 = make_user('athlete1@test.sadms', Role.ATHLETE)
    athlete_u2 = make_user('athlete2@test.sadms', Role.ATHLETE)
    officer_u = make_user('officer@test.sadms', Role.DOPING_CONTROL_OFFICER)
    lab_u = make_user('lab@test.sadms', Role.LABORATORY_STAFF)
    authority_u = make_user('authority@test.sadms', Role.SPORTS_AUTHORITY)

    a1 = Athlete.objects.create(user=athlete_u1, athlete_id='ATH-T01', sport='Track')
    a2 = Athlete.objects.create(user=athlete_u2, athlete_id='ATH-T02', sport='Swimming')
    off = DopingControlOfficer.objects.create(user=officer_u, officer_id='DCO-T01')

    t1 = DopingTest.objects.create(
        athlete=a1,
        officer=off,
        scheduled_date='2026-10-01',
        test_type=TestType.IN_COMPETITION,
        location='Stadium A',
    )
    t2 = DopingTest.objects.create(
        athlete=a2,
        officer=off,
        scheduled_date='2026-10-02',
        test_type=TestType.OUT_OF_COMPETITION,
        location='Aquatics Center',
    )

    return {
        'admin': admin,
        'athlete1': athlete_u1,
        'athlete2': athlete_u2,
        'officer': officer_u,
        'lab': lab_u,
        'authority': authority_u,
        'test1': t1,
        'test2': t2,
    }


def auth_client(api_client, user):
    token = str(RefreshToken.for_user(user).access_token)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client


@pytest.mark.django_db
class TestRoleAuthorization:
    def test_athlete_sees_only_own_tests(self, api_client, auth_users):
        client = auth_client(api_client, auth_users['athlete1'])
        resp = client.get('/api/tests/')
        assert resp.status_code == 200
        payload = resp.json()
        items = payload.get('results', payload) if isinstance(payload, dict) else payload
        test_ids = [item['id'] for item in items]
        assert str(auth_users['test1'].id) in test_ids
        assert str(auth_users['test2'].id) not in test_ids

    def test_athlete_cannot_create_user(self, api_client, auth_users):
        client = auth_client(api_client, auth_users['athlete1'])
        resp = client.post('/api/users/', {
            'email': 'hacker@test.com',
            'username': 'hacker',
            'first_name': 'Hacker',
            'last_name': 'Man',
            'password': 'Password@123',
            'password_confirm': 'Password@123',
            'role': Role.ADMINISTRATOR,
        })
        assert resp.status_code == 403

    def test_athlete_cannot_create_doping_test(self, api_client, auth_users):
        client = auth_client(api_client, auth_users['athlete1'])
        resp = client.post('/api/tests/', {
            'athlete': str(auth_users['athlete1'].athlete_profile.id),
            'scheduled_date': '2026-10-10',
            'test_type': TestType.IN_COMPETITION,
            'location': 'Gym',
        })
        assert resp.status_code == 403

    def test_officer_can_schedule_test(self, api_client, auth_users):
        client = auth_client(api_client, auth_users['officer'])
        resp = client.post('/api/tests/', {
            'athlete': str(auth_users['athlete1'].athlete_profile.id),
            'scheduled_date': '2026-10-15',
            'test_type': TestType.TARGETED,
            'location': 'Training Camp',
        })
        assert resp.status_code == 201

    def test_admin_has_full_access(self, api_client, auth_users):
        client = auth_client(api_client, auth_users['admin'])
        resp_users = client.get('/api/users/')
        assert resp_users.status_code == 200
        resp_tests = client.get('/api/tests/')
        assert resp_tests.status_code == 200
        count = resp_tests.json().get('count', len(resp_tests.json())) if isinstance(resp_tests.json(), dict) else len(resp_tests.json())
        assert count >= 2
