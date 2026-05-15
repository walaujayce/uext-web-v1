import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import SimpleBackdrop from "./LoadingOverlay";
import api from "../api/apiClient";
import { useAuth } from "../JS/AuthContext";

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

/* -------------------- 護理建議模板 (改由 i18n 提供) --------------------
 * 完整內容放在 locales/{zh,en}/translation.json 的
 *   PatientRecord.Recommendations.<metric>.<stateKey>
 * 之下。例如:
 *   PatientRecord.Recommendations.sleepTime.normal.summaryTitle
 *   PatientRecord.Recommendations.sleepTime.normal.summaryRange
 *   PatientRecord.Recommendations.sleepTime.normal.details (string[])
 */

/** 依 metric + warn 狀態 + 平均值，決定要載入哪個 state key */
const pickStateKey = (metric, warns, values) => {
  const hasWarn = Array.isArray(warns) && warns.some(Boolean);

  if (metric === "sleepTime") {
    if (!hasWarn) return "normal";
    const avg =
      values.length > 0
        ? values.reduce((a, b) => a + (Number(b) || 0), 0) / values.length
        : 0;
    return avg < 7 ? "insufficient" : "excessive";
  }
  return hasWarn ? "warn" : "normal";
};

/** 依當前語言從 i18n 取出該 metric / stateKey 的建議內容 */
const buildRecommendation = (t, metric, stateKey) => {
  const base = `PatientRecord.Recommendations.${metric}.${stateKey}`;
  const details = t(`${base}.details`, { returnObjects: true });
  return {
    summary: [t(`${base}.summaryTitle`), t(`${base}.summaryRange`)],
    details: Array.isArray(details) ? details : [],
  };
};

/* --------------------------- BarChart 子元件 -------------------------- */
function BarChart({ labels, values, warns, title, yAxisLabel, yUnit = "" }) {
  const {t} = useTranslation();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const { isDarkMode } = useAuth();
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
          // 關掉全域註冊的 chartjs-plugin-datalabels (來自 AlertGanttChart.jsx)
          // 否則每根柱子中間會顯示 y 軸數值
          datalabels: { display: false },
          title: {
            display: true,
            text: title,
            font: { size: 16, weight: "bold" },
            padding: { bottom: 12 },
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (items) => (items.length ? `${t("PatientRecord.Date")}: ${items[0].label}` : ""),
              label: (item) => {
                const v = item.parsed.y;
                return `${yAxisLabel}: ${v}${yUnit ? " " + yUnit : ""}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: `${t("PatientRecord.Date")} (mm/dd)`, font: { size: 14 } },
            grid: { display: false },
            border: {
              color: isDarkMode ? "#666666" : "#cbd5e1",
            },
          },
          y: {
            title: { display: false, text: yAxisLabel, font: { size: 14 } },
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: isDarkMode ? "#666666" : "#cbd5e1" },
            border: {
              color: isDarkMode ? "#666666" : "#cbd5e1",
            },
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
  }, [labels, values, warns, title, yAxisLabel, yUnit, isDarkMode]);

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
      <div
        style={{
          flex: 2,
          minWidth: 0,
          justifyItems: "center",
          alignContent: "center",
        }}
      >
        <div style={{ fontSize: 15, lineHeight: 1.6, justifyItems: "center" }}>
          {summary.map((line, i) => (
            <div key={i} style={{ fontWeight: i === 0 ? 600 : 400 }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 8, minWidth: 0 }}>
        <div
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
        </div>
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
  const { t } = useTranslation();
  const hasWarn = Array.isArray(warns) && warns.some(Boolean);
  const stateKey = pickStateKey(recommendationKey, warns, values);
  const rec = buildRecommendation(t, recommendationKey, stateKey);

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
      let patientId = "";
      const patientResponse = await api.get(`/api/7284/db/Patient`);

      const data = patientResponse.data;
      const matchingPatient = data.find((item) => item.deviceid === macaddress);

      patientId = matchingPatient.patientid;

      const response = await api.get(
        `/api/7284/db/RecordData/analyse?mac=${macaddress}&patientid=${patientId}&timezone=Asia_Taipei`,
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
          <div style={{ color: "#888", fontStyle: "italic" }}>{t("PatientRecord.NotEnoughData")}</div>
        )}

        {hasData && deviceType === 1 && (
          <>
            <ChartSection
              title={t("PatientRecord.SleepingTime")}
              labels={labels}
              values={sleepHours}
              warns={sleepWarns}
              yAxisLabel={t("PatientRecord.SleepingTime")}
              yUnit={t("PatientRecord.Hour")}
              recommendationKey="sleepTime"
            />
            <ChartSection
              title={t("PatientRecord.LeaveBedCount")}
              labels={labels}
              values={leaveBedCounts}
              warns={leaveBedWarns}
              yAxisLabel={t("PatientRecord.LeaveBedCount")}
              yUnit={t("PatientRecord.Times")}
              recommendationKey="leaveBed"
            />
            <ChartSection
              title={t("PatientRecord.TurnOverCount")}
              labels={labels}
              values={turnOverCounts}
              warns={turnOverWarns}
              yAxisLabel={t("PatientRecord.TurnOverCount")}
              yUnit={t("PatientRecord.Times")}
              recommendationKey="turnOverUEXT"
            />
          </>
        )}

        {hasData && deviceType === 2 && (
          <>
            <ChartSection
              title={t("PatientRecord.TurnOverCount")}
              labels={labels}
              values={turnOverCounts}
              warns={turnOverWarns}
              yAxisLabel={t("PatientRecord.TurnOverCount")}
              yUnit={t("PatientRecord.Times")}
              recommendationKey="turnOverUMAP"
            />
            <ChartSection
              title={t("PatientRecord.TurnOverInterval")}
              labels={labels}
              values={turnOverIntervals}
              warns={turnOverIntervalWarns}
              yAxisLabel={t("PatientRecord.TurnOverInterval")}
              yUnit={t("PatientRecord.Hour")}
              recommendationKey="turnOverInterval"
            />
          </>
        )}
      </div>
    </>
  );
}

export default PatientRecord;
