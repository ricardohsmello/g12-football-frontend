#!/bin/bash

# Use PORT environment variable from Render, default to 10000 if not set
PORT=${PORT:-10000}

echo "Starting Keycloak in production mode on port $PORT"

# Start Keycloak in production mode
exec /opt/keycloak/bin/kc.sh start \
  --http-host=0.0.0.0 \
  --http-port=$PORT \
  --hostname-strict=false \
  --import-realm \
  --optimized