import React, { useEffect, useRef, useState } from "react";

/**
 * RiskIndexBar
 * 在 OpenCVComponent 的 canvas 旁邊顯示一排 risk region 的 idx 數字，
 * 每個數字的位置對齊該 region 在壓力圖上的圓心座標。
 *
 * Props:
 *  - data:      Array<{ idx, center_x, center_y, ... }>  risk regions（空陣列 → 不顯示）
 *  - width:     sensor 寬（data.WIDTH）
 *  - height:    sensor 高（data.HEIGHT）
 *  - placement: "right"(預設) | "left" | "top" | "bottom"
 *                 left / right → 直向排列，數字的 y 對齊圓心 y
 *                 top / bottom → 橫向排列，數字的 x 對齊圓心 x
 *  - gap:       標號與 canvas 邊緣的間距 px（預設 8）
 *
 * 對齊原理（與 OpenCVComponent / RiskArea 完全相同的換算）：
 *  1. canvas 尺寸 = parentBox.clientHeight * 0.9，寬度依 sensor 比例換算後同樣 * 0.9
 *  2. 壓力圖是旋轉 180° 呈現的，所以兩軸都要反轉：
 *       cx = (width  - 1 - center_x) * (canvasW / (width  - 1))
 *       cy = (height - 1 - center_y) * (canvasH / (height - 1))
 *  3. 父層 .box 必須是 position: relative（PatientMonitor 已設定）
 */
function RiskIndexBar({
  data = [],
  width,
  height,
  placement = "right",
  gap = 8,
}) {
  const rootRef = useRef(null);
  // canvas 的實際像素尺寸；跟著 .box 尺寸變動重算，視窗縮放也會對齊
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const parentBox = rootRef.current?.parentElement;
    if (!parentBox || !width || !height) return;

    const measure = () => {
      // ⚠ 這三行必須與 OpenCVComponent 內的計算逐字一致，否則會對不準
      const h = parentBox.clientHeight * 0.9;
      const scaleAdjustClientWidth = Math.round(
        (parentBox.clientHeight * width) / height,
      );
      const w = scaleAdjustClientWidth * 0.9;
      setCanvasSize({ w, h });
    };

    measure();
    // .box 會隨視窗縮放改變高度 → canvas 尺寸跟著變，標號位置也要重算
    const ro = new ResizeObserver(measure);
    ro.observe(parentBox);
    return () => ro.disconnect();
  }, [width, height]);

  const isVertical = placement === "left" || placement === "right";
  const regions = Array.isArray(data) ? data : [];

  // riskRegionArray 沒資料、或尺寸還沒量到 → 什麼都不畫
  // （仍要保留一個節點，才有 parentElement 可以量測）
  const notReady =
    regions.length === 0 ||
    !canvasSize.w ||
    !canvasSize.h ||
    (isVertical ? !height || height <= 1 : !width || width <= 1);
  if (notReady) return <div ref={rootRef} style={{ display: "none" }} />;

  const labels = regions
    .filter((r) =>
      Number.isFinite(Number(isVertical ? r?.center_y : r?.center_x)),
    )
    .map((r, i) => ({
      key: `${r.idx ?? "?"}-${i}`,
      idx: r.idx,
      // 與圓圈相同的換算（含 180° 旋轉）
      pos: isVertical
        ? (height - 1 - Number(r.center_y)) * (canvasSize.h / (height - 1))
        : (width - 1 - Number(r.center_x)) * (canvasSize.w / (width - 1)),
    }))
    .sort((a, b) => a.pos - b.pos);

  // 標號條本身的粗細（直向=寬度，橫向=高度）
  const BAR_THICKNESS = 24;

  // canvas 在 .box 中是垂直+水平置中的，所以把標號條的中心往外推
  // 「半個 canvas + 半個標號條 + gap」即可貼齊 canvas 的邊緣。
  const offset = isVertical
    ? canvasSize.w / 2 + BAR_THICKNESS / 2 + gap
    : canvasSize.h / 2 + BAR_THICKNESS / 2 + gap;

  const sign = placement === "top" || placement === "left" ? "-" : "+";
  const transform = isVertical
    ? `translate(calc(-50% ${sign} ${offset}px), -50%)`
    : `translate(-50%, calc(-50% ${sign} ${offset}px))`;

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: isVertical ? `${BAR_THICKNESS}px` : `${canvasSize.w}px`,
        height: isVertical ? `${canvasSize.h}px` : `${BAR_THICKNESS}px`,
        transform,
        pointerEvents: "none",
        zIndex: 11,
      }}
    >
      {labels.map((l) => (
        <span
          key={l.key}
          style={{
            position: "absolute",
            // 直向：固定水平置中、垂直依 y；橫向：固定垂直置中、水平依 x
            left: isVertical ? "50%" : `${l.pos}px`,
            top: isVertical ? `${l.pos}px` : "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: 1,
            color: "#FF2D2D",
            // 深/淺底色都看得清楚
            textShadow:
              "0 0 3px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.85), 0 0 2px #fff",
            whiteSpace: "nowrap",
          }}
        >
          {String(l.idx)}
        </span>
      ))}
    </div>
  );
}

export default RiskIndexBar;
