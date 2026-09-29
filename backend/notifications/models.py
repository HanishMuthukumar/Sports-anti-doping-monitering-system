"""Notification model."""
import uuid
from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    TEST_SCHEDULED = 'TEST_SCHEDULED', 'Test Scheduled'
    SAMPLE_COLLECTED = 'SAMPLE_COLLECTED', 'Sample Collected'
    SAMPLE_SUBMITTED = 'SAMPLE_SUBMITTED', 'Sample Submitted'
    SAMPLE_RECEIVED = 'SAMPLE_RECEIVED', 'Sample Received'
    ANALYSIS_STARTED = 'ANALYSIS_STARTED', 'Analysis Started'
    RESULT_GENERATED = 'RESULT_GENERATED', 'Result Generated'
    POSITIVE_RESULT = 'POSITIVE_RESULT', 'Positive Result'
    VIOLATION_CREATED = 'VIOLATION_CREATED', 'Violation Created'
    VIOLATION_REVIEWED = 'VIOLATION_REVIEWED', 'Violation Reviewed'
    ACTION_TAKEN = 'ACTION_TAKEN', 'Action Taken'
    VIOLATION_CLOSED = 'VIOLATION_CLOSED', 'Violation Closed'
    GENERAL = 'GENERAL', 'General'


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.CharField(max_length=100, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f'{self.title} → {self.user.email}'
