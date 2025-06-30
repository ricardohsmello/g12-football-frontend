FROM quay.io/keycloak/keycloak:24.0.3

ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_HTTP_PORT=10000 \
    KC_PROXY=edge

RUN /opt/keycloak/bin/kc.sh build

EXPOSE 10000

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
