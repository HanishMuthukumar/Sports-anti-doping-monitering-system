from django.contrib import admin
from .models import Violation

@admin.register(Violation)
class ViolationAdmin(admin.ModelAdmin):
    list_display = ('violation_number', 'athlete', 'status', 'reviewed_by', 'action_date', 'created_at')
    list_filter = ('status',)
    search_fields = ('violation_number', 'athlete__user__email', 'athlete__athlete_id')
    readonly_fields = ('id', 'violation_number', 'created_at', 'updated_at')
