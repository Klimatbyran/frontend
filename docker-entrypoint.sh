#!/bin/sh
set -e

# API key for garbo proxy injection
GARBO_ALL_ACCESS_API_KEY=${GARBO_ALL_ACCESS_API_KEY:-}
export GARBO_ALL_ACCESS_API_KEY

# Substitute environment variables in nginx config template
envsubst '${GARBO_ALL_ACCESS_API_KEY}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
