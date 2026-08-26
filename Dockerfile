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
#   VITE_USE_HTTPS         → true 時 WebAPI 走 https:8081，否則 http:7284
#                            （/api/7284 只是路由標籤，切換時前端不用改）
#   VITE_TLS_REJECT_UNAUTHORIZED
#                          → 是否驗證後端 TLS 憑證。自簽請留 false；
#                            要驗證就設 true 並額外提供 NODE_EXTRA_CA_CERTS，
#                            例如：-v /path/rootCA.crt:/certs/rootCA.crt:ro \
#                                  -e NODE_EXTRA_CA_CERTS=/certs/rootCA.crt
#   SERVER_TLS_CERT / SERVER_TLS_KEY
#                          → 站台本身要走 https 時，指向掛進容器的憑證/私鑰。
#                            兩個都給才會啟用 https；只要有一個沒給就維持 http。
#                            ⚠ 與 VITE_USE_HTTPS 是兩段不同的連線：
#                                瀏覽器 ──(A)──▶ 本 server ──(B)──▶ WebAPI
#                              (A) 由 SERVER_TLS_* 決定；(B) 由 VITE_USE_HTTPS 決定。
#                            例如：
#                              -v /path/certs:/certs:ro \
#                              -e SERVER_TLS_CERT=/certs/server.crt \
#                              -e SERVER_TLS_KEY=/certs/server.key
#   SERVER_TLS_PASSPHRASE  → 私鑰有加密時才需要
#   DEBUG_PROXY=1          → 印出每筆轉發的 X-Target-IP 與最終目標
ENV PORT=5173 \
    VITE_WEBAPI_URL=192.168.100.200 \
    VITE_SOCKETSERVER_URL=192.168.100.200 \
    VITE_SIGNALR_ENABLE=false \
    VITE_MODE=prod \
    VITE_USE_HTTPS=false \
    VITE_TLS_REJECT_UNAUTHORIZED=false \
    DEBUG_PROXY=0
EXPOSE 5173

CMD ["node", "server.js"]
