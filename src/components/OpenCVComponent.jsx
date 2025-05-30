import React, { useEffect, useState, useRef } from "react";

const OpenCVComponent = ({ deviceid, rawdata, height, width }) => {
  const sensor_height = height;
  const sensor_width = width;

  const [opencvLoaded, setOpencvLoaded] = useState(false);
  //console.log("rawdata is ", rawdata);
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="/src/JS/OpenCV.js"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "/src/JS/OpenCV.js";
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
      const scaleAdjust_clientWidth = Math.round(
        (parentBox.clientHeight * sensor_width) / sensor_height
      );
      canvasRef.current.width = scaleAdjust_clientWidth *0.9; // reduce a 10% percentage of output image size
    }
    console.log("the cavas height ", parentBox.clientHeight);
    console.log("the cavas width ", parentBox.clientWidth);
    console.log("the sensorrrrrrrr height ", height);
    console.log("the sensorrrrrrrr width ", width);
    console.log(
      "the cavas width multiple ",
      Math.round((parentBox.clientWidth * sensor_width) / sensor_height)
    );
    const message = `${canvasRef.current.width} + ${canvasRef.current.height}`;
    //alert(message);
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

  const getUMAPColor = (div) => {
    if (div < 10) return [255, 255, 255]; 
    if (div > 150) return [37, 58, 235];
    div = Math.floor(div / 16);

    switch (div) {
      case 0:
        return [104, 4, 1]; //dark red
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
        return [250, 225, 104]; // yellow
      case 7:
        return [160, 226, 110]; // light green
      case 8:
        return [62, 210, 97];
      case 9:
        return [70, 227, 166];
      case 10:
        return [75, 234, 211]; // green
      case 11:
        return [79, 240, 251]; // light blue
      case 12:
        return [84, 203, 246];
      case 13:
        return [56, 158, 240];
      case 14:
        return [48, 119, 234];
      case 15:
        return [37, 58, 235]; // blue
      default:
        return [0, 0, 0];
    }
  };

  const print_img = (data) => {
    if (!sensor_height || !sensor_width) {
      return;
    }
    if (!data.length >= sensor_height * sensor_width) {
      const canvas = document.getElementById("tcanvas");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (sensor_height * sensor_width > 240) {      
      let originalImage = cv.matFromArray(
        sensor_height,
        sensor_width,
        cv.CV_8UC1,
        data
      );

      let m = 3; // Scaling factor

      // Resize step 1
      let resizedMat1 = new cv.Mat();
      cv.resize(
        originalImage,
        resizedMat1,
        new cv.Size(sensor_width * m, sensor_height * m),
        0,
        0,
        cv.INTER_LINEAR_EXACT
      );

      // Apply Gaussian blur
      let result = new cv.Mat();
      let kernelSize = new cv.Size(9, 9); // Equivalent kernel size (not 25x25, as OpenCV.js uses width/height separately)
      cv.GaussianBlur(
        resizedMat1,
        result,
        kernelSize,
        3.0,
        3.0,
        cv.BORDER_DEFAULT
      );
      // Resize step 2
      let resizedMat2 = new cv.Mat();
      cv.resize(
        result,
        resizedMat2,
        new cv.Size(sensor_width * m * m, sensor_height * m * m),
        0,
        0,
        cv.INTER_LINEAR_EXACT
      );

      // Resize step 3
      let resizedMat3 = new cv.Mat();
      cv.resize(
        resizedMat2,
        resizedMat3,
        new cv.Size(sensor_width * m * m * m, sensor_height * m * m * m),
        0,
        0,
        cv.INTER_LINEAR_EXACT
      );



      // Convert grayscale to RGB
      let dst = new cv.Mat();
      cv.cvtColor(resizedMat3, dst, cv.COLOR_GRAY2RGB, 0);

      // Apply custom color mapping using `getColor()`
      for (let i = 0; i < dst.rows; i++) {
        for (let j = 0; j < dst.cols; j++) {
          let c = getUMAPColor(dst.ucharPtr(i, j)[0]);
          dst.ucharPtr(i, j)[0] = c[2]; // Blue
          dst.ucharPtr(i, j)[1] = c[1]; // Green
          dst.ucharPtr(i, j)[2] = c[0]; // Red
          dst.ucharPtr(i, j)[3] = 0; // Alpha
        }
      }
      // ** Resize to match canvas size **
      let finalOutput = new cv.Mat();
      // let canvasWidth = canvasRef.current.width;
      let canvasHeight = canvasRef.current.height;
      let canvasWidth = canvasRef.current.width;
      cv.resize(
        dst,
        finalOutput,
        new cv.Size(canvasWidth, canvasHeight),
        0,
        0,
        cv.INTER_LINEAR_EXACT
      );

      // Display image on canvas
      cv.imshow("tcanvas", finalOutput);

      // Free memory
      originalImage.delete();
      resizedMat1.delete();
      resizedMat2.delete();
      resizedMat3.delete();
      result.delete();
      dst.delete();
      finalOutput.delete(); // Ensure final output is deleted after use

    } else {

      const mat24 = cv.matFromArray(
        canvasRef.current.height,
        canvasRef.current.width,
        cv.CV_8UC1,
        Array(canvasRef.current.width * canvasRef.current.height).fill(24)
      );
      const vis = cv.matFromArray(
        sensor_height,
        sensor_width,
        cv.CV_8UC1,
        data
      );

      const dim = new cv.Size(
        canvasRef.current.width,
        canvasRef.current.height
      );
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
    }
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
    const sum = decimalArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    console.log("the total of rawdata is ", sum);
    // Find the highest value
    const maxValue = Math.max(...decimalArray);
    console.log("The highest value in decimalArray is:", maxValue);
    const minValue = Math.min(...decimalArray);
    console.log("The smallest value in decimalArray is:", minValue);

    return decimalArray;
  };

  useEffect(() => {
    let result = convertHexToDecimalArray(rawdata);
    if (sensor_height * sensor_width > 240) {
      result = result.reverse()
    }
    console.log("ori: ",result)
    // normalized value between 80 to 0
    let scaleData = [];
    for (let i = 0; i < result.length; i++) {
      if (result[i] < 1) {
          scaleData.push(0);
      } else if (result[i] > 80) {
          scaleData.push(255);
      } else {
          let normalizeValue = (result[i] - 0) / (80 - 0);
          scaleData.push(Math.round(normalizeValue * 255));
      }
    } 
    console.log("cal: ",scaleData)

    setDecimalArray(scaleData); // Store the result in state
  }, [rawdata]);

  useEffect(() => {
    try {
      if (opencvLoaded) {
        print_img(decimalArray);
      }
    } catch (error) {
      console.error("Error making in print_img request:", error);
      //console.log("the aaaaaaaa is ", decimalArray);
    }
  }, [opencvLoaded, decimalArray]);

  return <canvas id="tcanvas" ref={canvasRef}></canvas>;
};

export default OpenCVComponent;
