import datetime
from calendar import timegm

from django.test import TestCase
from django.utils import timezone
from graphql_jwt.settings import jwt_settings

from gwauth.models import GWCloudUser, Verification
from gwauth.utility import jwt_payload, get_token


class TestUtils(TestCase):
    def setUp(self):
        self.user = GWCloudUser.objects.create(
            username="testuser",
            first_name="Bill",
            last_name="Nye",
            email="billnye@scienceguy.com",
        )

    def test_jwt_payload(self):
        result = jwt_payload(self.user)

        self.assertIn(
            self.user.USERNAME_FIELD,
            result,
            "username was not in generated JWT payload",
        )
        self.assertIn("exp", result, "expiry was not in generated JWT payload")
        self.assertIn("userId", result, "user id was not in generated JWT payload")
        self.assertIn("isLigo", result, "is ligo user was not in generated JWT payload")

        self.assertEqual(
            result[self.user.USERNAME_FIELD],
            self.user.username,
            "username was not the expected value",
        )
        self.assertAlmostEqual(
            result["exp"],
            timegm(
                (
                    datetime.datetime.utcnow() + jwt_settings.JWT_EXPIRATION_DELTA
                ).utctimetuple()
            ),
            delta=5,
            msg="expiry was not the expected value",
        )
        self.assertAlmostEqual(
            result["origIat"],
            timegm(datetime.datetime.utcnow().utctimetuple()),
            delta=5,
            msg="Issued at time was not the expected value",
        )
        self.assertEqual(result["isLigo"], False, "isLigo was incorrect")

        # Check that isLigo updates as expected
        self.user.is_ligo_user = True
        self.user.save()

        result = jwt_payload(self.user)
        self.assertEqual(result["isLigo"], True, "isLigo was incorrect")

    def test_get_token(self):
        # First test success

        _id = get_token("myinfo", None)
        v = Verification.objects.filter(id=_id)
        self.assertTrue(v.exists())
        v = v.first()
        self.assertEqual(v.information, "myinfo")
        self.assertEqual(v.expiry, None)
        self.assertEqual(v.verified, False)

        _id = get_token("myinfo", 60)
        v = Verification.objects.filter(id=_id)
        self.assertTrue(v.exists())
        v = v.first()
        self.assertEqual(v.information, "myinfo")
        now = timezone.localtime(timezone.now())
        expiry = now + datetime.timedelta(seconds=60)
        self.assertAlmostEqual(v.expiry, expiry, delta=datetime.timedelta(seconds=5))
        self.assertEqual(v.verified, False)
