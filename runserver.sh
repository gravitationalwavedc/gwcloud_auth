#! /bin/bash
mkdir -p /src/logs

/src/venv/bin/python /src/production-manage.py migrate;
/src/venv/bin/python /src/production-manage.py collectstatic --noinput;

chown -R www-data:www-data /src/static-files
chown -R www-data:www-data /src/logs

service shibd restart;
apachectl -D FOREGROUND;
