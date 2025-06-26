# Usa a imagem oficial do Keycloak
FROM quay.io/keycloak/keycloak:24.0.3

ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# Adiciona suporte ao build
RUN microdnf install -y gettext

RUN /opt/keycloak/bin/kc.sh build

# Define o comando padrão
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
