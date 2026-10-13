import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import axios from "axios";
import api from "../api/apiClient";
import { useAuth } from "../JS/AuthContext";
import "/src/CSS/btn.css";
import "/src/CSS/record-loading.css";

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
        <div style={{ fontSize: 15, lineHeight: 1.6, justifyItems: "center",justifySelf: "start" }}>
          {summary.map((line, i) => (
            <div key={i} style={{ fontWeight: i === 0 ? 600 : 400, justifySelf: "start" }}>
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
  // 已經等了幾秒。分析的資料量大時這支 API 可能要跑一段時間，
  // 讓使用者看得到時間，才知道要不要按取消。
  const [elapsed, setElapsed] = useState(0);
  // 使用者主動取消 → 不能顯示「資料不足」，那會被誤會成真的沒有資料
  const [cancelled, setCancelled] = useState(false);
  const [record, setRecord] = useState([]);
  const [deviceType, setDeviceType] = useState(null);

  // 目前這次請求的中止控制器；按取消或換裝置時用它把請求收掉
  const abortRef = useRef(null);

  const isCanceled = (error) =>
    axios.isCancel?.(error) ||
    error?.code === "ERR_CANCELED" ||
    error?.name === "CanceledError";

  const fetchRecord = async () => {
    // 前一次還在飛的請求先收掉，避免晚回來的結果蓋掉新的
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setCancelled(false);
    setLoading(true);
    try {
      const patientResponse = await api.get(`/api/7284/db/Patient`, {
        signal: controller.signal,
      });

      const data = patientResponse.data;
      const matchingPatient = (Array.isArray(data) ? data : []).find(
        (item) => item.deviceid === macaddress,
      );

      // 查不到對應住民就當作沒有資料，不要讓 undefined.patientid 直接炸掉
      if (!matchingPatient?.patientid) {
        setRecord([]);
        setDeviceType(null);
        return;
      }

      const response = await api.get(
        `/api/7284/db/RecordData/analyse?mac=${macaddress}&patientid=${matchingPatient.patientid}&timezone=Asia_Taipei`,
        { signal: controller.signal },
      );
      const result = response.data;
      setRecord(Array.isArray(result?.data) ? result.data : []);
      setDeviceType(result?.meta?.deviceType ?? null);
    } catch (error) {
      // 使用者按取消不是錯誤，安靜收掉就好
      if (isCanceled(error)) return;
      console.error("Error fetching record data:", error.message, error);
    } finally {
      // 期間若又發了新的請求，收尾交給那一次，這裡不要把 loading 關掉
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setCancelled(true);
    abortRef.current?.abort();
  };

  useEffect(() => {
    if (macaddress) fetchRecord();
  }, [macaddress]);

  // 離開頁面時把還在飛的請求收掉
  useEffect(() => () => abortRef.current?.abort(), []);

  // 等待秒數：只在 loading 期間計時
  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [loading]);

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
    <div className="pr-wrap">
      {/* 區域內的載入遮罩：只蓋住記錄分析這一塊，其餘頁面照常可以操作 */}
      {loading && (
        <div className="pr-loading">
          <div className="pr-loading-box">
            <div className="pr-spinner" />
            <p className="pr-loading-msg">{t("PatientRecord.Analysing")}</p>
            <p className="pr-loading-elapsed">
              {t("PatientRecord.Elapsed", { seconds: elapsed })}
            </p>
            <div
              className="btn text-only outline sec pr-cancel"
              onClick={handleCancel}
            >
              <p className="btn-text sec-text">{t("PatientRecord.Cancel")}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        {!loading && cancelled && (
          <div className="pr-cancelled">
            <span>{t("PatientRecord.Cancelled")}</span>
            <div className="btn text-only outline sec pr-retry" onClick={fetchRecord}>
              <p className="btn-text sec-text">{t("PatientRecord.Retry")}</p>
            </div>
          </div>
        )}

        {!loading && !cancelled && !hasData && (
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
    </div>
  );
}

export default PatientRecord;
