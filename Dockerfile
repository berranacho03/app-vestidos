# Use official Node LTS image
FROM node:20-alpine AS base
WORKDIR /app

# Install production deps for runtime
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --production --legacy-peer-deps

# Install all deps (including dev) for building the app
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Production image: use production deps and copy build output
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
