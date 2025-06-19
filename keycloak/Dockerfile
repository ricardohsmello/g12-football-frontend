FROM quay.io/keycloak/keycloak:24.0.3

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin

COPY realms/g12-realm.json /opt/keycloak/data/import/

EXPOSE 8081

# ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
RUN /opt/keycloak/bin/kc.sh build --db=postgres
CMD ["start-dev", "--http-host=0.0.0.0", "--http-port=8081", "--hostname-strict=false", "--import-realm"]
