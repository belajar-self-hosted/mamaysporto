#!/usr/bin/env bash
set -euo pipefail

# Helper to sync Traefik dynamic configuration to LXC 10080
GATEWAY_IP="${GATEWAY_IP:-192.168.0.80}"
GATEWAY_USER="${GATEWAY_USER:-root}"
GATEWAY_DIR="${GATEWAY_DIR:-/opt/ingress/dynamic}"
SOURCE_FILE="opt/ingress/dynamic/profile-mamay.yml"

if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "Error: Source file $SOURCE_FILE not found!" >&2
  exit 1
fi

echo "==> Syncing ${SOURCE_FILE} to ${GATEWAY_USER}@${GATEWAY_IP}:${GATEWAY_DIR}..."
scp "${SOURCE_FILE}" "${GATEWAY_USER}@${GATEWAY_IP}:${GATEWAY_DIR}/profile-mamay.yml"

echo "==> Successfully synced! Traefik File Provider on LXC 10080 will automatically watch and reload this configuration."
