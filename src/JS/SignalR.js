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

  // ─────────────────────────────────────────────────────────
  // 綁定 ReceiveMessage handler。
  //
  // ⚠ 一定要在 connection.start() 之前呼叫。連線一 start，後端就可能立刻開始推播；
  //   若此時還沒有 handler，@microsoft/signalr 會對每一筆訊息印出
  //     "No client method with the name 'receivemessage' found."
  //   而且那些訊息會直接被丟掉 —— 不只是 console 吵，是真的漏資料。
  //
  // 先 off 再 on：重複呼叫時是「取代」而不是「疊加」，避免 callback 被觸發多次。
  // ─────────────────────────────────────────────────────────
  static _attach(conn, callback, ip) {
    if (!conn || !callback) return;
    conn.off("ReceiveMessage");
    conn.on("ReceiveMessage", (topic, message) => {
      //console.log(`Received message: ${topic} : ${message}`);
      callback(topic, message, ip);
    });
  }

  // onMessage 可選；有傳就會在 start() 之前先綁好 handler（建議一律這樣呼叫）
  async startConnection(ipOverride, onMessage) {
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
    const conn = new HubConnectionBuilder()
      .withUrl(url, hubOptions()) // 依目前選取樓層 IP 動態決定 + 帶上 JWT
      .configureLogging(LogLevel.Information)
      .build();

    // ⬅ 關鍵順序：先綁 handler，再 start
    const ip = ipOverride !== undefined ? ipOverride : getCurrentServerIp();
    SignalRService._attach(conn, onMessage, ip);

    this.connection = conn;

    // Start the connection
    try {
      await conn.start();
      //console.log("SignalR connection established:", url);
    } catch (error) {
      console.error("Error establishing SignalR connection:", error);
    }
  }

  // 保留給舊呼叫端。注意這是「start 之後才綁」，開頭那幾筆訊息會漏掉，
  // 建議改用 startConnection(ip, callback)。
  onReceiveMessage(callback) {
    if (this.connection) {
      SignalRService._attach(this.connection, callback);
    } else {
      console.error("SignalR connection not established.");
    }
  }

  // ─────────────────────────────────────────────────────────
  // 多台連線（All 模式）：同時連到多個後端 IP，各自收 realtime 訊息。
  // 不動用 this.connection（primary），避免影響 sendMessage / 其他頁面。
  // ─────────────────────────────────────────────────────────
  // onMessage 可選；有傳就會在每條連線 start() 之前先綁好 handler。
  // 這裡的競態比單條更嚴重：原本要等 Promise.all 全部連完才綁 handler，
  // 先連上的那幾台在等待期間推來的訊息會全部變成 "No client method..." 警告。
  async startConnections(ips, onMessage) {
    await this.stopConnections();
    const uniqueIps = [...new Set((ips || []).filter(Boolean))];
    await Promise.all(
      uniqueIps.map(async (ip) => {
        const conn = new HubConnectionBuilder()
          .withUrl(buildHubUrl(ip), hubOptions()) // 每台各自帶自己的 targetIp + JWT
          .configureLogging(LogLevel.Information)
          .build();

        // ⬅ 關鍵順序：先綁 handler，再 start
        SignalRService._attach(conn, onMessage, ip);

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
  // 同樣是「start 之後才綁」，建議改用 startConnections(ips, callback)。
  onReceiveMessageMulti(callback) {
    this.connections.forEach((conn, ip) => {
      SignalRService._attach(conn, callback, ip);
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
