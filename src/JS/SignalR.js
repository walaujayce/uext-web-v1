import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getCurrentServerIp } from "../api/serverStore";
import { getAccessToken } from "../auth/authStore";

// SignalR hub 已加上 JWT 驗證：
//   - negotiate / long-polling(HTTP) → 用 Authorization: Bearer header
//   - WebSocket 握手(無法帶 header) → SignalR 會自動把 token 放到 query string ?access_token=
//     （後端 OnMessageReceived 對 /notifyHub 就是讀這個 query）
// 只要提供 accessTokenFactory，@microsoft/signalr 會自動處理上述兩種情況。
const hubOptions = () => ({
  accessTokenFactory: () => getAccessToken() || "",
});

// 依目前選取的樓層/區域 IP 組出 SignalR hub 網址。
//   一律走相對路徑 /signalR/7284（same-origin，無 CORS），把目標 IP 放在 query string；
//   由 vite.config.js 的 dynamic-api-proxy 依 targetIp 動態轉發到對應後端。
//
// 註：WebSocket 握手無法帶自訂 header，所以改用 query string 傳遞目標 IP
//     （negotiate 與 ws 握手都會帶上 query，proxy 兩邊都讀得到）。
//     尚未選到 IP 時不帶 targetIp，proxy 會 fallback 到 env 預設 IP。
const HUB_PORT = "7284";
const buildHubUrl = (ipArg) => {
  // ipArg 未傳(undefined) → 讀 module store；有傳(含 null) → 以傳入值為準
  const ip = ipArg !== undefined ? ipArg : getCurrentServerIp();
  return ip
    ? `/signalR/${HUB_PORT}?targetIp=${encodeURIComponent(ip)}`
    : `/signalR/${HUB_PORT}`;
};

export class SignalRService {
  constructor() {
    this.connection = null;
    // 「All」模式：每台後端各一條連線，key = ip
    this.connections = new Map();
  }

  async startConnection(ipOverride) {
    // 先關掉舊連線，確保切換樓層時會重新連到新的 IP
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        /* 忽略停止舊連線時的錯誤 */
      }
      this.connection = null;
    }

    const url = buildHubUrl(ipOverride);
    this.connection = new HubConnectionBuilder()
      .withUrl(url, hubOptions()) // 依目前選取樓層 IP 動態決定 + 帶上 JWT
      .configureLogging(LogLevel.Information)
      .build();

    // Start the connection
    try {
      await this.connection.start();
      //console.log("SignalR connection established:", url);
    } catch (error) {
      console.error("Error establishing SignalR connection:", error);
    }
  }

  onReceiveMessage(callback) {
    if (this.connection) {
      this.connection.on("ReceiveMessage", (topic, message) => {
        //console.log(`Received message: ${topic} : ${message}`);
        if (callback) {
          callback(topic, message);
        }
      });
    } else {
      console.error("SignalR connection not established.");
    }
  }

  // ─────────────────────────────────────────────────────────
  // 多台連線（All 模式）：同時連到多個後端 IP，各自收 realtime 訊息。
  // 不動用 this.connection（primary），避免影響 sendMessage / 其他頁面。
  // ─────────────────────────────────────────────────────────
  async startConnections(ips) {
    await this.stopConnections();
    const uniqueIps = [...new Set((ips || []).filter(Boolean))];
    await Promise.all(
      uniqueIps.map(async (ip) => {
        const conn = new HubConnectionBuilder()
          .withUrl(buildHubUrl(ip), hubOptions()) // 每台各自帶自己的 targetIp + JWT
          .configureLogging(LogLevel.Information)
          .build();
        try {
          await conn.start();
          this.connections.set(ip, conn);
        } catch (error) {
          console.error(`Error establishing SignalR connection (${ip}):`, error);
        }
      }),
    );
  }

  // 對所有多台連線註冊同一個 ReceiveMessage handler；
  // 第三個參數帶上「這條連線的來源 IP」，讓上層知道訊息來自哪一台。
  onReceiveMessageMulti(callback) {
    this.connections.forEach((conn, ip) => {
      conn.on("ReceiveMessage", (topic, message) => {
        if (callback) callback(topic, message, ip);
      });
    });
  }

  async stopConnections() {
    const conns = Array.from(this.connections.values());
    this.connections.clear();
    await Promise.all(conns.map((c) => c.stop().catch(() => {})));
  }

  async sendMessage(topic, message) {
    if (this.connection) {
      try {
        await this.connection.invoke("SendMessage", topic, message);
        //console.log(`Message sent: ${topic} : ${message}`);
      } catch (error) {
        console.error("Error sending message via SignalR:", error);
      }
    } else {
      console.error("SignalR connection not established.");
    }
  }
}

export default new SignalRService();
