"""Athlete profile model."""
import uuid
from django.db import models
from django.conf import settings


class AthleteStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    SUSPENDED = 'SUSPENDED', 'Suspended'


class Athlete(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='athlete_profile',
    )
    athlete_id = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    sport = models.CharField(max_length=100)
    nationality = models.CharField(max_length=100, blank=True)
    team = models.CharField(max_length=100, blank=True)
    coach = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=AthleteStatus.choices, default=AthleteStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'athletes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['athlete_id']),
            models.Index(fields=['sport']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.athlete_id})'
