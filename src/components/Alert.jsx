import React, { useState, useEffect } from "react";
import { startConnection, getConnection } from "../JS/SignalR";

function Alert() {
  const [expandAlertList, setExpandAlertList] = useState(false);

  const handleAlertListExpandClick = () => {
    setExpandAlertList((prev) => !prev);
  };
  {
    /* Signal R Connection */
  }
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on initial render
    const savedMessages = sessionStorage.getItem("signalRMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  useEffect(() => {
    // Start SignalR connection
    startConnection();

    const connection = getConnection();

    // Subscribe to a SignalR method (replace 'ReceiveMessage' with your hub method name)
    connection.on("ReceiveMessage", (message) => {
      setMessages((prevMessages) => {
        const updatedMessages = [message, ...prevMessages];
        // Save updated messages to localStorage
        sessionStorage.setItem(
          "signalRMessages",
          JSON.stringify(updatedMessages)
        );
        return updatedMessages;
      });
    });
    return () => {
      connection.off("ReceiveMessage");
    };
  }, []);

  return (
    <div className={`alerts ${expandAlertList ? "min" : ""}`}>
      <div className="box">
        <h1>Alerts</h1>
        <img
          id="expand"
          src="/src/assets/double-left.svg"
          alt="double chervon left arrow"
          onClick={handleAlertListExpandClick}
        />
      </div>
      <div className="alert-list">
        <div className={`container new ${expandAlertList ? "min" : ""}`}>
          <div className="title">
            <img src="/src/assets/alert.svg" alt="red rectangular alert icon" />
            <h2>Exit Bed Alert</h2>
          </div>
          <div className="info">
            <div className="item">
              <div className="caption">Section</div>
              <p>9F-01</p>
            </div>
            <div className="item">
              <div className="caption">Bed</div>
              <p>1024</p>
            </div>
            <div className="item">
              <div className="caption">Name</div>
              <p>Chan Tai Ming</p>
            </div>
            <div className="time">08:41</div>
          </div>
        </div>

        {messages.map((msg, index) => (
          <div
            className={`container new ${expandAlertList ? "min" : ""}`}
            key={index}
          >
            <div className="title">
              <img
                src="/src/assets/alert.svg"
                alt="red rectangular alert icon"
              />
              <h2>Exit Bed Alert</h2>
            </div>
            <div className="info">
              <div className="item">
                <div className="caption">Section</div>
                <p>9F-01</p>
              </div>
              <div className="item">
                <div className="caption">Bed</div>
                <p>1024</p>
              </div>
              <div className="item">
                <div className="caption">Name</div>
                <p>Chan Tai Ming</p>
              </div>
              <div className="time">08:41</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alert;
