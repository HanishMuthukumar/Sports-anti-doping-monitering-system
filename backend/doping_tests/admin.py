from django.contrib import admin
from .models import DopingTest
@admin.register(DopingTest)
class DopingTestAdmin(admin.ModelAdmin):
    list_display = ('test_number', 'athlete', 'officer', 'scheduled_date', 'test_type', 'status')
    list_filter = ('status', 'test_type')
    search_fields = ('test_number', 'athlete__user__email', 'location')
    readonly_fields = ('id', 'test_number', 'created_at', 'updated_at')
