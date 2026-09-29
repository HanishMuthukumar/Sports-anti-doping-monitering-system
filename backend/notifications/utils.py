"""Utility function to create notifications."""
from .models import Notification, NotificationType


def create_notification(user, title, message, notification_type=NotificationType.GENERAL,
                        related_object_type='', related_object_id=''):
    """Create a notification for a user."""
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_object_type=related_object_type,
        related_object_id=str(related_object_id),
    )


def notify_users_by_role(role, title, message, notification_type=NotificationType.GENERAL,
                          related_object_type='', related_object_id=''):
    """Send a notification to all users with a given role."""
    from accounts.models import User
    users = User.objects.filter(role=role, is_active=True)
    notifications = [
        Notification(
            user=u,
            title=title,
            message=message,
            notification_type=notification_type,
            related_object_type=related_object_type,
            related_object_id=str(related_object_id),
        )
        for u in users
    ]
    Notification.objects.bulk_create(notifications)
