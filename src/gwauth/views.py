from http.client import HTTPResponse
from urllib import parse

import graphene

from gwauth import utility
from gwauth.forms import RegistrationForm
from gwauth.mailer import actions
from gwauth.models import GWCloudUser


def register(args):
    """
    View to process the registration
    """

    # creating the registration form from the data
    form = RegistrationForm(args)

    # if form is valid save the information
    if form.is_valid():
        data = form.cleaned_data
        form.save()

        # generating verification link
        verification_link = utility.get_absolute_site_url() + '/auth/verify/?code=' + utility.get_token(
            information='type=user&username={}'.format(data.get('username')),
            validity=utility.get_email_verification_expiry(),
        )

        # Sending email to the potential user to verify the email address
        actions.email_verify_request(
            to_addresses=[data.get('email')],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            link=verification_link,
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
                    user = GWCloudUser.objects.get(username=username)
                    user.status = user.VERIFIED
                    user.is_active = True
                    user.save()
                    return True, 'The email address has been verified successfully'
                except GWCloudUser.DoesNotExist:
                    return False, 'The requested user account to verify does not exist'
        except ValueError as e:
            print("Value Error")
            return False, e if e else 'Invalid verification code'

    return False, 'Invalid Verification Code'


def ligo_auth(request):
    return HTTPResponse(str(request.META) + "\n\n" + str(request.GET) + "\n\n" + str(request.POST))