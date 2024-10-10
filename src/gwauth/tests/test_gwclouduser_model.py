from django.test import TestCase

from gwauth.models import GWCloudUser


class TestGWCloudUserModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.bill = GWCloudUser.objects.create(username="bill", first_name="billy", last_name="nye", email="1@2.com")
        cls.sally = GWCloudUser.objects.create(username="sally", first_name="sally", last_name="gold", email="2@2.com")
        cls.mike = GWCloudUser.objects.create(username="mikel73", first_name="Mike", last_name="Pats", email="3@2.com")

    def test_filter_by_ids(self):
        self.assertSequenceEqual(
            GWCloudUser.filter_by_ids([self.bill.id, self.mike.id]),
            [self.bill, self.mike]
        )

        self.assertSequenceEqual(
            GWCloudUser.filter_by_ids([self.sally.id, self.bill.id]),
            [self.bill, self.sally]
        )

    def test_filter_by_term(self):
        # Test case insensitivity
        for term in ["bill", "Bill", "BILL"]:
            self.assertSequenceEqual(
                GWCloudUser.filter_by_term(term),
                [self.bill]
            )

        # Test username, first and last names
        for term in ["bill", "billy", "nye"]:
            self.assertSequenceEqual(
                GWCloudUser.filter_by_term(term),
                [self.bill]
            )

        # Test multiple users
        self.assertSequenceEqual(
            GWCloudUser.filter_by_term("l"),
            [self.bill, self.sally, self.mike]
        )

        self.assertSequenceEqual(
            GWCloudUser.filter_by_term("ly"),
            [self.bill, self.sally]
        )

        self.assertSequenceEqual(
            GWCloudUser.filter_by_term("s"),
            [self.sally, self.mike]
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
            'uid': '1234',
            'givenName': "buffy",
            'sn': "summers",
            'mail': 'buffy@slayer.com'
        }

        self.assertFalse(GWCloudUser.does_user_exist("buffy123"))
        buffy = GWCloudUser.ligo_update_or_create(payload)

        self.assertEqual(buffy.first_name, payload['givenName'])
        self.assertEqual(buffy.last_name, payload['sn'])
        self.assertEqual(buffy.email, payload['mail'])

        payload['sn'] = "married"
        payload['mail'] = 'buffymarried@slayer.com'
        GWCloudUser.ligo_update_or_create(payload)

        buffy.refresh_from_db()
        self.assertEqual(buffy.first_name, payload['givenName'])
        self.assertEqual(buffy.last_name, payload['sn'])
        self.assertEqual(buffy.email, payload['mail'])
