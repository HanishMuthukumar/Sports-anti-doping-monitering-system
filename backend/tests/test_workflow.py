import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, Role
from athletes.models import Athlete
from officers.models import DopingControlOfficer
from laboratories.models import Laboratory, LaboratoryStaff
from doping_tests.models import DopingTest, TestStatus, TestType
from samples.models import Sample, SampleStatus, SampleType
from laboratory_results.models import LaboratoryResult, ResultStatus
from violations.models import Violation, ViolationStatus
from notifications.models import Notification


@pytest.fixture
def api_client():
    return APIClient()


def auth_client(api_client, user):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


@pytest.mark.django_db
class TestEndToEndWorkflow:
    def test_complete_12_step_doping_control_workflow(self, api_client):
        # -------------------------------------------------------------
        # STEP 1: Create Administrator and setup actors
        # -------------------------------------------------------------
        admin_user = User.objects.create_superuser(
            email='admin@wada.org',
            username='admin_wada',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='Officer',
        )

        officer_user = User.objects.create(
            email='officer@nadc.org',
            username='officer_nadc',
            role=Role.DOPING_CONTROL_OFFICER,
            first_name='John',
            last_name='Collector',
        )
        officer_user.set_password('OfficerPass123!')
        officer_user.save()
        officer = DopingControlOfficer.objects.create(
            user=officer_user,
            officer_id='DCO-WF-001',
            certification_number='WADA-CERT-999',
            organization='National Anti-Doping Org',
        )

        athlete_user = User.objects.create(
            email='athlete@track.org',
            username='athlete_track',
            role=Role.ATHLETE,
            first_name='Sarah',
            last_name='Runner',
        )
        athlete_user.set_password('AthletePass123!')
        athlete_user.save()
        athlete = Athlete.objects.create(
            user=athlete_user,
            athlete_id='ATH-WF-001',
            sport='Athletics 100m',
            nationality='Canada',
        )

        lab = Laboratory.objects.create(
            laboratory_name='Olympic Analytical Centre',
            accreditation_number='WADA-LAB-888',
            city='Montreal',
            country='Canada',
        )
        lab_user = User.objects.create(
            email='analyst@lab.org',
            username='analyst_lab',
            role=Role.LABORATORY_STAFF,
            first_name='Dr. Pierre',
            last_name='Curie',
        )
        lab_user.set_password('LabPass123!')
        lab_user.save()
        lab_staff = LaboratoryStaff.objects.create(
            user=lab_user,
            laboratory=lab,
            staff_id='STF-888-01',
        )

        authority_user = User.objects.create(
            email='review@authority.org',
            username='authority_head',
            role=Role.SPORTS_AUTHORITY,
            first_name='Elena',
            last_name='Vance',
        )
        authority_user.set_password('AuthorityPass123!')
        authority_user.save()

        # -------------------------------------------------------------
        # STEP 2: Officer schedules a doping test for the athlete
        # -------------------------------------------------------------
        officer_client = auth_client(api_client, officer_user)
        test_payload = {
            'athlete': str(athlete.id),
            'scheduled_date': '2026-10-15',
            'test_type': TestType.IN_COMPETITION,
            'location': 'Olympic Stadium, Montreal',
            'reason': 'Finals testing protocol',
        }
        test_resp = officer_client.post('/api/tests/', test_payload)
        assert test_resp.status_code == 201
        test_data = test_resp.json()
        test_id = test_data['id']
        assert test_data['status'] == TestStatus.SCHEDULED

        # Athlete received notification
        assert Notification.objects.filter(user=athlete_user, related_object_id=test_id).exists()

        # -------------------------------------------------------------
        # STEP 3: Officer collects sample
        # -------------------------------------------------------------
        sample_payload = {
            'doping_test': test_id,
            'sample_type': SampleType.URINE,
            'collection_date': '2026-10-15',
            'chain_of_custody_notes': 'A and B samples collected under direct observation',
        }
        sample_resp = officer_client.post('/api/samples/', sample_payload)
        assert sample_resp.status_code == 201
        sample_data = sample_resp.json()
        sample_id = sample_data['id']
        assert sample_data['status'] == SampleStatus.COLLECTED

        # Doping test automatically transitioned to SAMPLE_COLLECTED
        doping_test = DopingTest.objects.get(id=test_id)
        assert doping_test.status == TestStatus.SAMPLE_COLLECTED

        # -------------------------------------------------------------
        # STEP 4: Officer submits sample to courier/lab
        # -------------------------------------------------------------
        trans_resp = officer_client.post(f'/api/samples/{sample_id}/transition/', {
            'status': SampleStatus.SUBMITTED,
            'notes': 'Handed to secure courier service tracking #12345',
        })
        assert trans_resp.status_code == 200
        sample_1 = Sample.objects.get(id=sample_id)
        assert sample_1.status == SampleStatus.SUBMITTED
        assert sample_1.submitted_at is not None

        # -------------------------------------------------------------
        # STEP 5: Laboratory receives sample
        # -------------------------------------------------------------
        lab_client = auth_client(api_client, lab_user)
        recv_resp = lab_client.post(f'/api/samples/{sample_id}/transition/', {
            'status': SampleStatus.RECEIVED,
            'notes': 'Intact security seals verified upon arrival',
            'received_by': str(lab_staff.id),
        })
        assert recv_resp.status_code == 200
        sample_1.refresh_from_db()
        assert sample_1.status == SampleStatus.RECEIVED
        assert sample_1.received_at is not None

        # -------------------------------------------------------------
        # STEP 6: Laboratory starts analysis
        # -------------------------------------------------------------
        start_resp = lab_client.post(f'/api/samples/{sample_id}/transition/', {
            'status': SampleStatus.UNDER_ANALYSIS,
            'notes': 'Sample prepared for GC-MS and LC-MS screening',
        })
        assert start_resp.status_code == 200
        sample_1.refresh_from_db()
        assert sample_1.status == SampleStatus.UNDER_ANALYSIS
        doping_test.refresh_from_db()
        assert doping_test.status == TestStatus.UNDER_ANALYSIS

        # -------------------------------------------------------------
        # STEP 7: Laboratory creates NEGATIVE result
        # -------------------------------------------------------------
        res_payload = {
            'sample': sample_id,
            'result_status': ResultStatus.NEGATIVE,
            'test_method': 'GC-MS / LC-MS Screen',
            'findings': 'No prohibited substances found.',
            'comments': 'All parameters within reference ranges.',
            'report_reference': 'LAB-REP-NEG-001',
        }
        neg_res_resp = lab_client.post('/api/results/', res_payload)
        assert neg_res_resp.status_code == 201

        sample_1.refresh_from_db()
        assert sample_1.status == SampleStatus.ANALYZED
        doping_test.refresh_from_db()
        assert doping_test.status == TestStatus.COMPLETED

        # Verify negative result produced NO violations
        assert not Violation.objects.filter(sample=sample_1).exists()

        # -------------------------------------------------------------
        # STEP 8: Create second test and sample for POSITIVE result test
        # -------------------------------------------------------------
        test_2 = DopingTest.objects.create(
            athlete=athlete,
            officer=officer,
            scheduled_date='2026-10-18',
            test_type=TestType.TARGETED,
            location='Montreal Training Center',
        )
        sample_2 = Sample.objects.create(
            doping_test=test_2,
            sample_type=SampleType.BLOOD,
            collection_date='2026-10-18',
            collected_by=officer_user,
            status=SampleStatus.UNDER_ANALYSIS,
        )

        # -------------------------------------------------------------
        # STEP 9: Laboratory creates POSITIVE result -> Atomic Violation
        # -------------------------------------------------------------
        pos_payload = {
            'sample': str(sample_2.id),
            'result_status': ResultStatus.POSITIVE,
            'test_method': 'HR-MS Isotope Ratio',
            'findings': 'Adverse analytical finding: Exogenous Testosterone metabolites detected.',
            'comments': 'Confirmed with secondary analytical column.',
            'report_reference': 'LAB-REP-POS-999',
        }
        pos_res_resp = lab_client.post('/api/results/', pos_payload)
        assert pos_res_resp.status_code == 201

        # Verify exactly one violation created
        violations = Violation.objects.filter(sample=sample_2)
        assert violations.count() == 1
        violation = violations.first()
        assert violation.athlete == athlete
        assert violation.doping_test == test_2
        assert violation.status == ViolationStatus.OPEN
        assert violation.laboratory_result is not None

        # Verify notifications sent to athlete and authority
        assert Notification.objects.filter(
            user=athlete_user,
            related_object_id=str(violation.id)
        ).exists()
        assert Notification.objects.filter(
            user=authority_user,
            related_object_id=str(violation.id)
        ).exists()

        # -------------------------------------------------------------
        # STEP 10: Sports Authority reviews violation
        # OPEN -> UNDER_REVIEW -> ACTION_TAKEN -> CLOSED
        # -------------------------------------------------------------
        auth_client_inst = auth_client(api_client, authority_user)
        v_url = f'/api/violations/{violation.id}/review/'

        # Transition 1: OPEN -> UNDER_REVIEW
        rev_resp1 = auth_client_inst.post(v_url, {
            'status': ViolationStatus.UNDER_REVIEW,
            'remarks': 'Case opened for initial legal and biological passport review',
        })
        assert rev_resp1.status_code == 200
        violation.refresh_from_db()
        assert violation.status == ViolationStatus.UNDER_REVIEW
        assert violation.reviewed_by == authority_user
        assert violation.reviewed_at is not None

        # Transition 2: UNDER_REVIEW -> ACTION_TAKEN
        rev_resp2 = auth_client_inst.post(v_url, {
            'status': ViolationStatus.ACTION_TAKEN,
            'remarks': 'Hearing panel concluded. Provisional suspension issued.',
            'action_taken': 'Provisional 2-year suspension imposed under WADA Code 2.1.',
            'action_date': '2026-10-25',
        })
        assert rev_resp2.status_code == 200
        violation.refresh_from_db()
        assert violation.status == ViolationStatus.ACTION_TAKEN
        assert 'Provisional 2-year suspension' in violation.action_taken

        # Transition 3: ACTION_TAKEN -> CLOSED
        rev_resp3 = auth_client_inst.post(v_url, {
            'status': ViolationStatus.CLOSED,
            'remarks': 'Appeal window lapsed. Sanction finalized.',
        })
        assert rev_resp3.status_code == 200
        violation.refresh_from_db()
        assert violation.status == ViolationStatus.CLOSED

        # -------------------------------------------------------------
        # STEP 11: INVALID result workflow
        # -------------------------------------------------------------
        sample_3 = Sample.objects.create(
            doping_test=test_2,
            sample_type=SampleType.URINE,
            collection_date='2026-10-20',
            status=SampleStatus.UNDER_ANALYSIS,
        )
        inv_resp = lab_client.post('/api/results/', {
            'sample': str(sample_3.id),
            'result_status': ResultStatus.INVALID,
            'test_method': 'Specific Gravity',
            'findings': 'Sample dilute, specific gravity below minimum valid threshold.',
            'comments': 'Retest required.',
        })
        assert inv_resp.status_code == 201
        sample_3.refresh_from_db()
        assert sample_3.status == SampleStatus.INVALID
        # No automatic violation on invalid
        assert not Violation.objects.filter(sample=sample_3).exists()

        # -------------------------------------------------------------
        # STEP 12: INCONCLUSIVE result workflow
        # -------------------------------------------------------------
        sample_4 = Sample.objects.create(
            doping_test=test_2,
            sample_type=SampleType.BLOOD,
            collection_date='2026-10-22',
            status=SampleStatus.UNDER_ANALYSIS,
        )
        inconc_resp = lab_client.post('/api/results/', {
            'sample': str(sample_4.id),
            'result_status': ResultStatus.INCONCLUSIVE,
            'test_method': 'Atypical finding panel',
            'findings': 'Atypical parameter elevation requiring long-term monitoring.',
            'comments': 'Does not constitute positive at this threshold.',
        })
        assert inconc_resp.status_code == 201
        # No automatic violation on inconclusive
        assert not Violation.objects.filter(sample=sample_4).exists()
        # Authority was notified for review
        assert Notification.objects.filter(user=authority_user, title__icontains='Inconclusive').exists()
