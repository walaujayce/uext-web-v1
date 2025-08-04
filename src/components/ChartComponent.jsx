import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // This imports Chart.js automatically
import { data } from "react-router-dom";

const ChartComponent = ({ dataType, xAxisData, yAxisData, canvasRef2 }) => {
  var canvasRef = useRef(null);
  canvasRef = canvasRef2;
  useEffect(() => {
    if (!canvasRef2.current) return;
    console.log("current2", dataType, xAxisData, yAxisData);
    const ctx = canvasRef.current.getContext("2d");

    /* format time */
    const formattedDataArray = [];
    xAxisData.forEach((data) => {
      const dateTimeArray = data.split("T");
      let time = dateTimeArray[1];
      let timeParts = time.split(":");
      if (timeParts[1] === "24") {
        timeParts[1] = "00";
        dateTimeArray[1] = timeParts.join(":");
      }
      formattedDataArray.push(dateTimeArray);
    });
    var myChart = new Chart();
    switch (dataType) {
      case "Event":
        myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: formattedDataArray,
            datasets: [
              {
                label: "EVENT",
                data: yAxisData,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                fill: false,
                tension: 0.3,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Time", 
                },
                offset: false,
                ticks: {
                  align: "center",
                  maxTicksLimit: 5,                  
                },
                grid: {
                  offset: false,
                  display: false,
                  align: "start",
                },
              },
              y: {
                title:{
                  display: true,
                  text: "Bed Event",
                },
                beginAtZero: true,
                max: 5,
                min: 0,
                ticks: {
                  stepSize: 1,
                  precision: 0,
                },
              },
            },
          },
        });
        break;
      case "ADC":
        myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: xAxisData,
            datasets: [
              {
                label: "ADC",
                data: yAxisData,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                fill: false,
                tension: 0.3,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
            responsive: true,
            scales: {
              x: {
                ticks: {
                  display: false,
                },
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1000,
                  precision: 0,
                },
              },
            },
          },
        });
        break;
      case "Var":
        myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: xAxisData,
            datasets: [
              {
                label: "VAR",
                data: yAxisData,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                fill: false,
                tension: 0.3,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
            responsive: true,
            scales: {
              x: {
                ticks: {
                  display: false,
                },
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 100,
                  precision: 0,
                },
              },
            },
          },
        });
        break;
    }

    // Cleanup: destroy chart on unmount
    return () => {
      myChart.destroy();
    };
  }, [yAxisData]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default ChartComponent;
