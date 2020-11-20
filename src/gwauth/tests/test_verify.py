import responses
from django.contrib.auth import get_user_model
from django.core import mail

from gwauth.models import Verification
from gwauth.tests.testcases import AuthTestCase


class TestVerify(AuthTestCase):
    def test_invalid_token(self):
        """
        Check that invalid token fails as expected
        """
        response = self.client.execute(
            """
                mutation {
                  verify(input: {
                    code: "nonexistanttoken"
                  })
                  {
                    result {
                      result
                    }
                  }
                }
            """
        )

        expected = {
            "verify": {
                "result": {
                    "result": False,
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

    @responses.activate
    def test_successful_verify(self):
        """
        Check that a valid verification succeeds
        """
        # First create the new user
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': True}, status=200)

        self.client.execute(
            """
                mutation {
                  register(input: {
                    email: "bill@nye.com"
                    firstName: "Bill"
                    lastName: "Nye"
                    password: "billnye123!"
                    captcha: "captcha123"
                  })
                  {
                    result {
                      result
                      errors {
                        field
                        messages
                      }
                    }
                  }
                }
            """
        )

        # Get the created user
        user = get_user_model().objects.get(username="bill@nye.com")
        self.assertFalse(user.is_active)
        self.assertEqual(user.status, get_user_model().UNVERIFIED)

        # Get the created Verification token
        token = Verification.objects.all().last()

        # Check that the token is in the verification email
        self.assertTrue(str(token.id) in mail.outbox[0].body)

        # Verify the user
        response = self.client.execute(
            f"""
                mutation {{
                  verify(input: {{
                    code: "{str(token.id)}"
                  }})
                  {{
                    result {{
                      result
                    }}
                  }}
                }}
            """
        )

        expected = {
            "verify": {
                "result": {
                    "result": True,
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

        # Check that the user is now active
        user = get_user_model().objects.get(username="bill@nye.com")
        self.assertTrue(user.is_active)
        self.assertEqual(user.status, get_user_model().VERIFIED)

        # Check that the token can't be reused
        response = self.client.execute(
            """
                mutation {
                  verify(input: {
                    code: "{str(token.id)}"
                  })
                  {
                    result {
                      result
                    }
                  }
                }
            """
        )

        expected = {
            "verify": {
                "result": {
                    "result": False,
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )
