import datetime

import jwt
from django.conf import settings

from gwauth.models import GWCloudUser
from gwauth.tests.testcases import AuthTestCase
from gwauth.tests.test_utils import silence_errors


class TestQueriesSchema(AuthTestCase):
    @classmethod
    def setUpTestData(cls):
        payload = {
            'givenName': "buffy",
            'sn': "summers",
            'mail': 'buffy@slayer.com'
        }
        cls.buffy = GWCloudUser.ligo_update_or_create("buffy", payload)
        cls.bill = GWCloudUser.objects.create(username="bill", first_name="billy", last_name="nye", email="1@2.com")
        cls.sally = GWCloudUser.objects.create(username="sally", first_name="sally", last_name="gold", email="2@2.com")
        cls.mike = GWCloudUser.objects.create(username="mikel73", first_name="Mike", last_name="Pats", email="3@2.com")

    def get_token(self, user, secret):
        # Create the jwt token
        return jwt.encode(
            {
                'userId': user.id,
                'exp': datetime.datetime.now() + datetime.timedelta(days=30)
            },
            secret,
            algorithm='HS256'
        )

    @silence_errors
    def test_user_details(self):
        def run_query():
            return self.client.execute(
                """
                    query {
                        gwclouduser {
                        userId
                        username
                        firstName
                        lastName
                        isLigoUser
                        }
                    }
                """
            )

        # Check that the user must be logged in to get the current user
        self.assertEqual(
            run_query().errors[0].message,
            "You do not have permission to perform this action"
        )

        self.assertEqual(
            run_query().data["gwclouduser"],
            None
        )

        # Validate that a logged in user can get their own details
        self.client.authenticate(self.buffy)

        self.assertEqual(
            run_query().data["gwclouduser"],
            {
                'userId': self.buffy.id,
                'username': self.buffy.username,
                'firstName': self.buffy.first_name,
                'lastName': self.buffy.last_name,
                'isLigoUser': True
            }
        )

        self.client.authenticate(self.bill)

        self.assertEqual(
            run_query().data["gwclouduser"],
            {
                'userId': self.bill.id,
                'username': self.bill.username,
                'firstName': self.bill.first_name,
                'lastName': self.bill.last_name,
                'isLigoUser': False
            }
        )

    @silence_errors
    def test_username_filter(self):
        def run_query(search):
            return self.client.execute(
                f"""
                    query {{
                        usernameFilter(search: "{search}") {{
                        terms {{
                            term
                            users {{
                            userId
                            username
                            firstName
                            lastName
                            isLigoUser
                            }}
                        }}
                        }}
                    }}
                """
            )

        # Check that the user must be logged in to get the current user
        self.assertEqual(
            run_query("bil").errors[0].message,
            "You do not have permission to perform this action"
        )

        self.assertEqual(
            run_query("bil").data['usernameFilter'],
            None
        )

        # Validate that a normal user cannot access this query
        self.client.authenticate(self.buffy)

        self.assertEqual(
            run_query("bil").errors[0].message,
            "You do not have permission to perform this action"
        )

        # Validate that a user with a token based on the auth secret can access this query
        self.client.authenticate(token=self.get_token(self.buffy, settings.AUTH_SERVICE_JWT_SECRET))

        self.assertEqual(
            run_query("bil").data['usernameFilter'],
            {
                'terms': [
                    {
                        'term': 'bil',
                        'users': [
                            {
                                'userId': self.bill.id,
                                'username': self.bill.username,
                                'firstName': self.bill.first_name,
                                'lastName': self.bill.last_name,
                                'isLigoUser': self.bill.is_ligo_user
                            }
                        ]
                    }
                ]
            }
        )

        self.assertEqual(
            run_query("billy     ly").data['usernameFilter'],
            {
                'terms': [
                    {
                        'term': 'billy',
                        'users': [
                            {
                                'userId': self.bill.id,
                                'username': self.bill.username,
                                'firstName': self.bill.first_name,
                                'lastName': self.bill.last_name,
                                'isLigoUser': self.bill.is_ligo_user
                            }
                        ]
                    },
                    {
                        'term': 'ly',
                        'users': [
                            {
                                'userId': self.bill.id,
                                'username': self.bill.username,
                                'firstName': self.bill.first_name,
                                'lastName': self.bill.last_name,
                                'isLigoUser': self.bill.is_ligo_user
                            },
                            {
                                'userId': self.sally.id,
                                'username': self.sally.username,
                                'firstName': self.sally.first_name,
                                'lastName': self.sally.last_name,
                                'isLigoUser': self.sally.is_ligo_user
                            }
                        ]
                    }
                ]
            }
        )

    @silence_errors
    def test_username_lookup(self):
        def run_query(ids):
            return self.client.execute(
                f"""
                    query {{
                        usernameLookup(ids: [{ids}]) {{
                        userId
                        username
                        firstName
                        lastName
                        isLigoUser
                        }}
                    }}
                """
            )

        self.assertEqual(
            run_query(self.bill.id).errors[0].message,
            "You do not have permission to perform this action"
        )

        self.assertEqual(
            run_query(self.bill.id).data['usernameLookup'],
            None
        )

        # Validate that a normal user cannot access this query
        self.client.authenticate(self.buffy)

        self.assertEqual(
            run_query(self.bill.id).errors[0].message,
            "You do not have permission to perform this action"
        )

        # Validate that a user with a token based on the auth secret can access this query
        self.client.authenticate(token=self.get_token(self.buffy, settings.AUTH_SERVICE_JWT_SECRET))

        self.assertEqual(
            run_query(self.bill.id).data['usernameLookup'],
            [
                {
                    'userId': self.bill.id,
                    'username': self.bill.username,
                    'firstName': self.bill.first_name,
                    'lastName': self.bill.last_name,
                    'isLigoUser': self.bill.is_ligo_user
                }
            ]
        )

        self.assertEqual(
            run_query(f"{self.sally.id}, {self.buffy.id}").data['usernameLookup'],
            [
                {
                    'userId': self.buffy.id,
                    'username': self.buffy.username,
                    'firstName': self.buffy.first_name,
                    'lastName': self.buffy.last_name,
                    'isLigoUser': self.buffy.is_ligo_user
                },
                {
                    'userId': self.sally.id,
                    'username': self.sally.username,
                    'firstName': self.sally.first_name,
                    'lastName': self.sally.last_name,
                    'isLigoUser': self.sally.is_ligo_user
                }
            ]
        )
