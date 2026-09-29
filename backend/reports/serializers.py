from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Report
        fields = ['id', 'report_number', 'report_type', 'generated_by', 'generated_by_name',
                  'description', 'file_path', 'created_at']
        read_only_fields = ['id', 'report_number', 'created_at']
