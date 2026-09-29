from django.contrib import admin
from .models import Sample
@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    list_display = ('sample_number', 'doping_test', 'sample_type', 'status', 'collection_date')
    list_filter = ('status', 'sample_type')
    search_fields = ('sample_number', 'doping_test__test_number')
    readonly_fields = ('id', 'sample_number', 'submitted_at', 'received_at', 'created_at', 'updated_at')
