import * as signalR from '@microsoft/signalr';

// Create a SignalR connection
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/signalR/7284') // Replace with your SignalR hub URL
  .withAutomaticReconnect() // Optional: Automatically reconnect if the connection is lost
  .build();

// Start the connection
export const startConnection = async () => {
  try {
    await connection.start();
    console.log("SignalR connection established.");
  } catch (error) {
    console.error("SignalR connection error:", error);
  } 
};

export const getConnection = () => connection; // Export the connection for use
