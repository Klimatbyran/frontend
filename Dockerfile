# Build stage
FROM node:20-slim AS build

# Accept public build-time environment variable
ARG VITE_MAILCHIMP_URL
ENV VITE_MAILCHIMP_URL=$VITE_MAILCHIMP_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Check for vulnerabilities
RUN npm audit --audit-level=moderate

# Install dependencies
RUN npm ci

# Fix Rollup native dependency issue
RUN npm rebuild @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Build the app (includes sitemap generation)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
