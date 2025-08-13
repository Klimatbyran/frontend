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

# Copy source files
COPY . .

# Build the app with Vike
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built app and server files
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Expose port 3000
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the Node.js server
CMD ["node", "server/index.js"]
