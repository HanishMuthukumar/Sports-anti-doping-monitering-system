from rest_framework import serializers
from .models import Violation, ViolationStatus, VIOLATION_VALID_TRANSITIONS


class ViolationSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.user.get_full_name', read_only=True)
    athlete_id_code = serializers.CharField(source='athlete.athlete_id', read_only=True)
    sport = serializers.CharField(source='athlete.sport', read_only=True)
    test_number = serializers.CharField(source='doping_test.test_number', read_only=True, allow_null=True)
    sample_number = serializers.CharField(source='sample.sample_number', read_only=True, allow_null=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Violation
        fields = [
            'id', 'violation_number', 'athlete', 'athlete_name', 'athlete_id_code', 'sport',
            'doping_test', 'test_number', 'sample', 'sample_number', 'laboratory_result',
            'description', 'status', 'reviewed_by', 'reviewed_by_name',
            'reviewed_at', 'action_taken', 'action_date', 'remarks',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'violation_number', 'created_at', 'updated_at']


class ViolationReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ViolationStatus.choices)
    remarks = serializers.CharField(required=False, allow_blank=True)
    action_taken = serializers.CharField(required=False, allow_blank=True)
    action_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        violation = self.context['violation']
        new_status = attrs['status']
        allowed = VIOLATION_VALID_TRANSITIONS.get(violation.status, [])
        if new_status not in allowed:
            raise serializers.ValidationError(
                {'status': f"Cannot transition violation from '{violation.status}' to '{new_status}'."}
            )
        return attrs
