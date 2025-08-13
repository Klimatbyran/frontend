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

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and server files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
COPY --from=build /app/index.html ./

# Set production environment
ENV NODE_ENV=production

# Expose port 5173 (or whatever port your server uses)
EXPOSE 5173

# Start the Node.js server
CMD ["node", "server.js"]
