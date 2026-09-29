from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LaboratoryResultViewSet

router = DefaultRouter()
router.register('', LaboratoryResultViewSet, basename='laboratory-result')

urlpatterns = [
    path('', include(router.urls)),
]
