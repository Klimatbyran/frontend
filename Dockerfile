# Build stage
FROM node:20-slim AS build

# Accept public build-time environment variable
ARG VITE_MAILCHIMP_URL
ENV VITE_MAILCHIMP_URL=$VITE_MAILCHIMP_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Fix Rollup native dependency issue
RUN npm rebuild @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Build the app (includes sitemap generation)
RUN npm run build

# Previous release — keep hashed /assets across deploys so mixed pods during
# rolling updates do not 404 when HTML references a new chunk hash.
ARG PREVIOUS_IMAGE=ghcr.io/klimatbyran/frontend:latest
FROM ${PREVIOUS_IMAGE} AS previous_release

# Production stage
FROM nginx:alpine

RUN mkdir -p /usr/share/nginx/html/assets
COPY --from=previous_release /usr/share/nginx/html/assets/ /usr/share/nginx/html/assets/
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copy nginx config template and entrypoint
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

CMD ["/docker-entrypoint.sh"]
