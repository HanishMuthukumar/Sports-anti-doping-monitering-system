from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import Role
from accounts.permissions import IsAdministrator, IsAdminOrOfficer
from doping_tests.models import TestStatus
from notifications.utils import create_notification
from notifications.models import NotificationType
from .models import Sample, SampleStatus
from .serializers import SampleSerializer, SampleCreateSerializer, SampleTransitionSerializer


class SampleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Sample.objects.select_related(
            'doping_test__athlete__user',
            'doping_test__officer__user',
            'collected_by',
            'received_by__user',
        ).order_by('-created_at')
        if user.role == Role.ATHLETE:
            return qs.filter(doping_test__athlete__user=user)
        if user.role == Role.DOPING_CONTROL_OFFICER:
            return qs.filter(Q(doping_test__officer__user=user) | Q(collected_by=user))
        if user.role == Role.LABORATORY_STAFF:
            return qs.filter(status__in=[
                SampleStatus.SUBMITTED, SampleStatus.RECEIVED,
                SampleStatus.UNDER_ANALYSIS, SampleStatus.ANALYZED, SampleStatus.INVALID
            ])
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return SampleCreateSerializer
        return SampleSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminOrOfficer()]
        if self.action == 'destroy':
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = SampleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sample = serializer.save(collected_by=request.user)
        # Update the doping test status
        test = sample.doping_test
        if test.status == 'SCHEDULED':
            test.transition_status(TestStatus.SAMPLE_COLLECTED)
        return Response(SampleSerializer(sample).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'Samples cannot be deleted.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['post'], url_path='transition')
    def transition(self, request, pk=None):
        """POST /api/samples/{id}/transition/ — advance chain of custody."""
        sample = self.get_object()
        serializer = SampleTransitionSerializer(data=request.data, context={'sample': sample})
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        received_by_id = serializer.validated_data.get('received_by')

        if received_by_id and new_status == SampleStatus.RECEIVED:
            from laboratories.models import LaboratoryStaff
            try:
                sample.received_by = LaboratoryStaff.objects.get(id=received_by_id)
            except LaboratoryStaff.DoesNotExist:
                pass

        sample.transition_status(new_status, user=request.user, notes=notes)

        # Sync doping test status
        test = sample.doping_test
        status_sync_map = {
            SampleStatus.SUBMITTED: TestStatus.SAMPLE_SUBMITTED,
            SampleStatus.RECEIVED: None,  # handled by analysis start
            SampleStatus.UNDER_ANALYSIS: TestStatus.UNDER_ANALYSIS,
        }
        if new_status in status_sync_map and status_sync_map[new_status]:
            try:
                test.transition_status(status_sync_map[new_status])
            except Exception:
                pass  # Test may already be in the right state

        # Notify
        notif_map = {
            SampleStatus.SUBMITTED: ('Sample submitted', NotificationType.SAMPLE_SUBMITTED),
            SampleStatus.RECEIVED: ('Sample received by lab', NotificationType.SAMPLE_RECEIVED),
            SampleStatus.UNDER_ANALYSIS: ('Analysis started', NotificationType.ANALYSIS_STARTED),
        }
        if new_status in notif_map:
            title, ntype = notif_map[new_status]
            create_notification(
                user=test.athlete.user,
                title=title,
                message=f'Sample {sample.sample_number} status: {new_status}.',
                notification_type=ntype,
                related_object_type='sample',
                related_object_id=sample.id,
            )
        return Response(SampleSerializer(sample).data)
