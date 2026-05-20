import React, { useState, useEffect } from "react";
import FloorSectionBar from "./FloorSectionBar";
import { useTranslation } from "react-i18next";
import { useAuth } from "../JS/AuthContext";
import { Chart } from "chart.js";
import "/src/CSS/alert.css";
import ChartDataLabels from "chartjs-plugin-datalabels";
import AlertBatchSetting from "./Modals/AlertBatchSetting";
import { color } from "chart.js/helpers";
import api from "../api/apiClient";

function AlertGanttChart() {
  const { t, i18n } = useTranslation();
  const { role, isDarkMode } = useAuth();

  const [select_floor, setSelect_Floor] = useState("");
  const handleSelectFloor = (floor) => {
    setSelect_Floor(floor);
  };
  const [select_section, setSelect_Section] = useState("");
  const handleSelectSection = (section) => {
    setSelect_Section(section);
  };
  const [select_device, setSelect_Device] = useState("");
  const handleSelectDeviceType = (device) => {
    setSelect_Device(device);
  };

  {
    /* Handle Overlay Visible */
  }
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isUEXT, setIsUEXT] = useState(false);

  const handleModifyPatientAlert = (e) => {
    e.preventDefault();
    console.log("selectedAlert: ", selectedAlert);
    console.log("patient: ", patient);
    if (selectedAlert.length === 0) {
      alert("At least select a resident to set alert settings.");
      return;
    }
    let deviceType = new Set();
    if (selectedAlert.length > 1) {
      selectedAlert.forEach((pateintId) => {
        const matchingPatient = patient.find((p) => p.patientid === pateintId);
        const matchingDevice = device.find((p) => p.deviceid === matchingPatient.deviceid);
        deviceType.add(matchingDevice.devicetype);
      });
      if(deviceType.size > 1){
        alert("批次設定只允許選擇相同類型的裝置！\n請選擇相同類型(UEXT或UMAP)的多個裝置。");
        return;
      }
    }
    console.log("device type set length: ", deviceType);
    console.log("deviceType.has(1): ", deviceType.has(1));
    setIsUEXT(deviceType.has(1));
    setOverlayVisible(!isOverlayVisible);
    // console.log("selected patient: ", selectedAlert.length);
  };

  var alertSettingListTemplate = [
    {
      bed_id: "A01",
      floor: "8F",
      section: "Room SD",
      type: 1,
      patient_name: "Alex",
      alert_triggers: {
        status: true,
        intervals: [
          {
            id: 0,
            start: {
              hour: 0,
              minute: 0,
            },
            end: {
              hour: 8,
              minute: 0,
            },
          },
          {
            id: 1,
            start: {
              hour: 20,
              minute: 0,
            },
            end: {
              hour: 24,
              minute: 0,
            },
          },
        ],
      },
    },
    {
      bed_id: "A02",
      floor: "9F",
      section: "Room SD",
      type: 1,
      patient_name: "David",
      alert_triggers: {
        status: false,
        intervals: [
          {
            id: 0,
            start: {
              hour: 8,
              minute: 0,
            },
            end: {
              hour: 10,
              minute: 0,
            },
          },
          {
            id: 1,
            start: {
              hour: 15,
              minute: 15,
            },
            end: {
              hour: 20,
              minute: 0,
            },
          },
        ],
      },
    },
    {
      bed_id: "B00",
      floor: "8F",
      section: "Room RD",
      type: 2,
      patient_name: "Rose",
      alert_triggers: {
        status: true,
        intervals: [
          {
            id: 0,
            start: {
              hour: 12,
              minute: 0,
            },
            end: {
              hour: 14,
              minute: 0,
            },
          },
          {
            id: 1,
            start: {
              hour: 17,
              minute: 15,
            },
            end: {
              hour: 20,
              minute: 45,
            },
          },
        ],
      },
    },
    {
      bed_id: "B02222222222222222222222",
      floor: "8F",
      section: "Room RD",
      type: 1,
      patient_name: "Felic22222222222222222222",
      alert_triggers: {
        status: true,
        intervals: [
          {
            id: 0,
            start: {
              hour: 11,
              minute: 45,
            },
            end: {
              hour: 13,
              minute: 0,
            },
          },
          {
            id: 1,
            start: {
              hour: 21,
              minute: 30,
            },
            end: {
              hour: 24,
              minute: 0,
            },
          },
          {
            id: 2,
            start: {
              hour: 0,
              minute: 30,
            },
            end: {
              hour: 0,
              minute: 45,
            },
          },
          {
            id: 3,
            start: {
              hour: 1,
              minute: 0,
            },
            end: {
              hour: 1,
              minute: 15,
            },
          },
        ],
      },
    },
  ];

  const [selectedAlert, setSelectedAlert] = useState([]);
  const handleSelectAlert = (patientid) => {
    setSelectedAlert((prev) => {
      if (!Array.isArray(prev)) prev = []; // Ensure state is always an array
      return prev.includes(patientid)
        ? prev.filter((item) => item !== patientid) // Deselect if already selected
        : [...prev, patientid]; // Add to selected if not already selected
    });
  };
  const handleSelectAllAlert = () => {
    setSelectedAlert((prev) => {
      if (!Array.isArray(prev)) prev = []; // Ensure state is always an array
      if (prev.length !== data.length) {
        return data.map((item) => item.patientid);
      } else {
        return [];
      }
    });
  };
  const [result, setResult] = useState([]);

  const [device, setDevice] = useState(null);
  const [patient, setPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      const [responsePatient, responseDevice, responseAlert] =
        await Promise.all([
          api.get(`/api/7284/db/Patient`),
          api.get(`/api/7284/db/Device`),
          api.get(`/api/7284/db/Alert`),
        ]);
      // if (!responsePatient.ok) {
      //   throw new Error(`HTTP error! status: ${responsePatient.status}`);
      // }
      // if (!responseDevice.ok) {
      //   throw new Error(`HTTP error! status: ${responseDevice.status}`);
      // }
      // if (!responseAlert.ok) {
      //   throw new Error(`HTTP error! status: ${responseDevice.status}`);
      // }

      const patientData = await responsePatient.data;
      const deviceData = await responseDevice.data;
      const alertData = await responseAlert.data;

      setPatient(patientData);
      setDevice(deviceData);
      // console.log("patients: ", patientData);
      // console.log("devices: ", deviceData);
      // console.log("alerts: ", alertData);

      const formattedData = patientData.map((patient) => {
        const matchingDevice = deviceData.find(
          (device) => device.deviceid === patient.deviceid,
        );
        if (matchingDevice === undefined) return;
        const matchingAlert = alertData.find(
          (alert) => alert.patientid === patient.patientid,
        );
        // if (matchingAlert === undefined) return;
        // console.log("matchingalert :", matchingAlert.jlog.alert_triggers);
        return {
          bed_id: patient.bed,
          floor: patient.floor,
          section: patient.section,
          patient_name: patient.patientname,
          deviceId: patient.deviceid,
          patientid: patient.patientid,
          type: matchingDevice.devicetype,
          alert_triggers:
            matchingAlert === undefined
              ? []
              : matchingAlert.jlog.alert_triggers,
        };
      });

      // console.log("formattedData :", formattedData);
      // 2. Set the result with the CLEAN data
      setResult(formattedData.filter((data) => data !== undefined));
      // setResult(alertSettingListTemplate);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, []);
  useEffect(() => {
    // console.log("result: ", result);
  }, [result]);

  const toDecimal = (t) => t.hour + t.minute / 60;

  // Helper function to format decimal hours back to HH:mm for tooltips
  const toTimeStr = (decimal) => {
    const h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const [data, setData] = useState([]);
  useEffect(() => {
    setSelectedAlert([]);
    setData(
      result
        .filter((patient) => {
          return (
            select_floor === "" ||
            select_floor === "All" ||
            patient.floor === select_floor
          );
        })
        .filter((patient) => {
          return (
            select_section === "" ||
            select_section === "All" ||
            patient.section === select_section
          );
        })
        .filter((patient) => {
          return (
            select_device === "" ||
            select_device === "All" ||
            patient.type === select_device
          );
        }),
    );
  }, [select_device, select_section, select_floor, result]);

  useEffect(() => {
    if (data.length === 0) return;
    const rowHeight = data.length <= 2 && data.length > 1 ? 100 : 80;
    const chartMinHeight = data.length * rowHeight;
    const chartHeight = data.length < 2 ? chartMinHeight * 2 : chartMinHeight;

    // 2. Apply this to the canvas style
    const canvas = document.getElementById("myChart");
    canvas.parentElement.style.height = chartHeight + "px"; // Ensure container matches
    canvas.style.height = chartHeight + "px";
    const checkboxTable = document.getElementById("checkbox-table");
    checkboxTable.style.height = chartHeight + "px";
    const gridContainer = document.getElementById("grid-container");
    gridContainer.style.height = chartHeight + "px";

    const maxTriggers = Math.max(
      ...data.map((item) => {
        if (item.alert_triggers.intervals === undefined) {
          return 0;
        } else {
          return item.alert_triggers.intervals.length;
        }
      }),
    );
    const datasets = [];
    for (let i = 0; i < maxTriggers; i++) {
      datasets.push({
        label: `Interval ${i + 1}`,
        data: data.map((item) => {
          if (!item.alert_triggers.status) return null; // if alert status is false, then alert is not switch on but intervals might have values
          const trigger = item.alert_triggers.intervals.find((t) => t.id === i);
          return trigger
            ? [toDecimal(trigger.start), toDecimal(trigger.end)]
            : null;
        }),
        backgroundColor: "#07794f",
        borderColor: "#055d3d",
        borderRadius: 5,
        borderSkipped: false,
        grouped: false,
        base: 0,
        datalabels: {
          display: false,
          color: "black", // Text color
          formatter: (value) => {
            if (!value) return "";
            // value[0] is start, value[1] is end
            return `${toTimeStr(value[0])} ~ ${toTimeStr(value[1])}`;
          },
          font: {
            weight: "bold",
            size: 10,
          },
          anchor: "center", // Position relative to the bar
          align: "center", // Position inside the bar
        },
      });
    }
    Chart.register(ChartDataLabels);
    var myChart = new Chart(
      document.getElementById("myChart").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: data.map((item) => {
            // // If name is longer than 10 chars, cut to 7 and add "..."
            const truncatedBedId =
              item.bed_id.length > 15
                ? item.bed_id.substring(0, 10) + "..."
                : item.bed_id;
            const truncatedPatientName =
              item.patient_name.length > 15
                ? item.patient_name.substring(0, 10) + "..."
                : item.patient_name;

            // // Return as an array to keep the wrapping (Bed ID on top, Name below)
            // return truncatedLabel.padEnd(15, " ");
            return [
              `${truncatedBedId.padEnd(15, " ")}`,
              `${truncatedPatientName.padEnd(15, " ")}`,
            ];
          }),
          datasets: datasets,
        },
        options: {
          animation: false,
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
              grid: {
                color: isDarkMode ? "#5c5c5c" : "#cecccc",
              },
            },
            y: {
              grid: {
                display: false,
                // drawBorder:false,
              },
              stacked: false, // Keep them on the same line but not added together
              title: { display: false, text: "Bed / Patient" },
              ticks: {
                display: true,
                crossAlign: "far",
                // textAlign:"center",
                // padding:10,
                color: isDarkMode ? "#cecccc" : "#424242",
                font: {
                  size: 12,
                },
              },
            },
          },
          plugins: {
            datalabels: {
              //   align: "left",
              textAlign: "left",
            },
            tooltip: {
              //   enabled: false,
              callbacks: {
                label: function (context) {
                  const range = context.raw;
                  return `${toTimeStr(range[0])} - ${toTimeStr(range[1])}`;
                },
                title: () => "",
              },
            },
            legend: { display: false, position: "top" },
            title: { display: false, text: "Patient Alert Intervals" },
          },
          barThickness: 30,
          // layout: {
          //   padding:{
          //     top:21
          //   }
          // }
        },
      },
    );
    // Cleanup: destroy chart on unmount
    return () => {
      myChart.destroy();
    };
  }, [data, isDarkMode]);

  const [selectedHoverIndex, setSelectedHoverIndex] = useState(null);

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
            selectDeviceType={handleSelectDeviceType}
            enableDeviceType={true}
          />

          <div
            className="btn"
            id="addDevice"
            onClick={handleModifyPatientAlert}
          >
            <p className="btn-text" style={{ margin: "0px 10px" }}>
              {t("Alert.Setting")}
            </p>
          </div>
          {isOverlayVisible && (
            <AlertBatchSetting
              callback={handleModifyPatientAlert}
              patientIDs={selectedAlert}
              isBatchUEXT={isUEXT}
            />
          )}
        </div>
        <div className="al">
          {data.length === 0 ? (
            <div>{t("Alert.NoResident")}</div>
          ) : (
            <>
              {/* checkbox table */}
              <div className="checkbox-table" id="checkbox-table">
                {/* checkbox header */}
                <div
                  className="checkbox-header"
                  onClick={() => handleSelectAllAlert()}
                >
                  <div
                    className={`checkbox-all ${selectedAlert.length === data.length ? "active" : ""}`}
                  >
                    <img
                      src={`${isDarkMode ? "/src/assets/checkbox-blank-outline-white.svg" : "/src/assets/checkbox-blank-outline-gray.svg"}`}
                      alt=""
                    />
                  </div>
                  <div className="bed-list-title">
                    <p>{t("Alert.BedID")}</p>
                    <p>{t("Alert.PatientID")}</p>
                  </div>
                </div>
                {/* checkbox list */}
                <div className="checkbox-list">
                  {data.map((item) => {
                    return (
                      <div
                        key={item.patientid}
                        className="checkbox-row"
                        onClick={() => handleSelectAlert(item.patientid)}
                        onMouseEnter={() =>
                          setSelectedHoverIndex(item.patientid)
                        }
                        onMouseLeave={() => setSelectedHoverIndex(null)}
                      >
                        <div className="checkbox-row-header">
                          <div
                            className={`checkbox ${
                              Array.isArray(selectedAlert) &&
                              selectedAlert.includes(item.patientid)
                                ? "active"
                                : ""
                            }`}
                          >
                            <img
                              src={`${isDarkMode ? "/src/assets/checkbox-blank-outline-white.svg" : "/src/assets/checkbox-blank-outline-gray.svg"}`}
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
              {/* background grid */}
              <div className="grid-container" id="grid-container">
                <div className="grid-header"></div>
                <div className="grid-list">
                  {data.map((item) => {
                    return (
                      <div
                        key={item.patientid}
                        className={`grid-row ${selectedHoverIndex === item.patientid ? "hover" : ""}`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AlertGanttChart;
