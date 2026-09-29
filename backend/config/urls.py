"""URL configuration for Sports Anti-Doping Monitoring System."""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('accounts.urls')),
    path('api/users/', include('accounts.user_urls')),
    path('api/athletes/', include('athletes.urls')),
    path('api/officers/', include('officers.urls')),
    path('api/laboratories/', include('laboratories.urls')),
    path('api/tests/', include('doping_tests.urls')),
    path('api/samples/', include('samples.urls')),
    path('api/results/', include('laboratory_results.urls')),
    path('api/violations/', include('violations.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),
]
