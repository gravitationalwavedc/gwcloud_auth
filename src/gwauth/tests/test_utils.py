import datetime
from calendar import timegm

from django.test import TestCase
from graphql_jwt.settings import jwt_settings

from gwauth.models import GWCloudUser
from gwauth.utility import jwt_payload


class TestUtils(TestCase):
    def setUp(self):
        self.user = GWCloudUser.objects.create(
            username="testuser",
            first_name="Bill",
            last_name="Nye",
            email="billnye@scienceguy.com"
        )

    def test_jwt_payload(self):
        result = jwt_payload(self.user)

        self.assertIn(self.user.USERNAME_FIELD, result, "username was not in generated JWT payload")
        self.assertIn("exp", result, "expiry was not in generated JWT payload")
        self.assertIn("userId", result, "user id was not in generated JWT payload")

        self.assertEqual(result[self.user.USERNAME_FIELD], self.user.username, "username was not the expected value")
        self.assertAlmostEqual(
            result["exp"],
            datetime.datetime.utcnow() + jwt_settings.JWT_EXPIRATION_DELTA,
            delta=datetime.timedelta(seconds=5),
            msg="expiry was not the expected value"
        )
        self.assertAlmostEqual(
            result['origIat'],
            timegm(datetime.datetime.utcnow().utctimetuple()),
            delta=5,
            msg="Issued at time was not the expected value"
        )
