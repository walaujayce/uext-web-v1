import { red } from "@mui/material/colors";
import React, { useEffect, useRef } from "react";

/**
 * RiskArea
 * 在 OpenCVComponent 產出的 canvas 上方覆蓋一個透明 canvas，
 * 依照 center_x / center_y / radius 在對應位置畫圓形框。
 *
 * Props:
 *  - data: Array<{ center_x, center_y, radius, status }>
 *  - width:  data.WIDTH  (sensor 寬，用來與 OpenCVComponent 同步比例)
 *  - height: data.HEIGHT (sensor 高，用來與 OpenCVComponent 同步比例)
 *
 * 圓的半徑 = radius * 2.54 (px)
 * status === 1 → 黃色, status === 2 → 紅色, 其它 → 不畫
 *
 * 為了讓覆蓋層與 OpenCVComponent 的 canvas 完全對齊：
 * 1. 父層 .box 必須是 position: relative
 * 2. 兩個 canvas 都依照 parentBox.clientHeight * 0.9 + 維持 sensor 比例 計算尺寸
 */
function RiskArea({ data = [], width, height }) {
  console.log("risk area: ", data);
  console.log("risk area: ", width);
  console.log("risk area: ", height);
  const sensor_width = width;
  const sensor_height = height;
  const canvasRef = useRef(null);

  const temp = [
    { idx: 0, radius: 32, center_x: 5, center_y: 31 },
    { idx: 1, radius: 2, center_x: 14, center_y: 57},
    { idx: 2, radius: 5, center_x: 21, center_y: 60},
  ];
  // 1) 計算 canvas 尺寸：與 OpenCVComponent 完全相同的邏輯
  useEffect(() => {
    const parentBox = canvasRef.current?.parentElement;
    if (parentBox && sensor_width && sensor_height) {
      canvasRef.current.height = parentBox.clientHeight * 0.9;
      const scaleAdjust_clientWidth = Math.round(
        (parentBox.clientHeight * sensor_width) / sensor_height,
      );
      canvasRef.current.width = scaleAdjust_clientWidth * 0.9;
    }
  }, [sensor_width, sensor_height]);

  // 2) 依照 data 在 canvas 上畫圓
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!Array.isArray(data) || data.length === 0) return;

    data.forEach((region) => {
      if (!region) return;
      const { idx, center_x, center_y, radius } = region;
      console.log("idx: ", idx);
      console.log("center_x: ", center_x);
      console.log("center_y: ", center_y);
      console.log("radius: ", radius);

      // 顏色: 1 → 黃, 2 → 紅, 其它略過
      let color = "#FF2D2D";
      // let color = null;
      // if (status === 1)
      //   color = "#FFD400"; // 黃
      // else if (status === 2) color = "#FF2D2D"; // 紅
      // if (!color) return;

      const r = (Number(radius) || 0) * 2.54;
      if (r <= 0) return;

      const cx = Number(center_x) || 0;
      const cy = Number(center_y) || 0;

      // 圓形框
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();

      // 在圓內標示 idx (黑色字體)
      if (idx !== undefined && idx !== null) {
        const fontSize = Math.max(12, Math.round(r * 0.8));
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(idx), cx, cy);
      }
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 10,
        // backgroundColor: "rgba(0, 0, 255, 0.5)", // 透明度 50% 的藍色
      }}
    />
  );
}

export default RiskArea;
