from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from accounts.models import Role
from accounts.permissions import IsAdministrator, IsSportsAuthority, IsAdminOrAuthority
from notifications.utils import create_notification
from notifications.models import NotificationType
from .models import Violation, ViolationStatus
from .serializers import ViolationSerializer, ViolationReviewSerializer


class ViolationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['violation_number', 'athlete__user__first_name', 'athlete__user__last_name', 'description']
    ordering_fields = ['created_at', 'status', 'reviewed_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Violation.objects.select_related(
            'athlete__user', 'doping_test', 'sample', 'laboratory_result', 'reviewed_by'
        ).order_by('-created_at')
        if user.role == Role.ATHLETE:
            return qs.filter(athlete__user=user)
        # Admins and Sports Authority see all violations
        return qs

    def get_serializer_class(self):
        return ViolationSerializer

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            return [IsAdministrator()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrAuthority], url_path='review')
    def review(self, request, pk=None):
        """POST /api/violations/{id}/review/ — Review and change violation status."""
        violation = self.get_object()
        serializer = ViolationReviewSerializer(data=request.data, context={'violation': violation})
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        remarks = serializer.validated_data.get('remarks', '')
        action_taken = serializer.validated_data.get('action_taken', '')
        action_date = serializer.validated_data.get('action_date')

        violation.transition_status(
            new_status=new_status,
            user=request.user,
            remarks=remarks,
            action_taken=action_taken,
            action_date=action_date
        )

        # Notify athlete of update
        status_notification_map = {
            ViolationStatus.UNDER_REVIEW: ('Violation under review', NotificationType.VIOLATION_REVIEWED),
            ViolationStatus.ACTION_TAKEN: ('Action taken on violation', NotificationType.ACTION_TAKEN),
            ViolationStatus.CLOSED: ('Violation closed', NotificationType.VIOLATION_CLOSED),
        }
        if new_status in status_notification_map:
            title, ntype = status_notification_map[new_status]
            create_notification(
                user=violation.athlete.user,
                title=title,
                message=f"Case {violation.violation_number} is now {new_status}. {remarks}".strip(),
                notification_type=ntype,
                related_object_type='violation',
                related_object_id=violation.id,
            )

        return Response(ViolationSerializer(violation).data)
