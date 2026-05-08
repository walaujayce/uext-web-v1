import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import SimpleBackdrop from "./LoadingOverlay";
import api from "../api/apiClient";

/* ------------------------------ helpers ------------------------------ */

// 把 ISO 日期 (e.g. "2026-05-06T00:00:00Z") 轉成 "mm/dd"
const formatDateMMDD = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}`;
};

// warn=true → 紅色，warn=false → 綠色
const colorFromWarn = (warn) => (warn ? "#E53935" : "#43A047");

/* -------------------- 護理建議模板 (參考 UBS 模板) -------------------- */
const RECOMMENDATIONS = {
  // 夜間睡眠時數 (UEXT)
  sleepTime: {
    normal: {
      summary: ["一般狀況", "(平均每晚 7-9 小時)"],
      details: [
        "建議維持每日睡眠約 7-9 小時，以促進身體恢復。",
        "鼓勵建立規律作息時間，避免日夜顛倒。",
        "白天午睡時間不超過 30 分鐘，以利夜間入睡。",
      ],
    },
    insufficient: {
      summary: ["睡眠不足 / 品質不佳", "(平均每晚少於 6 小時)"],
      details: [
        "住民夜間睡眠時數不足，建議提供安靜環境並減少干擾。",
        "睡前避免刺激性活動，如滑手機、飲用含咖啡因飲品。",
        "可評估是否有疼痛、不適或焦慮影響睡眠，必要時通報醫師處理。",
      ],
    },
    excessive: {
      summary: ["睡眠過多 / 嗜睡", "(平均每晚大於 10 小時)"],
      details: [
        "住民嗜睡情形明顯，建議適度喚醒並鼓勵日間活動。",
        "調整白天午睡休息時間，避免影響夜間睡眠。",
        "評估是否與藥物副作用或病況相關。",
      ],
    },
  },

  // 夜間離床次數 (UEXT)
  leaveBed: {
    normal: {
      summary: ["一般狀況", "(平均每晚少於或等於 2 次)"],
      details: [
        "住民夜間離床次數可接受，持續觀察夜間活動狀況。",
        "建議維持床邊環境安全，如安全床欄、呼叫鈴。",
        "鼓勵睡前如廁，以減少夜間離床需求。",
        "建議持續評估跌倒風險並提供必要輔助，如助行器。",
      ],
    },
    warn: {
      summary: ["離床次數太多 / 頻尿", "(平均每晚大於 2 次)"],
      details: [
        "住民夜間頻繁離床，建議加強跌倒預防措施，如呼叫鈴、降低床高。",
        "建議評估頻尿、疼痛或不適等可能原因，必要時通報醫師。",
        "建議安排規律如廁時間，如睡前及夜間定時如廁。",
        "建議夜間提供適度照明，避免因視線不佳導致跌倒。",
        "必要時評估是否需陪伴或增加巡視頻率。",
      ],
    },
  },

  // 夜間翻身次數 (UEXT, deviceType=1)
  turnOverUEXT: {
    normal: {
      summary: ["一般狀況", "(平均每晚少於或等於 40 次)"],
      details: [
        "住民夜間翻身次數可接受，持續觀察夜間活動狀況。",
        "持續提供適當擺位與支撐，如枕頭、減壓墊。",
        "建議維持床邊環境安全，如安全床欄、呼叫鈴。",
      ],
    },
    warn: {
      summary: ["翻身次數太多 / 淺眠", "(平均每晚大於 40 次)"],
      details: [
        "住民夜間頻繁翻身，建議評估是否因疼痛、不適或焦慮所致。",
        "建議檢查床墊舒適度及擺位是否適當。",
        "必要時評估壓力點疼痛或皮膚問題。",
        "建議夜間加強觀察，必要時通報醫師評估用藥或處置。",
      ],
    },
  },

  // 翻身次數 (UMAP, deviceType=2)
  turnOverUMAP: {
    normal: {
      summary: ["一般狀況", "(平均每日大於等於 12 次)"],
      details: [
        "住民每日翻身次數正常，符合預防壓力性損傷原則，持續維持定時翻身措施。",
        "建議持續依翻身計畫執行，並搭配皮膚評估與減壓輔具使用。",
      ],
    },
    warn: {
      summary: ["翻身次數太少", "(平均每日少於 12 次)"],
      details: [
        "住民每日翻身次數太少，建議加強翻身頻率以預防壓力性損傷。",
        "建議確實執行翻身計畫並加強翻身紀錄。",
        "評估是否因人力、病人狀況或照護安排影響翻身執行。",
        "必要時調整照護計畫或增加巡視頻率。",
      ],
    },
  },

  // 翻身間隔時間 (UMAP, deviceType=2)
  turnOverInterval: {
    normal: {
      summary: ["一般狀況", "(平均每日最長間隔小於等於 2 小時)"],
      details: [
        "住民翻身間隔時間正常，符合壓力性損傷預防原則，持續維持。",
        "建議持續依翻身計畫執行，並搭配皮膚評估與減壓輔具使用。",
      ],
    },
    warn: {
      summary: ["間隔時間太長", "(平均每日最長間隔大於 2 小時)"],
      details: [
        "住民翻身間隔時間超時，建議縮短翻身間隔以降低壓力性損傷風險。",
        "建議落實定時翻身計畫，並加強紀錄。",
        "評估是否因夜間人力或照護流程影響翻身執行。",
        "必要時調整照護安排以確保翻身頻率。",
      ],
    },
  },
};

/**
 * 根據 metric 名稱、warn 陣列、value 陣列回傳適合的建議模板。
 * - warn 陣列只要任一日為 true，就視為整體有警示。
 * - 睡眠時數需要再依平均值決定 不足 / 過多。
 */
const pickRecommendation = (metric, warns, values) => {
  const hasWarn = Array.isArray(warns) && warns.some(Boolean);

  if (metric === "sleepTime") {
    if (!hasWarn) return RECOMMENDATIONS.sleepTime.normal;
    const avg =
      values.length > 0
        ? values.reduce((a, b) => a + (Number(b) || 0), 0) / values.length
        : 0;
    return avg < 7
      ? RECOMMENDATIONS.sleepTime.insufficient
      : RECOMMENDATIONS.sleepTime.excessive;
  }

  const group = RECOMMENDATIONS[metric];
  if (!group) return null;
  return hasWarn ? group.warn : group.normal;
};

/* --------------------------- BarChart 子元件 -------------------------- */
function BarChart({ labels, values, warns, title, yAxisLabel, yUnit = "" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const backgroundColors = (warns || []).map((w) => colorFromWarn(w));

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 60,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: title,
            font: { size: 16, weight: "bold" },
            padding: { bottom: 12 },
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (items) =>
                items.length ? `Date: ${items[0].label}` : "",
              label: (item) => {
                const v = item.parsed.y;
                return `${yAxisLabel}: ${v}${yUnit ? " " + yUnit : ""}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Date (mm/dd)", font: { size: 14 } },
            grid: { display: false },
          },
          y: {
            title: { display: false, text: yAxisLabel, font: { size: 14 } },
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, values, warns, title, yAxisLabel, yUnit]);

  return (
    <div style={{ width: "100%", height: 320, marginBottom: 16 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ------------------------ RecommendationPanel ------------------------ */
/**
 * 顯示「分析總結 (3) | 詳細建議 (7)」兩欄。
 *  - warn=false → 綠色背景文字
 *  - warn=true  → 紅色文字 (淺紅底)
 */
function RecommendationPanel({ summary, details, warn }) {
  const palette = warn
    ? {
        bg: "#FFEBEE",
        border: "#EF9A9A",
        text: "#C62828",
        heading: "#B71C1C",
      }
    : {
        bg: "#E8F5E9",
        border: "#A5D6A7",
        text: "#2E7D32",
        heading: "#1B5E20",
      };

  const cardBase = {
    padding: "16px 20px",
    backgroundColor: palette.bg,
    color: palette.text,
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    boxSizing: "border-box",
  };

  return (
    <div style={{ ...cardBase, display: "flex", gap: 16, marginBottom: 32 }}>
      <div style={{ flex: 2, minWidth: 0, justifyItems:"center", alignContent:"center" }}>
        <div style={{ fontSize: 15, lineHeight: 1.6, justifyItems:"center", }}>
          {summary.map((line, i) => (
            <div key={i} style={{ fontWeight: i === 0 ? 600 : 400 }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <div style={{  flex: 8, minWidth: 0 }}>
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          {details.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------- ChartSection -------------------------- */
/** 一個 chart + 對應建議區塊。 */
function ChartSection({
  title,
  labels,
  values,
  warns,
  yAxisLabel,
  yUnit,
  recommendationKey,
}) {
  const hasWarn = Array.isArray(warns) && warns.some(Boolean);
  const rec = pickRecommendation(recommendationKey, warns, values);

  return (
    <div>
      <BarChart
        title={title}
        labels={labels}
        values={values}
        warns={warns}
        yAxisLabel={yAxisLabel}
        yUnit={yUnit}
      />
      {rec && (
        <RecommendationPanel
          summary={rec.summary}
          details={rec.details}
          warn={hasWarn}
        />
      )}
    </div>
  );
}

/* ---------------------------- 主元件 ---------------------------- */

function PatientRecord() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState([]);
  const [deviceType, setDeviceType] = useState(null);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/7284/db/RecordData/analyse?mac=${macaddress}&timezone=Asia_Taipei`,
      );
      const result = response.data;
      setRecord(Array.isArray(result?.data) ? result.data : []);
      setDeviceType(result?.meta?.deviceType ?? null);
    } catch (error) {
      console.error("Error fetching record data:", error.message, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (macaddress) fetchRecord();
  }, [macaddress]);

  /* --------- 將 record 轉成各 chart 需要的陣列 --------- */
  const labels = record.map((r) => formatDateMMDD(r.date));

  const sleepHours = record.map((r) =>
    Number(((r.sleepTimeInMinutes || 0) / 60).toFixed(2)),
  );
  const sleepWarns = record.map((r) => !!r.sleepTimeWarn);

  const leaveBedCounts = record.map((r) => r.leaveBedCount || 0);
  const leaveBedWarns = record.map((r) => !!r.leaveBedCountWarn);

  const turnOverCounts = record.map((r) => r.turnOverCount || 0);
  const turnOverWarns = record.map((r) => !!r.turnOverWarn);

  const turnOverIntervals = record.map((r) =>
    Number((r.turnOverIntervalInHours || 0).toFixed(2)),
  );
  const turnOverIntervalWarns = record.map((r) => !!r.turnOverIntervalWarn);

  const hasData = record.length > 0 && deviceType !== null;

  return (
    <>
      <SimpleBackdrop open={loading} />
      <div style={{ padding: "16px 24px" }}>
        {!loading && !hasData && (
          <div style={{ color: "#888", fontStyle: "italic" }}>無資料</div>
        )}

        {hasData && deviceType === 1 && (
          <>
            <ChartSection
              title="Accumulated Sleeping Time"
              labels={labels}
              values={sleepHours}
              warns={sleepWarns}
              yAxisLabel="Sleeping Time"
              yUnit="hr"
              recommendationKey="sleepTime"
            />
            <ChartSection
              title="Leave Bed Count"
              labels={labels}
              values={leaveBedCounts}
              warns={leaveBedWarns}
              yAxisLabel="Leave Bed Count"
              yUnit="times"
              recommendationKey="leaveBed"
            />
            <ChartSection
              title="Turn Over Count"
              labels={labels}
              values={turnOverCounts}
              warns={turnOverWarns}
              yAxisLabel="Turn Over Count"
              yUnit="times"
              recommendationKey="turnOverUEXT"
            />
          </>
        )}

        {hasData && deviceType === 2 && (
          <>
            <ChartSection
              title="Turn Over Count"
              labels={labels}
              values={turnOverCounts}
              warns={turnOverWarns}
              yAxisLabel="Turn Over Count"
              yUnit="times"
              recommendationKey="turnOverUMAP"
            />
            <ChartSection
              title="Turn Over Interval"
              labels={labels}
              values={turnOverIntervals}
              warns={turnOverIntervalWarns}
              yAxisLabel="Turn Over Interval"
              yUnit="hr"
              recommendationKey="turnOverInterval"
            />
          </>
        )}
      </div>
    </>
  );
}

export default PatientRecord;
