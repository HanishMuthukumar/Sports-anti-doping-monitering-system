"""Role-based permission classes for the anti-doping system."""
from rest_framework.permissions import BasePermission
from .models import Role


class IsAdministrator(BasePermission):
    """Allow access only to administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.ADMINISTRATOR
        )


class IsAthlete(BasePermission):
    """Allow access only to athletes."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.ATHLETE
        )


class IsDopingControlOfficer(BasePermission):
    """Allow access only to doping control officers."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.DOPING_CONTROL_OFFICER
        )


class IsLaboratoryStaff(BasePermission):
    """Allow access only to laboratory staff."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.LABORATORY_STAFF
        )


class IsSportsAuthority(BasePermission):
    """Allow access only to sports authority."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.SPORTS_AUTHORITY
        )


class IsAdministratorOrReadOnly(BasePermission):
    """Allow full access to admins, read-only to authenticated users."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.role == Role.ADMINISTRATOR


class IsAdminOrOfficer(BasePermission):
    """Allow access to admins and doping control officers."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in (Role.ADMINISTRATOR, Role.DOPING_CONTROL_OFFICER)
        )


class IsAdminOrAuthority(BasePermission):
    """Allow access to admins and sports authority."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in (Role.ADMINISTRATOR, Role.SPORTS_AUTHORITY)
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: user can only access their own object, unless admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMINISTRATOR:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user
