import graphene

from gwauth import utility
from gwauth.forms import RegistrationForm
from gwauth.mailer import actions


def register(args):
    """
    View to process the registration
    """

    print(args)

    # creating the registration form from the data
    form = RegistrationForm(args)

    # if form is valid save the information
    if form.is_valid():
        data = form.cleaned_data
        #form.save()

        # generating verification link
        verification_link = utility.get_absolute_site_url() + '/accounts/verify?code=' + utility.get_token(
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
