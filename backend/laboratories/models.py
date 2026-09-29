"""Laboratory and LaboratoryStaff models."""
import uuid
from django.db import models
from django.conf import settings


class LabStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'


class Laboratory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    laboratory_name = models.CharField(max_length=200)
    accreditation_number = models.CharField(max_length=100, unique=True, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    status = models.CharField(max_length=20, choices=LabStatus.choices, default=LabStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'laboratories'
        ordering = ['laboratory_name']
        verbose_name_plural = 'Laboratories'

    def __str__(self):
        return self.laboratory_name


class LaboratoryStaff(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lab_staff_profile',
    )
    laboratory = models.ForeignKey(
        Laboratory,
        on_delete=models.CASCADE,
        related_name='staff',
    )
    staff_id = models.CharField(max_length=50, unique=True)
    designation = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=LabStatus.choices, default=LabStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'laboratory_staff'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.get_full_name()} — {self.laboratory.laboratory_name}'
