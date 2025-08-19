# Dockerfile for Next.js production deployment with npm
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy all source code
COPY . .

# Build Next.js app
RUN npm build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/styles ./styles

EXPOSE 80

CMD ["npm", "start"]
