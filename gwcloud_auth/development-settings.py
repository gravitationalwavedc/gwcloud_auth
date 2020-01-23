from .base import *

INSTALLED_APPS += ('corsheaders', )
CORS_ORIGIN_ALLOW_ALL = True

MIDDLEWARE.append('corsheaders.middleware.CorsMiddleware')

try:
    from .local import *
except:
    pass
