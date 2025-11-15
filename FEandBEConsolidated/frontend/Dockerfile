# Multi-stage build for minimal production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /jslets/AgriCommerce/frontend

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /jslets/AgriCommerce/frontend

# Copy package files
COPY package*.json ./

# Install all dependencies (vite needed for preview)
RUN npm ci && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /jslets/AgriCommerce/frontend/build ./build
COPY --from=builder /jslets/AgriCommerce/frontend/.svelte-kit ./.svelte-kit
COPY --from=builder /jslets/AgriCommerce/frontend/static ./static
COPY --from=builder /jslets/AgriCommerce/frontend/package.json ./
COPY --from=builder /jslets/AgriCommerce/frontend/vite.config.ts ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S frontend -u 1001

# Change ownership of the app directory
RUN chown -R frontend:nodejs /jslets/AgriCommerce/frontend

# Switch to non-root user
USER frontend

# Expose port
EXPOSE 34771

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:34771/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "run", "preview"]