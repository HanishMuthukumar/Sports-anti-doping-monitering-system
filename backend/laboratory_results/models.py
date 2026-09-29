"""Laboratory Result model."""
import uuid
from django.db import models
from django.conf import settings


class ResultStatus(models.TextChoices):
    NEGATIVE = 'NEGATIVE', 'Negative'
    POSITIVE = 'POSITIVE', 'Positive'
    INVALID = 'INVALID', 'Invalid'
    INCONCLUSIVE = 'INCONCLUSIVE', 'Inconclusive'


class LaboratoryResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sample = models.OneToOneField(
        'samples.Sample',
        on_delete=models.CASCADE,
        related_name='result',
    )
    laboratory = models.ForeignKey(
        'laboratories.Laboratory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='results',
    )
    analyst = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='analyzed_results',
    )
    result_status = models.CharField(max_length=20, choices=ResultStatus.choices)
    test_method = models.CharField(max_length=200, blank=True)
    findings = models.TextField()
    comments = models.TextField(blank=True)
    report_reference = models.CharField(max_length=200, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'laboratory_results'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.sample.sample_number} — {self.result_status}'
