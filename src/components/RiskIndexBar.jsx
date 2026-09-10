import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "/src/CSS/risk-callout.css";

/**
 * RiskIndexBar
 * 每個 risk region 都在壓力圖「外側」放一個標籤（區域編號），用引線連回圖上的實際位置；
 * 滑鼠移到標籤上才展開資訊卡（Max / Avg / Duration / Area）。
 *
 * 設計重點：標籤與資訊卡一律排在 canvas 之外，不會蓋住風險發生的位置；
 * 圖上只留一個小圓點標出位置本身，加一條細引線。
 *
 * Props:
 *  - data:   Array<risk region>（空陣列 → 不顯示）
 *  - width:  sensor 寬（data.WIDTH）
 *  - height: sensor 高（data.HEIGHT）
 *  - gap:    標籤與 canvas 邊緣的水平間距 px（預設 20）
 *
 * 對齊原理（與 OpenCVComponent / RiskArea 完全相同的換算）：
 *  1. canvas 尺寸 = parentBox.clientHeight * 0.9，寬度依 sensor 比例換算後同樣 * 0.9
 *  2. canvas 在 .box 中是垂直+水平置中
 *  3. 壓力圖是旋轉 180° 呈現的，所以兩軸都要反轉：
 *       cx = (width  - 1 - center_x) * (canvasW / (width  - 1))
 *       cy = (height - 1 - center_y) * (canvasH / (height - 1))
 *  4. 父層 .box 必須是 position: relative（PatientMonitor 已設定）
 */

// ─────────────────────────────────────────────────────────
// ⚠ 後端欄位對照表 —— 確認實際 key 之後只要改這裡
//   （每個欄位按順序找第一個有值的 key，找不到就顯示 "--"）
// ─────────────────────────────────────────────────────────
const FIELD_KEYS = {
  max: ["peak","max_pressure", "maxPressure", "max_press", "pressure_max", "max", "Max"],
  avg: ["mean","avg_pressure", "avgPressure", "avg_press", "pressure_avg", "mean_pressure", "avg", "Avg"],
  // 註：目前 RiskRegion 表格是把 radius 當「壓力範圍(cm²)」顯示，這裡沿用同一個來源
  area: ["area", "area_cm2", "pressure_area", "radius", "Radius"],
  duration: ["duration_sec", "durationSec", "duration", "Duration"],
};

const pick = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

const DASH = "--";

const fmtNum = (v, digits) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return DASH;
  return digits === 0 ? String(Math.round(n)) : n.toFixed(digits);
};

// 秒數 → HH:MM:SS
const fmtDuration = (sec) => {
  const n = Number(sec);
  if (!Number.isFinite(n) || n < 0) return DASH;
  const s = Math.floor(n);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const LEVEL_CLASS = { 2: "is-high", 1: "is-medium", 0: "is-low" };

// 圓圈半徑：與 OpenCVComponent 畫遮罩、RiskArea 畫框時完全相同的換算
//   OpenCVComponent: r = radius * 2.75 * (dst.cols / canvas.width)  → 換回 canvas 座標即 radius * 2.75
//   RiskArea:        r = radius * 2.75
// 太小的圈點不到，給一個最小可視半徑。
const RADIUS_SCALE = 2.75;
const MIN_RADIUS_PX = 5;
const regionRadiusPx = (r) =>
  Math.max(MIN_RADIUS_PX, (Number(r?.radius) || 0) * RADIUS_SCALE);

// 標籤沿 y 軸防重疊：由上而下掃一次，重疊就往下推
const spreadLabels = (items, minGap, boxH) => {
  const sorted = [...items].sort((a, b) => a.y - b.y);
  let prev = -Infinity;
  for (const it of sorted) {
    it.labelY = Math.max(it.y, prev + minGap);
    prev = it.labelY;
  }
  // 整批超出下緣就往上平移，再夾一次
  const overflow = prev - (boxH - minGap / 2);
  if (overflow > 0) {
    for (const it of sorted) {
      it.labelY = Math.max(minGap / 2, it.labelY - overflow);
    }
  }
  return sorted;
};

function RiskIndexBar({ data = [], width, height, gap = 20 }) {
  const { t } = useTranslation();

  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const panelRef = useRef(null);

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [labelSize, setLabelSize] = useState({ w: 28, h: 22 });
  const [panelSize, setPanelSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState(null); // region 的 key

  const regions = (Array.isArray(data) ? data : []).filter(
    (r) =>
      r &&
      Number.isFinite(Number(r.center_x)) &&
      Number.isFinite(Number(r.center_y)),
  );

  const notReady =
    regions.length === 0 ||
    !canvasSize.w ||
    !canvasSize.h ||
    !box.w ||
    !width ||
    width <= 1 ||
    !height ||
    height <= 1;

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
      // ⚠ 一律用「值相同就回傳 prev」：ResizeObserver 每次都給新物件，
      //   直接 setState 會讓 React 認定 state 有變 → 重繪 → 再量 → 無限迴圈。
      setCanvasSize((p) => (p.w === w && p.h === h ? p : { w, h }));
      const bw = parentBox.clientWidth;
      const bh = parentBox.clientHeight;
      setBox((p) => (p.w === bw && p.h === bh ? p : { w: bw, h: bh }));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parentBox);
    return () => ro.disconnect();
  }, [width, height]);

  // 量一個標籤的尺寸，用來做防重疊與資訊卡定位。
  // ⚠ 依賴陣列與「值相同回 prev」兩者缺一不可，否則同樣會無限迴圈。
  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setLabelSize((p) => (p.w === w && p.h === h ? p : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [notReady]);

  // 量資訊卡尺寸，才能把它夾在 .box 內不溢出
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setPanelSize((p) => (p.w === w && p.h === h ? p : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hovered]);

  // 沒資料時仍要保留一個節點，才有 parentElement 可以量測
  if (notReady) return <div ref={rootRef} style={{ display: "none" }} />;

  // canvas 在 .box 中置中 → 換算成 .box 座標系
  const canvasLeft = (box.w - canvasSize.w) / 2;
  const canvasTop = (box.h - canvasSize.h) / 2;
  const canvasRight = canvasLeft + canvasSize.w;

  // 標籤放右側；右邊塞不下就放左側。無論哪一側都在 canvas 之外，不會蓋住壓力圖。
  const rightRoom = box.w - canvasRight - gap;
  const leftRoom = canvasLeft - gap;
  const onRight = rightRoom >= labelSize.w || rightRoom >= leftRoom;
  const labelX = onRight ? canvasRight + gap : canvasLeft - gap - labelSize.w;

  const items = regions.map((r, i) => {
    const cx = (width - 1 - Number(r.center_x)) * (canvasSize.w / (width - 1));
    const cy = (height - 1 - Number(r.center_y)) * (canvasSize.h / (height - 1));
    return {
      key: `${r.idx ?? "?"}-${i}`,
      region: r,
      idx: r.idx,
      level: Number(r.risk_level) || 0,
      r: regionRadiusPx(r),
      dotX: canvasLeft + cx,
      dotY: canvasTop + cy,
      y: canvasTop + cy, // 標籤想對齊的 y，spreadLabels 會調整成 labelY
    };
  });

  const placed = spreadLabels(items, labelSize.h + 6, box.h);
  const active = placed.find((it) => it.key === hovered) || null;

  // 資訊卡：緊貼在標籤外側（中間不留縫，滑鼠移過去不會斷開 hover）
  const panelLeft = onRight
    ? labelX + labelSize.w
    : labelX - panelSize.w;
  const panelTop = active
    ? Math.min(
        Math.max(4, active.labelY - panelSize.h / 2),
        Math.max(4, box.h - panelSize.h - 4),
      )
    : 0;

  const rows = active
    ? [
        {
          k: t("RiskRegion.Max", "Max"),
          v: fmtNum(pick(active.region, FIELD_KEYS.max), 0),
          u: "mmHg",
        },
        {
          k: t("RiskRegion.Avg", "Avg"),
          v: fmtNum(pick(active.region, FIELD_KEYS.avg), 1),
          u: "mmHg",
        },
        {
          k: t("RiskRegion.Duration", "Duration"),
          v: fmtDuration(pick(active.region, FIELD_KEYS.duration)),
          u: "",
        },
        {
          k: t("RiskRegion.Area", "Area"),
          v: fmtNum(pick(active.region, FIELD_KEYS.area), 2),
          u: "cm²",
        },
      ]
    : [];

  return (
    <div ref={rootRef} className="risk-callout">
      {/* 引線：圖上的點 → 外側的標籤 */}
      <svg className="risk-callout__line" aria-hidden="true">
        {placed.map((it) => {
          const endX = onRight ? labelX : labelX + labelSize.w;
          // 從圓圈「邊緣」起筆，不要從圓心拉線穿過風險區域
          const startX = it.dotX + (onRight ? it.r : -it.r);
          const elbowX = onRight
            ? startX + (endX - startX) * 0.55
            : startX - (startX - endX) * 0.55;
          return (
            <path
              key={it.key}
              className={it.key === hovered ? "is-active" : undefined}
              d={`M ${startX} ${it.dotY} L ${elbowX} ${it.labelY} L ${endX} ${it.labelY}`}
            />
          );
        })}
      </svg>

      {/* 圖上的位置標記：只有一個小圓點，盡量不遮蔽 */}
      {placed.map((it) => (
        <div
          key={`dot-${it.key}`}
          className={`risk-callout__marker ${LEVEL_CLASS[it.level] ?? "is-low"}${
            it.key === hovered ? " is-active" : ""
          }`}
          style={{
            left: `${it.dotX}px`,
            top: `${it.dotY}px`,
            width: `${it.r * 2}px`,
            height: `${it.r * 2}px`,
          }}
        />
      ))}

      {/* 外側標籤：預設只顯示區域編號，hover 才展開資訊卡 */}
      {placed.map((it, i) => (
        <div
          key={`label-${it.key}`}
          ref={i === 0 ? labelRef : undefined}
          className={`risk-callout__label ${LEVEL_CLASS[it.level] ?? "is-low"}${
            it.key === hovered ? " is-active" : ""
          }`}
          style={{ left: `${labelX}px`, top: `${it.labelY}px` }}
          onMouseEnter={() => setHovered(it.key)}
          onMouseLeave={() => setHovered(null)}
        >
          {t("RiskRegion.CalloutTitle", "RISK REGION")}
        </div>
      ))}

      {/* 展開的資訊卡：也在 canvas 之外 */}
      {active && (
        <div
          ref={panelRef}
          className="risk-callout__panel"
          style={{
            left: `${panelLeft}px`,
            top: `${panelTop}px`,
            // 尚未量到尺寸前先不要閃現在錯的位置
            visibility: panelSize.w ? "visible" : "hidden",
          }}
          onMouseEnter={() => setHovered(active.key)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="risk-callout__title">
            {t("RiskRegion.CalloutTitle", "RISK REGION")}
            <span className="risk-callout__title-idx">
              {String(active.idx ?? "?")}
            </span>
          </div>
          <div className="risk-callout__rows">
            {rows.map((r) => (
              <div className="risk-callout__row" key={r.k}>
                <span className="risk-callout__key">{r.k}</span>
                <span className="risk-callout__sep">:</span>
                <span className="risk-callout__val">{r.v}</span>
                {r.u && <span className="risk-callout__unit">{r.u}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskIndexBar;
