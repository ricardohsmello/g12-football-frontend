# FROM quay.io/keycloak/keycloak:24.0.3

# ENV KEYCLOAK_ADMIN=admin
# ENV KEYCLOAK_ADMIN_PASSWORD=admin

# COPY realms/g12-realm.json /opt/keycloak/data/import/

# EXPOSE 10000

# RUN /opt/keycloak/bin/kc.sh build --db=postgres

# CMD ["start-dev", "--http-host=0.0.0.0", "--http-port=10000", "--hostname-strict=false", "--import-realm"]

FROM quay.io/keycloak/keycloak:24.0.3

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin
ENV KC_HOSTNAME_STRICT=false
ENV KC_HTTP_ENABLED=true

COPY realms/g12-realm.json /opt/keycloak/data/import/

# Build Keycloak for production with postgres
RUN /opt/keycloak/bin/kc.sh build --db=postgres

# Create startup script
COPY start-prod.sh /opt/keycloak/bin/start-prod.sh
RUN chmod +x /opt/keycloak/bin/start-prod.sh

CMD ["/opt/keycloak/bin/start-prod.sh"]