from hashlib import sha3_512

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

shibboleth_dict = {
    "cn": "Lewis Lakerink",
    "eduPersonPrincipalName": "lewis.lakerink@ligo.org",
    "givenName": "Lewis",
    "mail": "lewis.lakerink@ligo.org",
    "sn": "Lakerink",
    "uid": "1234",
}


class TestLigo(TestCase):
    def test_ligo_auth_user(self):
        """
        Test that user creation and update works as expected with ligo authentication
        """
        # After the first call, we need to check that the user was created as expected
        self.client.get(reverse("ligo_auth"), **shibboleth_dict)

        # Check that a user was correctly created
        username_hash = sha3_512(
            (shibboleth_dict["uid"] + settings.SECRET_KEY).encode()
        ).hexdigest()
        user = get_user_model().objects.get(
            username=username_hash,
            first_name=shibboleth_dict["givenName"],
            last_name=shibboleth_dict["sn"],
            email=shibboleth_dict["mail"],
            is_ligo_user=True,
        )

        new_details = dict(**shibboleth_dict)
        new_details["givenName"] = "Bill"

        # After the second call, we should check that the original user has been updated
        self.client.get(reverse("ligo_auth"), **new_details)

        # Check that a user was correctly created
        updated_user = get_user_model().objects.get(
            username=username_hash,
            first_name=new_details["givenName"],
            last_name=new_details["sn"],
            email=new_details["mail"],
            is_ligo_user=True,
        )

        # Check that the user instances were the same
        self.assertEqual(user, updated_user)

    def test_ligo_auth_no_next(self):
        """
        Test that ligo authentication works as expected without a next parameter
        """
        response = self.client.get(reverse("ligo_auth"), **shibboleth_dict)

        # Check that the result from the ligo_auth view is as expected
        self.assertEqual(response.status_code, 302)

        # Get the token
        token = response.url.split("/")[-1]

        # Double check that the redirect url with token is correct
        self.assertTrue(reverse("ligo_continue", args=[token]) in response.url)

        # Check the details in the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms="HS256")
        self.assertTrue("token" in payload)
        self.assertTrue("refresh_token" in payload)
        self.assertEqual(payload["next_url"], "/")

    def test_ligo_auth_with_next(self):
        """
        Test that ligo authentication works as expected with a next parameter
        """
        response = self.client.get(
            reverse("ligo_auth"), {"next": "/test/url/"}, **shibboleth_dict
        )

        # Check that the result from the ligo_auth view is as expected
        self.assertEqual(response.status_code, 302)

        # Get the token
        token = response.url.split("/")[-1]

        # Double check that the redirect url with token is correct
        self.assertTrue(reverse("ligo_continue", args=[token]) in response.url)

        # Check the details in the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms="HS256")
        self.assertTrue("token" in payload)
        self.assertTrue("refresh_token" in payload)
        self.assertEqual(payload["next_url"], "/test/url/")

    def test_ligo_auth_domain(self):
        """
        Test that ligo authentication works as expected for gwlab and gwcloud domains
        """
        # Default is gwcloud
        response = self.client.get(reverse("ligo_auth"), **shibboleth_dict)
        self.assertTrue(response.url.startswith("https://gwcloud.org.au/"))

        # Check gwcloud
        response = self.client.get(
            reverse("ligo_auth"), {"domain": "gwcloud"}, **shibboleth_dict
        )
        self.assertTrue(response.url.startswith("https://gwcloud.org.au/"))

        # Check gwlab
        response = self.client.get(
            reverse("ligo_auth"), {"domain": "gwlab"}, **shibboleth_dict
        )
        self.assertTrue(response.url.startswith("https://gwlab.org.au/"))

        # Check gwlandscape
        response = self.client.get(
            reverse("ligo_auth"), {"domain": "gwlandscape"}, **shibboleth_dict
        )
        self.assertTrue(response.url.startswith("https://gwlandscape.org.au/"))

    def test_ligo_auth_special(self):
        """
        Checks that the ozstar ligo verification step works as expected
        """

        # Construct a test token
        token = jwt.encode(
            {
                "project_join_request_id": 123,
                "callback_url": "https://special.com/callback/",
            },
            settings.ACCOUNTS_PORTAL_LIGO_AUTH_SECRET_KEY,
            algorithm="HS256",
        )

        response = self.client.get(
            reverse("ligo_auth"), {"special": token}, **shibboleth_dict
        )

        # Special should not redirect
        self.assertEqual(response.status_code, 200)

        # Make sure that the callback url exists in the output
        self.assertTrue(
            b'window.location = "https://special.com/callback/' in response.content
        )

        # Extract the token from the response
        loc = [
            line for line in response.content.splitlines() if b"window.location" in line
        ][0]
        loc = loc.strip()
        token = loc.split(b'"')[1]
        token = token.split(b"/")[-1]

        # Verify the content in the token
        payload = jwt.decode(
            token, settings.ACCOUNTS_PORTAL_LIGO_AUTH_SECRET_KEY, algorithms="HS256"
        )
        self.assertTrue(payload["verified"])
        self.assertEqual(payload["project_join_request_id"], 123)
