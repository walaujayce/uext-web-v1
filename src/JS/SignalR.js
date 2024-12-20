import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
  }

  async startConnection() {
    this.connection = new HubConnectionBuilder()
      .withUrl("/signalR/7284") // Use the same hub URL as your server
      .configureLogging(LogLevel.Information)
      .build();

    // Start the connection
    try {
      await this.connection.start();
      console.log("SignalR connection established.");
    } catch (error) {
      console.error("Error establishing SignalR connection:", error);
    }
  }

  onReceiveMessage(callback) {
    if (this.connection) {
      this.connection.on("ReceiveMessage", (topic, message) => {
        console.log(`Received message: ${topic} : ${message}`);
        if (callback) {
          callback(topic, message);
        }
      });
    } else {
      console.error("SignalR connection not established.");
    }
  }

  async sendMessage(topic, message) {
    if (this.connection) {
      try {
        await this.connection.invoke("SendMessage", topic, message);
        console.log(`Message sent: ${topic} : ${message}`);
      } catch (error) {
        console.error("Error sending message via SignalR:", error);
      }
    } else {
      console.error("SignalR connection not established.");
    }
  }
}

export default new SignalRService();
