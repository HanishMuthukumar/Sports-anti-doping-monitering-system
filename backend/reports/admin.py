from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'report_type', 'generated_by', 'created_at')
    list_filter = ('report_type',)
    search_fields = ('report_number', 'description')
    readonly_fields = ('id', 'report_number', 'created_at')
