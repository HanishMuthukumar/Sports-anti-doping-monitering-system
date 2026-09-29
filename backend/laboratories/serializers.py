from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import Role
from .models import Laboratory, LaboratoryStaff


class LaboratorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Laboratory
        fields = ['id', 'laboratory_name', 'accreditation_number', 'address', 'city',
                  'country', 'phone', 'email', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LaboratoryStaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    laboratory_name = serializers.CharField(source='laboratory.laboratory_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = LaboratoryStaff
        fields = ['id', 'user', 'full_name', 'laboratory', 'laboratory_name', 'staff_id',
                  'designation', 'qualification', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LabStaffCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    laboratory = serializers.PrimaryKeyRelatedField(queryset=Laboratory.objects.all())
    staff_id = serializers.CharField(max_length=50)
    designation = serializers.CharField(max_length=100, required=False, allow_blank=True)
    qualification = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_email(self, value):
        from accounts.models import User
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_staff_id(self, value):
        if LaboratoryStaff.objects.filter(staff_id=value).exists():
            raise serializers.ValidationError('This staff ID is already in use.')
        return value

    def create(self, validated_data):
        from accounts.models import User
        lab = validated_data.pop('laboratory')
        staff_fields = {k: validated_data.pop(k) for k in ['staff_id', 'designation', 'qualification'] if k in validated_data}
        password = validated_data.pop('password')
        user = User(role=Role.LABORATORY_STAFF, **validated_data)
        user.set_password(password)
        user.save()
        return LaboratoryStaff.objects.create(user=user, laboratory=lab, **staff_fields)
