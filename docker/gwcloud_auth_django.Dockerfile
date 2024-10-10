# Build the base image
FROM debian:bookworm AS base

# Update the container and install common packages
RUN apt-get update && apt-get upgrade -y
RUN apt-get -y install python3-virtualenv python3.11 python3-dev default-libmysqlclient-dev shibboleth-sp-common shibboleth-sp-utils libapache2-mod-shib libshibresolver3 libapache2-mod-wsgi-py3 curl

# Enable mod shibboleth and mod wsgi
RUN a2enmod shib
RUN a2enmod wsgi
RUN a2enmod proxy
RUN a2enmod proxy_http
RUN a2enmod ssl

# Configure shibboleth certificates
COPY certs/selfsignedcert.pem /etc/shibboleth/sp-cert.pem
COPY certs/selfsignedkey.pem /etc/shibboleth/sp-key.pem
RUN chown _shibd:_shibd /etc/shibboleth/sp-key.pem
RUN chmod 0600 /etc/shibboleth/sp-key.pem

COPY certs/login.ligo.org.cert.LIGOCA.pem.txt /etc/shibboleth/login.ligo.org.cert.LIGOCA.pem
COPY certs/shibboleth2-version3.xml /etc/shibboleth/shibboleth2.xml 
COPY certs/attribute-map-ligo.xml /etc/shibboleth/attribute-map.xml
RUN chmod +r /etc/shibboleth/shibboleth2.xml

# Generate a self signed certificate for the internal http -> https proxy
RUN apt-get update && \
    apt-get install -y openssl && \
    mkdir -p /etc/ssl/crt/ && \
    openssl genrsa -passout pass:x -out server.pass.key && \
    openssl rsa -passin pass:x -in server.pass.key -out /etc/ssl/crt/gwcloud_auth.key && \
    rm server.pass.key && \
    openssl req -new -key /etc/ssl/crt/gwcloud_auth.key -out server.csr \
        -subj "/C=AU/ST=Victoria/L=Swinburne/O=OrgName/OU=IT Department/CN=gw-cloud.org" && \
    openssl x509 -req -days 365 -in server.csr -signkey /etc/ssl/crt/gwcloud_auth.key -out /etc/ssl/crt/gwcloud_auth.crt

# Kube sometimes has trouble downloading this metadata file using shibd
RUN curl https://liam-saml-metadata.s3.amazonaws.com/ligo-metadata.xml > /var/log/shibboleth/ligo-metadata.xml

# Copy in the apache configuration 
COPY conf/000-default.conf /etc/apache2/sites-enabled/000-default.conf

# Set up the python project
FROM base AS python

# Copy django source
COPY src /src

# Remove the react source
RUN rm -Rf /src/react

# Create python virtualenv
RUN virtualenv -p python3 /src/venv

# Activate and install the django requirements (mysqlclient requires python3-dev, pkg-config and build-essential)
RUN apt-get install -y python3-dev build-essential pkg-config

RUN mkdir -p /src/react/data/
RUN . /src/venv/bin/activate && pip install -r /src/requirements.txt && pip install mysqlclient 
RUN . /src/venv/bin/activate && cd src && python production-manage.py graphql_schema

# Build clean layer
FROM python as clean

# Cleanup
RUN apt-get remove -y --purge python3-dev build-essential
RUN apt-get autoremove -y --purge

# Build the javascript bundle
FROM python AS javascript

# Copy the react source code
COPY src/react /tmp/react
 
# Build webpack bundle
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN . ~/.nvm/nvm.sh && cd /tmp/react && nvm install && nvm use && npm install --legacy-deps
COPY --from=python /src/react/data/schema.json /tmp/react/data/
RUN . ~/.nvm/nvm.sh && cd /tmp/react && nvm use && npm run relay && npm run build

# Build the final project
FROM clean AS final_image

# Copy the javascript bundle
COPY --from=javascript /tmp/static/* /src/static/

# Copy django source
COPY ./runserver.sh /runserver.sh
RUN chmod +x /runserver.sh

# Final cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Build the final image
FROM final_image
EXPOSE 8000
CMD [ "/runserver.sh"]
