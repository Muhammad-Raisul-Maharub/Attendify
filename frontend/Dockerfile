# Frontend Dockerfile for Attendify
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose frontend port
EXPOSE 3000

# Health check (optional, checks Vite dev server)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start Vite dev server
CMD ["npm", "run", "dev"]