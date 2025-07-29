# Dockerfile

# Stage 0: Install production dependencies
FROM node:18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 1: Build the Next.js application (including dev dependencies for build process)
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci # Install all dependencies (dev and prod) for building
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# Stage 2: Run the Next.js application (only production dependencies)
FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy build output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# If you have a public folder with static assets
COPY --from=builder /app/public ./public
# If you have specific scripts or server files, copy them as well
COPY --from=builder /app/next.config.js ./next.config.js # Assuming you have next.config.js (or next.config.ts)

EXPOSE 3000
CMD ["npm", "start"]