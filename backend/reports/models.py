"""Report model for stored and exported reports."""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class ReportType(models.TextChoices):
    TESTING_STATISTICS = 'TESTING_STATISTICS', 'Testing Statistics'
    RESULT_STATISTICS = 'RESULT_STATISTICS', 'Result Statistics'
    VIOLATION_STATISTICS = 'VIOLATION_STATISTICS', 'Violation Statistics'
    LABORATORY_STATISTICS = 'LABORATORY_STATISTICS', 'Laboratory Statistics'
    ATHLETE_HISTORY = 'ATHLETE_HISTORY', 'Athlete History'
    MONTHLY_SUMMARY = 'MONTHLY_SUMMARY', 'Monthly Summary'


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_number = models.CharField(max_length=50, unique=True, blank=True)
    report_type = models.CharField(max_length=50, choices=ReportType.choices)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports',
    )
    description = models.TextField(blank=True)
    file_path = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.report_number} ({self.report_type})'

    def save(self, *args, **kwargs):
        if not self.report_number:
            year = timezone.now().year
            suffix = str(self.id).replace('-', '')[-6:].upper()
            self.report_number = f'REP-{year}-{suffix}'
        super().save(*args, **kwargs)
