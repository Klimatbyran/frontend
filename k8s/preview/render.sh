#!/usr/bin/env bash
# Renders k8s/preview/manifest.template.yaml for a single PR preview environment.
set -euo pipefail

PR_NUMBER="${PR_NUMBER:?PR_NUMBER is required}"
IMAGE="${IMAGE:?IMAGE is required}"
PREVIEW_HOST="${PREVIEW_HOST:?PREVIEW_HOST is required}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="${SCRIPT_DIR}/manifest.template.yaml"

sed \
  -e "s|__PR_NUMBER__|${PR_NUMBER}|g" \
  -e "s|__IMAGE__|${IMAGE}|g" \
  -e "s|__PREVIEW_HOST__|${PREVIEW_HOST}|g" \
  "${TEMPLATE}"
