import pytest
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, Role
from athletes.models import Athlete
from officers.models import DopingControlOfficer
from doping_tests.models import DopingTest, TestStatus, TestType
from samples.models import Sample, SampleStatus, SampleType
from violations.models import Violation, ViolationStatus


@pytest.fixture
def test_setup(db):
    user_a = User.objects.create(email='athlete@sm.org', username='athlete_sm', role=Role.ATHLETE)
    user_o = User.objects.create(email='officer@sm.org', username='officer_sm', role=Role.DOPING_CONTROL_OFFICER)
    user_auth = User.objects.create(email='auth@sm.org', username='auth_sm', role=Role.SPORTS_AUTHORITY)

    athlete = Athlete.objects.create(user=user_a, athlete_id='ATH-SM-1', sport='Cycling')
    officer = DopingControlOfficer.objects.create(user=user_o, officer_id='DCO-SM-1')

    test = DopingTest.objects.create(
        athlete=athlete,
        officer=officer,
        scheduled_date='2026-11-01',
        test_type=TestType.OUT_OF_COMPETITION,
        location='Velodrome',
        status=TestStatus.COMPLETED,
    )

    sample = Sample.objects.create(
        doping_test=test,
        sample_type=SampleType.URINE,
        collection_date='2026-11-01',
        status=SampleStatus.ANALYZED,
    )

    violation = Violation.objects.create(
        athlete=athlete,
        doping_test=test,
        sample=sample,
        status=ViolationStatus.CLOSED,
    )

    return {
        'athlete_user': user_a,
        'officer_user': user_o,
        'authority_user': user_auth,
        'test': test,
        'sample': sample,
        'violation': violation,
    }


@pytest.mark.django_db
class TestInvalidStateTransitions:
    def test_invalid_doping_test_transition_model(self, test_setup):
        test = test_setup['test']
        assert test.status == TestStatus.COMPLETED

        # Attempting COMPLETED -> SAMPLE_COLLECTED must raise ValidationError
        with pytest.raises(ValidationError):
            test.transition_status(TestStatus.SAMPLE_COLLECTED)

    def test_invalid_doping_test_transition_api(self, test_setup):
        api_client = APIClient()
        token = str(RefreshToken.for_user(test_setup['officer_user']).access_token)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        test = test_setup['test']
        resp = api_client.post(f'/api/tests/{test.id}/update-status/', {
            'status': TestStatus.SAMPLE_COLLECTED,
        })
        assert resp.status_code == 400
        assert 'Cannot transition' in str(resp.json())

    def test_invalid_sample_transition_model(self, test_setup):
        sample = test_setup['sample']
        assert sample.status == SampleStatus.ANALYZED

        # Attempting ANALYZED -> COLLECTED must raise ValidationError
        with pytest.raises(ValidationError):
            sample.transition_status(SampleStatus.COLLECTED)

    def test_invalid_sample_transition_api(self, test_setup):
        api_client = APIClient()
        token = str(RefreshToken.for_user(test_setup['officer_user']).access_token)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        sample = test_setup['sample']
        resp = api_client.post(f'/api/samples/{sample.id}/transition/', {
            'status': SampleStatus.COLLECTED,
        })
        assert resp.status_code == 400
        assert 'Cannot transition' in str(resp.json())

    def test_invalid_violation_transition_model(self, test_setup):
        violation = test_setup['violation']
        assert violation.status == ViolationStatus.CLOSED

        # Attempting CLOSED -> OPEN must raise ValidationError
        with pytest.raises(ValidationError):
            violation.transition_status(ViolationStatus.OPEN)

    def test_invalid_violation_transition_api(self, test_setup):
        api_client = APIClient()
        token = str(RefreshToken.for_user(test_setup['authority_user']).access_token)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        violation = test_setup['violation']
        resp = api_client.post(f'/api/violations/{violation.id}/review/', {
            'status': ViolationStatus.OPEN,
        })
        assert resp.status_code == 400
        assert 'Cannot transition' in str(resp.json())
