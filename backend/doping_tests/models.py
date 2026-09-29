"""Doping Test model with state machine."""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class TestStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    SAMPLE_COLLECTED = 'SAMPLE_COLLECTED', 'Sample Collected'
    SAMPLE_SUBMITTED = 'SAMPLE_SUBMITTED', 'Sample Submitted'
    UNDER_ANALYSIS = 'UNDER_ANALYSIS', 'Under Analysis'
    RESULT_GENERATED = 'RESULT_GENERATED', 'Result Generated'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class TestType(models.TextChoices):
    IN_COMPETITION = 'IN_COMPETITION', 'In-Competition'
    OUT_OF_COMPETITION = 'OUT_OF_COMPETITION', 'Out-of-Competition'
    TARGETED = 'TARGETED', 'Targeted'
    FOLLOW_UP = 'FOLLOW_UP', 'Follow-up'


VALID_TEST_TRANSITIONS = {
    TestStatus.SCHEDULED: [TestStatus.SAMPLE_COLLECTED, TestStatus.CANCELLED],
    TestStatus.SAMPLE_COLLECTED: [TestStatus.SAMPLE_SUBMITTED],
    TestStatus.SAMPLE_SUBMITTED: [TestStatus.UNDER_ANALYSIS],
    TestStatus.UNDER_ANALYSIS: [TestStatus.RESULT_GENERATED],
    TestStatus.RESULT_GENERATED: [TestStatus.COMPLETED],
    TestStatus.COMPLETED: [],
    TestStatus.CANCELLED: [],
}


class DopingTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test_number = models.CharField(max_length=50, unique=True, blank=True)
    athlete = models.ForeignKey(
        'athletes.Athlete',
        on_delete=models.CASCADE,
        related_name='tests',
    )
    officer = models.ForeignKey(
        'officers.DopingControlOfficer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tests',
    )
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField(null=True, blank=True)
    test_type = models.CharField(max_length=30, choices=TestType.choices, default=TestType.IN_COMPETITION)
    location = models.CharField(max_length=255)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=TestStatus.choices, default=TestStatus.SCHEDULED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doping_tests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['athlete']),
            models.Index(fields=['officer']),
        ]

    def __str__(self):
        return f'{self.test_number} — {self.athlete}'

    def save(self, *args, **kwargs):
        if not self.test_number:
            from django.utils import timezone
            year = timezone.now().year
            # Use last 6 hex chars of UUID for uniqueness
            suffix = str(self.id).replace('-', '')[-6:].upper()
            self.test_number = f'DST-{year}-{suffix}'
        super().save(*args, **kwargs)

    def transition_status(self, new_status, notes=''):
        """Validate and apply a status transition."""
        allowed = VALID_TEST_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(
                f"Cannot transition from '{self.status}' to '{new_status}'. "
                f"Allowed: {[s for s in allowed] or 'none'}."
            )
        self.status = new_status
        if notes:
            self.notes = f'{self.notes}\n[{new_status}] {notes}'.strip()
        self.save()
