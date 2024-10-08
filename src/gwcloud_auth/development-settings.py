from .base import *

INSTALLED_APPS += ("corsheaders",)
CORS_ORIGIN_ALLOW_ALL = True

MIDDLEWARE.append("corsheaders.middleware.CorsMiddleware")

SITE_URLS["localhost"] = "http://localhost:3000"

ALLOWED_HOSTS = ["*"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

try:
    from .local import *
except ImportError:
    pass
