import React, { useState, useEffect,useCallback,useRef } from "react";
import Navbar from "../components/Navbar";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../JS/AuthContext";
import OpenCVComponent from "../components/OpenCVComponent";
import OpenCVComponent2 from "../components/OpenCVComponent2";
import { he } from "date-fns/locale";

function DemoSD() {
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();


  const [rawdatum, setRawdatum] = useState([]);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  // // UMAP
  // const macaddress = "00C0CAB7A36D";
  // const postData = async () => {
  //   try {
  //     const response = await fetch(`/api/8031/rawdata/${macaddress}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const contentType = response.headers.get("Content-Type");
  //     if (!response.ok || !contentType?.includes("application/json")) {
  //       throw new Error(`Expected JSON, got: ${contentType}`);
  //     }

  //     const data = await response.json();

  //     setRawdatum(data.IMAGE);
  //     setWidth(data.WIDTH);
  //     setHeight(data.HEIGHT);
  //   } catch (error) {
  //     console.error("Error making UMAP POST request:", error);
  //   }
  // };

  // useEffect(() => {
  //   postData();
  //   const interval = setInterval(postData, 900);
  //   return () => clearInterval(interval);
  // }, []);

  // // UEXT
  // const [rawdataUEXT, setRawdataUEXT] = useState([]);
  // const [widthUEXT, setWidthUEXT] = useState(null);
  // const [heightUEXT, setHeightUEXT] = useState(null);

  // const macaddressUEXT = "00C0CAB7A33D";
  // const postDataUEXT = async () => {
  //   try {
  //     const response = await fetch(`/api/8031/rawdata/${macaddressUEXT}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const contentType = response.headers.get("Content-Type");
  //     if (!response.ok || !contentType?.includes("application/json")) {
  //       throw new Error(`Expected JSON, got: ${contentType}`);
  //     }

  //     const data = await response.json();

  //     setRawdataUEXT(data.IMAGE);
  //     setWidthUEXT(data.WIDTH);
  //     setHeightUEXT(data.HEIGHT);
  //   } catch (error) {
  //     console.error("Error making UEXT POST request:", error);
  //   }
  // };

  // useEffect(() => {
  //   postDataUEXT();
  //   const interval = setInterval(postDataUEXT, 900);
  //   return () => clearInterval(interval);
  // }, []);


  const macaddressUMAP = "00C0CAB7A36D";

  // Use useRef to hold the interval ID
  const intervalIdRef = useRef(null);

  // Wrap postData in useCallback to stabilize it
  const postUMAPData = useCallback(async () => {
    
    // Create an AbortController to manage the request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Request timed out, aborting.");
      controller.abort();
    }, 1000); // 1000ms = 1 second timeout

    try {
      const response = await fetch(`/api/8031/rawdata/${macaddressUMAP}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal, // Pass the signal to fetch
      });

      // If fetch succeeds, clear the timeout
      clearTimeout(timeoutId);

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        // Handle bad HTTP responses (404, 500) or wrong content type
        throw new Error(`Expected JSON, got: ${contentType} with status ${response.status}`);
      }

      const data = await response.json();

      // Success! Update state.
      setRawdatum(data.IMAGE);
      setWidth(data.WIDTH);
      setHeight(data.HEIGHT);

    } catch (error) {

      console.error("Error making API request, stopping polling:", error.name === 'AbortError' ? 'Request timed out' : error.message);
      
      // Make sure timeout is cleared (in case error was not timeout)
      clearTimeout(timeoutId);

      // --- This is the key part ---
      // If the interval reference exists, clear it.
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null; // Set ref to null
      }
    }
  }, [macaddressUMAP, setRawdatum, setWidth, setHeight]); // Dependencies for useCallback

  useEffect(() => {
    postUMAPData();

    const interval = setInterval(postUMAPData, 1000);
    
    intervalIdRef.current = interval;

    // The cleanup function runs when the component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [postUMAPData]); // The effect depends on the memoized postData function

  return (
    <>
      <Navbar />
      <div className="wrap">
        <div className="main">
          <div className="monitor">
            {/* UEXT */}
            <div className="pressure" style={{gridColumn:"span 3"}}>
              <div className="title">UEXT</div>
              <div className="box">
                {width &&
                  height &&
                  (rawdataUEXT ? (
                    <OpenCVComponent
                      deviceid={macaddressUEXT}
                      rawdata={rawdataUEXT}
                      width={widthUEXT}
                      height={heightUEXT}
                    />
                  ) : (
                    <img
                      className="disconnect"
                      src="/src/assets/disconnect.png"
                      alt=""
                    ></img>
                  ))}
                <div className="bt-box">
                  <div className="spec row">
                    <div className="mr high">
                      {/* <img src="/src/assets/mr-high.svg" alt="" /> */}
                      {/* <p>12%</p> */}
                    </div>
                    <div className="mr mid">
                      {/* <img src="/src/assets/mr-mid.svg" alt="" /> */}
                      {/* <p>28%</p> */}
                    </div>
                    <div className="mr low">
                      {/* <img src="/src/assets/mr-low.svg" alt="" /> */}
                      {/* <p>60%</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UMAP */}
            <div className="pressure" style={{gridColumn:"span 3"}}>
              <div className="title">UMAP</div>
              <div className="box">
                {width &&
                  height &&
                  (rawdatum ? (
                    <OpenCVComponent2
                      deviceid={macaddress}
                      rawdata={rawdatum}
                      width={width}
                      height={height}
                    />
                  ) : (
                    <img
                      className="disconnect"
                      src="/src/assets/disconnect.png"
                      alt=""
                    ></img>
                  ))}
                <div className="bt-box">
                  <div className="spec row">
                    <div className="mr high">
                      {/* <img src="/src/assets/mr-high.svg" alt="" /> */}
                      {/* <p>12%</p> */}
                    </div>
                    <div className="mr mid">
                      {/* <img src="/src/assets/mr-mid.svg" alt="" /> */}
                      {/* <p>28%</p> */}
                    </div>
                    <div className="mr low">
                      {/* <img src="/src/assets/mr-low.svg" alt="" /> */}
                      {/* <p>60%</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DemoSD;
