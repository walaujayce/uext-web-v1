import React, { useState, useEffect, useRef, useMemo } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";
import api from "../../api/apiClient";
import { useFloorSection } from "../../JS/FloorSectionContext";

const AddNewDevice = ({ callback }) => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  // Section 選項來源：/api/7284/IpAddress/all（透過 FloorSectionContext 的 servers）
  const { servers } = useFloorSection();

  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  {
    /* Handle Stage 1 Btn Logic */
  }
  const [isActive_Stage2, setActive_Stage2] = useState(false);
  const handleConfirm_S1_Click = () => {
    // 床號欄位已移除：devices.bed 由床位綁定流程寫入（見 WebAPI 的 DeviceBedSync），
    // 不由使用者手填。這裡只檢查 MAC。
    if (!macaddress) {
      setMacError(true); // Mac Input Required
      return;
    }
    handleSubmit(); //Submit POST Request
  };
  // 裝置種類欄位已移除：新增時一律以「未指定」(0) 寫入，
  // 實際型別由裝置連線後回報，或之後在裝置設定頁調整。
  {
    /* Section Dropdown Menu Logic */
  }
  const [isSectionActive, setSectionActive] = useState(false);
  const handleSectionDropDownMenu = () => {
    setSectionActive((prev) => !prev);
  };

  const [placeholderSection, setPlaceholderSection] = useState(""); // Input placeholder

  const handleSectionItemClick = (section) => {
    setPlaceholderSection(section);
    handleSectionDropDownMenu;
    setSection_POST(section);
  };

  {
    /* Section 選項：來自 /api/7284/IpAddress/all（去重後的清單） */
  }
  const sectionOptions = useMemo(
    () => [...new Set(servers.map((s) => s.section).filter(Boolean))],
    [servers],
  );

  // 初次載入 servers 後，帶入預設的第一個 section（只觸發一次）
  const didInitSection = useRef(false);
  useEffect(() => {
    if (!didInitSection.current && servers.length > 0) {
      didInitSection.current = true;
      const firstSection = sectionOptions[0] ?? "";
      setPlaceholderSection(firstSection);
      setSection_POST(firstSection);
    }
  }, [servers, sectionOptions]);
  {
    /* DHCP Dropdown Menu Logic */
  }
  {
    /* DHCP / Static IP 的下拉目前沒有顯示在畫面上（原本只在 HaLow-R 機種才出現，
       而 HaLow-R 已不在裝置種類選項內）。state 與 handler 保留，
       dhcp 仍會以預設值 true 送出，日後要把欄位加回來時可以直接沿用。 */
  }
  const [isDhcpActive, setDhcpActive] = useState(false);
  const handleDhcpDropDownMenu = () => {
    setDhcpActive((prev) => !prev);
  };

  const [placeholderDhcp, setPlaceholderDhcp] = useState("DHCP"); // Input placeholder

  const handleDhcpItemClick = (dhcp) => {
    setPlaceholderDhcp(dhcp);
    handleDhcpDropDownMenu;
    if(dhcp === "DHCP"){
      setIpAddressInputBoxDisabled(true);
      setIpAddress_POST("");
      setDhcp_POST(true);
    }else{
      setIpAddressInputBoxDisabled(false);
      setDhcp_POST(false);
    }
  };
  {
    /* useRef Logic */
  }

  const dropdownRefs = useRef([]);

  const addDropdownRef = (el) => {
    if (el && !dropdownRefs.current.includes(el)) {
      dropdownRefs.current.push(el);
    }
  };
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRefs.current.every((ref) => ref && !ref.contains(event.target))
      ) {
        // Close all dropdowns or handle logic here
        setSectionActive(false);
        setDhcpActive(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

  const dropdownDhcpStyleRef = useRef(null);

  useDynamicDropdownHeight(dropdownDhcpStyleRef, isDhcpActive);

  {
    /* handle input error logic */
  }
  const [macError, setMacError] = useState(false);
  const [ipError, setIpError] = useState(false);
  {
    /* handle input box disable */
  }
  const [isIpAddressInputBoxDisabled, setIpAddressInputBoxDisabled] =
    useState(true);
  {
    /* handle submit logic */
  }
  // 裝置種類欄位已移除，一律以「未指定」寫入
  const devicetype = 0;
  const [deviceid, setDeviceId_POST] = useState("");
  const [macaddress, setMacAddress_POST] = useState("");
  const [ipaddress, setIpAddress_POST] = useState("");
  const [dhcp, setDhcp_POST] = useState(true);
  const [section, setSection_POST] = useState(placeholderSection);

  const handleSubmit = async () => {
    const requestBody = {
      devicetype,
      macaddress,
      dhcp,
      ipaddress,
      // 床號一律為 null：裝置綁定到床位時，後端才會把床號寫進來
      bed: null,
      section,
      used: true,
      jlog:{}
    };

    try {
      setLoading(true);
      // const response = await fetch("/api/7284/db/Device", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(requestBody),
      // });
      // 把裝置新增到「所選 section 對應的那台後端」（一個 section 唯一對應一台）
      const postIp = servers.find((s) => s.section === section)?.ip ?? null;
      const response = await api.post(
        "/api/7284/db/Device",
        requestBody,
        postIp ? { targetIp: postIp } : undefined,
      );

      //console.log("devicetype", devicetype);
      //console.log("macaddress", macaddress);
      //console.log("dhcp", dhcp);
      //console.log("ipaddress", ipaddress);
      //console.log("section", section);

      if (response.status === 200) {
        setActive_Stage2(true);
      } else {
        const errorData = response.data;
        alert(`Error: ${errorData.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert("Error: Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />

      <div
        className="addDevice"
        style={{ display: "block" }}
        onClick={handleWindowClick}
      >
        <div
          className="window"
          style={{ justifyContent: isActive_Stage2 ? "center" : "" }}
        >
          <a onClick={callback}>
            <img
              src="/src/assets/close.svg"
              alt="close icon"
              className="close"
            />
          </a>
          <img
            src={`${isActive_Stage2 ? "/src/assets/link-active.svg" : ""}`}
            alt=""
            className="icon"
            style={{ display: isActive_Stage2 ? "block" : "none" }}
          />
          <div className="title">{`${
            isActive_Stage2
              ? t("AddDeviceModal.NewDeviceAdd")
              : t("AddDeviceModal.AddDevice")
          }`}</div>
          <div
            className="tab-list"
            style={{ display: isActive_Stage2 ? "none" : "" }}
          >
            <a href="#" className="tab active tab-1">
              {t("AddDeviceModal.DeviceProfile")}
            </a>
            {/* <a href="#" className="tab tab-2">Device Connection</a> */}
          </div>
          {/* Device Profile */}
          <form action="POST">
            <div
              className="grid st3 active"
              style={{ display: isActive_Stage2 ? "none" : "" }}
            >
              {/* MAC */}
              <div className="input g-c-3">
                <label htmlFor="macaddress" className="label-container">
                  <p>{t("AddDeviceModal.MACAddress")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="macaddress"
                    placeholder="Enter here"
                    required
                    maxLength={12}
                    value={macaddress}
                    onChange={(e) => setMacAddress_POST(e.target.value)}
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text ${ipError ? "active" : ""} `}>
                  Invalid format.
                </div>
              </div>
              {/* Section */}
              <div
                className="input suffix g-c-3"
                onClick={handleSectionDropDownMenu}
                ref={addDropdownRef}
              >
                <label htmlFor="sectionInNewDevice" className="label-container">
                  <p>{t("AddDeviceModal.Section")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="sectionInNewDevice"
                    placeholder={placeholderSection}
                    readOnly
                  />
                  <img
                    className="suffix active"
                    src="/src/assets/menu-down.svg"
                    alt="dropdown icon"
                  />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className={`list ${isSectionActive ? "active" : ""}`}>
                  {sectionOptions.map((section) => (
                    <div
                      className="item"
                      key={section}
                      onClick={() => handleSectionItemClick(section)}
                    >
                      {section}
                    </div>
                  ))}
                </div>
              </div>              
            </div>
            <div
              className="btn-gp st1 active"
              style={{ display: isActive_Stage2 ? "none" : "" }}
              onClick={handleConfirm_S1_Click}
            >
              <div className="btn text-only pri">
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">
                  {t("AddDeviceModal.Continue")}
                </p>
              </div>
            </div>
          </form>
          {/* Connecting */}
          <div className="connecting">
            <img src="/src/assets/connecting.gif" alt="connecting" />
            <p>Connecting...</p>
          </div>
          {/* Successful / Link to Patient */}
          <div className={`btn-gp st2 ${isActive_Stage2 ? "active" : ""}`}>
            <a className="btn text-only pri" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">Okay</p>
            </a>
            {/* <div className="btn text-only outline sec">
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">Link device to a patient</p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewDevice;
