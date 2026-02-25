import React, { useState, useEffect } from "react";
import FloorSectionBar from "./FloorSectionBar";
import { useTranslation } from "react-i18next";
import { useAuth } from "../JS/AuthContext";
import { Chart } from "chart.js";
import "/src/CSS/alert.css";

function AlertGanttChart() {
  const { t, i18n } = useTranslation();
  const { role } = useAuth();

  const [select_floor, setSelect_Floor] = useState("");
  const handleSelectFloor = (floor) => {
    setSelect_Floor(floor);
  };
  const [select_section, setSelect_Section] = useState("");
  const handleSelectSection = (section) => {
    setSelect_Section(section);
  };

  {
    /* Handle Overlay Visible */
  }
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleAddDeviceClick = (e) => {
    if (["administrator", "engineer"].includes(role)) {
      e.preventDefault();
      setOverlayVisible(!isOverlayVisible);
    }
  };

  const [selectedAlert, setSelectedAlert] = useState([]);
  const handleSelectAlert = (bedId) => {
    setSelectedAlert((prev) => {
      if (!Array.isArray(prev)) prev = []; // Ensure state is always an array
      return prev.includes(bedId)
        ? prev.filter((item) => item !== bedId) // Deselect if already selected
        : [...prev, bedId]; // Add to selected if not already selected
    });
  };
  const handleSelectAllAlert = () => {
    setSelectedAlert((prev) => {
      if (!Array.isArray(prev)) prev = []; // Ensure state is always an array
      if (prev.length !== alertSettingListTemplate.length){
        return alertSettingListTemplate.map(item => item.bed_id);
      }else{
        return [];
      }
    });
  };

  var alertSettingListTemplate = [
    {
      bed_id: "A01",
      patient_name: "Alex",
      alert_triggers: [
        {
          id: 0,
          start_time: {
            hour: 0,
            minute: 0,
          },
          end_time: {
            hour: 8,
            minute: 0,
          },
        },
        {
          id: 1,
          start_time: {
            hour: 20,
            minute: 0,
          },
          end_time: {
            hour: 24,
            minute: 0,
          },
        },
      ],
    },
    {
      bed_id: "A02",
      patient_name: "David2222222222222222222222222222222222222",
      alert_triggers: [
        {
          id: 0,
          start_time: {
            hour: 8,
            minute: 0,
          },
          end_time: {
            hour: 10,
            minute: 0,
          },
        },
        {
          id: 1,
          start_time: {
            hour: 15,
            minute: 15,
          },
          end_time: {
            hour: 20,
            minute: 0,
          },
        },
      ],
    },
    {
      bed_id: "B00",
      patient_name: "Rose",
      alert_triggers: [
        {
          id: 0,
          start_time: {
            hour: 12,
            minute: 0,
          },
          end_time: {
            hour: 14,
            minute: 0,
          },
        },
        {
          id: 1,
          start_time: {
            hour: 17,
            minute: 15,
          },
          end_time: {
            hour: 20,
            minute: 45,
          },
        },
      ],
    },
    {
      bed_id: "B02",
      patient_name: "Felic",
      alert_triggers: [
        {
          id: 0,
          start_time: {
            hour: 11,
            minute: 45,
          },
          end_time: {
            hour: 13,
            minute: 0,
          },
        },
        {
          id: 1,
          start_time: {
            hour: 21,
            minute: 30,
          },
          end_time: {
            hour: 24,
            minute: 0,
          },
        },
        {
          id: 2,
          start_time: {
            hour: 0,
            minute: 30,
          },
          end_time: {
            hour: 0,
            minute: 45,
          },
        },
      ],
    },
  ];
  const toDecimal = (t) => t.hour + t.minute / 60;

  // Helper function to format decimal hours back to HH:mm for tooltips
  const toTimeStr = (decimal) => {
    const h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const rowHeight = 80;
    const chartHeight = alertSettingListTemplate.length * rowHeight;

    // 2. Apply this to the canvas style
    const canvas = document.getElementById("myChart");
    canvas.parentElement.style.height = chartHeight + "px"; // Ensure container matches
    canvas.style.height = chartHeight + "px";
    const checkboxTable = document.getElementById("checkbox-table");
    // checkboxTable.parentElement.style.height = chartHeight + "px"; // Ensure container matches
    checkboxTable.style.height = chartHeight + "px";

    const maxTriggers = Math.max(
      ...alertSettingListTemplate.map((item) => item.alert_triggers.length),
    );
    const datasets = [];
    for (let i = 0; i < maxTriggers; i++) {
      datasets.push({
        label: `Interval ${i + 1}`,
        data: alertSettingListTemplate.map((item) => {
          const trigger = item.alert_triggers.find((t) => t.id === i);
          return trigger
            ? [toDecimal(trigger.start_time), toDecimal(trigger.end_time)]
            : null;
        }),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgb(75, 192, 192)",
        borderRadius: 5,
        borderSkipped: false,
        grouped: false,
        base: 0,
      });
    }
    var myChart = new Chart(
      document.getElementById("myChart").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: alertSettingListTemplate.map((item) => {
            const name = item.patient_name;
            // If name is longer than 10 chars, cut to 7 and add "..."
            const truncatedName =
              name.length > 10 ? name.substring(0, 7) + "..." : name;

            // Return as an array to keep the wrapping (Bed ID on top, Name below)
            return `${item.bed_id} (${truncatedName})`;
          }),
          datasets: datasets,
        },
        options: {
          indexAxis: "y", // Horizontal bars
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              min: 0,
              max: 24,
              title: { display: false, text: "Time of Day (24h)" },
              ticks: {
                stepSize: 2,
                callback: (val) => `${val}:00`,
              },
              position: "top",
            },
            y: {
              grid: {
                display: false,
              },
              stacked: false, // Keep them on the same line but not added together
              title: { display: false, text: "Bed / Patient" },
              ticks: { display: true, crossAlign: "far" },
            },
          },
          plugins: {
            datalabels: {
              align: "left",
              textAlign: "left",
            },
            tooltip: {
              enabled: false,
              callbacks: {
                label: function (context) {
                  const range = context.raw;
                  return `${context.dataset.label}: ${toTimeStr(range[0])} - ${toTimeStr(range[1])}`;
                },
              },
            },
            legend: { display: false, position: "top" },
            title: { display: false, text: "Patient Alert Intervals" },
          },
          barThickness: 30,
        },
      },
    );
    // Cleanup: destroy chart on unmount
    return () => {
      myChart.destroy();
    };
  }, []);

  return (
    <>
      <div className="box">
        <h1>{t("Alert.AlertSettingList")}</h1>
      </div>
      <div className="container">
        <div className="top-bar">
          <FloorSectionBar
            selectFloor={handleSelectFloor}
            selectSection={handleSelectSection}
          />

          <div className="btn" id="addDevice" onClick={handleAddDeviceClick}>
            <p className="btn-text" style={{ margin: "0px 10px" }}>
              {t("Alert.Setting")}
            </p>
            {/* {isOverlayVisible && (
              <AddNewDevice callback={handleAddDeviceClick} />
            )} */}
          </div>
        </div>
        <div className="al">
          {/* checkbox table */}
          <div className="checkbox-table" id="checkbox-table">
            {/* checkbox header */}
            <div className="checkbox-header">
              <div
                className="checkbox-all"
                onClick={() => handleSelectAllAlert()}
              >
                <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
              </div>
              <div className="bed-list-title">床號 (住民)</div>
            </div>
            {/* checkbox list */}
            <div className="checkbox-list">
              {alertSettingListTemplate.map((item) => {
                return (
                  <div
                    key={item.bed_id}
                    className="checkbox-row"
                    onClick={() => handleSelectAlert(item.bed_id)}
                  >
                    <div className="checkbox-row-header">
                      <div
                        className={`checkbox ${
                          Array.isArray(selectedAlert) &&
                          selectedAlert.includes(item.bed_id)
                            ? "active"
                            : ""
                        }`}
                      >
                        <img
                          src="/src/assets/checkbox-blank-outline.svg"
                          alt=""
                        />
                      </div>
                      <div className="bed-id">
                        {/* <p>
                            {item.bed_id}({item.patient_name})
                        </p> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* chart */}
          <div className="chart-container">
            <canvas className="chart" id="myChart"></canvas>
          </div>
        </div>
      </div>
    </>
  );
}

export default AlertGanttChart;
