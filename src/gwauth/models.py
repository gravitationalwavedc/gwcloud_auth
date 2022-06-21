import uuid
import hashlib
from datetime import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.conf import settings


class GWCloudUser(AbstractUser):
    IS_ADMIN = 'Admin'
    IS_USER = 'User'
    ROLE_CHOICES = [
        (IS_ADMIN, IS_ADMIN),
        (IS_USER, IS_USER),
    ]
    role = models.CharField(max_length=5, choices=ROLE_CHOICES, default=IS_USER, blank=False)

    UNVERIFIED = 'Unverified'
    VERIFIED = 'Verified'
    CONFIRMED = 'Confirmed'
    DELETED = 'Deleted'
    STATUS_CHOICES = [
        (UNVERIFIED, UNVERIFIED),
        (VERIFIED, VERIFIED),
        (CONFIRMED, CONFIRMED),
        (DELETED, DELETED),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, blank=False, default=UNVERIFIED)
    is_ligo_user = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    @classmethod
    def filter_by_ids(cls, ids):
        """
        Returns a list of GWCloudUser objects with the specified ids

        :param ids: An array of ids to match
        :return: QuerySet
        """
        return cls.objects.filter(id__in=ids)

    @classmethod
    def filter_by_term(cls, term):
        """
        Filters all users based on the provided term.

        Currently this matches on username, first_name, and last_name

        :param term: The term to search on
        :return: QuerySet
        """
        return cls.objects.filter(
            Q(username__icontains=term) |
            Q(first_name__icontains=term) |
            Q(last_name__icontains=term)
        )

    @classmethod
    def get_by_username(cls, username):
        """
        Returns a GWCloudUser object by username

        :param username: The username
        :return: A GWCloudUser object
        """
        return cls.objects.get(username=username)

    @classmethod
    def does_user_exist(cls, username):
        """
        Checks if any user exists with the specified username

        :param username: The username
        :return: True or False
        """
        return cls.objects.filter(username=username).exists()

    @classmethod
    def ligo_update_or_create(cls, username, ligo_payload):
        """
        Updates a ligo users details if a user exists with username, otherwise creates a new ligo user with the details
        from the provided payload

        :param username: The username of the user to create or update
        :param ligo_payload: The ligo payload sent from shibboleth
        :return: GWCloudUser
        """
        return cls.objects.update_or_create(
            username=username,
            defaults={
                "first_name": ligo_payload['givenName'],
                "last_name": ligo_payload['sn'],
                "email": ligo_payload['mail'],
                "is_ligo_user": True
            }
        )[0]


class Verification(models.Model):
    """
    Model to store information for email address verification.
    Can also be used for other verifications as well.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    information = models.CharField(max_length=1024)
    expiry = models.DateTimeField(null=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return u'%s' % self.information

    @classmethod
    def create(cls, information, expiry):
        """
        Creates a new verification object

        :param information: The information to store about the verification
        :param expiry: When the verification expires

        :return: Verification object
        """
        return cls.objects.create(information=information, expiry=expiry)

    @classmethod
    def get_unverified(cls, vid):
        """
        Returns the Verification with tkid, making sure that the verification has not previously been verified, and
        that the Verification is not expired

        :param vid: The id of the verification object (This is a UUID string)
        :return: The Verification object
        """
        now = timezone.localtime(timezone.now())
        return cls.objects.get(id=vid, expiry__gte=now, verified=False)


class APIToken(models.Model):
    """
    Model to store unique token for a specific user and app
    """
    APP_CHOICES = [
        ("gwcloud", "GWCloud"),
        ("gwlab", "GWLab"),
        ("gwlandscape", "GWLandscape")
    ]
    user = models.ForeignKey('GWCloudUser', blank=False, on_delete=models.CASCADE)
    app = models.CharField(max_length=32, choices=APP_CHOICES, blank=False, default="gwcloud")
    token = models.CharField(max_length=64, unique=True, default=None)

    def save(self, *args, **kwargs):
        if self.token is None:
            token_str = self.user.first_name + self.user.last_name + self.app + \
                datetime.now().strftime("%m%d%Y%H%M%S") + settings.SECRET_KEY
            self.token = hashlib.sha256(token_str.encode('utf-8')).hexdigest()
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ('user', 'app',)
