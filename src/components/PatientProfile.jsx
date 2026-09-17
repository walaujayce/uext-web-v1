import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DisChargePatient from "./Modals/DisChargePatient";
import UnbindDevice from "./Modals/UnbindDevice";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";
import CalibrationConfirmOverlay from "./Modals/CalibrationConfirmOverlay";
import { useFloorSection } from "../JS/FloorSectionContext";
import api from "../api/apiClient"
import api8031 from "../api/apiClient8031";

function PatientProfile() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    //console.log("Window width:", windowWidth);
    setWindowWidth(window.innerWidth);
  }, [window.innerWidth]);


  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const macaddress = searchParams.get("macaddress") || "";
  // 首頁 / 住民列表點進來時會把床位上指派的住民編號帶在網址上，
  // 有帶就直接用 GET /db/Patient/{patientid} 取單筆資料。
  const patientIdParam = searchParams.get("patientid") || "";

  // 這頁該打哪台後端：All 模式用網址帶進來的 ?ip=（該裝置所屬 server）；
  // 單一模式用目前選取的 server。重整時 selectedServer 一開始為 null（servers 非同步載入），
  // 所以底下 fetch 會等 targetIp 有值再抓、並在它出現後自動重抓，避免打到預設台而抓不到。
  const { selectedServer } = useFloorSection();
  const ipParam = searchParams.get("ip");
  const targetIp = ipParam ?? selectedServer?.ip ?? null;

  {
    /* SEX  */
  }
  const [isSexActive, setSexActive] = useState(false);
  const handleSexDropdown = () => {
    setSexActive((prev) => !prev);
  };
  const SEX = ["Female", "Male"];
  const [placeholderSex, setPlaceholderSex] = useState(SEX[0]); // Input placeholder
  const handleSexItemClick = (sex) => {
    setPlaceholderSex(sex);
    handleSexDropdown;
    setIsChanged(true);
  };
  {
    /* Handle Item Select */
  }
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSexActive(false);
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

  const dropdownSexStyleRef = useRef(null);

  useDynamicDropdownHeight(dropdownSexStyleRef, isSexActive);

  {
    /* Handle Calender Logic */
  }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsChanged(date?.toISOString() !== selectedDate?.toISOString());
  };
  /// useSetInfoToInput Function ///
  const [isChanged, setIsChanged] = useState(false); // Track changes to enable SAVE button

  function useSetInfoToInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setIsChanged(e.target.value !== initialPlaceHolder);
    };

    return {
      inputValue,
      handleInputChange,
      setInputValue,
    };
  }
  {
    /* GET PATIENT INFO API */
  }
  const patientIDInput = useSetInfoToInput("");
  const patientNameInput = useSetInfoToInput("");
  // const patientSexInput = useSetInfoToInput("");
  // const patientDOBInput = useSetInfoToInput("");
  const patientHeightInput = useSetInfoToInput("");
  const patientWeightInput = useSetInfoToInput("");
  const patientBedInput = useSetInfoToInput("");
  const patientSectionInput = useSetInfoToInput("");

  const [patient, setPatient] = useState([]);
  // 住民下拉的選項來源（整份住民清單）
  const [patients, setPatients] = useState([]);
  // 這台裝置目前綁在哪張床（BedController）。床位是住民與裝置的關聯來源，
  // 床號 / 區域也以床位資料為準。
  const [bed, setBed] = useState(null);

  const fetchPatientProfile = async () => {
    try {
      // const response = await fetch(`/api/7284/db/Patient`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // const contentType = response.headers.get("Content-Type");
      // if (!response.ok || !contentType?.includes("application/json")) {
      //   throw new Error(`Expected JSON, got: ${contentType}`);
      // }

      // const data = await response.json();
      const cfg = targetIp ? { targetIp } : undefined;

      // 床位：床號 / 區域 / 移除裝置都會用到
      const bedPromise = api
        .get(`/api/7284/db/Bed?deviceId=${encodeURIComponent(macaddress)}`, cfg)
        .catch((err) => {
          console.error("Error fetching bed by deviceId:", err.message);
          return null;
        });

      // 住民清單：住民編號下拉的選項，另外也是沒帶 patientid 時的比對來源
      const listPromise = api
        .get(`/api/7284/db/Patient`, cfg)
        .catch((err) => {
          console.error("Error fetching patient list:", err.message);
          return null;
        });

      // 網址帶了 patientid → 直接查單筆
      const patientPromise = patientIdParam
        ? api
            .get(
              `/api/7284/db/Patient/${encodeURIComponent(patientIdParam)}`,
              cfg,
            )
            .catch((err) => {
              console.error("Error fetching patient:", err.message);
              return null;
            })
        : Promise.resolve(null);

      const [bedRes, listRes, patientRes] = await Promise.all([
        bedPromise,
        listPromise,
        patientPromise,
      ]);

      const patientList = Array.isArray(listRes?.data) ? listRes.data : [];
      setPatients(patientList);

      const matchingBed = (bedRes?.data || [])[0] ?? null;
      setBed(matchingBed);

      let matchingPatient = null;

      if (patientIdParam) {
        // 查無此住民時後端是回 200 + { code: -1, message }，不是 404，要自己判斷
        const one = patientRes?.data;
        if (one && one.code === undefined && one.patientid) {
          matchingPatient = one;
        }
      } else {
        // 相容舊進入點（網址沒帶 patientid）：
        //   1. 這台裝置所綁床位上指派的住民（bed.patientId）
        //   2. 住民資料自己帶的 deviceid（床位表還沒建立時的舊資料）
        matchingPatient =
          (matchingBed?.patientId &&
            patientList.find(
              (item) => item.patientid === matchingBed.patientId,
            )) ||
          patientList.find((item) => item.deviceid === macaddress) ||
          null;
      }

      matchingPatient = matchingPatient || {
        patientname: "",
        patientid: "",
        sex: "",
        birthday: "1999-01-01T00:00:00",
        height: "",
        weight: "",
        bed: "",
        section: "",
        deviceid: "",
        devicestatus: "",
      };

      setPatient(matchingPatient);
      //console.log("patient detail is ", matchingPatient);

      patientIDInput.setInputValue(matchingPatient.patientid);
      patientNameInput.setInputValue(matchingPatient.patientname);
      setPlaceholderSex(
        matchingPatient.sex === "" || matchingPatient.sex === null
          ? ""
          : matchingPatient.sex === 0
          ? SEX[0]
          : SEX[1]
      );
      setSelectedDate(
        matchingPatient.birthday
          ? new Date(matchingPatient.birthday)
          : new Date(),
      );
      patientHeightInput.setInputValue(matchingPatient.height);
      patientWeightInput.setInputValue(matchingPatient.weight);
      // 床號 / 區域以床位表為準，沒有床位資料才退回住民 DTO 帶的值
      patientBedInput.setInputValue(matchingBed?.bedId || matchingPatient.bed || "");
      patientSectionInput.setInputValue(
        matchingBed?.section || matchingPatient.section || "",
      );
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    if (!targetIp) return; // 還不知道要打哪台 → 等 targetIp 出現再抓
    fetchPatientProfile();
  }, [targetIp, macaddress, patientIdParam]);

  {
    /* 住民編號下拉：可以從既有住民挑一位綁到這張床，
       也可以直接打一個不存在的編號 + 填其他欄位，儲存時新增住民。 */
  }
  const [isPatientListActive, setPatientListActive] = useState(false);
  const patientDropdownRef = useRef(null);
  const dropdownPatientStyleRef = useRef(null);

  useDynamicDropdownHeight(dropdownPatientStyleRef, isPatientListActive);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(event.target)
      ) {
        setPatientListActive(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // 依已輸入的字串過濾選項，方便從一長串住民裡找人
  const patientOptions = patients.filter((p) => {
    const keyword = (patientIDInput.inputValue || "").trim().toLowerCase();
    if (!keyword) return true;
    return (
      String(p.patientid || "").toLowerCase().includes(keyword) ||
      String(p.patientname || "").toLowerCase().includes(keyword)
    );
  });

  // 目前輸入的編號在住民清單裡找不到 → 儲存時會新增住民
  const typedPatientId = (patientIDInput.inputValue || "").trim();
  const isNewPatient =
    typedPatientId !== "" &&
    !patients.some((p) => p.patientid === typedPatientId);

  const handlePatientIdChange = (e) => {
    patientIDInput.setInputValue(e.target.value);
    setPatientListActive(true);
    setIsChanged(true);
  };

  // 從下拉選一位既有住民 → 其他欄位一併帶入
  const handlePatientItemClick = (p) => {
    patientIDInput.setInputValue(p.patientid ?? "");
    patientNameInput.setInputValue(p.patientname ?? "");
    setPlaceholderSex(p.sex === 1 ? SEX[1] : SEX[0]);
    setSelectedDate(p.birthday ? new Date(p.birthday) : new Date());
    patientHeightInput.setInputValue(p.height ?? "");
    patientWeightInput.setInputValue(p.weight ?? "");
    setPatientListActive(false);
    setIsChanged(true);
  };

  const formatDOB = (birthday) => {
    if (!birthday) {
      return "";
    }
    return birthday.split("T")[0];
  };
  {
    /* 儲存：既有住民 → 更新資料；新編號 → 新增住民。兩者最後都指派到這張床 */
  }
  const handleSave = async () => {
    const pid = (patientIDInput.inputValue || "").trim();
    if (!pid) {
      alert(t("PatientProfile.PatientIDRequired"));
      return;
    }
    if (!(patientNameInput.inputValue || "").trim()) {
      alert(t("PatientProfile.PatientNameRequired"));
      return;
    }

    const cfg = targetIp ? { targetIp } : undefined;
    const profile = {
      patientname: patientNameInput.inputValue,
      sex: placeholderSex === SEX[0] ? 0 : 1,
      birthday: format(selectedDate, "yyyy-MM-dd"),
      height: parseInt(patientHeightInput.inputValue, 10) || 0,
      weight: parseInt(patientWeightInput.inputValue, 10) || 0,
      deviceid: macaddress,
    };

    try {
      setLoading(true);

      if (isNewPatient) {
        // 清單裡沒有這個編號 → 新增住民
        await api.post(
          `/api/7284/db/Patient`,
          { ...profile, patientid: pid, jlog: {} },
          cfg,
        );
      } else {
        // 既有住民 → 更新資料。
        // 注意：後端只有在真的有欄位變動時才回 code 0（SaveChanges > 0），
        // 只換綁定、沒改資料的情況會回非 0，那不算失敗，所以不在這裡擋。
        await api.put(`/api/7284/db/Patient/${pid}`, profile, cfg);
      }

      // 指派到這張床（床位是住民與裝置的關聯來源）
      if (bed && bed.patientId !== pid) {
        await api.put(
          `/api/7284/db/Bed/${bed.bedId}/patient`,
          { patientId: pid },
          cfg,
        );
      }

      setIsChanged(false);
      alert(t("PatientProfile.SaveSuccess"));

      // 網址上的 patientid 換成剛存好的那位，並重新載入這頁資料
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("patientid", pid);
      setSearchParams(nextParams, { replace: true });
      fetchPatientProfile();
    } catch (error) {
      console.error("Error saving patient:", error);
      alert(
        `Error: ${
          error.response?.data?.message || "Unable to connect to the server."
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  {
    /* Discharge Patient Button */
  }
  const [isDischargeOverlayVisible, setDischargeOverlayVisible] =
    useState(false);
  const handleDisChargeOverlay = () => {
    setDischargeOverlayVisible(!isDischargeOverlayVisible);
  };

  {
    /* 住民出院：
         1. 先解除床位綁定 —— bed.patient_id 參照 patient，不先解除就直接刪住民
            會踩到外鍵限制。連同裝置一起解除（沒有住民就不該留著裝置）。
            用 PUT 一次寫完，只需要 Roles.User 權限，也不會動到護理人員。
         2. 刪掉該住民的警示設定
         3. 刪掉住民本身
       原本這三步是兩支沒有 await 的函式各自併發跑，順序無法保證。 */
  }
  const handleDischargePatient = async () => {
    const patientId = patient?.patientid;
    if (!patientId) {
      setDischargeOverlayVisible(false);
      return;
    }

    const cfg = targetIp ? { targetIp } : undefined;

    try {
      setLoading(true);

      // 這頁的 bed 是用 deviceId 查到的；沒有綁裝置時查不到，改用住民編號再查一次
      let targetBed = bed;
      if (!targetBed) {
        const bedRes = await api
          .get(
            `/api/7284/db/Bed?patientId=${encodeURIComponent(patientId)}`,
            cfg,
          )
          .catch((err) => {
            console.error("Error fetching bed by patientId:", err.message);
            return null;
          });
        targetBed = (bedRes?.data || [])[0] ?? null;
      }

      if (targetBed) {
        await api.put(
          `/api/7284/db/Bed/${targetBed.bedId}`,
          {
            bedId: targetBed.bedId,
            section: targetBed.section || null,
            patientId: null,
            deviceId: null,
            nurseId: targetBed.nurseId || null,
          },
          cfg,
        );
      }

      // 警示設定沒有不算錯，失敗只記錄不中斷
      await api
        .delete(`/api/7284/db/Alert/${patientId}`, cfg)
        .catch((err) => console.error("Error deleting alert:", err.message));

      await api.delete(`/api/7284/db/Patient/${patientId}`, cfg);

      setDischargeOverlayVisible(false);
      alert(t("PatientProfile.DischargeSuccess"));
      navigate("/home");
    } catch (error) {
      console.error("Error discharging patient:", error);
      alert(
        `Error: ${
          error.response?.data?.message || "Unable to connect to the server."
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  {
    /* Remove Device Button：解除這張床位與目前裝置的綁定
       先用 GET /db/Bed?deviceId=xxx 找出是哪張床，再打
       DELETE /db/Bed/{bedId}/device（BedController 的 UnassignDevice）。
       只解除綁定，不會動到床位本身或住民資料。 */
  }
  const [isUnbindOverlayVisible, setUnbindOverlayVisible] = useState(false);
  const handleUnbindOverlay = () => {
    setUnbindOverlayVisible((prev) => !prev);
  };

  const handleUnbindDevice = async () => {
    const cfg = targetIp ? { targetIp } : undefined;
    try {
      setLoading(true);

      // 進頁面時已經查過這台裝置綁在哪張床，沒有的話再查一次（避免剛好還沒回來）
      let targetBed = bed;
      if (!targetBed) {
        const bedRes = await api.get(
          `/api/7284/db/Bed?deviceId=${encodeURIComponent(macaddress)}`,
          cfg,
        );
        targetBed = (bedRes.data || [])[0];
      }

      if (!targetBed) {
        alert(t("UnbindDeviceModal.NotBound"));
        setUnbindOverlayVisible(false);
        return;
      }

      // DELETE 需要 engineer 以上權限，權限不足時後端會回 401/403
      await api.delete(`/api/7284/db/Bed/${targetBed.bedId}/device`, cfg);

      // 裝置資料表自己也有 bed / section 兩欄，解除綁定時要一起清掉。
      // PUT /db/Device/{id} 是整筆覆寫，所以先讀回現值、只改這兩欄再送。
      // 需要 Roles.Engineer，失敗只記錄不中斷（床位那邊已經解除成功了）。
      try {
        const devRes = await api.get(
          `/api/7284/db/Device/${encodeURIComponent(macaddress)}`,
          cfg,
        );
        const current = devRes.data;
        // 查無裝置時後端是回 200 + { code: -1 }，要自己判斷
        if (current && current.code === undefined && current.deviceid) {
          const { deviceid, updatedat, ping, rssi, ...rest } = current;
          await api.put(
            `/api/7284/db/Device/${macaddress}`,
            { ...rest, bed: null, section: null },
            cfg,
          );
        }
      } catch (err) {
        console.error("Error clearing device bed/section:", err.message);
      }

      // 住民資料表也有一份 deviceid，一併清掉，否則兩邊會不一致
      //（其他頁面仍有用 patient.deviceid 反查裝置的地方）
      if (patient?.patientid) {
        await api
          .put(
            `/api/7284/db/Patient/${patient.patientid}`,
            {
              patientname: patient.patientname ?? "",
              sex: patient.sex ?? 0,
              birthday: patient.birthday
                ? format(new Date(patient.birthday), "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd"),
              height: patient.height ?? 0,
              weight: patient.weight ?? 0,
              deviceid: null,
            },
            cfg,
          )
          .catch((err) =>
            console.error("Error clearing patient deviceid:", err.message),
          );
      }

      setUnbindOverlayVisible(false);
      navigate("/home");
    } catch (error) {
      console.error("Error unbinding device:", error);
      alert(
        `Error: ${
          error.response?.data?.message || "Unable to connect to the server."
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const [isCalibrationOverlayVisible, setCalibrationOverlayVisible] =
    useState(false);
  const handleCalibrationOverlay = () => {
    setCalibrationOverlayVisible(!isCalibrationOverlayVisible);
  };

  // 只負責送出校正請求。
  // 15 秒的等待改由 CalibrationConfirmOverlay 自己倒數並顯示在同一個 modal 裡，
  // 所以這裡不再 setLoading(true)、不再關 modal、也不再用 setTimeout 排 reload。
  const handleCalibration = async () => {
    //console.log("calibration clicked");
    const requestBody = {
      MAC: macaddress,
    };
    try {
      // const response = await fetch("/api/8031/ucb/denoise", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(requestBody),
      // });
      const response = await api8031.post(
        "/api/8031/ucb/denoise",
        requestBody,
        targetIp ? { targetIp } : undefined,
      );
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert("Error: Unable to connect to the server.");
    }
  };

  // 倒數結束、使用者按下 modal 上最後那顆「確認」之後：關掉 modal 並重新載入，
  // 讓畫面拿到校正後的資料（沿用原本 15 秒後 reload 的行為）。
  const handleCalibrationFinish = () => {
    setCalibrationOverlayVisible(false);
    // window.location.reload();
  };

  return (
    <div className="pp">
      <h1 className="pp-title" style={{ zIndex: "1" }}>{t("PatientProfile.PatientProfile")}</h1>
      <div className="pfl">
        {/* Patient ID：可從既有住民挑一位綁到這張床，也可以直接輸入新的編號新增住民 */}
        <div
          className="input dropdown suffix g-c-6"
          ref={patientDropdownRef}
        >
          <label htmlFor="p-id" className="label-container">
            <p>{t("PatientProfile.PatientID")}</p>
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
              id="p-id"
              name="p-id"
              placeholder={t("PatientProfile.PatientIDPlaceholder")}
              value={patientIDInput.inputValue}
              onChange={handlePatientIdChange}
              onFocus={() => setPatientListActive(true)}
              autoComplete="off"
            />
            <img
              className="suffix active"
              src="/src/assets/menu-down.svg"
              alt="dropdown icon"
              onClick={() => setPatientListActive((prev) => !prev)}
            />
          </div>
          <div
            className={`assistive-text new-patient ${
              isNewPatient ? "active" : ""
            }`}
          >
            {t("PatientProfile.NewPatientHint")}
          </div>
          <div
            className={`list ${isPatientListActive ? "active" : ""}`}
            ref={dropdownPatientStyleRef}
          >
            {patientOptions.map((p) => (
              <div
                className="item"
                key={p.patientid}
                onClick={() => handlePatientItemClick(p)}
              >
                {p.patientname ? `${p.patientid}（${p.patientname}）` : p.patientid}
              </div>
            ))}
          </div>
        </div>
        {/* Patient Name */}
        <div className="input g-c-6">
          <label htmlFor="name" className="label-container">
            <p>{t("PatientProfile.PatientName")}</p>
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
              id="name"
              name="name"
              placeholder={patientNameInput.inputValue}
              value={patientNameInput.inputValue}
              onChange={patientNameInput.handleInputChange}
              required
              autoComplete="off"
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>

        {/* Sex */}
        <div
          className="input dropdown suffix g-c-3"
          onClick={handleSexDropdown}
          ref={dropdownRef}
        >
          <label htmlFor="sex" className="label-container">
            <p>{t("PatientProfile.Sex")}</p>
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
              id="sex"
              name="sex"
              placeholder={placeholderSex}
              readOnly
            />
          </div>
          <div
            className={`list ${isSexActive ? "active" : ""}`}
            ref={dropdownSexStyleRef}
          >
            {SEX.map((a) => (
              <div
                className="item"
                key={a}
                onClick={() => handleSexItemClick(a)}
              >
                {a}
              </div>
            ))}
          </div>
        </div>
        {/* Birthday Date */}
        <div className="g-c-3">
          <label htmlFor="arrival" className="label-container">
            <p>{t("PatientProfile.Birthday")}</p>
            <img
              className="info"
              src="/src/assets/information-outline.svg"
              alt="gray outline information icon"
            />
          </label>
          <div className="">
            <DatePicker
              dateFormat="yyyy/MM/dd"
              selected={selectedDate}
              onChange={handleDateSelect}
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Height */}
        <div className="input g-c-3">
          <label htmlFor="height" className="label-container">
            <p>{t("PatientProfile.Height")}</p>
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
              id="height"
              name="height"
              placeholder={patientHeightInput.inputValue}
              value={patientHeightInput.inputValue}
              onChange={patientHeightInput.handleInputChange}
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Weight */}
        <div className="input g-c-3">
          <label htmlFor="weight" className="label-container">
            <p>{t("PatientProfile.Weight")}</p>
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
              id="weight"
              name="weight"
              placeholder={patientWeightInput.inputValue}
              value={patientWeightInput.inputValue}
              onChange={patientWeightInput.handleInputChange}
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Bed */}
        <div className="input g-c-2">
          <label htmlFor="p-id" className="label-container">
            <p>{t("PatientProfile.Bed")}</p>
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
              id="p-id-bed"
              name="p-id"
              placeholder={patientBedInput.inputValue}
              readOnly
              style={{ cursor: "default" }}
              tabIndex="-1"
              onFocus={(e) => e.target.blur()}
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Section */}
        <div className="input g-c-2">
          <label htmlFor="section" className="label-container">
            <p>{t("PatientProfile.Section")}</p>
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
              id="section"
              name="section"
              placeholder={patientSectionInput.inputValue}
              readOnly
              style={{ cursor: "default" }}
              tabIndex="-1"
              onFocus={(e) => e.target.blur()}
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Device ID */}
        <div className="input g-c-3">
          <label htmlFor="d-id" className="label-container">
            <p>{t("PatientProfile.DeviceID")}</p>
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
              id="d-id"
              name="d-id"
              placeholder={macaddress}
              value={macaddress}
              readOnly
              style={{ cursor: "default" }}
              disabled
            />
            <img className="suffix" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">Oops! Something went wrong.</div>
        </div>
        {/* Connection Status */}
        <div className="input g-c-3 suffix">
          <label htmlFor="connection" className="label-container">
            <p>{t("PatientProfile.DeviceStatus")}</p>
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
              id="connection"
              name="connection"
              value={patient.devicestatus === 1 ? "Connected" : "Disconnect"}
              readOnly
              style={{ cursor: "default" }}
              disabled
            />
            <img className="suffix active" src="" alt="dropdown icon" />
          </div>
          <div className="assistive-text">click to reconnect</div>
        </div>
      </div>
      <div className="btn-gp">
        <SimpleBackdrop open={loading} />
        <div
          className={`btn text-only ${isChanged ? "" : "inactive"}`}
          onClick={() => {
            if (isChanged) {
              handleSave();
            }
          }}
          style={{ cursor: isChanged ? "pointer" : "default" }}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.Save")}</p>
        </div>
        <div
          className="btn text-only outline"
          id="discharge"
          onClick={handleDisChargeOverlay}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.Discharge")}</p>
          {isDischargeOverlayVisible && (
            <DisChargePatient
              callback={handleDisChargeOverlay}
              dischargebtn_click={handleDischargePatient}
            />
          )}
        </div>
        <div
          className="btn text-only outline"
          id="unbindDevice"
          onClick={handleUnbindOverlay}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.UnbindDevice")}</p>
          {isUnbindOverlayVisible && (
            <UnbindDevice
              callback={handleUnbindOverlay}
              unbindbtn_click={handleUnbindDevice}
            />
          )}
        </div>
              <div className="btn-gp calibration-display">
        <div
          className="btn text-only outline"
          id="calibration"
          onClick={handleCalibrationOverlay}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.Calibration")}</p>
        </div>
        {isCalibrationOverlayVisible && (
          <CalibrationConfirmOverlay
            callback={handleCalibrationOverlay}
            calibrationbtn_click={handleCalibration}
            onFinish={handleCalibrationFinish}
            countdownSeconds={15}
          />
        )}
      </div>
      </div>
      <div className="btn-gp calibration-display-below">
        <div
          className="btn text-only outline"
          id="calibration"
          onClick={handleCalibrationOverlay}
        >
          <img src="" alt="" className="prefix" />
          <p className="btn-text">{t("PatientProfile.Calibration")}</p>
        </div>
        {isCalibrationOverlayVisible && (
          <CalibrationConfirmOverlay
            callback={handleCalibrationOverlay}
            calibrationbtn_click={handleCalibration}
            onFinish={handleCalibrationFinish}
            countdownSeconds={15}
          />
        )}
      </div>
    </div>
  );
}

export default PatientProfile;
