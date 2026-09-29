from rest_framework import serializers
from athletes.serializers import AthleteSerializer
from officers.serializers import OfficerSerializer
from .models import DopingTest, TestStatus, VALID_TEST_TRANSITIONS


class DopingTestSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.user.get_full_name', read_only=True)
    athlete_id_code = serializers.CharField(source='athlete.athlete_id', read_only=True)
    officer_name = serializers.CharField(source='officer.user.get_full_name', read_only=True, allow_null=True)
    sport = serializers.CharField(source='athlete.sport', read_only=True)

    class Meta:
        model = DopingTest
        fields = [
            'id', 'test_number', 'athlete', 'athlete_name', 'athlete_id_code',
            'officer', 'officer_name', 'sport', 'scheduled_date', 'scheduled_time',
            'test_type', 'location', 'reason', 'status', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'test_number', 'created_at', 'updated_at']


class DopingTestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DopingTest
        fields = [
            'athlete', 'officer', 'scheduled_date', 'scheduled_time',
            'test_type', 'location', 'reason', 'notes',
        ]


class DopingTestStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=TestStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        test = self.context['test']
        new_status = attrs['status']
        allowed = VALID_TEST_TRANSITIONS.get(test.status, [])
        if new_status not in allowed:
            raise serializers.ValidationError(
                {'status': f"Cannot transition from '{test.status}' to '{new_status}'."}
            )
        return attrs
