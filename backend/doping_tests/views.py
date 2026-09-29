from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from accounts.models import Role
from accounts.permissions import IsAdministrator, IsAdminOrOfficer
from notifications.utils import create_notification
from notifications.models import NotificationType
from .models import DopingTest, TestStatus
from .serializers import DopingTestSerializer, DopingTestCreateSerializer, DopingTestStatusUpdateSerializer


class DopingTestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'test_type']
    search_fields = ['test_number', 'athlete__user__first_name', 'athlete__user__last_name', 'location']
    ordering_fields = ['scheduled_date', 'created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = DopingTest.objects.select_related(
            'athlete__user', 'officer__user'
        ).order_by('-created_at')
        if user.role == Role.ATHLETE:
            return qs.filter(athlete__user=user)
        if user.role == Role.DOPING_CONTROL_OFFICER:
            return qs.filter(officer__user=user)
        if user.role == Role.LABORATORY_STAFF:
            return qs.filter(status__in=[
                TestStatus.SAMPLE_SUBMITTED, TestStatus.UNDER_ANALYSIS,
                TestStatus.RESULT_GENERATED, TestStatus.COMPLETED
            ])
        # Admin and authority see all
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return DopingTestCreateSerializer
        return DopingTestSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminOrOfficer()]
        if self.action == 'destroy':
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = DopingTestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        extra = {}
        if request.user.role == Role.DOPING_CONTROL_OFFICER and not serializer.validated_data.get('officer'):
            officer_prof = getattr(request.user, 'officer_profile', None)
            if officer_prof:
                extra['officer'] = officer_prof
        test = serializer.save(**extra)
        # Notify athlete
        create_notification(
            user=test.athlete.user,
            title='Doping test scheduled',
            message=f'Test {test.test_number} has been scheduled for {test.scheduled_date} at {test.location}.',
            notification_type=NotificationType.TEST_SCHEDULED,
            related_object_type='test',
            related_object_id=test.id,
        )
        return Response(DopingTestSerializer(test).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        test = self.get_object()
        test.status = TestStatus.CANCELLED
        test.save()
        return Response({'detail': 'Test cancelled.'})

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """POST /api/tests/{id}/update-status/ — transition test status."""
        test = self.get_object()
        # Only admin or the assigned officer can update status
        if request.user.role == Role.DOPING_CONTROL_OFFICER:
            if not test.officer or test.officer.user != request.user:
                return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        elif request.user.role not in (Role.ADMINISTRATOR, Role.LABORATORY_STAFF):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = DopingTestStatusUpdateSerializer(
            data=request.data, context={'test': test}
        )
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        test.transition_status(new_status, notes)

        # Send notification to athlete for key transitions
        notif_map = {
            TestStatus.SAMPLE_COLLECTED: ('Sample collected', NotificationType.SAMPLE_COLLECTED),
            TestStatus.SAMPLE_SUBMITTED: ('Sample submitted to lab', NotificationType.SAMPLE_SUBMITTED),
            TestStatus.RESULT_GENERATED: ('Result ready', NotificationType.RESULT_GENERATED),
        }
        if new_status in notif_map:
            title, ntype = notif_map[new_status]
            create_notification(
                user=test.athlete.user,
                title=title,
                message=f'Test {test.test_number} status updated to {new_status}.',
                notification_type=ntype,
                related_object_type='test',
                related_object_id=test.id,
            )
        return Response(DopingTestSerializer(test).data)
