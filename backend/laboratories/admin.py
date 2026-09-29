from django.contrib import admin
from .models import Laboratory, LaboratoryStaff

@admin.register(Laboratory)
class LaboratoryAdmin(admin.ModelAdmin):
    list_display = ('laboratory_name', 'accreditation_number', 'city', 'country', 'status')
    list_filter = ('status', 'country')
    search_fields = ('laboratory_name', 'accreditation_number', 'city')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(LaboratoryStaff)
class LaboratoryStaffAdmin(admin.ModelAdmin):
    list_display = ('staff_id', 'user', 'laboratory', 'designation', 'status')
    list_filter = ('status', 'laboratory')
    search_fields = ('staff_id', 'user__email', 'designation')
    readonly_fields = ('id', 'created_at', 'updated_at')
