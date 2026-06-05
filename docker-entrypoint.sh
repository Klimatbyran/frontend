#!/bin/sh
set -e

GARBO_ALL_ACCESS_API_KEY=${GARBO_ALL_ACCESS_API_KEY:-}
export GARBO_ALL_ACCESS_API_KEY

export PROXY_PASS="${PROXY_PASS:-https://api.unearthdata.ai/api/}"
export PROXY_HOST_HEADER="${PROXY_HOST_HEADER:-api.unearthdata.ai}"

envsubst '${GARBO_ALL_ACCESS_API_KEY} ${PROXY_PASS} ${PROXY_HOST_HEADER}' \
  < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
