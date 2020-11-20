from django.test import testcases
from graphql_jwt.testcases import JSONWebTokenClient
from gwcloud_auth.schema import schema
from graphql_jwt.shortcuts import get_token
from graphql_jwt.settings import jwt_settings


class AuthJSONWebTokenClient(JSONWebTokenClient):
    """Auth test client with a custom authentication method."""

    def authenticate(self, user):
        """Payload for authentication in auth requires a special userID parameter."""
        self._credentials = {
            jwt_settings.JWT_AUTH_HEADER_NAME: "{0} {1}".format(
                jwt_settings.JWT_AUTH_HEADER_PREFIX, get_token(user, userId=user.id)
            ),
        }


class AuthTestCase(testcases.TestCase):
    """
    Auth test classes should inherit from this class.

    It overrides some settings that will be common to most auth test cases.

    Attributes
    ----------

    GRAPHQL_SCHEMA : schema object
        Uses the auth schema file as the default schema.

    GRAPHQL_URL : str
        Sets the graphql url to the current auth url.

    client_class : class
        Sets client to be a special auth specific object that uses a custom authentication.
        method.
    """

    GRAPHQL_SCHEMA = schema
    GRAPHQL_URL = "/graphql"
    client_class = AuthJSONWebTokenClient
