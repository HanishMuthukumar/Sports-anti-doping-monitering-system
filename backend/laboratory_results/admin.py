from django.contrib import admin
from .models import LaboratoryResult

@admin.register(LaboratoryResult)
class LaboratoryResultAdmin(admin.ModelAdmin):
    list_display = ('sample', 'laboratory', 'analyst', 'result_status', 'analyzed_at')
    list_filter = ('result_status', 'laboratory')
    search_fields = ('sample__sample_number', 'findings', 'report_reference')
    readonly_fields = ('id', 'analyzed_at', 'created_at', 'updated_at')
