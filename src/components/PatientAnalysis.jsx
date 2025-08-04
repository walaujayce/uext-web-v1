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

  const [bedEventList, setBedEventList] = useState([]);
  const [adcList, setAdcList] = useState([]);
  const [varList, setVarList] = useState([]);
  const [dateTimeList, setDateTimeList] = useState([]);

  const handleGetAlgoResult = async (startTime, endTime) => {
    try {
      // if (endTime < startTime) {
      //   alert("End date must be greater than start date");
      //   return;
      // }
      setLoading(true);
      const filterRequest = {
        Deviceid: "D83ADD981EA5",
        // StartTime: startTime.toISOString().split(".")[0],
        // EndTime: endTime.toISOString().split(".")[0],
        StartTime: "2025-07-30T00:24:00",
        EndTime: "2025-07-30T09:25:00",
      };

      const response = await fetch(
        `/api/7284/db/RecordData/?timezone=Asia_Taipei`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filterRequest),
        }
      );

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json();
        if (jsonData.code === -1) {
          alert(jsonData.messages || "Error: No raw data found");
          return;
        }
        // console.log("result", jsonData);
        const bedEventArray = [];
        const adcArray = [];
        const varArray = [];
        const dateTimes = [];

        jsonData.forEach((recordData) => {
          bedEventArray.push(parseInt(recordData.statusid, 10));
          adcArray.push(recordData.p_now);
          varArray.push(recordData.v_now_st);
          const formattedTime = recordData.recordtime
            .split(".")[0];
          dateTimes.push(formattedTime);
        });
        setBedEventList(bedEventArray);
        setAdcList(adcArray);
        setVarList(varArray);
        setDateTimeList(dateTimes);

        console.log("bed_event_list", bedEventList);
        console.log("adcList", adcList);
        console.log("varList", varList);
        console.log("dateTime_list", dateTimeList);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setLoading(false);
    }
  };

// Create refs for each chart
  const eventCanvasRef = useRef(null);
  const adcCanvasRef = useRef(null);
  const varCanvasRef = useRef(null);

  // Function to download all charts
  const handleDownloadResult = () => {
    if (!eventCanvasRef.current || !adcCanvasRef.current || !varCanvasRef.current) {
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
      tempCanvas.width = 1600;
      tempCanvas.height = 800;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        console.error("Failed to get canvas context");}
      // Fill background with white
      tempCtx.fillStyle = "#fff";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw and scale the chart canvas onto the temp canvas
      tempCtx.drawImage(
        ref.current,
        0, 0, ref.current.width, ref.current.height,
        0, 0, tempCanvas.width, tempCanvas.height
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
            <div className="input g-col-2">
              <label htmlFor="pmio" className="label-container">
                <p>Start date</p>
                <img
                  className="info"
                  src="/src/assets/information-outline.svg"
                  alt="gray outline information icon"
                />
              </label>
              <div className="">
                <DatePicker
                  selected={filterSelectedDate.selectedStartDate}
                  onChange={filterSelectedDate.handleStartDateSelect}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="time"
                  dateFormat="yyyy/MM/dd hh:mm aa"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                />
              </div>
              <div className="assistive-text">
                this is a line of assistive text
              </div>
            </div>
            <div className="input g-col-2 ">
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
                  dateFormat="yyyy/MM/dd hh:mm aa"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                />
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
                  onClick={() => handleGetAlgoResult(filterSelectedDate.selectedStartDate, filterSelectedDate.selectedEndDate)}
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
        {bedEventList.length > 0 && 
        <ChartComponent
          dataType="Event"
          yAxisData={bedEventList}
          xAxisData={dateTimeList}
          canvasRef2={eventCanvasRef}
        />}
        {/* <img src="/src/assets/patient-monitor-disconnected.png" alt="" /> */}
      </div>
      <div className="chart">
        <div className="title" style={{ fontSize: "24px" }}>
          {/* ADC */}
        </div>
        {adcList.length > 0 &&
        <ChartComponent
          dataType="ADC"
          yAxisData={adcList}
          xAxisData={dateTimeList}
          canvasRef2={adcCanvasRef}
        />}
        {/* <img src="/src/assets/patient-monitor-disconnected.png" alt="" /> */}
      </div>
      <div className="chart">
        <div className="title" style={{ fontSize: "24px" }}>
          {/* VAR */}
        </div>
        {varList.length > 0 && 
        <ChartComponent
          dataType="Var"
          yAxisData={varList}
          xAxisData={dateTimeList}
          canvasRef2={varCanvasRef}
        />
        }
        {/* <img src="/src/assets/patient-monitor-disconnected.png" alt="" /> */}
      </div>
    </div>
  );
}

export default PatientAnalysis;
