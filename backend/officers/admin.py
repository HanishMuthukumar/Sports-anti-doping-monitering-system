from django.contrib import admin
from .models import DopingControlOfficer

@admin.register(DopingControlOfficer)
class OfficerAdmin(admin.ModelAdmin):
    list_display = ('officer_id', 'user', 'organization', 'status')
    list_filter = ('status',)
    search_fields = ('officer_id', 'user__email', 'organization')
    readonly_fields = ('id', 'created_at', 'updated_at')
