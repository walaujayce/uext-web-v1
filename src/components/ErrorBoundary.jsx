import React from "react";

/**
 * ErrorBoundary
 * 捕捉子元件 render / lifecycle 期間丟出的錯誤，改顯示一個友善的訊息，
 * 避免使用者看到白畫面或底層錯誤堆疊(實作細節)。
 * 錯誤細節只寫進 console 給開發者，不顯示在畫面上。
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // 只記錄在 console(開發用)；畫面不顯示任何底層資訊
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    // 回首頁並重新整理，嘗試從錯誤狀態復原
    window.location.href = "/home";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
            fontFamily:
              '"Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", sans-serif',
          }}
        >
          <h1 style={{ fontSize: "22px", margin: 0 }}>
            系統發生問題 / Something went wrong
          </h1>
          <p style={{ margin: 0, color: "#888", maxWidth: "480px" }}>
            頁面暫時無法顯示，請稍後再試或重新整理。
            <br />
            The page ran into a problem. Please try again.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: "8px",
              padding: "10px 24px",
              fontSize: "15px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "#07794f",
              color: "#fff",
            }}
          >
            重新整理 / Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
