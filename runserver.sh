#! /bin/bash
chown www-data:www-data /src/logs
/src/venv/bin/python /src/production-manage.py migrate;
/src/venv/bin/python /src/production-manage.py collectstatic --noinput;
service shibd restart;
apachectl -D FOREGROUND;
