# certs/

放 TLS 憑證的地方。**這個資料夾裡的憑證與私鑰都不進版控**
（見 `.gitignore`），只有這份 README 與 `.gitkeep` 會被追蹤。

## 要放哪些檔案

| 檔名 | 用途 | 對應的環境變數 |
|---|---|---|
| `dev.crt` / `dev.key` | **dev** 站台憑證，SAN 要含 `localhost`、`127.0.0.1`、本機 IP | `SERVER_TLS_CERT` / `SERVER_TLS_KEY` |
| `server.crt` / `server.key` | **正式**站台憑證，SAN 要含部署主機的 IP | 同上（容器裡設定） |
| `rootCA.crt` | 簽發後端 8081 憑證的根 CA（要驗證後端時才需要） | `SERVER_TLS_CA` |

## `.env` 怎麼寫

`VITE_USE_HTTPS` 一個開關同時決定兩段連線的協定：

| VITE_USE_HTTPS | 站台 | WebAPI |
|---|---|---|
| `false` | `http://localhost:5173` | `http://<ip>:7284` |
| `true`  | `https://localhost:5173` | `https://<ip>:8081` |

`true` 時才需要站台憑證；沒給會直接報錯結束，不會默默退回 http。

路徑可以用相對路徑，基準是專案根目錄（`server.js` 則是它自己所在的目錄）：

```
VITE_USE_HTTPS='true'
SERVER_TLS_CERT=./certs/dev.crt      # dev 用：SAN 要含 localhost
SERVER_TLS_KEY=./certs/dev.key
SERVER_TLS_CA=./certs/rootCA.crt     # 要驗證後端憑證時才需要
```

Windows 上請用正斜線 `/`，不要用反斜線（`\` 在 dotenv 裡是跳脫字元）。

## 為什麼不進版控

私鑰進了 git 就等於外洩，即使之後刪掉也還留在歷史裡。
所以：檔案自己複製進來，設定值寫在 `.env`（`.env` 也不進版控）。

新環境要部署時，把憑證複製到這個資料夾就好，不用改任何程式碼。

## 容器怎麼拿到憑證

`certs/` 有列在 `.dockerignore`，所以**不會被打進 image**（避免私鑰烘進映像檔）。
執行時用 volume 掛進去：

```bash
docker run -d \
  -v /path/to/certs:/app/certs:ro \
  -e SERVER_TLS_CERT=./certs/server.crt \
  -e SERVER_TLS_KEY=./certs/server.key \
  ...
```

如果你就是想把憑證烘進 image（內網自簽、方便優先），把 `.dockerignore`
裡的 `certs` 那行刪掉即可。

## 產生自簽憑證

SAN 必須涵蓋所有你會用來連線的名稱／IP，否則瀏覽器會擋：

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout server.key -out server.crt \
  -subj "/CN=192.168.100.200" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.100.200,IP:192.168.100.201"
```

## 重要：不要把後端 8081 那張憑證拿來當站台憑證

後端憑證的 SAN 通常只有 `IP:192.168.100.200`。你用 `https://localhost:5173`
連 dev server 時，瀏覽器會檢查 `localhost` 是否在 SAN 裡 —— 不在就直接擋
（`NET::ERR_CERT_COMMON_NAME_INVALID`），rootCA 有沒有安裝都救不了，
因為那是「名稱不符」而不是「不信任」。

dev 用的憑證請另外簽一張（用同一個 rootCA，這樣已安裝 rootCA 的機器不會跳警告）：

```bash
cat > dev.conf <<'EOF'
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = TW
O = UNEO
CN = localhost

[v3_req]
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1  = 127.0.0.1
IP.2  = 192.168.100.201
EOF

openssl req -newkey rsa:2048 -nodes -keyout dev.key -out dev.csr -config dev.conf
openssl x509 -req -in dev.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial \
  -out dev.crt -days 825 -extfile dev.conf -extensions v3_req
```
