# ── Build stage：安裝依賴 + vite build 產出靜態檔 ──
FROM node:20-alpine AS build
WORKDIR /app

# ⚠ 這裡「刻意不」設定 VITE_WEBAPI_URL / VITE_SOCKETSERVER_URL。
#    import.meta.env.VITE_* 會被 Vite 在 build 當下字面替換寫死進 bundle，
#    一旦在這裡給值，之後 docker run -e 就再也改不動。
#    後端位址改由 runtime 的 /config.js 提供
#    （見 server.js 的 buildRuntimeConfigJs 與 src/config/runtimeConfig.js），
#    所以同一份 image 可以部署到任何環境。
#
# 註：專案根目錄的 .env 仍會被 COPY 進來並被 vite 讀到，其值只作為
#     「拿不到 /config.js 時」的最後 fallback；正式環境一律被 runtime 設定覆蓋。
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

# 以下都是 runtime 讀取，可在 docker run 用 -e 覆蓋，改完重啟容器即生效：
#   VITE_WEBAPI_URL        → 前端 /config.js 的值 + server.js 轉發 7284 的預設主機
#   VITE_SOCKETSERVER_URL  → 前端 /config.js 的值 + server.js 轉發 8031 的預設主機
#   VITE_SIGNALR_ENABLE    → 前端是否改用 SignalR 推播
#   DEBUG_PROXY=1          → 印出每筆轉發的 X-Target-IP 與最終目標
ENV PORT=5173 \
    VITE_WEBAPI_URL=192.168.100.200 \
    VITE_SOCKETSERVER_URL=192.168.100.200 \
    VITE_SIGNALR_ENABLE=false \
    VITE_MODE=prod \
    DEBUG_PROXY=0
EXPOSE 5173

CMD ["node", "server.js"]
