"""Report and analytics views with real database queries and CSV export."""
import csv
from datetime import datetime
from django.http import HttpResponse
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import User, Role
from athletes.models import Athlete
from officers.models import DopingControlOfficer
from laboratories.models import Laboratory, LaboratoryStaff
from doping_tests.models import DopingTest, TestStatus
from samples.models import Sample, SampleStatus
from laboratory_results.models import LaboratoryResult, ResultStatus
from violations.models import Violation, ViolationStatus
from accounts.permissions import IsAdministrator, IsSportsAuthority, IsAdminOrAuthority
from .models import Report, ReportType
from .serializers import ReportSerializer


class DashboardSummaryView(APIView):
    """
    GET /api/reports/dashboard/
    Real database statistics for dashboard KPI cards.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        total_users = User.objects.count()
        total_athletes = Athlete.objects.count()
        total_officers = DopingControlOfficer.objects.count()
        total_laboratories = Laboratory.objects.count()
        total_lab_staff = LaboratoryStaff.objects.count()

        scheduled_tests = DopingTest.objects.filter(status=TestStatus.SCHEDULED).count()
        completed_tests = DopingTest.objects.filter(status=TestStatus.COMPLETED).count()
        total_samples = Sample.objects.count()
        positive_results = LaboratoryResult.objects.filter(result_status=ResultStatus.POSITIVE).count()

        total_violations = Violation.objects.count()
        open_violations = Violation.objects.filter(status=ViolationStatus.OPEN).count()
        under_review_violations = Violation.objects.filter(status=ViolationStatus.UNDER_REVIEW).count()

        # Role-specific adjustments if not admin
        if user.role == Role.ATHLETE:
            athlete_tests = DopingTest.objects.filter(athlete__user=user)
            return Response({
                'role': 'ATHLETE',
                'total_tests': athlete_tests.count(),
                'upcoming_tests': athlete_tests.filter(status=TestStatus.SCHEDULED).count(),
                'completed_tests': athlete_tests.filter(status=TestStatus.COMPLETED).count(),
                'violations': Violation.objects.filter(athlete__user=user).count(),
            })

        if user.role == Role.DOPING_CONTROL_OFFICER:
            officer_tests = DopingTest.objects.filter(officer__user=user)
            return Response({
                'role': 'DOPING_CONTROL_OFFICER',
                'assigned_tests': officer_tests.count(),
                'scheduled': officer_tests.filter(status=TestStatus.SCHEDULED).count(),
                'completed': officer_tests.filter(status=TestStatus.COMPLETED).count(),
                'samples_collected': Sample.objects.filter(doping_test__officer__user=user).count(),
            })

        if user.role == Role.LABORATORY_STAFF:
            lab = getattr(getattr(user, 'lab_staff_profile', None), 'laboratory', None)
            lab_results = LaboratoryResult.objects.filter(laboratory=lab) if lab else LaboratoryResult.objects.none()
            return Response({
                'role': 'LABORATORY_STAFF',
                'samples_received': Sample.objects.filter(status=SampleStatus.RECEIVED).count(),
                'under_analysis': Sample.objects.filter(status=SampleStatus.UNDER_ANALYSIS).count(),
                'results_generated': lab_results.count(),
                'positive_results': lab_results.filter(result_status=ResultStatus.POSITIVE).count(),
            })

        return Response({
            'total_users': total_users,
            'total_athletes': total_athletes,
            'total_officers': total_officers,
            'total_laboratories': total_laboratories,
            'total_lab_staff': total_lab_staff,
            'scheduled_tests': scheduled_tests,
            'completed_tests': completed_tests,
            'total_samples': total_samples,
            'positive_results': positive_results,
            'total_violations': total_violations,
            'open_violations': open_violations,
            'under_review_violations': under_review_violations,
        })


class TestingReportView(APIView):
    """
    GET /api/reports/testing/
    Real testing report with filters and optional CSV export.
    Filters: date_from, date_to, sport, status, format=csv
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = DopingTest.objects.select_related('athlete__user', 'officer__user').order_by('-scheduled_date')

        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        sport = request.query_params.get('sport')
        test_status = request.query_params.get('status')
        export_format = request.query_params.get('format')

        if date_from:
            qs = qs.filter(scheduled_date__gte=date_from)
        if date_to:
            qs = qs.filter(scheduled_date__lte=date_to)
        if sport:
            qs = qs.filter(athlete__sport__icontains=sport)
        if test_status:
            qs = qs.filter(status=test_status)

        if export_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="testing_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Test Number', 'Athlete', 'Athlete ID', 'Sport', 'Officer', 'Date', 'Type', 'Status', 'Location'])
            for t in qs:
                writer.writerow([
                    t.test_number,
                    t.athlete.user.get_full_name(),
                    t.athlete.athlete_id,
                    t.athlete.sport,
                    t.officer.user.get_full_name() if t.officer else 'Unassigned',
                    t.scheduled_date,
                    t.test_type,
                    t.status,
                    t.location,
                ])
            return response

        data = [{
            'id': str(t.id),
            'test_number': t.test_number,
            'athlete_name': t.athlete.user.get_full_name(),
            'athlete_id': t.athlete.athlete_id,
            'sport': t.athlete.sport,
            'officer_name': t.officer.user.get_full_name() if t.officer else None,
            'scheduled_date': str(t.scheduled_date),
            'test_type': t.test_type,
            'status': t.status,
            'location': t.location,
        } for t in qs]

        return Response({
            'count': len(data),
            'results': data,
        })


class ViolationReportView(APIView):
    """
    GET /api/reports/violations/
    Real violations report with filters and optional CSV export.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Violation.objects.select_related('athlete__user', 'reviewed_by').order_by('-created_at')

        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        v_status = request.query_params.get('status')
        export_format = request.query_params.get('format')

        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        if v_status:
            qs = qs.filter(status=v_status)

        if export_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="violations_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Violation Number', 'Athlete', 'Sport', 'Status', 'Opened Date', 'Reviewed By', 'Action Taken'])
            for v in qs:
                writer.writerow([
                    v.violation_number,
                    v.athlete.user.get_full_name(),
                    v.athlete.sport,
                    v.status,
                    v.created_at.strftime('%Y-%m-%d'),
                    v.reviewed_by.get_full_name() if v.reviewed_by else 'Not Reviewed',
                    v.action_taken or 'None',
                ])
            return response

        data = [{
            'id': str(v.id),
            'violation_number': v.violation_number,
            'athlete_name': v.athlete.user.get_full_name(),
            'sport': v.athlete.sport,
            'status': v.status,
            'description': v.description,
            'reviewed_by': v.reviewed_by.get_full_name() if v.reviewed_by else None,
            'action_taken': v.action_taken,
            'action_date': str(v.action_date) if v.action_date else None,
            'created_at': v.created_at.strftime('%Y-%m-%d %H:%M'),
        } for v in qs]

        return Response({
            'count': len(data),
            'results': data,
        })


class MonthlySummaryReportView(APIView):
    """
    GET /api/reports/monthly/
    Returns actual counts aggregated by month over the past 12 months.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        months = []
        for i in range(5, -1, -1):
            target_year = now.year if (now.month - i) > 0 else now.year - 1
            target_month = (now.month - i) if (now.month - i) > 0 else (now.month - i + 12)
            month_name = datetime(target_year, target_month, 1).strftime('%b %Y')

            tests_count = DopingTest.objects.filter(
                created_at__year=target_year,
                created_at__month=target_month
            ).count()

            positive_count = LaboratoryResult.objects.filter(
                result_status=ResultStatus.POSITIVE,
                created_at__year=target_year,
                created_at__month=target_month
            ).count()

            negative_count = LaboratoryResult.objects.filter(
                result_status=ResultStatus.NEGATIVE,
                created_at__year=target_year,
                created_at__month=target_month
            ).count()

            violations_count = Violation.objects.filter(
                created_at__year=target_year,
                created_at__month=target_month
            ).count()

            months.append({
                'month': month_name,
                'tests': tests_count,
                'positive': positive_count,
                'negative': negative_count,
                'violations': violations_count,
            })

        return Response(months)


class LaboratoryReportView(APIView):
    """
    GET /api/reports/laboratories/
    Real laboratory performance statistics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        labs = Laboratory.objects.all()
        data = []
        for lab in labs:
            results = LaboratoryResult.objects.filter(laboratory=lab)
            data.append({
                'id': str(lab.id),
                'name': lab.laboratory_name,
                'accreditation': lab.accreditation_number,
                'city': lab.city,
                'country': lab.country,
                'status': lab.status,
                'total_analyzed': results.count(),
                'positive': results.filter(result_status=ResultStatus.POSITIVE).count(),
                'negative': results.filter(result_status=ResultStatus.NEGATIVE).count(),
                'inconclusive': results.filter(result_status=ResultStatus.INCONCLUSIVE).count(),
                'invalid': results.filter(result_status=ResultStatus.INVALID).count(),
            })

        return Response(data)


class ReportListView(generics.ListCreateAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAuthority]

    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
