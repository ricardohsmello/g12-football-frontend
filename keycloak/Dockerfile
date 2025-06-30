FROM quay.io/keycloak/keycloak:24.0.3

# Ativa health checks e métricas
ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_HTTP_PORT=10000
# Compila a configuração para produção
RUN /opt/keycloak/bin/kc.sh build

EXPOSE 10000

# Inicia o Keycloak no modo padrão (não-dev)
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
