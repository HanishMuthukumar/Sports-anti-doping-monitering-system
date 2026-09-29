"""Athlete serializers."""
from rest_framework import serializers
from accounts.serializers import UserSerializer, UserCreateSerializer
from accounts.models import Role
from .models import Athlete


class AthleteSerializer(serializers.ModelSerializer):
    """Read serializer with nested user info."""
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Athlete
        fields = [
            'id', 'user', 'full_name', 'email', 'athlete_id',
            'date_of_birth', 'gender', 'sport', 'nationality',
            'team', 'coach', 'address', 'emergency_contact',
            'emergency_phone', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AthleteCreateSerializer(serializers.Serializer):
    """Write serializer — creates a User + Athlete in one step."""
    # User fields
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    # Athlete fields
    athlete_id = serializers.CharField(max_length=50)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)
    sport = serializers.CharField(max_length=100)
    nationality = serializers.CharField(max_length=100, required=False, allow_blank=True)
    team = serializers.CharField(max_length=100, required=False, allow_blank=True)
    coach = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(max_length=100, required=False, allow_blank=True)
    emergency_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value):
        from accounts.models import User
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_athlete_id(self, value):
        if Athlete.objects.filter(athlete_id=value).exists():
            raise serializers.ValidationError('This athlete ID is already in use.')
        return value

    def create(self, validated_data):
        from accounts.models import User
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone': validated_data.pop('phone', ''),
            'role': Role.ATHLETE,
        }
        password = validated_data.pop('password')
        user = User(**user_data)
        user.set_password(password)
        user.save()
        athlete = Athlete.objects.create(user=user, **validated_data)
        return athlete


class AthleteUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for athlete profile fields."""
    class Meta:
        model = Athlete
        fields = [
            'date_of_birth', 'gender', 'sport', 'nationality',
            'team', 'coach', 'address', 'emergency_contact',
            'emergency_phone', 'status',
        ]
