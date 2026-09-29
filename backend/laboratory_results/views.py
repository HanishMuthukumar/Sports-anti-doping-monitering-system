"""Laboratory result views — critical POSITIVE result processing is atomic."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from accounts.models import Role
from accounts.permissions import IsLaboratoryStaff
from doping_tests.models import TestStatus
from samples.models import SampleStatus
from notifications.utils import create_notification, notify_users_by_role
from notifications.models import NotificationType
from .models import LaboratoryResult, ResultStatus
from .serializers import LaboratoryResultSerializer, LaboratoryResultCreateSerializer


class LaboratoryResultViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']  # no PUT/PATCH/DELETE

    def get_queryset(self):
        user = self.request.user
        qs = LaboratoryResult.objects.select_related(
            'sample__doping_test__athlete__user',
            'laboratory',
            'analyst',
        ).order_by('-created_at')
        if user.role == Role.ATHLETE:
            return qs.filter(sample__doping_test__athlete__user=user)
        if user.role == Role.LABORATORY_STAFF:
            try:
                lab = user.lab_staff_profile.laboratory
                return qs.filter(laboratory=lab)
            except Exception:
                return qs.none()
        # Admin and authority see all
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return LaboratoryResultCreateSerializer
        return LaboratoryResultSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsLaboratoryStaff()]
        return [IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Critical endpoint — processes lab result atomically.
        POSITIVE result automatically creates a Violation.
        All steps within a single database transaction.
        """
        serializer = LaboratoryResultCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sample = serializer.validated_data['sample']
        result_status = serializer.validated_data['result_status']

        # Determine analyst laboratory
        laboratory = None
        try:
            laboratory = request.user.lab_staff_profile.laboratory
        except Exception:
            pass

        # 1. Create the result
        lab_result = LaboratoryResult.objects.create(
            sample=sample,
            laboratory=laboratory,
            analyst=request.user,
            **{k: v for k, v in serializer.validated_data.items() if k != 'sample'},
        )

        # 2. Update sample status
        if result_status == ResultStatus.INVALID:
            sample.status = SampleStatus.INVALID
        else:
            sample.status = SampleStatus.ANALYZED
        sample.save()

        # 3. Update doping test status
        test = sample.doping_test
        try:
            test.transition_status(TestStatus.RESULT_GENERATED)
        except Exception:
            pass  # Already in correct state
        if result_status == ResultStatus.NEGATIVE:
            try:
                test.transition_status(TestStatus.COMPLETED)
            except Exception:
                pass
        test.save()

        # 4. Handle result-specific logic
        athlete_user = test.athlete.user

        if result_status == ResultStatus.POSITIVE:
            # 4a. Prevent duplicate violation
            from violations.models import Violation
            existing = Violation.objects.filter(
                sample=sample,
                doping_test=test,
            ).exists()
            if not existing:
                violation = Violation.objects.create(
                    athlete=test.athlete,
                    doping_test=test,
                    sample=sample,
                    laboratory_result=lab_result,
                    description=f'Positive result: {lab_result.findings}',
                    status='OPEN',
                )
                # Notify athlete
                create_notification(
                    user=athlete_user,
                    title='Positive result — violation opened',
                    message=f'An adverse analytical finding was detected. Case {violation.violation_number} has been opened.',
                    notification_type=NotificationType.VIOLATION_CREATED,
                    related_object_type='violation',
                    related_object_id=violation.id,
                )
                # Notify all sports authority users
                notify_users_by_role(
                    role=Role.SPORTS_AUTHORITY,
                    title='New violation requires review',
                    message=f'Violation {violation.violation_number} for athlete {athlete_user.get_full_name()} requires review.',
                    notification_type=NotificationType.VIOLATION_CREATED,
                    related_object_type='violation',
                    related_object_id=violation.id,
                )

        elif result_status == ResultStatus.NEGATIVE:
            create_notification(
                user=athlete_user,
                title='Test result: Negative',
                message=f'Your sample {sample.sample_number} returned a negative result.',
                notification_type=NotificationType.RESULT_GENERATED,
                related_object_type='result',
                related_object_id=lab_result.id,
            )

        elif result_status == ResultStatus.INVALID:
            # Notify officer — retest required
            if test.officer:
                create_notification(
                    user=test.officer.user,
                    title='Sample invalid — retest required',
                    message=f'Sample {sample.sample_number} was marked invalid. A retest may be required.',
                    notification_type=NotificationType.RESULT_GENERATED,
                    related_object_type='sample',
                    related_object_id=sample.id,
                )

        elif result_status == ResultStatus.INCONCLUSIVE:
            # Notify authority for manual review
            notify_users_by_role(
                role=Role.SPORTS_AUTHORITY,
                title='Inconclusive result requires review',
                message=f'Sample {sample.sample_number} returned an inconclusive result and requires review.',
                notification_type=NotificationType.RESULT_GENERATED,
                related_object_type='result',
                related_object_id=lab_result.id,
            )

        return Response(LaboratoryResultSerializer(lab_result).data, status=status.HTTP_201_CREATED)
