import datetime

from django.test import TestCase
from django.utils import timezone

from gwauth.models import Verification


class TestVerificationModel(TestCase):
    def test_create(self):
        expiry = timezone.now() + datetime.timedelta(days=1)
        v = Verification.create("test_info", expiry)

        self.assertEqual(v.information, "test_info")
        self.assertEqual(v.expiry, expiry)

        v.delete()

    def test_get_unverified(self):
        expiry = timezone.now() - datetime.timedelta(days=1)
        v_expired = Verification.create("test_info", expiry)

        expiry = timezone.now() + datetime.timedelta(days=1)
        v_ok = Verification.create("test_info", expiry)

        expiry = timezone.now() + datetime.timedelta(days=1)
        v_verified = Verification.create("test_info", expiry)
        v_verified.verified = True
        v_verified.save()

        with self.assertRaises(Verification.DoesNotExist):
            Verification.get_unverified(v_expired.id)

        with self.assertRaises(Verification.DoesNotExist):
            Verification.get_unverified(v_verified.id)

        v = Verification.get_unverified(v_ok.id)
        self.assertEqual(v, v_ok)

        v.verified = True
        v.save()

        with self.assertRaises(Verification.DoesNotExist):
            Verification.get_unverified(v_ok.id)
