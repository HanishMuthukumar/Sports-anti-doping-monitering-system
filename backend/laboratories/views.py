from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import Role
from accounts.permissions import IsAdministrator
from .models import Laboratory, LaboratoryStaff
from .serializers import LaboratorySerializer, LaboratoryStaffSerializer, LabStaffCreateSerializer


class LaboratoryViewSet(viewsets.ModelViewSet):
    queryset = Laboratory.objects.all().order_by('laboratory_name')
    serializer_class = LaboratorySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        lab = self.get_object()
        lab.status = 'INACTIVE'
        lab.save()
        return Response({'detail': 'Laboratory deactivated.'})


class LaboratoryStaffViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = LaboratoryStaff.objects.select_related('user', 'laboratory').order_by('-created_at')
        if user.role == Role.LABORATORY_STAFF:
            return qs.filter(user=user)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return LabStaffCreateSerializer
        return LaboratoryStaffSerializer

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = LabStaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        return Response(LaboratoryStaffSerializer(staff).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        staff = self.get_object()
        staff.status = 'INACTIVE'
        staff.save()
        return Response({'detail': 'Staff deactivated.'})
