import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // This imports Chart.js automatically
import { data } from "react-router-dom";
import crosshairPlugin from "chartjs-plugin-crosshair";
import { id } from "date-fns/locale";
// Chart.register(crosshairPlugin);

const ChartComponent = ({
  dataType,
  xAxisData,
  yAxisData,
  canvasRef2,
  xAxisTitle,
  isStepped = false,
}) => {
  useEffect(() => {
    if (!canvasRef2.current) return;
    const ctx = canvasRef2.current.getContext("2d");

    // get yAxiesData max and round to the Y-axis max data scale
    const yAxisDataMaxValue = yAxisData.reduce((currentMax, value) => {
      return Math.max(currentMax, value);
    }, -Infinity); // Initialize with a very small number

    // var yAxisDataMaxValue = Math.max(...yAxisData);
    var yAxisMaxDataScale = Math.ceil(yAxisDataMaxValue * 1.2);
    console.log(`xAxisTitle: ${xAxisTitle} | yAxisDataMaxValue: ${yAxisDataMaxValue} | yAxisMaxDataScale: ${yAxisMaxDataScale}`)
    if (yAxisMaxDataScale >= 10) { // 1676
      let scaleStr = yAxisMaxDataScale.toString(); // scaleStr = '1676'
      scaleStr = scaleStr[0] + scaleStr[1] + "0".repeat(scaleStr.length - 2); // scaleStr = 1600 , scaleStr.length = 4
      // let addFirstDigitValue = Math.pow(10, scaleStr.length-2); // addFirstDigitValue = 100
      // yAxisMaxDataScale = Number(scaleStr) + addFirstDigitValue; // yAxisMaxDataScale = 1100
      yAxisMaxDataScale = Number(scaleStr); // yAxisMaxDataScale = 1600
    }
    console.log(`xAxisTitle2: ${xAxisTitle} | yAxisDataMaxValue2: ${yAxisDataMaxValue} | yAxisMaxDataScale2: ${yAxisMaxDataScale}`)
    // step size format
    let stepSize = 1;
    const digits = yAxisDataMaxValue.toString().length;
    if (digits > 1) {
      stepSize = Math.pow(10, digits - 1);
    }

    /* format time */
    // when hour is 24, change it to 00
    const formattedDataArray = [];
    console.log("xAxisData", xAxisData);
    xAxisData.forEach((data) => {
      const dateTimeArray = data.split("T");
      // let time = dateTimeArray[1];
      // let timeParts = time.split(":");
      // if (timeParts[1] === "24") {
      //   timeParts[1] = "00";
      //   dateTimeArray[1] = timeParts.join(":");
      // }
      formattedDataArray.push(dateTimeArray);
    });
    console.log("formattedDataArray", formattedDataArray);

    //plugin
    const staticLabel = {
      id: "staticLabel",
      // beforeDatasetsDraw: (chart, args, plugins) => {
      //   const {
      //     ctx,
      //     data,
      //     chartArea: { top, bottom, left, right, width, height },
      //     scales: { x, y },
      //   } = chart;
      //   ctx.save();
      //   const lastPoint = data.datasets[0].data.length - 1;
      //   // console.log("lastPoint", lastPoint, data.datasets[0]);

      //   //static line
      //   ctx.beginPath();
      //   ctx.lineWidth = 2;
      //   ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      //   ctx.setLineDash([5, 5]);
      //   ctx.moveTo(left, y.getPixelForValue(data.datasets[0].data[lastPoint]));
      //   ctx.lineTo(right, y.getPixelForValue(data.datasets[0].data[lastPoint]));
      //   ctx.stroke();
      //   ctx.restore();

      //   // static bubble
      //   const textWidth = ctx.measureText(
      //     data.datasets[0].data[lastPoint]
      //   ).width;
      //   ctx.beginPath();
      //   ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      //   ctx.roundRect(
      //     left,
      //     y.getPixelForValue(data.datasets[0].data[lastPoint]) - 5,
      //     -10,
      //     10,
      //     5
      //   );
      //   ctx.fill();

      //   // static text
      //   ctx.font = "bold 12px Arial";
      //   ctx.fillStyle = "rgba(255, 0, 0, 1)";
      //   ctx.textAlign = "center";
      //   ctx.fillText(
      //     data.datasets[0].data[lastPoint],
      //     left - 5,
      //     y.getPixelForValue(data.datasets[0].data[lastPoint]) - 10
      //   );
      // },
    };

    let xHoverCoor, yHoverCoor, hoverIndex;
    let xHoverLabel = [];
    const hoverLabel = {
      id: "hoverLabel",
      beforeDatasetsDraw(chart, args, plugins) {
        const {
          ctx,
          data,
          chartArea: { top, bottom, left, right, width, height },
          scales: { x, y },
        } = chart;
        //console.log('data', data);
        if (xHoverCoor && yHoverCoor) {
          const nearestX = x.getValueForPixel(xHoverCoor); //nearestX return the index of x labels
          // console.log("nearestX:", nearestX);
          const nearestXDate = data.labels[nearestX]; // return date array ex: ["2025-07-30", "00:24:00"]
          xHoverLabel = nearestXDate;
          // console.log("nearestXDate:", nearestXDate);
          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          ctx.fillRect(x.getPixelForValue(nearestXDate) - 1, top, 2, height);
          ctx.restore();
        }
      },
      afterDatasetsDraw: (chart, args, plugins) => {
        const {
          ctx,
          data,
          chartArea: { top, bottom, left, right, width, height },
          scales: { x, y },
        } = chart;

        ctx.save();
        const nearestX = x.getValueForPixel(xHoverCoor); //nearestX return the index of x labels
        const nearestXDate = data.labels[nearestX]; // return date array ex: ["2025-07-30", "00:24:00"]

        // console.log("nearestX:", nearestX);
        // console.log("nearestXDate:", nearestXDate);
        // console.log("xHoverLabel:", xHoverLabel);
        if (!nearestX || !nearestXDate || !xHoverLabel.length) return;
        // cloud
        const textWidth = ctx.measureText(xHoverLabel[0]).width + 20;

        let value = x.getPixelForValue(nearestXDate) - textWidth / 2;
        if (value < left) {
          value = left;
        }
        if(value + textWidth > right){
          value = right - textWidth;
        }
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.roundRect(
          value,
          bottom - 35,
          textWidth,
          35,
          4
        );
        ctx.fill();

        // text
        let textPos = x.getPixelForValue(nearestXDate);
        if(value === left){
          textPos = left + textWidth / 2;
        }
        if(value === right - textWidth){
          textPos = right - textWidth / 2;
        }

        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "white";
        xHoverLabel.forEach((line, i) => {
          ctx.fillText(
            line,
            textPos,
            bottom - 22 + i * 16 // 16px line height, adjust as needed
          );
        });

        // x-hoverline
        // console.log("y", data.datasets[0].data[nearestX]);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.moveTo(left, y.getPixelForValue(data.datasets[0].data[nearestX]));
        ctx.lineTo(right, y.getPixelForValue(data.datasets[0].data[nearestX]));
        ctx.lineWidth = 2;
        ctx.stroke();

        // x-hoverCloud
        const hoverTextWidth =
          ctx.measureText(data.datasets[0].data[nearestX]).width + 10;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.roundRect(
          left,
          y.getPixelForValue(data.datasets[0].data[nearestX]) - 10,
          hoverTextWidth,
          20,
          4
        );
        ctx.fill();

        //x-hoverText
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
          data.datasets[0].data[nearestX],
          left + hoverTextWidth / 2,
          y.getPixelForValue(data.datasets[0].data[nearestX]) + 5
        );
      },
      afterEvent: (chart, args) => {
        const {
          ctx,
          canvas,
          chartArea: { top, bottom, left, right, width, height },
          scales: { x, y },
        } = chart;
        //console.log("arg:", args);
        if (args.inChartArea && args.event.type === "mousemove") {
          canvas.addEventListener("mousemove", (e) => {
            nearestValue(chart, e);
          });

          function nearestValue(chart, mousemove) {
            if (!chart) return;
            const point = chart.getElementsAtEventForMode(
              mousemove,
              "nearest",
              { intersect: false },
              true
            );
            if (point.length) {
              hoverIndex = point[0].index;
            }
          }
          xHoverCoor = args.event.x;
          yHoverCoor = args.event.y;
        } else {
          xHoverCoor = null;
          yHoverCoor = null;
          hoverIndex = null;
        }
        args.changed = true;

        {
          /*
          if (args.inChartArea && args.event.type === "mousemove") {
          const point = chart.getElementsAtEventForMode(
            args.event.native,
            "nearest",
            { intersect: false },
            true
          );
          if (point.length) {
            hoverIndex = point[0].index;
          }
          xHoverCoor = args.event.x;
          yHoverCoor = args.event.y;
        } else {
          xHoverCoor = null;
          yHoverCoor = null;
          hoverIndex = null;
        }
        args.changed = true;
          // console.log("xHoverCoor:", xHoverCoor, "yHoverCoor:", yHoverCoor);        
          */
        }
      },
    };

    // create new chart
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        // xAxisData is the time
        labels: formattedDataArray,
        // yAxisData is the data
        datasets: [
          {
            data: yAxisData,
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill: false,
            tension: 0.3,
            stepped: isStepped,
          },
        ],
      },
      options: {
        interaction: {
          intersect: false,
          axis: "x",
        },
        plugins: {
          // 數據小標題 屏蔽
          legend: {
            display: false,
          },
          // 數據提示框
          tooltip: {
            enabled: false, // Disable the tooltip
            // mode: "index", // index,nearest,dataset,point,x
            // intersect: false,
          },
          // Crosshair plugin options
          crosshair: {
            line: {
              display: false, // show crosshair line
              color: "rgba(0, 0, 0, 1)", // crosshair line color
              width: 0.5, // crosshair line width
            },
            sync: {
              enabled: true, // enable trace line syncing with other charts
              group: 1, // chart group
              suppressTooltips: false, // suppress tooltips when showing a synced tracer
            },
            zoom: {
              enabled: true, // enable zooming
              zoomboxBackgroundColor: "rgba(66,133,244,0.2)", // background color of zoom box
              zoomboxBorderColor: "#48F", // border color of zoom box
              zoomButtonText: "Reset Zoom", // reset zoom button text
              zoomButtonClass: "reset-zoom", // reset zoom button class
            },
            callbacks: {
              beforeZoom: () =>
                function (start, end) {
                  // called before zoom, return false to prevent zoom
                  return true;
                },
              afterZoom: () =>
                function (start, end) {
                  // called after zoom
                },
            },
          },
        },
        // 即時顯示
        responsive: true,
        // x 軸顯示 和 y 軸顯示
        scales: {
          x: {
            title: {
              display: true,
              text: "Time",
              font: {
                size: 16, // Set x-axis title font size to 16px
              },
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
            title: {
              display: true,
              text: xAxisTitle,
              font: {
                size: 16, // Set y-axis title font size to 16px
              },
            },
            beginAtZero: true,
            max: yAxisMaxDataScale,
            min: 0,
            ticks: {
              stepSize: stepSize,
              precision: 0,
            },
          },
        },
      },
      plugins: [staticLabel, hoverLabel],
    });
    // Cleanup: destroy chart on unmount
    return () => {
      myChart.destroy();
    };
  }, [yAxisData]);

  return (
    <div>
      <canvas ref={canvasRef2} width="1200px" height="300px"></canvas>
    </div>
  );
};

export default ChartComponent;
