import React, { useEffect, useState, useRef } from "react";
import { loadOpenCv } from "../JS/opencv-loader.js";
import { useAuth } from "../JS/AuthContext.jsx";

const OpenCVComponent = ({ deviceid, rawdata, height, width }) => {
  const sensor_height = height;
  const sensor_width = width;
  const { isDarkMode } = useAuth();

  const [opencvLoaded, setOpencvLoaded] = useState(false);
  // //console.log("rawdata is ", rawdata);
  //   useEffect(() => {
  //     const onCvReady = () => {
  //       //console.log("OpenCV initialized for ", deviceid);
  //       setOpencvLoaded(true);
  //       window.isCvReady = true; // Use a global flag
  //     };

  //     const existingScript = document.querySelector(
  //       'script[src="/src/JS/OpenCV.js"]'
  //     );
  //     if (!existingScript) {
  //       const script = document.createElement("script");
  //       script.src = "/src/JS/OpenCV.js";
  //       script.async = true;
  //       script.onload = () => {
  //         // Script file is loaded, now tell cv what to do when *it* is ready
  //         if (window.cv) {
  //           window.cv["onRuntimeInitialized"] = onCvReady;
  //         } else {
  //           console.error("cv object not found after script load.");
  //         }
  //       };
  //       script.onerror = () => {
  //         console.error("Failed to load OpenCV.js script. Check path.");
  //       };
  //       document.body.appendChild(script);
  //     } else {
  //       // OpenCV is already loaded
  //       if (window.isCvReady) {
  //         // Already initialized by another component
  //         onCvReady();
  //       } else if (window.cv) {
  //         // Script loaded, but still initializing (or listener wasn't set)
  //         window.cv["onRuntimeInitialized"] = onCvReady;
  //       }
  //     }
  //   }, [deviceid]); // Load OpenCV.js once when the component mounts

  useEffect(() => {
    loadOpenCv().then(() => {
      //console.log("OpenCV ready for UEXT");
      setOpencvLoaded(true);
    });
  }, []);

  const canvasRef = useRef(null);
  useEffect(() => {
    // Get the parent `.box` element
    const parentBox = canvasRef.current?.parentElement;
    if (parentBox) {
      // Set the canvas size to match the parent `.box` size
      canvasRef.current.height = parentBox.clientHeight * 0.9; // reduce a 10% percentage of output image size
      const scaleAdjust_clientWidth = Math.round(
        (parentBox.clientHeight * sensor_width) / sensor_height,
      );
      canvasRef.current.width = scaleAdjust_clientWidth * 0.9; // reduce a 10% percentage of output image size
    }
    // //console.log("the cavas height ", parentBox.clientHeight);
    // //console.log("the cavas width ", parentBox.clientWidth);
    // //console.log("the sensorrrrrrrr height ", height);
    // //console.log("the sensorrrrrrrr width ", width);
    // //console.log(
    //   "the cavas width multiple ",
    //   Math.round((parentBox.clientWidth * sensor_width) / sensor_height)
    // );
    const message = `${canvasRef.current.width} + ${canvasRef.current.height}`;
    //alert(message);
  }, []);

  const getColor = (div) => {
    if (div < 5) {
      return isDarkMode ? [0, 0, 0] : [255, 255, 255];
    }

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
    if (div < 10) {
      return isDarkMode ? [0, 0, 0] : [255, 255, 255];
    }
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
    if (!canvasRef.current) {
      return;
    }

    if (!data.length >= sensor_height * sensor_width) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (sensor_height * sensor_width > 240) {
      let originalImage = cv.matFromArray(
        sensor_height,
        sensor_width,
        cv.CV_8UC1,
        data,
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
        cv.INTER_LINEAR_EXACT,
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
        cv.BORDER_DEFAULT,
      );
      // Resize step 2
      let resizedMat2 = new cv.Mat();
      cv.resize(
        result,
        resizedMat2,
        new cv.Size(sensor_width * m * m, sensor_height * m * m),
        0,
        0,
        cv.INTER_LINEAR_EXACT,
      );

      // Resize step 3
      let resizedMat3 = new cv.Mat();
      cv.resize(
        resizedMat2,
        resizedMat3,
        new cv.Size(sensor_width * m * m * m, sensor_height * m * m * m),
        0,
        0,
        cv.INTER_LINEAR_EXACT,
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
        cv.INTER_LINEAR_EXACT,
      );

      // Display image on canvas
      cv.imshow(canvasRef.current, finalOutput);
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
        Array(canvasRef.current.width * canvasRef.current.height).fill(24),
      );
      const vis = cv.matFromArray(
        sensor_height,
        sensor_width,
        cv.CV_8UC1,
        data,
      );

      const dim = new cv.Size(
        canvasRef.current.width,
        canvasRef.current.height,
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

      cv.imshow(canvasRef.current, dst);

      vis.delete();
      vis2.delete();
      dst.delete();
    }
  };
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
      0,
    );
    // //console.log("the total of rawdata is ", sum);
    // Find the highest value
    const maxValue = Math.max(...decimalArray);
    // //console.log("The highest value in decimalArray is:", maxValue);
    const minValue = Math.min(...decimalArray);
    // //console.log("The smallest value in decimalArray is:", minValue);

    return decimalArray;
  };

  useEffect(() => {
    let result = convertHexToDecimalArray(rawdata);
    if (sensor_height * sensor_width > 240) {
      result = result.reverse();
    }
    // //console.log("ori: ", result);
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
    // //console.log("cal: ", scaleData);

    setDecimalArray(scaleData); // Store the result in state
  }, [rawdata, isDarkMode]);

  useEffect(() => {
    try {
      if (opencvLoaded && decimalArray) {
        print_img(decimalArray);
      }
    } catch (error) {
      console.error("Error making in print_img request:", error);
      ////console.log("the aaaaaaaa is ", decimalArray);
    }
  }, [opencvLoaded, decimalArray]);

  return <canvas ref={canvasRef} style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} ></canvas>;
};

export default OpenCVComponent;
