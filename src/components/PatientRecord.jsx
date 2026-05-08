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

/* --------------------------- BarChart 子元件 -------------------------- */
/**
 * 通用 bar chart：
 *  - labels: x 軸文字陣列 (mm/dd)
 *  - values: y 軸數值陣列
 *  - warns:  與 values 對應的 boolean 陣列，true → 紅, false → 綠
 *  - title:  圖表標題（也作為 tooltip 的 dataset label）
 *  - yAxisLabel: y 軸標題
 *  - yUnit: tooltip 顯示的單位文字（可選）
 */
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
            // hover 顯示 x 與 y 值
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
    <div style={{ width: "100%", height: 320, marginBottom: 24 }}>
      <canvas ref={canvasRef} />
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

  // 累積睡眠時間 (hours) — 從 sleepTimeInMinutes 轉成小時
  const sleepHours = record.map((r) =>
    Number(((r.sleepTimeInMinutes || 0) / 60).toFixed(2)),
  );
  const sleepWarns = record.map((r) => !!r.sleepTimeWarn);

  // 離床次數
  const leaveBedCounts = record.map((r) => r.leaveBedCount || 0);
  const leaveBedWarns = record.map((r) => !!r.leaveBedCountWarn);

  // 翻身次數
  const turnOverCounts = record.map((r) => r.turnOverCount || 0);
  const turnOverWarns = record.map((r) => !!r.turnOverWarn);

  // 翻身間隔 (hours)
  const turnOverIntervals = record.map((r) =>
    Number((r.turnOverIntervalInHours || 0).toFixed(2)),
  );
  const turnOverIntervalWarns = record.map((r) => !!r.turnOverIntervalWarn);

  /* --------------------- render --------------------- */
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
            <BarChart
              title="Accumulated Sleeping Time"
              labels={labels}
              values={sleepHours}
              warns={sleepWarns}
              yAxisLabel="Sleeping Time"
              yUnit="hr"
            />
            <BarChart
              title="Leave Bed Count"
              labels={labels}
              values={leaveBedCounts}
              warns={leaveBedWarns}
              yAxisLabel="Leave Bed Count"
              yUnit="times"
            />
            <BarChart
              title="Turn Over Count"
              labels={labels}
              values={turnOverCounts}
              warns={turnOverWarns}
              yAxisLabel="Turn Over Count"
              yUnit="times"
            />
          </>
        )}

        {hasData && deviceType === 2 && (
          <>
            <BarChart
              title="Turn Over Count"
              labels={labels}
              values={turnOverCounts}
              warns={turnOverWarns}
              yAxisLabel="Turn Over Count"
              yUnit="times"
            />
            <BarChart
              title="Turn Over Interval"
              labels={labels}
              values={turnOverIntervals}
              warns={turnOverIntervalWarns}
              yAxisLabel="Turn Over Interval"
              yUnit="hr"
            />
          </>
        )}
      </div>
    </>
  );
}

export default PatientRecord;
