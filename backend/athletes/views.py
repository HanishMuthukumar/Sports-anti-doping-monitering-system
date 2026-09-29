"""Athlete views."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import Role
from accounts.permissions import IsAdministrator, IsOwnerOrAdmin
from .models import Athlete
from .serializers import AthleteSerializer, AthleteCreateSerializer, AthleteUpdateSerializer


class AthleteViewSet(viewsets.ModelViewSet):
    """
    /api/athletes/
    - Admin: full CRUD
    - Athlete: retrieve + update own profile only
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Athlete.objects.select_related('user').order_by('-created_at')
        if user.role == Role.ATHLETE:
            return qs.filter(user=user)
        if user.role == Role.ADMINISTRATOR:
            return qs
        # Officers, lab staff, authority: read-only access to list
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return AthleteCreateSerializer
        if self.action in ('update', 'partial_update'):
            return AthleteUpdateSerializer
        return AthleteSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdministrator()]
        if self.action == 'destroy':
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = AthleteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        athlete = serializer.save()
        return Response(AthleteSerializer(athlete).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        athlete = self.get_object()
        # Object-level check: athlete can only update their own profile
        if request.user.role == Role.ATHLETE and athlete.user != request.user:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(athlete, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AthleteSerializer(athlete).data)

    def destroy(self, request, *args, **kwargs):
        athlete = self.get_object()
        athlete.status = 'INACTIVE'
        athlete.save()
        athlete.user.is_active = False
        athlete.user.save()
        return Response({'detail': 'Athlete deactivated.'}, status=status.HTTP_200_OK)
