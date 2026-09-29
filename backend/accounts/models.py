"""Custom User model with role-based access control."""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Role(models.TextChoices):
    ADMINISTRATOR = 'ADMINISTRATOR', 'Administrator'
    ATHLETE = 'ATHLETE', 'Athlete'
    DOPING_CONTROL_OFFICER = 'DOPING_CONTROL_OFFICER', 'Doping Control Officer'
    LABORATORY_STAFF = 'LABORATORY_STAFF', 'Laboratory Staff'
    SPORTS_AUTHORITY = 'SPORTS_AUTHORITY', 'Sports Authority'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('An email address is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.ADMINISTRATOR)
        if not extra_fields.get('username'):
            extra_fields['username'] = email.split('@')[0]
        if not extra_fields.get('first_name'):
            extra_fields['first_name'] = 'Super'
        if not extra_fields.get('last_name'):
            extra_fields['last_name'] = 'Admin'
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.ATHLETE)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}>'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()
