import os

MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_ROOT_PASSWORD = os.getenv('MYSQL_ROOT_PASSWORD')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')

SECRET_KEY = os.getenv('SECRET_KEY', 'super_secret')
AUTH_SERVICE_JWT_SECRET = os.getenv('AUTH_SERVICE_JWT_SECRET')
ACCOUNTS_PORTAL_LIGO_AUTH_SECRET_KEY = os.getenv('ACCOUNTS_PORTAL_LIGO_AUTH_SECRET_KEY')

SECRET_CAPTCHA_KEY = os.getenv('SECRET_CAPTCHA_KEY')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': MYSQL_DATABASE,
        'HOST': MYSQL_HOST,
        'USER': MYSQL_USER,
        'PORT': 3306,
        'PASSWORD': MYSQL_PASSWORD,
    },
}
