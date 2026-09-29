"""Sample model with chain-of-custody state machine."""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone


class SampleType(models.TextChoices):
    URINE = 'URINE', 'Urine'
    BLOOD = 'BLOOD', 'Blood'
    OTHER = 'OTHER', 'Other'


class SampleStatus(models.TextChoices):
    COLLECTED = 'COLLECTED', 'Collected'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    RECEIVED = 'RECEIVED', 'Received'
    UNDER_ANALYSIS = 'UNDER_ANALYSIS', 'Under Analysis'
    ANALYZED = 'ANALYZED', 'Analyzed'
    INVALID = 'INVALID', 'Invalid'


SAMPLE_VALID_TRANSITIONS = {
    SampleStatus.COLLECTED: [SampleStatus.SUBMITTED],
    SampleStatus.SUBMITTED: [SampleStatus.RECEIVED],
    SampleStatus.RECEIVED: [SampleStatus.UNDER_ANALYSIS],
    SampleStatus.UNDER_ANALYSIS: [SampleStatus.ANALYZED, SampleStatus.INVALID],
    SampleStatus.ANALYZED: [],
    SampleStatus.INVALID: [],
}


class Sample(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sample_number = models.CharField(max_length=50, unique=True, blank=True)
    doping_test = models.ForeignKey(
        'doping_tests.DopingTest',
        on_delete=models.CASCADE,
        related_name='samples',
    )
    sample_type = models.CharField(max_length=20, choices=SampleType.choices, default=SampleType.URINE)
    collection_date = models.DateField()
    collection_time = models.TimeField(null=True, blank=True)
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_samples',
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    received_by = models.ForeignKey(
        'laboratories.LaboratoryStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_samples',
    )
    status = models.CharField(max_length=20, choices=SampleStatus.choices, default=SampleStatus.COLLECTED)
    chain_of_custody_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'samples'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['doping_test']),
        ]

    def __str__(self):
        return f'{self.sample_number} ({self.status})'

    def save(self, *args, **kwargs):
        if not self.sample_number:
            suffix = str(self.id).replace('-', '')[-6:].upper()
            self.sample_number = f'SMP-{suffix}'
        super().save(*args, **kwargs)

    def transition_status(self, new_status, user=None, notes=''):
        """Validate and apply a chain-of-custody transition."""
        allowed = SAMPLE_VALID_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(
                f"Cannot transition sample from '{self.status}' to '{new_status}'. "
                f"Allowed: {[s for s in allowed] or 'none'}."
            )
        now = timezone.now()
        timestamp = now.strftime('%Y-%m-%d %H:%M UTC')
        user_name = user.get_full_name() if user else 'System'
        entry = f'[{timestamp}] {user_name}: {self.status} → {new_status}'
        if notes:
            entry += f' — {notes}'
        self.chain_of_custody_notes = f'{self.chain_of_custody_notes}\n{entry}'.strip()
        self.status = new_status
        if new_status == SampleStatus.SUBMITTED:
            self.submitted_at = now
        elif new_status == SampleStatus.RECEIVED:
            self.received_at = now
        self.save()
