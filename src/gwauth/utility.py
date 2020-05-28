"""
Distributed under the MIT License. See LICENSE.txt for more info.
"""

import logging

from datetime import timedelta, datetime
from functools import wraps

from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
import jwt

from . import constants
from .models import Verification

from calendar import timegm

from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _

import jwt

from graphql_jwt.settings import jwt_settings
from graphql_jwt import exceptions, decorators


logger = logging.getLogger(__name__)


def get_email_verification_expiry():
    """Finds the email verification expiry and then returns it.
    :return: Number
    """
    try:
        return settings.EMAIL_VERIFICATION_EXPIRY
    except AttributeError:
        return constants.EMAIL_VERIFICATION_EXPIRY


def get_absolute_site_url():
    """
    Finds the site url that will be used to generate links
    """

    # check whether forcefully using a specific url from the settings
    return settings.SITE_URL


def get_token(information, validity=None):
    """
    Stores the information in the database and generates a corresponding token
    :param information: information that needs to be stored and corresponding token to be generated
    :param validity: for how long the token will be valid (in seconds)
    :return: token to be encoded in the url
    """
    if validity:
        now = timezone.localtime(timezone.now())
        expiry = now + timedelta(seconds=validity)
    else:
        expiry = None
    try:
        verification = Verification.objects.create(information=information, expiry=expiry)
        return verification.id.__str__()
    except:
        logger.info("Failure generating Verification token with {}".format(information))
        raise


def get_information(token):
    """
    Retrieves the information from the database for a particular token
    :param token: encoded token from email
    :return: the actual information
    """
    now = timezone.localtime(timezone.now())
    try:
        verification = Verification.objects.get(id=token, expiry__gte=now)
        if verification.verified:
            raise ValueError('Already verified')
        else:
            verification.verified = True
            verification.save()
        return verification.information
    except Verification.DoesNotExist:
        raise ValueError('Invalid or expired verification code')
    except ValidationError:
        raise ValueError("Invalid verification code")
    except Exception as e:
        logger.exception(e)  # should notify admins via email
        raise

def jwt_payload(user, context=None):
    username = user.get_username()

    if hasattr(username, 'pk'):
        username = username.pk

    payload = {
        user.USERNAME_FIELD: username,
        'exp': datetime.utcnow() + jwt_settings.JWT_EXPIRATION_DELTA,
        'userId': user.id
    }

    if jwt_settings.JWT_ALLOW_REFRESH:
        payload['origIat'] = timegm(datetime.utcnow().utctimetuple())

    if jwt_settings.JWT_AUDIENCE is not None:
        payload['aud'] = jwt_settings.JWT_AUDIENCE

    if jwt_settings.JWT_ISSUER is not None:
        payload['iss'] = jwt_settings.JWT_ISSUER

    return payload


def jwt_authentication(secret, exc=exceptions.PermissionDenied()):
    """
    Provide authentication for a view that must have a valid JWT token for the provided secret key
    :param secret: The secret key that validates the jwt token provided in the request headers
    :param exc: The exception to throw if the token is not valid
    :return: The request result
    """
    def decorator(f):
        @wraps(f)
        @decorators.context(f)
        def wrapper(context, *args, **kwargs):
            # Get the auth header
            token = context.headers.get('Authorization', None)
            if not token:
                raise exc

            # Validate the token
            try:
                token = token.encode('utf-8')
                jwt.decode(token, key=secret, verify=True, algorithms='HS256')
            except jwt.DecodeError:
                raise exc

            # Token was valid, call the wrapped function
            return f(*args, **kwargs)
        return wrapper
    return decorator
