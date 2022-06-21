import logging

from graphql_jwt.shortcuts import get_user_by_token

from gwauth.models import GWCloudUser, APIToken
from gwauth.tests.testcases import AuthTestCase


class TestAPIToken(AuthTestCase):
    def setUp(self):
        self.user = GWCloudUser.objects.create(
            username="billnye",
            first_name="Bill",
            last_name="Nye",
            email="billnye@scienceguy.com"
        )

    def test_create_api_token(self):
        """
        Check that an API token can be created with a mutation
        """
        try:
            logging.disable(logging.ERROR)

            def run_query():
                return self.client.execute(
                    """
                        mutation {
                            createApiToken(input: {
                                app: "gwcloud"
                            })
                            {
                                result {
                                    app
                                    token
                                }
                            }
                        }
                    """
                )

            # User is not authenticated, mutation fails
            self.assertEqual(
                run_query().errors[0].message,
                "You do not have permission to perform this action"
            )

            self.client.authenticate(self.user)

            # User is authenticated, mutation succeeds
            self.assertEqual(
                run_query().data['createApiToken']['result']['token'],
                APIToken.objects.all().last().token,
                "API token creation mutation does not run correctly."
            )
        finally:
            logging.disable(logging.NOTSET)

    def test_get_api_token(self):
        """
        Check that an API token can be obtained with a query
        """
        try:
            logging.disable(logging.ERROR)

            def run_query():
                return self.client.execute(
                    """
                        query {
                            apiToken(
                                app: "gwcloud"
                            )
                        }
                    """
                )

            token = APIToken.objects.create(user=self.user, app="gwcloud")

            # User is not authenticated, query fails
            self.assertEqual(
                run_query().errors[0].message,
                'You do not have permission to perform this action'
            )

            self.client.authenticate(self.user)

            # User is authenticated, query succeeds
            self.assertEqual(
                run_query().data['apiToken'],
                token.token,
                "API token query returned unexpected data."
            )
        finally:
            logging.disable(logging.NOTSET)

    def test_revoke_api_token(self):
        """
        Check that an API token can be revoked with a mutation
        """
        try:
            logging.disable(logging.ERROR)

            def run_query():
                return self.client.execute(
                    """
                        mutation {
                            revokeApiToken(input: {
                                app: "gwcloud"
                            })
                            {
                                result
                            }
                        }
                    """
                )

            APIToken.objects.create(user=self.user, app="gwcloud")

            # User is not authenticated, mutation fails
            self.assertEqual(
                run_query().errors[0].message,
                'You do not have permission to perform this action'
            )

            self.client.authenticate(self.user)

            # User is authenticated, mutation succeeds
            self.assertEqual(
                run_query().data['revokeApiToken']['result'],
                f"{self.user.username}\'s API token for the gwcloud app has been deleted",
                'No return message upon token deletion'
            )

            self.assertFalse(
                APIToken.objects.all().exists(), "queryset of API Tokens is not empty."
            )
        finally:
            logging.disable(logging.NOTSET)


class TestJWTFromAPIToken(AuthTestCase):
    def setUp(self):
        self.user = GWCloudUser.objects.create(
            username="testuser",
            first_name="Bill",
            last_name="Nye",
            email="billnye@scienceguy.com"
        )

        self.client.authenticate(self.user)

        self.token = APIToken.objects.create(
            user=self.user,
            app="gwcloud"
        )

    def test_jwt_auth(self):
        """
        Test that a JWT for the correct user can be created using an API Token
        """

        response = self.client.execute(
            f"""
                query {{
                    jwtToken(
                        token: "{self.token.token}"
                    ) {{
                        jwtToken
                        refreshToken
                    }}
                }}
            """,
            HTTP_HOST="gwcloud.org.au"
        )

        jwt_token = response.data['jwtToken']['jwtToken']
        self.assertEqual(get_user_by_token(jwt_token), self.user, "user not being correctly encoded into jwt")
