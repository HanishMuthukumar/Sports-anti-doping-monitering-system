"""Violation model with validation and transitions."""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone


class ViolationStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    ACTION_TAKEN = 'ACTION_TAKEN', 'Action Taken'
    CLOSED = 'CLOSED', 'Closed'


VIOLATION_VALID_TRANSITIONS = {
    ViolationStatus.OPEN: [ViolationStatus.UNDER_REVIEW],
    ViolationStatus.UNDER_REVIEW: [ViolationStatus.ACTION_TAKEN],
    ViolationStatus.ACTION_TAKEN: [ViolationStatus.CLOSED],
    ViolationStatus.CLOSED: [],
}


class Violation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    violation_number = models.CharField(max_length=50, unique=True, blank=True)
    athlete = models.ForeignKey(
        'athletes.Athlete',
        on_delete=models.CASCADE,
        related_name='violations',
    )
    doping_test = models.ForeignKey(
        'doping_tests.DopingTest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='violations',
    )
    sample = models.ForeignKey(
        'samples.Sample',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='violations',
    )
    laboratory_result = models.ForeignKey(
        'laboratory_results.LaboratoryResult',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='violations',
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ViolationStatus.choices,
        default=ViolationStatus.OPEN,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_violations',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    action_taken = models.TextField(blank=True)
    action_date = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'violations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['athlete']),
            models.Index(fields=['violation_number']),
        ]

    def __str__(self):
        return f'{self.violation_number} - {self.athlete} ({self.status})'

    def save(self, *args, **kwargs):
        if not self.violation_number:
            year = timezone.now().year
            suffix = str(self.id).replace('-', '')[-6:].upper()
            self.violation_number = f'ADR-{year}-{suffix}'
        super().save(*args, **kwargs)

    def transition_status(self, new_status, user=None, remarks='', action_taken=None, action_date=None):
        allowed = VIOLATION_VALID_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(
                f"Cannot transition violation from '{self.status}' to '{new_status}'. "
                f"Allowed: {[s for s in allowed] or 'none'}."
            )
        now = timezone.now()
        self.status = new_status
        if remarks:
            self.remarks = f"{self.remarks}\n[{new_status}] {remarks}".strip()

        if new_status == ViolationStatus.UNDER_REVIEW:
            self.reviewed_by = user
            self.reviewed_at = now
        elif new_status == ViolationStatus.ACTION_TAKEN:
            if action_taken:
                self.action_taken = action_taken
            self.action_date = action_date or now.date()
        elif new_status == ViolationStatus.CLOSED:
            if not self.action_date:
                self.action_date = now.date()

        self.save()
