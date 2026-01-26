import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/patient.css";
import OpenCVComponent from "../components/OpenCVComponent";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";
import ChartComponent from "./ChartComponent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { set } from "date-fns";
import api from "../api/apiClient";

function PatientAnalysis() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const [searchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";

  const formatSecondsToDHMS = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const dateTime =
      days > 0
        ? `${String(days).padStart(2, "0")}:${String(hours).padStart(
            2,
            "0"
          )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
            2,
            "0"
          )}`
        : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`;

    return dateTime;
  };

  const useDynamicDropdownHeight = (ref, isActive) => {
    useEffect(() => {
      if (ref.current) {
        if (isActive) {
          // Calculate the total height of items
          const items = ref.current.querySelectorAll(".item");
          const totalHeight = Array.from(items).reduce(
            (acc, item) => acc + item.offsetHeight,
            0
          );

          // Set the height dynamically
          ref.current.style.height = `${totalHeight}px`;
        } else {
          // Reset height when inactive
          ref.current.style.height = "0px";
        }
      }
    }, [ref, isActive]);
  };

  {
    /* compare input value to default value */
  }
  const compareDefaultValueReturnBorderStyle = (currentValue, defaultValue) => {
    if (currentValue === "" || currentValue === null) return;
    const numericCurrent = parseFloat(currentValue);
    const numericReset = parseFloat(defaultValue);
    const isChanged =
      isNaN(numericCurrent) || isNaN(numericReset)
        ? currentValue !== defaultValue
        : numericCurrent !== numericReset;

    return isChanged ? { border: "2px solid blue" } : {};
  };

  {
    /* Handle Calender Logic */
  }
  function useSelectDate() {
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const handleStartDateSelect = (date) => {
      setSelectedStartDate(date);
    };
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const handleEndDateSelect = (date) => {
      setSelectedEndDate(date);
    };
    return {
      selectedStartDate,
      selectedEndDate,
      handleStartDateSelect,
      handleEndDateSelect,
    };
  }

  const filterSelectedDate = useSelectDate();

  // Handle input change
  const [intervalValue, setIntervalValue] = useState("1");
  const handleInputChange = (e) => {
    const value = e.target.value;
    setIntervalValue(value);
  };

  const [bedEventList, setBedEventList] = useState([]);
  const [adcList, setAdcList] = useState([]);
  const [varList, setVarList] = useState([]);
  const [dateTimeList, setDateTimeList] = useState([]);

  const handleGetAlgoResult = async (startTime, endTime, interval) => {
    try {
      // Calculate the difference in milliseconds
      const timeDifference = endTime.getTime() - startTime.getTime();

      // Convert milliseconds to days
      const differenceInDays = timeDifference / (1000 * 3600 * 24);
      console.log("differenceInDays", differenceInDays);
      let adjustedInterval = parseInt(intervalValue, 10); // Start with current user value

      // Check from the largest duration to the smallest
      if (differenceInDays > 7 && intervalValue < 1000) {
        adjustedInterval = 1000; // More than 1 week
      } else if (differenceInDays > 3 && intervalValue < 100) {
        adjustedInterval = 100; // More than 3 days
      } else if (differenceInDays > 1 && intervalValue < 10) {
        adjustedInterval = 10; // More than 1 day
      } else if (differenceInDays > 14 && intervalValue < 10000) {
        adjustedInterval = 10000; // More than 2 weeks
      }
      setIntervalValue(adjustedInterval.toString());
      // clear previous data
      setBedEventList([]);
      setAdcList([]);
      setVarList([]);
      setDateTimeList([]);

      setLoading(true);

      localStorage.setItem(
        "patientAnalysisParams",
        JSON.stringify({
          startTime: filterSelectedDate.selectedStartDate,
          endTime: filterSelectedDate.selectedEndDate,
          interval: adjustedInterval,
        })
      );
      console.log("selectedStartDate", startTime);
      console.log("selectedEndDate", endTime);

      const filterRequest = {
        Deviceid: macaddress,
        StartTime: `${startTime.getFullYear()}-${String(
          startTime.getMonth() + 1
        ).padStart(2, "0")}-${String(startTime.getDate()).padStart(
          2,
          "0"
        )}T${String(startTime.getHours()).padStart(2, "0")}:${String(
          startTime.getMinutes()
        ).padStart(2, "0")}:00`,
        EndTime: `${endTime.getFullYear()}-${String(
          endTime.getMonth() + 1
        ).padStart(2, "0")}-${String(endTime.getDate()).padStart(
          2,
          "0"
        )}T${String(endTime.getHours()).padStart(2, "0")}:${String(
          endTime.getMinutes()
        ).padStart(2, "0")}:00`,
        // StartTime: "2025-07-29T00:24:00",
        // EndTime: "2025-07-30T09:25:00",
        Interval: parseInt(adjustedInterval, 10),
      };
      console.log("filterRequest", filterRequest);
      // const response = await fetch(
      //   `/api/7284/db/RecordData/?timezone=Asia_Taipei`,
      //   {
        //     method: "POST",
        //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify(filterRequest),
          //   }
          // );
          // console.log("response", response);
          // const contentType = response.headers.get("Content-Type");
          // if (contentType && contentType.includes("application/json")) {
            const response = await api.post(
              `/api/7284/db/RecordData/?timezone=Asia_Taipei`,filterRequest);
            const jsonData = response.data;
            if (jsonData.code === -1) {
              alert(jsonData.messages || "Error: No raw data found");
              return;
        }
        console.log("result", jsonData);
        const bedEventArray = [];
        const adcArray = [];
        const varArray = [];
        const dateTimes = [];

        jsonData.forEach((recordData) => {
          bedEventArray.push(parseInt(recordData.statusid, 10));
          adcArray.push(recordData.p_now);
          varArray.push(recordData.v_now_st);
          const formattedTime = recordData.recordtime.split(".")[0];
          dateTimes.push(formattedTime);
        });
        setBedEventList(bedEventArray);
        setAdcList(adcArray);
        setVarList(varArray);
        setDateTimeList(dateTimes);

        // console.log("bed_event_list", bedEventList);
        // console.log("adcList", adcList);
        // console.log("varList", varList);
        console.log("dateTime_list", dateTimeList);
      // }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("patientAnalysisParams");
    if (saved) {
      const { startTime, endTime, interval } = JSON.parse(saved);
      setIntervalValue(parseInt(interval), 10);
      filterSelectedDate.handleStartDateSelect(new Date(startTime));
      filterSelectedDate.handleEndDateSelect(new Date(endTime));
      console.log("saved1", saved);
      handleGetAlgoResult(new Date(startTime), new Date(endTime), interval);
      console.log("saved2", saved);
    }
    return () => {
      // Cleanup: remove saved parameters when leaving the page
      localStorage.removeItem("patientAnalysisParams");
    };
  }, []);

  // Create refs for each chart
  const eventCanvasRef = useRef(null);
  const adcCanvasRef = useRef(null);
  const varCanvasRef = useRef(null);

  // Function to download all charts
  const handleDownloadResult = () => {
    if (
      !eventCanvasRef.current ||
      !adcCanvasRef.current ||
      !varCanvasRef.current
    ) {
      alert("One or more canvas references are not set.");
      console.error("One or more canvas references are not set.");
      return;
    }
    const charts = [
      { ref: eventCanvasRef, name: `${macaddress}_BedEvent.png` },
      { ref: adcCanvasRef, name: `${macaddress}_ADC.png` },
      { ref: varCanvasRef, name: `${macaddress}_Var.png` },
    ];
    charts.forEach(({ ref, name }) => {
      if (ref.current) {
        const tempCanvas = document.createElement("canvas");
        console.log(
          `${name} = width: ${ref.current.width} | height: ${ref.current.height}`
        );
        tempCanvas.width = 1200;
        tempCanvas.height = 300;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
          console.error("Failed to get canvas context");
        }
        // Fill background with white
        tempCtx.fillStyle = "#fff";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw and scale the chart canvas onto the temp canvas
        tempCtx.drawImage(
          ref.current,
          0,
          0,
          ref.current.width,
          ref.current.height,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        // Download image
        const link = document.createElement("a");
        link.download = name;
        link.href = tempCanvas.toDataURL("image/png");
        link.click();
      }
    });
  };
  return (
    <div className="monitor">
      <SimpleBackdrop open={loading} />
      <div className="date-selection">
        <div className="opt-list">
          <div className="opt-grid">
            <div className="g-col-1">
              <label htmlFor="pmio" className="label-container">
                <p>Start date</p>
                <img
                  className="info"
                  src="/src/assets/information-outline.svg"
                  alt="gray outline information icon"
                />
              </label>
              <div>
                <DatePicker
                  selected={filterSelectedDate.selectedStartDate}
                  onChange={filterSelectedDate.handleStartDateSelect}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="time"
                  dateFormat="yyyy/MM/dd HH:mm"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  popperPlacement="bottom"
                  popperContainer={({ children }) => <div>{children}</div>}
                  portalId="root-portal" // optional, for React 18+
                />
              </div>
              <div className="assistive-text">
                this is a line of assistive text
              </div>
            </div>
            <div className="g-col-1">
              <label htmlFor="vmax" className="label-container">
                <p>End date</p>
                <img
                  className="info"
                  src="/src/assets/information-outline.svg"
                  alt="gray outline information icon"
                />
              </label>
              <div className="">
                <DatePicker
                  selected={filterSelectedDate.selectedEndDate}
                  onChange={filterSelectedDate.handleEndDateSelect}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="time"
                  dateFormat="yyyy/MM/dd HH:mm"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  popperPlacement="bottom"
                  popperContainer={({ children }) => <div>{children}</div>}
                  portalId="root-portal" // optional, for React 18+
                />
              </div>
              <div className="assistive-text">
                this is a line of assistive text
              </div>
            </div>
            <div className="input g-col-1">
              <label htmlFor="interval" className="label-container">
                <p>Interval</p>
                <div className="info-container">
                  <img
                    className="info active"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                  <div className="tooltip2">
                    <ul>
                      <li>Data taken between certain interval : </li>
                      <li>(1) More than 1 day, interval at least 10.</li>
                      <li>(2) More than 3 days, interval at least 100.</li>
                      <li>(3) More than 1 week, interval at least 1000.</li>
                    </ul>
                  </div>
                </div>
              </label>
              <div className="input-gp">
                <input
                  type="text"
                  className="placeholder"
                  id="interval"
                  placeholder={intervalValue}
                  value={intervalValue}
                  onChange={handleInputChange}
                />
                <img className="suffix" src="" alt="dropdown icon" />
              </div>
              <div className="assistive-text">
                this is a line of assistive text
              </div>
            </div>
            <div className="input g-col-1">
              <label htmlFor="vmin" className="label-container">
                <p>&nbsp;</p>
              </label>
              <div className="btn-gp" style={{ height: "100%" }}>
                <div
                  className="btn text-only"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleGetAlgoResult(
                      filterSelectedDate.selectedStartDate,
                      filterSelectedDate.selectedEndDate,
                      intervalValue
                    );
                  }}
                >
                  <img src="" alt="" className="prefix" />
                  <p className="btn-text">Confirm</p>
                </div>
              </div>
            </div>
            <div className="input g-col-1">
              <label htmlFor="download" className="label-container">
                <p>&nbsp;</p>
              </label>
              <div className="btn-gp" style={{ height: "100%" }}>
                <div
                  className="btn text-only outline"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDownloadResult()}
                >
                  <img src="" alt="" className="prefix" />
                  <p className="btn-text">Download</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="chart">
        <div className="title" style={{ fontSize: "24px" }}>
          {/* EVENT */}
        </div>
        {bedEventList.length > 0 && (
          <ChartComponent
            xAxisTitle="EVENT"
            yAxisData={bedEventList}
            xAxisData={dateTimeList}
            canvasRef2={eventCanvasRef}
            isStepped={true}
          />
        )}
        {/* <img src="/src/assets/patient-monitor-disconnected.png" alt="" /> */}
      </div>
      <div className="chart">
        <div className="title" style={{ fontSize: "24px" }}>
          {/* ADC */}
        </div>
        {adcList.length > 0 && (
          <ChartComponent
            xAxisTitle="ADC"
            yAxisData={adcList}
            xAxisData={dateTimeList}
            canvasRef2={adcCanvasRef}
          />
        )}
        {/* <img src="/src/assets/patient-monitor-disconnected.png" alt="" /> */}
      </div>
      <div className="chart">
        <div className="title" style={{ fontSize: "24px" }}>
          {/* VAR */}
        </div>
        {varList.length > 0 && (
          <ChartComponent
            xAxisTitle="VAR"
            yAxisData={varList}
            xAxisData={dateTimeList}
            canvasRef2={varCanvasRef}
          />
        )}
        {/* <img src="/src/assets/patient-monitor-disconnected.png" alt="" /> */}
      </div>
    </div>
  );
}

export default PatientAnalysis;
