import React, { useEffect, useState, useRef } from "react";
import { loadOpenCv } from "../JS/opencv-loader.js";
import { useAuth } from "../JS/AuthContext.jsx";

const OpenCVComponent = ({ deviceid, rawdata, height, width, riskRegions = [] }) => {
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

  // ─────────────────────────────────────────────────────────
  // UMAP 專用色階
  //   下限固定 raw 5：以下一律背景色（深色模式黑 / 淺色模式白）
  //   上限 hi 依「模糊後影像的最大值」動態決定：
  //     max <  50        → hi = 50
  //     50 <= max <= 80  → hi = max
  //     max >  80        → hi = 80
  //     也就是 hi = min(80, max(50, max))
  //   raw >= hi → #eb3a25（飽和紅）；raw 5~hi 之間平均分成 case 0 ~ case 14，共 15 階
  //
  // ⚠ hi 一定要取「模糊之後」的最大值，不能取原始 rawdata 的最大值。
  //   著色是對模糊後的影像做的，而高斯模糊會把孤立的高點大幅削低
  //   （實測：單一格的峰值 255 → 47；要 4x4 以上的高原才撐得住 255）。
  //   若用原始最大值當 hi，色階頂端那一段就永遠沒有像素到得了，飽和紅畫不出來。
  //
  // ⚠ 回傳的 tuple 之後是以 [2],[1],[0] 的順序寫進 RGBA 的（R/B 對調），
  //   所以「畫面上的 #eb3a25」在這裡要寫成 [37, 58, 235]，不能寫 [235, 58, 37]。
  //   下面每個 case 後面標註的是「畫面上實際看到的顏色」。
  // ─────────────────────────────────────────────────────────
  const UMAP_RAW_MIN = 5; // 色階下限（raw）
  const UMAP_HI_MIN = 50; // 上限的下界：整幀都很低時也不要過度放大雜訊
  const UMAP_HI_MAX = 80; // 上限的上界：維持原本的飽和點
  const UMAP_LEVELS = 15; // case 0 ~ case 14
  // 正規化的參考上限：useEffect 把 raw 0~80 線性拉成 0~255（只是為了讓 8-bit 的
  // 模糊有足夠數值解析度），所以反推 raw 時用的就是這個值。
  const UMAP_REF_MAX = 80;

  // 灰階值 (0~255) → 對應的 raw 值
  const grayToRaw = (gray) => (gray / 255) * UMAP_REF_MAX;

  // 這一幀的色階上限
  const   umapUpperBound = (maxRaw) =>
    Math.min(UMAP_HI_MAX, Math.max(UMAP_HI_MIN, Number(maxRaw) || 0));

  // 直接在 raw 空間分桶，不再繞一層正規化門檻。
  // ⚠ [5, hi] 切成 16 等份：前 15 份是 case 0~14 的漸層，最上面那一份是飽和紅。
  //   不能寫成「rawValue >= hi 才紅」—— hi 現在「就等於」畫面上的最大值，
  //   那樣紅色只會落在最高的那一個點上，最後縮到 canvas 尺寸時就被鄰居平均掉，
  //   等於永遠看不到紅色。給紅色一份完整的區間，熱點才畫得出來。
  const getUMAPColor = (rawValue, hi) => {
    if (rawValue < UMAP_RAW_MIN) {
      return isDarkMode ? [0, 0, 0] : [255, 255, 255];
    }
    if (rawValue >= hi) return [37, 58, 235]; // #eb3a25 紅

    const idx = Math.floor(
      ((rawValue - UMAP_RAW_MIN) / (hi - UMAP_RAW_MIN)) * (UMAP_LEVELS + 1),
    ); // 0 ~ 15；15 = 最上面那一份，畫成紅色

    switch (idx) {
      case 0:
        return [104, 4, 1]; // #010468 深藍
      case 1:
        return [158, 8, 2]; // #02089e 藍
      case 2:
        return [245, 57, 21]; // #1539f5 亮藍
      case 3:
        return [245, 97, 41]; // #2961f5 藍
      case 4:
        return [245, 141, 63]; // #3f8df5 天藍
      case 5:
        return [249, 185, 84]; // #54b9f9 淺藍
      case 6:
        return [250, 225, 104]; // #68e1fa 青
      case 7:
        return [160, 226, 110]; // #6ee2a0 薄荷綠
      case 8:
        return [62, 210, 97]; // #61d23e 綠
      case 9:
        return [70, 227, 166]; // #a6e346 黃綠
      case 10:
        return [75, 234, 211]; // #d3ea4b 檸檬黃綠
      case 11:
        return [79, 240, 251]; // #fbf04f 黃
      case 12:
        return [84, 203, 246]; // #f6cb54 橘黃
      case 13:
        return [56, 158, 240]; // #f09e38 橘
      case 14:
        return [48, 119, 234]; // #ea7730 橘紅
      default:
        return [37, 58, 235]; // idx 15（最上面那一份）→ #eb3a25 紅
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

      // ⚠ 先把灰階縮到 canvas 尺寸，「之後」才著色。
      //   原本的順序是「在 27 倍大的圖上著色 → 再縮到 canvas」，那一次縮圖是對
      //   「已經上好色的 RGBA」做平均，會把最高點那一小撮顏色跟鄰居混掉——
      //   熱點永遠混不出飽和紅。改成先縮再著色之後：
      //     1. 量到的最大值就是畫面上真正會出現的最大值，頂端色階一定畫得到；
      //     2. 著色迴圈的像素數少一個數量級（27 倍圖約 115 萬 → canvas 約 15 萬），順便快很多。
      let scaled = new cv.Mat();
      cv.resize(
        resizedMat3,
        scaled,
        new cv.Size(canvasRef.current.width, canvasRef.current.height),
        0,
        0,
        cv.INTER_LINEAR_EXACT,
      );

      // 色階上限：取「模糊並縮到 canvas 之後」的最大值。
      // 高斯模糊會把孤立高點大幅削低（實測單格峰值 255 → 47），所以絕不能拿
      // 原始 rawdata 的最大值當 hi，否則色階頂端沒有任何像素到得了。
      const umapHi = umapUpperBound(grayToRaw(cv.minMaxLoc(scaled).maxVal));

      // Convert grayscale to RGBA（圓圈外要套 alpha，需要 alpha 通道）
      let dst = new cv.Mat();
      cv.cvtColor(scaled, dst, cv.COLOR_GRAY2RGBA, 0);

      // 若有 risk region：先算出各圓在 dst 座標系的位置（與 RiskArea 相同的換算，
      // 含 180° 旋轉、半徑 = radius * 2.75，再依 dst 與 canvas 的比例放大）。
      // 邊界羽化寬度 = 半徑 * 此比例（在此帶狀範圍內，減少量由 0 平滑過渡到 10，消除硬邊界）
      const FEATHER_RATIO = 0.6;
      const riskCircles =
        Array.isArray(riskRegions) && riskRegions.length > 0
          ? riskRegions
              .filter((rg) => rg && (Number(rg.radius) || 0) > 0)
              .map((rg) => {
                const r =
                  (Number(rg.radius) || 0) *
                  2.75 *
                  (dst.cols / canvasRef.current.width);
                return {
                  cx:
                    (sensor_width - 1 - Number(rg.center_x)) *
                    (dst.cols / (sensor_width - 1)),
                  cy:
                    (sensor_height - 1 - Number(rg.center_y)) *
                    (dst.rows / (sensor_height - 1)),
                  r,
                  feather: Math.max(r * FEATHER_RATIO, 1),
                };
              })
          : [];
      const applyRiskMask = riskCircles.length > 0;

      // 圓圈外要把值往下降（降壓/變淡）的最大量；圈內不動。
      const OUTSIDE_DROP = 10;
      const OUTSIDE_ALPHA = 1; // 圓圈外的透明度

      // Apply custom color mapping using `getColor()`
      for (let i = 0; i < dst.rows; i++) {
        for (let j = 0; j < dst.cols; j++) {
          let val = dst.ucharPtr(i, j)[0]; // 原始灰階值 (0~255)
          let alpha = 255; // 圈內不透明
          // 沿圓邊「羽化」：ratio = 0(圈內) → 1(遠離所有圓)，用來平滑過渡「減值」與「透明度」，
          // 讓圓圈外「值減 OUTSIDE_DROP」+「alpha 0.8」都不會有明顯邊界。
          if (applyRiskMask) {
            let ratio = 1;
            for (let k = 0; k < riskCircles.length; k++) {
              const dx = j - riskCircles[k].cx;
              const dy = i - riskCircles[k].cy;
              const dist = Math.sqrt(dx * dx + dy * dy) - riskCircles[k].r; // 帶號距離：<=0 在圈內
              let t;
              if (dist <= 0) t = 0;
              else if (dist >= riskCircles[k].feather) t = 1;
              else t = dist / riskCircles[k].feather;
              if (t < ratio) ratio = t;
              if (ratio <= 0) break; // 已落在某圓內，最小了
            }
            // 值：原本 < OUTSIDE_DROP 的不動（避免變負值/動到背景）
            if (val >= OUTSIDE_DROP) {
              val = val - Math.round(OUTSIDE_DROP * ratio);
            }
            // 透明度：圈內 1 → 圈外 OUTSIDE_ALPHA，沿羽化帶漸變
            if(val > 10){
              alpha = Math.round(255 * (1 - (1 - OUTSIDE_ALPHA) * ratio));
            }
          }
          const c = getUMAPColor(grayToRaw(val), umapHi);
          dst.ucharPtr(i, j)[0] = c[2]; // Blue
          dst.ucharPtr(i, j)[1] = c[1]; // Green
          dst.ucharPtr(i, j)[2] = c[0]; // Red
          dst.ucharPtr(i, j)[3] = alpha; // Alpha
        }
      }
      // dst 已經是 canvas 尺寸了（縮圖提前到著色之前），直接畫上去
      cv.imshow(canvasRef.current, dst);
      // Free memory
      originalImage.delete();
      resizedMat1.delete();
      resizedMat2.delete();
      resizedMat3.delete();
      result.delete();
      scaled.delete();
      dst.delete();
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

  // const temp1  = "000000000000000000000000000000000026000000000000000000000000000000000000000000000000101000000000000000001200000000000000000000000000001C000B000000000000001903000000000000000000000003030700000000000000000018130000000000000000000000001D10000000000000000007362812010400000000000000000116130400000000000000032A223602000000000000000000051B150000000000000000032844330000000000000000000020150A00000000000000000036361F080000000000000000000F201C03080000000000000111281C04000000000000000000061B1400060000000000000000121B00000000000000000000030603000000000000000000000E110000000000000000000001050000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000200000000000000000000000000000008000000000000000607050000000000000000000000000002000100000000000109050000000000000000000000000000080602010000000003070C0B04000000000000000000000000010B09030000000000000002000000000000000000000100000105020000000000010C0E070000000000000000000000050100040608050000000505060A0900000000000000000000000C0500000000000000100D0A1A07000000000000000000000000032F13000000050C11100C12090000000000000000000000000000042509000F1011120609030400000000000000000000000002070F2308141111130A081100000000000000000000030E09110D09181211161318090C0A00000000000000000000010405130F0D181D10231711141D160B0000000000000000000001070611121A222B3A1F200E0A0C0100000000000000000000030B0F14141B1B2D2B22232130271C0700000000000000000004060711141F1B1B1A1B0E0C0A0000000000000000000000000004060712160D12230C130D110500000000000000000000000000031011080B0E130A0B08000000000000000000000000000000010B0B0A070B140A13110D000000000000000000000000000000000103020705020000000103000000000000000000000000000007061A060000000200000001010000000000000000000000000A0E0C0F0004030900000000000000000200000300000000000909080001120F0E01000000000006000C000F0C01000000000205060300050707000000000000080416000412020000000000090804050F0C0D0100000000000A141600020C080000000000050706070B070B0B00000000060A141100000F0E0000000004020C0A0D070D070A040000000004030D000003090003000204030B0A0C120C120C100700000006020900000107000500040C14120D11190E1817141500000000000000000006050D030E15161815121D1119212319110000000000000000000D1B0B181F18191B151D1D281A3318150700000000000000000B17111715131D1D151E1B1E224323101000000000000000010B0E140F0C15151C15151E141A24180E0A0000000000000000091A0E13170F101A16141A12040C110000000000000000000000000000090809181713120F00000000000000000000000000000000000000040E0B0103010000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000122001100000000000000000000000000000000000000000520370B350900000000000000000000000000000000000000000633002A000000000000000000000000010000000000000000071A071507050200000500090500";

  // 1）若最大值為50-80之間，則將著色設為5-MAX
  // 2）若最大值小於50，著色設為5-50
  // 3）若最大值大於80，著色設為5-80

  useEffect(() => {
    // let result = convertHexToDecimalArray(temp1);
    let result = convertHexToDecimalArray(rawdata);
    if (sensor_height * sensor_width > 240) {
      result = result.reverse();
    }
    // 固定把 raw 0~80 線性拉成 0~255。
    // ⚠ 這裡「不」做動態色階 —— UMAP 的上限要等模糊完才量（見 print_img 的 umapHi）。
    //   這一步純粹是給 8-bit 的高斯模糊足夠的數值解析度，反推時用 UMAP_REF_MAX。
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
  }, [opencvLoaded, decimalArray, riskRegions]);

  // 底色：canvas 的 bitmap 是半透明的（圓圈外套了 OUTSIDE_ALPHA），沒有底色的話
  // 會直接透出頁面背景。canvas 元素的 CSS background 就繪製在 bitmap「底下」，
  // 且元素尺寸 = 繪圖表面尺寸（width/height 屬性），所以這就是一塊完全等大的底色，
  // 不需要額外的 div，也不會有對不齊的問題。
  //   深色模式 → 黑；淺色模式 → 白（與 getColor / getUMAPColor 的背景值一致）
  const backdropColor = isDarkMode ? "#000000" : "#FFFFFF";

  return <canvas ref={canvasRef} style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        backgroundColor: backdropColor,
      }} ></canvas>;
};

export default OpenCVComponent;
