# syntax=docker/dockerfile:1.7
FROM node:20.18.0 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20.18.0 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 重新安装并重建 lightningcss 以获取匹配当前镜像的二进制
RUN rm -rf node_modules/lightningcss && npm install --force lightningcss && npm rebuild lightningcss
RUN npm run build

FROM node:20.18.0 AS runner
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
