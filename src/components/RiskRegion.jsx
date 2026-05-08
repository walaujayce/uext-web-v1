import React, { useState, useEffect } from "react";

function RiskRegion({ data = [] }) {
  // 依照 idx 排序 (不修改原 array)

  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => a.idx - b.idx)
    : [];

  // 不同等級對應的顏色
  const getLevelStyle = (level) => {
    const baseStyle = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "capitalize",
      minWidth: "60px",
      textAlign: "center",
    };

    switch ((level || "").toLowerCase()) {
      case "high":
        return { ...baseStyle, backgroundColor: "#fde2e2", color: "#c0392b" };
      case "medium":
        return { ...baseStyle, backgroundColor: "#fff4d6", color: "#b8860b" };
      case "low":
        return { ...baseStyle, backgroundColor: "#dff5e1", color: "#1e7e34" };
      default:
        return { ...baseStyle, backgroundColor: "#e0e0e0", color: "#555" };
    }
  };

  // Styles
  const containerStyle = {
    flex: "1 1 auto",
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    padding: "16px",
    boxSizing: "border-box",
  };

  const tableWrapperStyle = {
    width: "100%",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  };

  const tableStyle = {
    width: "100%",
    tableLayout: "auto",
    borderCollapse: "collapse",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  };

  const theadStyle = {
    backgroundColor: "#f5f7fa",
    color: "#333",
  };

  const thStyle = {
    padding: "12px 16px",
    fontWeight: 600,
    borderBottom: "2px solid #e0e0e0",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const tdStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    color: "#444",
    textAlign: "center",
    verticalAlign: "middle",
  };

  const emptyRowStyle = {
    padding: "24px 16px",
    textAlign: "center",
    verticalAlign: "middle",
    color: "#999",
    fontStyle: "italic",
  };

  return (
    <div className="respiration">
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>區域編號</th>
              <th style={thStyle}>持續時間</th>
              <th style={thStyle}>壓力範圍cm&sup2;</th>
              <th style={thStyle}>x</th>
              <th style={thStyle}>y</th>
              <th style={thStyle}>風險等級</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={4} style={emptyRowStyle}>
                  無資料
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={item.idx ?? index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                  }}
                >
                  <td style={tdStyle}>{item.idx}</td>
                  <td style={tdStyle}>{item.duration_sec}</td>
                  <td style={tdStyle}>{item.radius}</td>
                  <td style={tdStyle}>{item.center_x}</td>
                  <td style={tdStyle}>{item.center_y}</td>
                  <td style={tdStyle}>
                    <span style={getLevelStyle(item.level)}>{item.level}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RiskRegion;
