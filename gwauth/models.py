import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class GWCloudUser(AbstractUser):
    pass


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
