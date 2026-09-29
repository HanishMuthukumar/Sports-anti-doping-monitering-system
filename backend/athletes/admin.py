from django.contrib import admin
from .models import Athlete

@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ('athlete_id', 'user', 'sport', 'nationality', 'status')
    list_filter = ('status', 'sport')
    search_fields = ('athlete_id', 'user__email', 'user__first_name', 'user__last_name', 'sport')
    readonly_fields = ('id', 'created_at', 'updated_at')
