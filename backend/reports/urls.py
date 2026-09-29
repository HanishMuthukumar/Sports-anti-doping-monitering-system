from django.urls import path
from .views import (
    DashboardSummaryView,
    TestingReportView,
    ViolationReportView,
    MonthlySummaryReportView,
    LaboratoryReportView,
    ReportListView,
)

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='report-dashboard'),
    path('testing/', TestingReportView.as_view(), name='report-testing'),
    path('violations/', ViolationReportView.as_view(), name='report-violations'),
    path('monthly/', MonthlySummaryReportView.as_view(), name='report-monthly'),
    path('laboratories/', LaboratoryReportView.as_view(), name='report-laboratories'),
    path('list/', ReportListView.as_view(), name='report-list'),
]
