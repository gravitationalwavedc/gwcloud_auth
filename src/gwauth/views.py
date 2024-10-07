from urllib import parse

import jwt
import requests
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from graphql_jwt.refresh_token.shortcuts import refresh_token_lazy
from graphql_jwt.shortcuts import get_token

from gwauth import utility
from gwauth.forms import RegistrationForm
from gwauth.mailer import actions
from gwauth.models import GWCloudUser

from hashlib import sha3_512


def register(args, project):
    """
    View to process the registration
    """

    # Verify the captcha
    r = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={
            'secret': settings.SECRET_CAPTCHA_KEY,
            'response': args.get('captcha'),
        }
    )

    if not r.json()['success']:
        return False, [(
            'captcha', ["Captcha was invalid"]
        )]

    form_args = {
        'username': args.get('email'),
        'email': args.get('email'),
        'first_name': args.get('first_name'),
        'last_name': args.get('last_name'),
        'password1': args.get('password'),
        'password2': args.get('password')
    }

    # creating the registration form from the data
    form = RegistrationForm(form_args)

    # if form is valid save the information
    if form.is_valid():
        data = form.cleaned_data
        user = form.save()

        # Make sure the user is not active
        user.is_active = False
        user.save()

        # generating verification link
        verification_link = utility.get_absolute_site_url(project) + '/auth/verify/?code=' + utility.get_token(
            information='type=user&username={}'.format(data.get('username')),
            validity=utility.get_email_verification_expiry(),
        )

        # Sending email to the potential user to verify the email address
        actions.email_verify_request(
            to_addresses=[data.get('email')],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            link=verification_link,
            project=project
        )

        return True, []
    else:
        return False, form.errors.items()


def verify(args):
    """
    View to verify an account, using verification table
    :return:
    """
    code_encrypted = args.get('code', None)

    if code_encrypted:
        try:
            # decrypt the code and its parts
            code = utility.get_information(code_encrypted)
            params = dict(parse.parse_qsl(code))
            verify_type = params.get('type', None)

            # if the verification is for user email address
            if verify_type == 'user':

                # finds username from the retrieved information
                username = params.get('username', None)

                # Update the user
                try:
                    user = GWCloudUser.get_by_username(username=username)
                    user.status = user.VERIFIED
                    user.is_active = True
                    user.save()
                    return True, 'The email address has been verified successfully'
                except GWCloudUser.DoesNotExist:
                    return False, 'The requested user account to verify does not exist'
        except ValueError as e:
            return False, e if e else 'Invalid verification code'

    return False, 'Invalid Verification Code'


def ligo_auth(request):
    #  'cn': 'Lewis Lakerink'
    #  'displayName': 'Lewis Lakerink'
    #  'eduPersonPrincipalName': 'lewis.lakerink@ligo.org'
    #  'employeeNumber': '5429'
    #  'givenName': 'Lewis'
    #  'mail': 'lewis.lakerink@ligo.org'
    #  'sn': 'Lakerink'
    #  'uid': 'lewis.lakerink'

    # Check if 'special' was passed through to the view - this is currently used by the ozstar accounts portal to verify
    # that a user is a valid ligo user
    if 'special' in request.GET:
        # The 'special' get parameter is a JWT encoded token containing a callback url and a payload
        payload = jwt.decode(request.GET['special'], settings.ACCOUNTS_PORTAL_LIGO_AUTH_SECRET_KEY, algorithms='HS256')

        # Generate the response token to send back to the accounts portal
        response_token = jwt.encode(
            {
                "verified": True,
                "project_join_request_id": payload['project_join_request_id']
            },
            settings.ACCOUNTS_PORTAL_LIGO_AUTH_SECRET_KEY,
            algorithm='HS256'
        )

        # Return a response that will redirect to the callback url with the verification token
        return HttpResponse(f"""
                <!DOCTYPE html>
                <script>
                    window.location = "{payload['callback_url']}{response_token}";
                </script>
                """)
    else:
        # This will generate a unique hash that is 128 characters long (Django has 160 limit on username field)
        username_hash = sha3_512((request.META['uid'] + settings.SECRET_KEY).encode()).hexdigest()

        # Get and update the user
        user = GWCloudUser.ligo_update_or_create(username_hash, request.META)

        # Authorize the user and get the token details
        token = get_token(user)
        refresh_token = refresh_token_lazy(user)

        # Get the next url
        next_url = request.GET.get('next', '/')

        response_token = jwt.encode(
            {
                "token": token,
                "refresh_token": str(refresh_token),
                "next_url": next_url
            },
            settings.SECRET_KEY,
            algorithm='HS256'
        )

        # Now we need to determine if the login was for gwlab, gwcloud or gwlandscape and correctly redirect to
        # the relevant domain
        # todo: Perhaps this can be improved
        domain_param = request.GET.get('domain', 'gwcloud')
        if domain_param == 'gwlab':
            domain = "https://gwlab.org.au"
        elif domain_param == 'gwcloud':
            domain = "https://gwcloud.org.au"
        elif domain_param == 'gwlandscape':
            domain = "https://gwlandscape.org.au"

        # Since the ligo authentication works only under gw-cloud.org, we need to redirect to the
        # calling domain with the provided token. Each of gwcloud/gwlab.org.au exposes an /auth/
        # url which can handle the ligo_continue.

        # To make this work as expected, we append the ligo_continue url to the domain and redirect
        # there with the generated token. This allows the token to be correctly set in local storage
        # for the relevant calling application

        return HttpResponseRedirect(
            parse.urljoin(
                domain,
                reverse(
                    'ligo_continue',
                    args=[response_token]
                )
            )
        )


def ligo_continue(request, token):
    """
    After ligo_auth, this view may be called under a different domain (especially in the case of
    gw-cloud.org/auth/ligo/ redirecting to gwcloud/gwlab.org.au/auth/ligo_continue/)

    This is a special view which takes a jwt token generated by ligo_auth, and then returns the
    expected script which sets the local storage tokens and redirects to the next url
    """

    # Decode the provided token
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')

    # Return a response that will set the tokens in localStorage and then redirect the page
    return HttpResponse(f"""
        <!DOCTYPE html>
        <script>
            localStorage.authToken = "{payload["token"]}";
            localStorage.authRefreshToken = "{payload["refresh_token"]}";
            window.location = "{payload["next_url"]}";
        </script>
        """)
