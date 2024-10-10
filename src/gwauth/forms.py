from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm


FIELDS = [
    "first_name",
    "last_name",
    "email",
    "username",
]


class RegistrationForm(UserCreationForm):
    """
    Customise the User Registration form from default Django UserCreationForm
    """

    class Meta:
        model = get_user_model()
        fields = FIELDS
