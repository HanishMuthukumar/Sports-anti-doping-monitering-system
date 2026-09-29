from rest_framework import serializers
from .models import LaboratoryResult


class LaboratoryResultSerializer(serializers.ModelSerializer):
    sample_number = serializers.CharField(source='sample.sample_number', read_only=True)
    athlete_name = serializers.CharField(source='sample.doping_test.athlete.user.get_full_name', read_only=True)
    laboratory_name = serializers.CharField(source='laboratory.laboratory_name', read_only=True, allow_null=True)
    analyst_name = serializers.CharField(source='analyst.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = LaboratoryResult
        fields = [
            'id', 'sample', 'sample_number', 'athlete_name',
            'laboratory', 'laboratory_name', 'analyst', 'analyst_name',
            'result_status', 'test_method', 'findings', 'comments',
            'report_reference', 'analyzed_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'analyzed_at', 'created_at', 'updated_at']


class LaboratoryResultCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaboratoryResult
        fields = ['sample', 'result_status', 'test_method', 'findings', 'comments', 'report_reference']

    def validate_sample(self, sample):
        # Cannot create a result for a sample that already has one
        if hasattr(sample, 'result'):
            raise serializers.ValidationError('A result already exists for this sample.')
        return sample
