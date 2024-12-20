import React, { useEffect, useState, useRef } from "react";

const OpenCVComponent = ({ deviceid, rawdata }) => {
  const sensor_width = 20;
  const sensor_height = 12;

  const [opencvLoaded, setOpencvLoaded] = useState(false);
  console.log("rawdata is ", rawdata);
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://docs.opencv.org/4.x/opencv.js"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://docs.opencv.org/4.x/opencv.js";
      script.async = true;
      script.onload = () => {
        // Wait until OpenCV.js is loaded
        cv["onRuntimeInitialized"] = () => {
          console.log("OpenCV initialized for ", deviceid);
          setOpencvLoaded(true); // Set OpenCV loaded flag to true
        };
      };
      document.body.appendChild(script);
    } else {
      // OpenCV is already loaded
      if (cv && cv["onRuntimeInitialized"]) {
        setOpencvLoaded(true);
      } else {
        existingScript.onload = () => {
          cv["onRuntimeInitialized"] = () => {
            console.log("OpenCV initialized for ", deviceid);
            setOpencvLoaded(true);
          };
        };
      }
    }
  }, [deviceid]); // Load OpenCV.js once when the component mounts

  const canvasRef = useRef(null);

  useEffect(() => {
    // Get the parent `.box` element
    const parentBox = canvasRef.current?.parentElement;
    if (parentBox) {
      // Set the canvas size to match the parent `.box` size
      canvasRef.current.height = parentBox.clientHeight * 0.9; // reduce a 10% percentage of output image size
      const scaleAdjust_clientWidth =  Math.round((parentBox.clientWidth * 12)/20);
      canvasRef.current.width = scaleAdjust_clientWidth * 0.9; // reduce a 10% percentage of output image size
    }
    console.log("the cavas height ", parentBox.clientHeight);
    console.log("the cavas width ", parentBox.clientWidth);
    console.log("the cavas width multiple ", Math.round((parentBox.clientWidth * 20)/12));
    const message = `${canvasRef.current.width} + ${canvasRef.current.height}`;
    // alert(message);
  }, []);

  const getColor = (div) => {
    if (div < 5) return [255, 255, 255];

    div = Math.floor(div / 16);
    if (div > 15) return [37, 58, 235];

    switch (div) {
      case 0:
        return [104, 4, 1];
      case 1:
        return [158, 8, 2];
      case 2:
        return [245, 57, 21];
      case 3:
        return [245, 97, 41];
      case 4:
        return [245, 141, 63];
      case 5:
        return [249, 185, 84];
      case 6:
        return [250, 225, 104];
      case 7:
        return [160, 226, 110];
      case 8:
        return [62, 210, 97];
      case 9:
        return [70, 227, 166];
      case 10:
        return [75, 234, 211];
      case 11:
        return [79, 240, 251];
      case 12:
        return [84, 203, 246];
      case 13:
        return [56, 158, 240];
      case 14:
        return [48, 119, 234];
      case 15:
        return [37, 58, 235];
      default:
        return [0, 0, 0];
    }
  };

  const print_img = (data) => {
    if (!data || data.length === 0) {
      const canvas = document.getElementById("tcanvas");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const mat24 = cv.matFromArray(
      canvasRef.current.height,
      canvasRef.current.width,
      cv.CV_8UC1,
      Array(canvasRef.current.width * canvasRef.current.height).fill(24)
    );
    const vis = cv.matFromArray(sensor_width, sensor_height, cv.CV_8UC1, data);

    const dim = new cv.Size(canvasRef.current.width, canvasRef.current.height);
    const vis2 = new cv.Mat();

    cv.resize(vis, vis2, dim, 0, 0, cv.INTER_CUBIC);
    cv.divide(vis2, mat24, vis2);
    cv.multiply(vis2, mat24, vis2);

    const dst = new cv.Mat();
    cv.cvtColor(vis2, dst, cv.COLOR_GRAY2RGB, 0);

    for (let i = 0; i < vis2.size().height; i++) {
      for (let j = 0; j < vis2.size().width; j++) {
        const c = getColor(vis2.ucharPtr(i, j)[0]);
        dst.ucharPtr(i, j)[0] = c[2];
        dst.ucharPtr(i, j)[1] = c[1];
        dst.ucharPtr(i, j)[2] = c[0];
        dst.ucharPtr(i, j)[3] = 0;
      }
    }

    cv.imshow("tcanvas", dst);

    vis.delete();
    vis2.delete();
    dst.delete();
  };

  // Example data to be used
  const sampleData = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0,
    7, 10, 0, 7, 0, 0, 2, 0, 15, 10, 31, 9, 14, 10, 24, 21, 24, 34, 31, 33, 17,
    38, 72, 25, 38, 55, 43, 48, 49, 53, 71, 76, 0, 255, 223, 24, 50, 66, 45, 45,
    73, 59, 62, 66, 40, 75, 168, 43, 50, 54, 25, 30, 46, 53, 48, 75, 43, 50,
    213, 19, 49, 53, 24, 42, 59, 41, 53, 58, 47, 48, 177, 12, 35, 48, 42, 31,
    60, 30, 47, 34, 31, 48, 103, 15, 14, 28, 20, 24, 21, 12, 17, 28, 25, 25, 38,
    0, 9, 10, 0, 4, 1, 5, 0, 17, 2, 9, 7, 21, 9, 15, 16, 12, 2, 12, 4, 5, 0, 7,
    11, 64, 32, 26, 33, 30, 31, 15, 12, 32, 34, 22, 19, 123, 32, 28, 29, 39, 20,
    26, 34, 46, 27, 52, 65, 196, 44, 35, 29, 23, 33, 33, 25, 36, 30, 32, 44, 80,
    40, 30, 40, 43, 29, 43, 21, 34, 28, 34, 80, 67, 37, 37, 15, 28, 26, 13, 32,
    11, 46, 13, 53, 84, 47, 31, 22, 26, 30, 23, 10, 14, 33, 32, 16, 0, 16, 20,
    11, 21, 22, 13, 26, 6, 28, 20, 16, 0, 0, 0, 4, 3, 0, 0, 5, 20, 14, 18, 17,
  ]; // Example data

  const [decimalArray, setDecimalArray] = useState([]);

  // Function to convert 480-character hex string to 240 decimal values
  const convertHexToDecimalArray = (rawdata) => {
    const decimalArray = [];
    for (let i = 0; i < rawdata.length; i += 2) {
      const hexPair = rawdata.substring(i, i + 2); // Take two characters
      const decimalValue = parseInt(hexPair, 16); // Convert to decimal
      decimalArray.push(decimalValue);
    }
    return decimalArray;
  };

  useEffect(() => {
    const result = convertHexToDecimalArray(rawdata);
    setDecimalArray(result); // Store the result in state
  }, [rawdata]);

  useEffect(() => {
    if (opencvLoaded) {
      print_img(decimalArray);
    }
  }, [opencvLoaded, decimalArray]);

  return <canvas id="tcanvas" ref={canvasRef}></canvas>;
};

export default OpenCVComponent;
