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
