"""Doping Control Officer model."""
import uuid
from django.db import models
from django.conf import settings


class OfficerStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'


class DopingControlOfficer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='officer_profile',
    )
    officer_id = models.CharField(max_length=50, unique=True)
    certification_number = models.CharField(max_length=100, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=OfficerStatus.choices, default=OfficerStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'officers'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.officer_id})'
