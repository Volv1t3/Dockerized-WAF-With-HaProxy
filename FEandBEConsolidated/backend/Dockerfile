# Multi-stage build for minimal production image
FROM node:22 AS builder

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /jslets/AgriCommerce/backend

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client, initialize database, and build TypeScript
RUN npx prisma generate && \
    npx prisma db push && \
    npx prisma db seed && \
    npm run build

# Production stage
FROM node:22 AS production

# Install OpenSSL for Prisma runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /jslets/AgriCommerce/backend

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application and Prisma files from builder stage
COPY --from=builder /jslets/AgriCommerce/backend/dist ./dist
COPY --from=builder /jslets/AgriCommerce/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /jslets/AgriCommerce/backend/prisma ./prisma

# Create non-root user for security
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs backend

# Set proper permissions for database and directories
RUN chown -R backend:nodejs /jslets/AgriCommerce/backend && \
    chmod 775 /jslets/AgriCommerce/backend/prisma && \
    if [ -f /jslets/AgriCommerce/backend/prisma/dev.db ]; then chmod 664 /jslets/AgriCommerce/backend/prisma/dev.db; fi

# Switch to non-root user
USER backend

# Expose port
EXPOSE 33771

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:33771/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "run", "start"]