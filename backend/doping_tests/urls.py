from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DopingTestViewSet

router = DefaultRouter()
router.register('', DopingTestViewSet, basename='doping-test')
urlpatterns = [path('', include(router.urls))]
