from django.test import TestCase
from django.conf import settings

from gwauth.models import GWCloudUser

from hashlib import sha3_512


class TestGWCloudUserModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.bill = GWCloudUser.objects.create(
            username="bill", first_name="billy", last_name="nye", email="1@2.com"
        )
        cls.sally = GWCloudUser.objects.create(
            username="sally", first_name="sally", last_name="gold", email="2@2.com"
        )
        cls.mike = GWCloudUser.objects.create(
            username="mikel73", first_name="Mike", last_name="Pats", email="3@2.com"
        )

    def test_filter_by_ids(self):
        self.assertSequenceEqual(
            GWCloudUser.filter_by_ids([self.bill.id, self.mike.id]),
            [self.bill, self.mike],
        )

        self.assertSequenceEqual(
            GWCloudUser.filter_by_ids([self.sally.id, self.bill.id]),
            [self.bill, self.sally],
        )

    def test_filter_by_term(self):
        # Test case insensitivity
        for term in ["bill", "Bill", "BILL"]:
            self.assertSequenceEqual(GWCloudUser.filter_by_term(term), [self.bill])

        # Test username, first and last names
        for term in ["bill", "billy", "nye"]:
            self.assertSequenceEqual(GWCloudUser.filter_by_term(term), [self.bill])

        # Test multiple users
        self.assertSequenceEqual(
            GWCloudUser.filter_by_term("l"), [self.bill, self.sally, self.mike]
        )

        self.assertSequenceEqual(
            GWCloudUser.filter_by_term("ly"), [self.bill, self.sally]
        )

        self.assertSequenceEqual(
            GWCloudUser.filter_by_term("s"), [self.sally, self.mike]
        )

    def test_get_by_username(self):
        self.assertEqual(GWCloudUser.get_by_username("bill"), self.bill)
        self.assertEqual(GWCloudUser.get_by_username("mikel73"), self.mike)

    def test_does_user_exist(self):
        self.assertTrue(GWCloudUser.does_user_exist("bill"))
        self.assertFalse(GWCloudUser.does_user_exist("billy"))
        self.assertTrue(GWCloudUser.does_user_exist("mikel73"))
        self.assertFalse(GWCloudUser.does_user_exist("mike"))

    def test_ligo_update_or_create(self):
        payload = {
            "uid": "1234",
            "givenName": "buffy",
            "sn": "summers",
            "mail": "buffy@slayer.com",
        }

        self.assertFalse(GWCloudUser.does_user_exist("buffy123"))
        buffy = GWCloudUser.ligo_update_or_create(payload)

        self.assertEqual(buffy.first_name, payload["givenName"])
        self.assertEqual(buffy.last_name, payload["sn"])
        self.assertEqual(buffy.email, payload["mail"])

        payload["sn"] = "married"
        payload["mail"] = "buffymarried@slayer.com"
        GWCloudUser.ligo_update_or_create(payload)

        buffy.refresh_from_db()
        self.assertEqual(buffy.first_name, payload["givenName"])
        self.assertEqual(buffy.last_name, payload["sn"])
        self.assertEqual(buffy.email, payload["mail"])

    def test_ligo_update_or_create_old_uid(self):
        userhash = sha3_512(
            ("buffy.summers" + settings.SECRET_KEY).encode()
        ).hexdigest()
        # Create a user bypassing the normal method, so we can have the old-style
        # firstname.lastname UID rather than an integer (but actually a string) UID
        user = GWCloudUser.objects.create(
            username=userhash, email="buffy.summers@slayer.com"
        )
        payload = {
            "uid": "1234",
            "givenName": "buffy",
            "sn": "summers",
            "mail": "buffy.summers@slayer.com",
        }
        new_username_hash = sha3_512(
            (payload["uid"] + settings.SECRET_KEY).encode()
        ).hexdigest()

        tested_user = GWCloudUser.ligo_update_or_create(payload)
        self.assertEqual(user.id, tested_user.id)

        self.assertEqual(tested_user.first_name, payload["givenName"])
        self.assertEqual(tested_user.last_name, payload["sn"])
        self.assertEqual(tested_user.email, payload["mail"])
        self.assertEqual(tested_user.username, new_username_hash)
