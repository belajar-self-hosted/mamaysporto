# =============================================
# Stage 1: Build Frontend (SolidJS + Vite)
# =============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

# =============================================
# Stage 2: Production Server (Node.js + REST API)
# =============================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV UPLOADS_DIR=/app/uploads
ENV DIST_DIR=/app/dist

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server/index.js"]
