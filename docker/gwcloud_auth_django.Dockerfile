FROM debian:buster

# Update the container and install the required packages
RUN apt-get update
RUN apt-get -y install shibboleth-sp2-common shibboleth-sp2-utils libapache2-mod-shib2 libshibresolver2 python-virtualenv python3 libapache2-mod-wsgi-py3 default-libmysqlclient-dev python3-dev build-essential curl

# Enable mod shibboleth and mod wsgi
RUN a2enmod shib
RUN a2enmod wsgi

# Copy django source
COPY src /src
COPY ./runserver.sh /runserver.sh
RUN chmod +x /runserver.sh

# Create python virtualenv
RUN virtualenv -p python3 /src/venv

# Activate and install the django requirements (mysqlclient requires python3-dev and build-essential)
RUN . /src/venv/bin/activate && pip install -r /src/requirements.txt && pip install mysqlclient

# Clean up unneeded packages
RUN apt-get remove --purge -y build-essential python3-dev
RUN apt-get autoremove --purge -y

# Configure shibboleth certificates
COPY certs/selfsignedcert.pem /etc/shibboleth/sp-cert.pem
COPY certs/selfsignedkey.pem /etc/shibboleth/sp-key.pem
RUN chown _shibd:_shibd /etc/shibboleth/sp-key.pem
RUN chmod 0600 /etc/shibboleth/sp-key.pem

COPY certs/login.ligo.org.cert.LIOGOCA.pem.txt /etc/shibboleth/login.ligo.org.cert.LIGOCA.pem
COPY certs/shibboleth2-version3.xml /etc/shibboleth/shibboleth2.xml 
COPY certs/attribute-map-ligo.xml /etc/shibboleth/attribute-map.xml

# Copy in the apache configuration 
COPY conf/000-default.conf /etc/apache2/sites-enabled/000-default.conf

# Workaround
# COPY certs/gwcloud_auth.crt /etc/ssl/crt/gwcloud_auth.crt
# COPY certs/gwcloud_auth.key /etc/ssl/crt/gwcloud_auth.key
RUN apt-get update && \
    apt-get install -y openssl && \
    mkdir -p /etc/ssl/crt/ && \
    openssl genrsa -passout pass:x -out server.pass.key && \
    openssl rsa -passin pass:x -in server.pass.key -out /etc/ssl/crt/gwcloud_auth.key && \
    rm server.pass.key && \
    openssl req -new -key /etc/ssl/crt/gwcloud_auth.key -out server.csr \
        -subj "/C=AU/ST=Victoria/L=Swinburne/O=OrgName/OU=IT Department/CN=gw-cloud.org" && \
    openssl x509 -req -days 365 -in server.csr -signkey /etc/ssl/crt/gwcloud_auth.key -out /etc/ssl/crt/gwcloud_auth.crt
    
RUN a2enmod ssl

# Build webpack bundle
RUN mkdir /src/static
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
RUN . ~/.nvm/nvm.sh && cd /src/react && nvm install && nvm use && nvm install-latest-npm && npm install && npm run relay && npm run build

# Don't need any of the javascipt code now
RUN rm -Rf /src/react
RUN rm -Rf ~/.nvm/

EXPOSE 80
CMD [ "/runserver.sh"]
