import responses
from django.contrib.auth import get_user_model
from django.core import mail

from gwauth.tests.testcases import AuthTestCase


class TestRegistration(AuthTestCase):
    @responses.activate
    def test_invalid_captcha(self):
        """
        Check that invalid captcha fails as expected
        """
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': False}, status=200)

        response = self.client.execute(
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

        expected = {
            "register": {
                "result": {
                    "result": False,
                    "errors": [
                        {
                            "field": "captcha",
                            "messages": [
                                "Captcha was invalid"
                            ]
                        }
                    ]
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

    @responses.activate
    def test_invalid_email(self):
        """
        Check that invalid email fails as expected
        """
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': True}, status=200)

        response = self.client.execute(
            """
                mutation {
                  register(input: {
                    email: "bill"
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

        expected = {
            "register": {
                "result": {
                    "result": False,
                    "errors": [
                        {
                            "field": "email",
                            "messages": [
                                "Enter a valid email address."
                            ]
                        }
                    ]
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

    @responses.activate
    def test_invalid_first_name(self):
        """
        Check that invalid first name fails as expected
        """
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': True}, status=200)

        response = self.client.execute(
            """
                mutation {
                  register(input: {
                    email: "bill@nye.com"
                    firstName: ""
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

        expected = {
            "register": {
                "result": {
                    "result": False,
                    "errors": [
                        {
                            "field": "first_name",
                            "messages": [
                                "This field is required."
                            ]
                        }
                    ]
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

    @responses.activate
    def test_invalid_last_name(self):
        """
        Check that invalid last name fails as expected
        """
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': True}, status=200)

        response = self.client.execute(
            """
                mutation {
                  register(input: {
                    email: "bill@nye.com"
                    firstName: "Bill"
                    lastName: ""
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

        expected = {
            "register": {
                "result": {
                    "result": False,
                    "errors": [
                        {
                            "field": "last_name",
                            "messages": [
                                "This field is required."
                            ]
                        }
                    ]
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

    @responses.activate
    def test_invalid_password(self):
        """
        Check that invalid password fails as expected
        """
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': True}, status=200)

        response = self.client.execute(
            """
                mutation {
                  register(input: {
                    email: "bill@nye.com"
                    firstName: "Bill"
                    lastName: "Nye"
                    password: " "
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

        expected = {
            "register": {
                "result": {
                    "result": False,
                    "errors": [
                        {
                            "field": "password2",
                            "messages": [
                                "This password is too short. It must contain at least 8 characters."
                            ]
                        }
                    ]
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

    @responses.activate
    def test_successful_registration(self):
        """
        Check that a valid registration succeeds
        """
        responses.add(responses.POST, 'https://www.google.com/recaptcha/api/siteverify',
                      json={'success': True}, status=200)

        response = self.client.execute(
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

        expected = {
            "register": {
                "result": {
                    "result": True,
                    "errors": []
                }
            }
        }

        self.assertDictEqual(
            expected, response.data, "registration query returned unexpected data."
        )

        # Verify that an email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "[GW Cloud] Please verify your email address")
        self.assertTrue("bill@nye.com" in mail.outbox[0].to)
        self.assertTrue("Bill" in mail.outbox[0].body)
        self.assertTrue("Nye" in mail.outbox[0].body)

        # Make sure that the created user is correct (Will raise an exception if user doesn't get created with provided
        # model attributes)
        get_user_model().objects.get(
            username="bill@nye.com",
            email="bill@nye.com",
            first_name="Bill",
            last_name="Nye",
            status=get_user_model().UNVERIFIED,
            is_active=False,
            is_ligo_user=False
        )
