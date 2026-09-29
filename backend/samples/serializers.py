from rest_framework import serializers
from .models import Sample, SampleStatus, SAMPLE_VALID_TRANSITIONS


class SampleSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='doping_test.athlete.user.get_full_name', read_only=True)
    test_number = serializers.CharField(source='doping_test.test_number', read_only=True)
    collected_by_name = serializers.CharField(source='collected_by.get_full_name', read_only=True, allow_null=True)
    received_by_name = serializers.CharField(source='received_by.user.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Sample
        fields = [
            'id', 'sample_number', 'doping_test', 'test_number', 'athlete_name',
            'sample_type', 'collection_date', 'collection_time',
            'collected_by', 'collected_by_name', 'submitted_at',
            'received_at', 'received_by', 'received_by_name',
            'status', 'chain_of_custody_notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'sample_number', 'submitted_at', 'received_at', 'created_at', 'updated_at']


class SampleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = ['doping_test', 'sample_type', 'collection_date', 'collection_time', 'chain_of_custody_notes']


class SampleTransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=SampleStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    received_by = serializers.UUIDField(required=False, allow_null=True)

    def validate(self, attrs):
        sample = self.context['sample']
        new_status = attrs['status']
        allowed = SAMPLE_VALID_TRANSITIONS.get(sample.status, [])
        if new_status not in allowed:
            raise serializers.ValidationError(
                {'status': f"Cannot transition from '{sample.status}' to '{new_status}'."}
            )
        return attrs
