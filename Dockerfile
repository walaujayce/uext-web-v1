# ── Build stage：安裝依賴 + vite build 產出靜態檔 ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime stage：只帶靜態檔 + production server（不含 build 工具/dev 依賴）──
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# server.js 只用 Node 內建模組，不需要 npm install
COPY --from=build /app/dist ./dist
COPY server.js ./

# 監聽埠與後端預設主機（部署時可用 -e 覆蓋）
ENV PORT=5173 \
    VITE_WEBAPI_URL=192.168.100.200 \
    VITE_SOCKETSERVER_URL=192.168.100.200
EXPOSE 5173

CMD ["node", "server.js"]
