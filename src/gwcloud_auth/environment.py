import os

MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_ROOT_PASSWORD = os.getenv('MYSQL_ROOT_PASSWORD')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')

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