"""Views for auth and user management."""
from rest_framework import status, viewsets, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from .models import User, Role
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    AdminUserUpdateSerializer, ChangePasswordSerializer
)
from .permissions import IsAdministrator, IsOwnerOrAdmin


class LoginView(APIView):
    """POST /api/auth/login/ — obtain JWT token pair."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {'detail': 'Account is deactivated.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class RegisterView(APIView):
    """POST /api/auth/register/ — public account self-registration requiring admin verification."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_verified = False  # Requires administrator verification
        user.save(update_fields=['is_verified'])

        # Auto-create profile shell for verification queue
        role = user.role
        try:
            if role == Role.ATHLETE:
                from athletes.models import Athlete
                sport = request.data.get('sport', 'Athletics')
                team = request.data.get('team', '')
                coach = request.data.get('coach', '')
                nationality = request.data.get('nationality', '')
                Athlete.objects.create(
                    user=user,
                    athlete_id=f"ATH-{str(user.id)[:6].upper()}",
                    sport=sport,
                    team=team,
                    coach=coach,
                    nationality=nationality,
                    status='INACTIVE',
                )
            elif role == Role.LABORATORY_STAFF:
                from laboratories.models import Laboratory, LaboratoryStaff
                lab_name = request.data.get('laboratory_name', 'National Anti-Doping Laboratory')
                accreditation = request.data.get('accreditation_number', '')
                lab, _ = Laboratory.objects.get_or_create(
                    laboratory_name=lab_name,
                    defaults={'accreditation_number': accreditation or f"WADA-LAB-{str(user.id)[:4].upper()}"}
                )
                LaboratoryStaff.objects.create(
                    user=user,
                    laboratory=lab,
                    staff_id=f"LAB-{str(user.id)[:6].upper()}",
                    designation=request.data.get('designation', 'Laboratory Analyst'),
                    status='INACTIVE',
                )
            elif role == Role.DOPING_CONTROL_OFFICER:
                from officers.models import DopingControlOfficer
                cert = request.data.get('certification_number', f"DCO-CERT-{str(user.id)[:4].upper()}")
                org = request.data.get('organization', 'National Anti-Doping Agency')
                DopingControlOfficer.objects.create(
                    user=user,
                    officer_id=f"DCO-{str(user.id)[:6].upper()}",
                    certification_number=cert,
                    organization=org,
                    status='INACTIVE',
                )
        except Exception:
            pass  # User is still registered and will be verified by admin

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'message': 'Registration submitted successfully. Account pending administrator verification.',
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {'detail': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """GET /api/auth/me/ — return the current authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    """
    /api/users/ — full user management.
    Only admins can list, create, or delete.
    Users can retrieve and update their own profile.
    """
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            if self.request.user.role == Role.ADMINISTRATOR:
                return AdminUserUpdateSerializer
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ('list', 'create'):
            return [IsAdministrator()]
        if self.action == 'destroy':
            return [IsAdministrator()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    def destroy(self, request, *args, **kwargs):
        """Soft-delete: set is_active=False instead of removing the record."""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'detail': 'User deactivated.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        """POST /api/users/{id}/change-password/"""
        user = self.get_object()
        if request.user != user and request.user.role != Role.ADMINISTRATOR:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password changed.'})

    @action(detail=False, methods=['get'], permission_classes=[IsAdministrator])
    def pending(self, request):
        """GET /api/users/pending/ — get all users awaiting admin verification."""
        pending_users = User.objects.filter(is_verified=False).order_by('-created_at')
        return Response(UserSerializer(pending_users, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdministrator])
    def verify(self, request, pk=None):
        """POST /api/users/{id}/verify/ — verify and activate a user and their profile."""
        user = self.get_object()
        user.is_verified = True
        user.is_active = True
        user.save(update_fields=['is_verified', 'is_active'])

        # Activate linked profiles
        if hasattr(user, 'athlete_profile'):
            user.athlete_profile.status = 'ACTIVE'
            user.athlete_profile.save(update_fields=['status'])
        if hasattr(user, 'lab_staff_profile'):
            user.lab_staff_profile.status = 'ACTIVE'
            user.lab_staff_profile.save(update_fields=['status'])
        if hasattr(user, 'officer_profile'):
            user.officer_profile.status = 'ACTIVE'
            user.officer_profile.save(update_fields=['status'])

        return Response({
            'detail': f'User {user.get_full_name()} verified and activated successfully.',
            'user': UserSerializer(user).data,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdministrator])
    def reject(self, request, pk=None):
        """POST /api/users/{id}/reject/ — reject a user registration."""
        user = self.get_object()
        user.is_verified = False
        user.is_active = False
        user.save(update_fields=['is_verified', 'is_active'])
        return Response({'detail': f'User {user.get_full_name()} registration rejected.'})
