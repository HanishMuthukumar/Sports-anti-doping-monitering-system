from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LaboratoryViewSet, LaboratoryStaffViewSet

router = DefaultRouter()
router.register('staff', LaboratoryStaffViewSet, basename='lab-staff')
router.register('', LaboratoryViewSet, basename='laboratory')
urlpatterns = [path('', include(router.urls))]
