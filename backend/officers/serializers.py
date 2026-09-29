from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import Role
from .models import DopingControlOfficer


class OfficerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = DopingControlOfficer
        fields = ['id', 'user', 'full_name', 'email', 'officer_id', 'certification_number',
                  'organization', 'phone', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OfficerCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    officer_id = serializers.CharField(max_length=50)
    certification_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    organization = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_email(self, value):
        from accounts.models import User
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_officer_id(self, value):
        if DopingControlOfficer.objects.filter(officer_id=value).exists():
            raise serializers.ValidationError('This officer ID is already in use.')
        return value

    def create(self, validated_data):
        from accounts.models import User
        officer_fields = {k: validated_data.pop(k) for k in ['officer_id', 'certification_number', 'organization'] if k in validated_data}
        password = validated_data.pop('password')
        user = User(role=Role.DOPING_CONTROL_OFFICER, **validated_data)
        user.set_password(password)
        user.save()
        return DopingControlOfficer.objects.create(user=user, **officer_fields)


class OfficerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DopingControlOfficer
        fields = ['certification_number', 'organization', 'phone', 'status']
