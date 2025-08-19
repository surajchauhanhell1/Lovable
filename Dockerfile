# syntax=docker/dockerfile:1.7
FROM node:20.18.0-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20.18.0-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20.18.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 80
USER node
CMD ["npm","run","start","--","-p","80"]
