import React, { useState,useEffect } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/patient.css";
import "/src/CSS/patient-custom.css";

function PatientAlerts() {

    {/* NOTIFICATION TIME RANGE ARRAY */} 
    const NotificationTimeRange = [
        { id: 1, label: "00 - 24" },
        { id: 2, label: "00 - 08" },
        { id: 3, label: "08 - 16" },
        { id: 4, label: "16 - 24" },
        { id: 5, label: "Custom" },
        ];

    const PositionStatus = [
        { id: 1, label: "Resting on the bed"},
        { id: 2, label: "Sitting on the bed" },
        { id: 3, label: "Sitting on the bed edge" },
        { id: 4, label: "Leaving out bed" },
        { id: 5, label: "Unusual condition" },
        { id: 6, label: "Lying/Curled up on left side" },
        { id: 7, label: "Lying/Curled up on right side" },
        ];
    {/* HANDLE CHECK BOX */} 
    // Notification
    const [selectedNotification, setSelectedNotification] = useState(null); // Track selected checkbox

    const handleNotificationCheckBox = (notification) => {
      setSelectedNotification((prev) => (prev === notification ? null : notification)); // Toggle the same option off, otherwise select
    };
    // Alert Repeat Time
    const [isARTChecked, setARTIsChecked] = useState(false);
    const handleARTCheckBox = () => {
        setARTIsChecked((prev) => !prev);
    };
    // Exit Bed Rate
    const [isEBRChecked, setEBRIsChecked] = useState(false);
    const handleEBRCheckBox = () => {
        setEBRIsChecked((prev) => !prev);
    };
    // Position
    const [selectedNotifications2, setSelectedNotifications2] = useState([]); // Track selected checkboxes

    const handleNotificationCheckBox2 = (notification) => {
      setSelectedNotifications2((prev) =>{
        if (!Array.isArray(prev)) prev = []; // Ensure state is always an array
      return prev.includes(notification)
        ? prev.filter((item) => item !== notification) // Deselect if already selected
        : [...prev, notification]; // Add to selected if not already selected
    });
  };
    // Respiraton and Heart Beat Rate
    const [isRnHBChecked1, setRnHBIsChecked1] = useState(false);
    const handleRnHBCheckBox1 = () => {
        setRnHBIsChecked1((prev) => !prev);
    };
    const [isRnHBChecked2, setRnHBIsChecked2] = useState(false);
    const handleRnHBCheckBox2 = () => {
        setRnHBIsChecked2((prev) => !prev);
    };
    const [isRnHBChecked3, setRnHBIsChecked3] = useState(false);
    const handleRnHBCheckBox3 = () => {
        setRnHBIsChecked3((prev) => !prev);
    };
    const [isRnHBChecked4, setRnHBIsChecked4] = useState(false);
    const handleRnHBCheckBox4 = () => {
        setRnHBIsChecked4((prev) => !prev);
    };

    {/* HANDLE TOGGLE BUTTON */}
    // Notification
    const [notificationToggleState, setNotificationToggleState] = useState(false);
    const handleNotificationToggle = () => {
        setNotificationToggleState((prev) => !prev);
        setSelectedNotification(() => false);
    };
    // Alert Repeat Time
    const [alertRepeatToggleState, setAlertRepeatToggleState] = useState(false);
    const handleAlertRepeatToggle = () => {
    setAlertRepeatToggleState((prev) => !prev);
    setARTIsChecked(()=>false);
    };
    // Exit Bed Rate
    const [exitBedRateToggleState, setExitBedRateToggleState] = useState(false);
    const handleExitBedRateToggle = () => {
    setExitBedRateToggleState((prev) => !prev);
    setEBRIsChecked(()=>false);
    setSensitivityDropDown(()=>false);
    setPlaceholder("None");
    };
    // Position
    const [positionToggleState, setPositionToggleState] = useState(false);
    const handlePositionToggle = () => {
        setPositionToggleState((prev) => !prev);
        setSelectedNotifications2((prev)=>false);
    };
    // Respiration and Heart Beat
    const [respHeartBeatToggleState, setRespHeartBeatToggleState] = useState(false);
    const handleRespHeartBeatToggle = () => {
    setRespHeartBeatToggleState((prev) => !prev);
    setRnHBIsChecked1(() => false); // Resp. Max
    setRnHBIsChecked2(() => false); // Resp. Min
    setRnHBIsChecked3(() => false); // Heart beat Max
    setRnHBIsChecked4(() => false); // Heart beat Min
    };

    {/* HANDLE DROP DOWN MENU */}
    const [isSensitivityDropDown, setSensitivityDropDown] = useState(false);
    const [placeholder, setPlaceholder] = useState("None"); // Input placeholder

    const handleSensitivityDropDown = () => {
      setSensitivityDropDown((prev) => !prev);
    };
    const handleItemClick = (sensitivity) => {
      setPlaceholder(sensitivity);
      handleSensitivityDropDown;
      console.log("the state is ", isSensitivityDropDown);
    };

return(
    <div className="alertSection">
        {/* Notification */}
        <div className="alertSetting">
            <div className="alertHead">
                <h1>Notification</h1>
                <div
                className={`toggle ${notificationToggleState ? "active" : ""}`}
                onClick={handleNotificationToggle}
                >
                <img
                    className="line"
                    src="/src/assets/toggle-line.svg"
                    alt="toggle button"
                />
                <img className="dot" src="/src/assets/toggle-dot.svg" alt="" />
                </div>
            </div>
            <div className="alertOpt">
                <p className="alertDesc">These are alerts for different valid times.</p>
                <div className="opt-list">
                <div className={`opt-grid ${notificationToggleState ? "active" : ""}`}>
                    {NotificationTimeRange.map((option) => (
                    <div key={option.id} className="opt-box">
                        <div
                        className={`opt ${option.id===5? "custom" : "duration"} ${
                            notificationToggleState ? "on" : ""
                        } ${selectedNotification === option.id ? "active" : ""}`}
                        >
                        <img src="/src/assets/checkbox-blank-outline.svg" alt="" onClick={() => handleNotificationCheckBox(option.id)}/>
                        <div className="desc-box">
                            <p>{option.label}</p>
                            {option.id === 5 && (
                            <div className="desc">
                                <div className="desc-input">
                                <input
                                    type="number"
                                    readOnly={selectedNotification !== option.id}
                                />
                                </div>
                                <p>to</p>
                                <div className="desc-input">
                                <input
                                    type="number"
                                    readOnly={selectedNotification !== option.id}
                                />
                                </div>
                            </div>
                            )}
                        </div>
                        </div>
                        <div className="assistive-text">This is a line of text</div>
                    </div>
                    ))}
                </div>
                <div className="btn-gp">
                    <div
                    className={`text-only btn ${
                        notificationToggleState ? "" : "inactive"
                    }`}
                    >
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">Save</p>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <div className="alertSetting">
            <div className="alertHead">
                <h1>Alert Repeat Times</h1>
                <div className={`toggle ${alertRepeatToggleState ? "active" : ""}`} onClick={handleAlertRepeatToggle} >
                    <img className="line" src="/src/assets/toggle-line.svg" alt="toggle button"/>
                    <img className="dot" src="/src/assets/toggle-dot.svg" alt=""/>
                </div>
            </div>
            <div className="alertOpt">
                <p className="alertDesc">These are alerts for different in-bed positions.</p>
                <div className="opt-list">
                    <div className={`opt-grid ${alertRepeatToggleState ? "active" : ""}`}>
                        <div className="opt-box">
                            <div className={`opt ${alertRepeatToggleState ? "on" : ""} ${alertRepeatToggleState ? "active" : ""} `}>
                                <img src="/src/assets/checkbox-blank-outline.svg" alt=""/>
                                <div className="desc-box">
                                    <p>Debounce</p>
                                    <div className="desc">
                                        <p>Limit alert repeat times in this time interval.</p>
                                        <div className="desc-input">
                                        <input type="number" readOnly={!alertRepeatToggleState} />                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="assistive-text">This is a line of text</div>
                        </div>
                    </div>
                    <div className="btn-gp">
                        <div className={`btn text-only ${alertRepeatToggleState ? "" : "inactive"}`}>
                            <img src="" alt="" className="prefix"/>
                            <p className="btn-text">Save</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="alertSetting">
            <div className="alertHead">
                <h1>Exit Bed Alerts</h1>
                <div className={`toggle ${exitBedRateToggleState ? "active" : ""}`} onClick={handleExitBedRateToggle} >
                    <img className="line" src="/src/assets/toggle-line.svg" alt="toggle button"/>
                    <img className="dot" src="/src/assets/toggle-dot.svg" alt=""/>
                </div>
            </div>
            <div className="alertOpt">
                <p className="alertDesc">These are alerts for different in-bed positions.</p>
                <div className="opt-list">
                    <div className={`opt-grid ${exitBedRateToggleState ? "active" : ""}`}>
                        <div className="opt-box">
                            <div className={`opt ${exitBedRateToggleState ? "on" : ""} ${exitBedRateToggleState ? "active" : ""} `}>
                                <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                                <div className="desc-box">
                                    <p>Sensitivity</p>
                                    <div className="desc">
                                        <p>Alert when exit rate exceeds a specific percentage.</p>
                                        <div className="input dropdown section suffix" onClick={handleSensitivityDropDown}>
                                            <div className="input-gp">
                                                <input type="text" className="placeholder" id="name" name="name" placeholder={placeholder} />
                                                <img className="suffix" src="" alt="dropdown icon"/>
                                            </div>
                                            <div className={`list ${isSensitivityDropDown ? "active" : ""}`}>
                                            <div className="item opt1" onClick={() => handleItemClick("None")}>
                                              None
                                            </div>
                                            <div className="item opt2" onClick={() => handleItemClick("Low")}>
                                              Low
                                            </div>
                                            <div className="item opt3" onClick={() => handleItemClick("Medium")}>
                                              Medium
                                            </div>
                                            <div className="item opt4" onClick={() => handleItemClick("High")}>
                                              High
                                            </div>
                                          </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="assistive-text">This is a line of text</div>
                        </div>
                    </div>
                    <div className="btn-gp">
                        <div className={`text-only btn ${exitBedRateToggleState ? "" : "inactive"}`}>
                            <img src="" alt="" className="prefix"/>
                            <p className="btn-text">Save</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="alertSetting">
            <div className="alertHead">
                <h1>Position Alerts</h1>
                <div className={`toggle ${positionToggleState ? "active" : ""}`} onClick={handlePositionToggle}>
                    <img className="line" src="/src/assets/toggle-line.svg" alt="toggle button"/>
                    <img className="dot" src="/src/assets/toggle-dot.svg" alt=""/>
                </div>
            </div>
            <div className="alertOpt">
                <p className="alertDesc">These are alerts for different in-bed positions.</p>
                <div className="opt-list">
                    <div className={`opt-grid ${positionToggleState ? "active" : ""}`}>
                        {PositionStatus.map((option)=>(
                        <div key={option.id} className="opt-box">
                            <div className={`opt ${
                                    positionToggleState ? "on" : ""
                                    } ${
                                        Array.isArray(selectedNotifications2) &&
                                        selectedNotifications2.includes(option.id)
                                          ? "active"
                                          : ""
                                      }`}>
                                <img src="/src/assets/checkbox-blank-outline.svg" alt="" onClick={() => handleNotificationCheckBox2(option.id)}/>
                                <div className="desc-box">
                                    <p>{option.label}</p>
                                    <div className="desc">
                                        <p>Alert when current position holding for a specific duration.</p>
                                        <div className="desc-input">
                                            <input type="number" readOnly={
                                              !(
                                                Array.isArray(selectedNotifications2) &&
                                                selectedNotifications2.includes(option.id)
                                              )
                                            }/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="assistive-text">This is a line of text</div>
                        </div>))}
                        
                    </div>
                    <div className="btn-gp">
                        <div className={`text-only btn ${positionToggleState ? "" : "inactive"}`}>
                            <img src="" alt="" className="prefix"/>
                            <p className="btn-text">Save</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="alertSetting">
            <div className="alertHead">
                <h1>Physiological Alerts</h1>
                <div className={`toggle ${respHeartBeatToggleState ? "active" : ""}`} onClick={handleRespHeartBeatToggle}>
                    <img className="line" src="/src/assets/toggle-line.svg" alt="toggle button"/>
                    <img className="dot" src="/src/assets/toggle-dot.svg" alt=""/>
                </div>
            </div>
            <div className="alertOpt">
                <p className="alertDesc">These are alerts for abnormal respiration & heartbeat.</p>
                <div className="opt-list">
                    <div className={`opt-grid2 ${respHeartBeatToggleState ? "active" : ""}`}>
                        <div className="opt-box">
                            <div className={`opt ${respHeartBeatToggleState ? "on" : ""} ${isRnHBChecked1 ? "active" : ""} `}>
                                <img src="/src/assets/checkbox-blank-outline.svg" alt="" onClick={handleRnHBCheckBox1}/>
                                <div className="desc-box">
                                    <p>Respiration Rate</p>
                                    <div className="desc">
                                        <p>Control highest & lowest limit of respiration rate.</p>
                                        <div className="desc-input rpm max">
                                        <input type="number" readOnly={!isRnHBChecked1} />                                            
                                        </div>
                                        <div className="desc-input rpm min">
                                        <input type="number" readOnly={!isRnHBChecked1} />                                            
                                        </div>
                                    </div>
                                  </div>
                              </div>
                          </div>
                    </div>
                    <div className={`opt-grid2 ${respHeartBeatToggleState ? "active" : ""}`}>
                        <div className="opt-box">
                            <div className={`opt ${respHeartBeatToggleState ? "on" : ""} ${isRnHBChecked2 ? "active" : ""} `}>
                                <img src="/src/assets/checkbox-blank-outline.svg" alt="" onClick={handleRnHBCheckBox2}/>
                                <div className="desc-box">
                                    <p>Heartbeat Rate</p>
                                    <div className="desc">
                                        <p>Control highest & lowest limit of heartbeat rate.</p>
                                        <div className="desc-input rpm max">
                                        <input type="number" readOnly={!isRnHBChecked2} />                                            
                                        </div>
                                        <div className="desc-input rpm min">
                                        <input type="number" readOnly={!isRnHBChecked2} />                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="assistive-text">This is a line of text</div>
                        </div>
                    </div>
                    <div className="btn-gp">
                        <div className={`btn text-only ${respHeartBeatToggleState ? "" : "inactive"}`}>
                            <img src="" alt="" className="prefix"/>
                            <p className="btn-text">Save</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default PatientAlerts;