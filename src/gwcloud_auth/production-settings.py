from .base import *

DEBUG = False

STATIC_URL = "/auth/static/"

ALLOWED_HOSTS = ["*"]

EMAIL_HOST = "mail.swin.edu.au"
EMAIL_PORT = 25

try:
    from .environment import *
except ImportError:
    pass
