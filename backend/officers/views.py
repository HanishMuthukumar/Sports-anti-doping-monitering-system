from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import Role
from accounts.permissions import IsAdministrator
from .models import DopingControlOfficer
from .serializers import OfficerSerializer, OfficerCreateSerializer, OfficerUpdateSerializer


class OfficerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = DopingControlOfficer.objects.select_related('user').order_by('-created_at')
        if user.role == Role.DOPING_CONTROL_OFFICER:
            return qs.filter(user=user)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return OfficerCreateSerializer
        if self.action in ('update', 'partial_update'):
            return OfficerUpdateSerializer
        return OfficerSerializer

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = OfficerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        officer = serializer.save()
        return Response(OfficerSerializer(officer).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        officer = self.get_object()
        officer.status = 'INACTIVE'
        officer.save()
        return Response({'detail': 'Officer deactivated.'})
