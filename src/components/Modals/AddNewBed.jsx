import React, { useState, useEffect, useRef, useMemo } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/bed.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";
import api from "../../api/apiClient";
import { useFloorSection } from "../../JS/FloorSectionContext";

// ─────────────────────────────────────────────────────────────
// 下拉選單欄位（樣式與 AddNewDevice.jsx 的 .input.dropdown 完全一致）
// options 形式：[{ value, label }]，value 為實際要送出的值。
// 元件定義在模組層級，避免每次 render 產生新的 component type 造成重新掛載。
// ─────────────────────────────────────────────────────────────
const SelectField = ({
  id,
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled,
  error,
  errorText,
}) => {
  const [isActive, setActive] = useState(false);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  // 點到元件外面就收合
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // 展開時依項目數量算出高度（與其他頁面的下拉一致）
  useEffect(() => {
    if (!listRef.current) return;
    if (isActive) {
      const items = listRef.current.querySelectorAll(".item");
      const totalHeight = Array.from(items).reduce(
        (acc, item) => acc + item.offsetHeight,
        0,
      );
      listRef.current.style.height = `${totalHeight}px`;
    } else {
      listRef.current.style.height = "0px";
    }
  }, [isActive, options]);

  return (
    <div
      className={`input dropdown suffix ${disabled ? "is-disabled" : ""}`}
      onClick={() => {
        if (!disabled) setActive((prev) => !prev);
      }}
      ref={rootRef}
    >
      <label htmlFor={id} className="label-container">
        <p>{label}</p>
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
          id={id}
          name={id}
          placeholder={selected ? selected.label : placeholder}
          readOnly
          disabled={disabled}
        />
        <img
          className="suffix active"
          src="/src/assets/menu-down.svg"
          alt="dropdown icon"
        />
      </div>
      <div className={`assistive-text ${error ? "active" : ""}`}>
        {errorText}
      </div>
      <div
        className={`list ${isActive && !disabled ? "active" : ""}`}
        ref={listRef}
      >
        {options.map((opt) => (
          <div
            className="item"
            key={opt.value || "__none__"}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// 純文字欄位（樣式與其他頁面的 .input 一致）
const TextField = ({ id, label, value, onChange, maxLength, disabled, error, errorText }) => (
  <div className="input">
    <label htmlFor={id} className="label-container">
      <p>{label}</p>
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
        id={id}
        name={id}
        placeholder="Enter here"
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
      <img className="suffix" src="" alt="" />
    </div>
    <div className={`assistive-text ${error ? "active" : ""}`}>{errorText}</div>
  </div>
);

// 新增／編輯床位 Modal（外框版型參考 AddNewDevice.jsx）
//
//   不帶 bed  → 新增模式：POST /db/Bed
//   帶  bed  → 編輯模式：PUT /db/Bed/{bedId}，並可「住民出院」或刪除床位
//              （刪除床位時，床上的住民資料也會一併刪除）
//
// 版面：
//   床位編號 / 區域 —— 一定顯示（區域選項來自 FloorSectionContext，非資料庫查詢）
//   住民與指派      —— 選填，預設收合顯示「未指派」，展開後才填
//                     （住民編號 / 姓名 / 身高 / 體重 / 生日 / 性別 / 裝置 / 護理人員）
//
// 綁定規則：
//   1. 床位一定要先有住民，才能綁定裝置（沒填住民編號時裝置下拉是鎖住的）
//   2. 新增住民時裝置非必填；若這張床有綁裝置，POST /db/Patient 會把它一併
//      寫進 patient 的 deviceid
//
// 綁定／解除裝置時，裝置資料表的 bed / section 兩欄會同步維護（見 syncDeviceBed）。
//
// 資料庫查詢只有兩處：裝置下拉（依區域抓裝置清單 + 排除已被別張床綁走的），
// 以及編輯模式載入已綁定住民的資料。其餘欄位一律手動輸入。
// 樣式全部寫在 /src/CSS/bed.css，不使用 inline style。
const AddNewBed = ({ callback, onCreated, bed = null }) => {
  const { t } = useTranslation();

  const isEdit = Boolean(bed);

  const [loading, setLoading] = useState(false); // loading screen

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
    /* 一定顯示的欄位 */
  }
  const [bedId, setBedId_POST] = useState(bed?.bedId ?? "");
  const [section, setSection_POST] = useState(bed?.section ?? "");

  {
    /* 選填欄位（住民與指派） */
  }
  const [patientId, setPatientId_POST] = useState(bed?.patientId ?? "");
  const [patientName, setPatientName_POST] = useState("");
  const [height, setHeight_POST] = useState("");
  const [weight, setWeight_POST] = useState("");
  const [sex, setSex_POST] = useState(0);
  const [birthday, setBirthday] = useState(new Date());
  const [deviceId, setDeviceId_POST] = useState(bed?.deviceId ?? "");
  const [nurseId, setNurseId_POST] = useState(bed?.nurseId ?? "");

  // 編輯模式下這張床本來就有指派 → 一進來就展開，讓使用者直接看到現有內容
  const [isOptionalOpen, setOptionalOpen] = useState(
    Boolean(bed?.patientId || bed?.deviceId || bed?.nurseId),
  );

  const [bedIdError, setBedIdError] = useState(false);
  // 裝置欄位的錯誤：沒住民卻選了裝置
  const [deviceError, setDeviceError] = useState("");
  // 二次確認的用途：null = 沒有、"delete" = 刪除床位、"discharge" = 住民出院
  const [confirmMode, setConfirmMode] = useState(null);
  // null = 還在填表；其餘為完成後要顯示的訊息 key
  const [doneMessage, setDoneMessage] = useState(null);

  {
    /* Section 選項 */
  }
  const sectionOptions = useMemo(
    () => [...new Set(servers.map((s) => s.section).filter(Boolean))],
    [servers],
  );

  const sectionSelectOptions = useMemo(
    () => sectionOptions.map((s) => ({ value: s, label: s })),
    [sectionOptions],
  );

  // 新增模式：初次載入 servers 後帶入預設的第一個 section（只觸發一次）
  const didInitSection = useRef(false);
  useEffect(() => {
    if (isEdit) return;
    if (!didInitSection.current && servers.length > 0) {
      didInitSection.current = true;
      setSection_POST(sectionOptions[0] ?? "");
    }
  }, [isEdit, servers, sectionOptions]);

  // 要打哪一台後端：
  //   新增 → 由選取的 section 決定（一個 section 唯一對應一台）
  //   編輯 → 固定用這筆床位的來源後端，section 只是一個欄位
  const targetIp = useMemo(() => {
    if (isEdit) return bed.__srcIp ?? null;
    return servers.find((s) => s.section === section)?.ip ?? null;
  }, [isEdit, bed, servers, section]);

  const cfg = targetIp ? { targetIp } : undefined;

  {
    /* 裝置下拉的選項：依「區域」決定要抓哪一台後端的裝置清單。
       一個 section 唯一對應一台後端，所以換區域就重抓。
       住民資料仍維持手動輸入，不撈資料庫。 */
  }
  const [devices, setDevices] = useState([]);
  // 已經被其他床位綁走的裝置（bed 表對 device_id 有唯一鍵，選了也會被擋）
  const [takenDeviceIds, setTakenDeviceIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const cfgLocal = targetIp ? { targetIp } : undefined;

    const fetchDevices = async () => {
      const [deviceRes, bedRes] = await Promise.all([
        api.get("/api/7284/db/Device", cfgLocal).catch((err) => {
          console.error("Error fetching device list:", err.message);
          return null;
        }),
        api.get("/api/7284/db/Bed", cfgLocal).catch((err) => {
          console.error("Error fetching bed list:", err.message);
          return null;
        }),
      ]);
      if (cancelled) return;

      setDevices(Array.isArray(deviceRes?.data) ? deviceRes.data : []);

      // 編輯模式下，這張床自己綁的裝置不算「被佔用」，否則會從選單裡消失
      const beds = (Array.isArray(bedRes?.data) ? bedRes.data : []).filter(
        (b) => !isEdit || b.bedId !== bed.bedId,
      );
      setTakenDeviceIds(beds.map((b) => b.deviceId).filter(Boolean));
    };

    fetchDevices();
    // 切換區域時，前一次還在飛的請求可能比新的晚回來 → 用旗標丟棄過期結果
    return () => {
      cancelled = true;
    };
  }, [targetIp, isEdit, bed]);

  // 顯示這個區域、且尚未被其他床位綁定的裝置：
  //   - 裝置自己標了 section 就比對，沒標的（尚未歸屬）也一併列出
  //   - 已被別張床綁走的一律排除
  const deviceSelectOptions = useMemo(() => {
    const list = devices
      .filter((d) => !d.section || !section || d.section === section)
      .filter((d) => !takenDeviceIds.includes(d.deviceid))
      .map((d) => ({ value: d.deviceid, label: d.deviceid }));

    // 編輯模式下，目前綁定的裝置若不在清單裡（例如區域被改過），仍要顯示出來
    if (deviceId && !list.some((o) => o.value === deviceId)) {
      list.unshift({ value: deviceId, label: deviceId });
    }

    return [{ value: "", label: t("AddBedModal.Unassigned") }, ...list];
  }, [devices, takenDeviceIds, section, deviceId, t]);

  // useMemo：options 是 SelectField 的 effect 依賴，每次 render 產生新陣列會讓它空轉
  const sexOptions = useMemo(
    () => [
      { value: 0, label: t("AddBedModal.Female") },
      { value: 1, label: t("AddBedModal.Male") },
    ],
    [t],
  );

  {
    /* 編輯模式：這張床已經綁了住民 → 把該住民的姓名／身高／體重／性別／生日載進來，
       使用者才看得到現有資料，也才能直接修改。 */
  }
  useEffect(() => {
    if (!isEdit || !bed?.patientId) return;
    let cancelled = false;

    const fetchPatient = async () => {
      try {
        const res = await api.get(
          `/api/7284/db/Patient/${encodeURIComponent(bed.patientId)}`,
          targetIp ? { targetIp } : undefined,
        );
        // 查無此住民時後端是回 200 + { code: -1, message }，不是 404，要自己判斷
        const p = res.data;
        if (cancelled || !p || p.code !== undefined || !p.patientid) return;

        setPatientName_POST(p.patientname ?? "");
        setHeight_POST(p.height ?? "");
        setWeight_POST(p.weight ?? "");
        setSex_POST(p.sex === 1 ? 1 : 0);
        if (p.birthday) setBirthday(new Date(p.birthday));
      } catch (error) {
        console.error("Error fetching patient:", error.message);
      }
    };

    fetchPatient();
    return () => {
      cancelled = true;
    };
  }, [isEdit, bed, targetIp]);

  // 住民編號清空 → 裝置一併清掉（規則：沒有住民就不能綁定裝置）
  const handlePatientIdChange = (value) => {
    setPatientId_POST(value);
    if (!value.trim()) setDeviceId_POST("");
  };

  // 裝置欄位何時鎖住：還沒填住民、且目前也沒有已綁定的裝置。
  // （舊資料可能有「有裝置但沒住民」的床位，這時不鎖，讓使用者能把它解除掉）
  const deviceLocked = !patientId.trim() && !deviceId;

  {
    /* 裝置資料表自己也有 bed / section 兩欄，綁定與解除時要一起維護，
       否則會和床位表對不起來（DeviceList、8031 等處都讀裝置上的這兩欄）。

       ⚠ PUT /db/Device/{id} 是整筆覆寫（後端用 AutoMapper 全欄位 map），
         所以要把該裝置現有的值原樣帶回，只改 bed / section，
         不能只送這兩個欄位，否則其他設定會被清成預設值。
       ⚠ 這支端點需要 Roles.Engineer；權限不足時失敗只記錄，不中斷主流程。 */
  }
  const syncDeviceBed = async (devId, nextBed, nextSection) => {
    if (!devId) return;
    const current = devices.find((d) => d.deviceid === devId);
    if (!current) return; // 不在這台後端的清單裡就跳過

    // 這幾個欄位不屬於 DevicePutDto（唯讀或由後端維護），不要送出去
    const { __srcIp, deviceid, updatedat, ping, rssi, ...rest } = current;

    await api
      .put(
        `/api/7284/db/Device/${devId}`,
        { ...rest, bed: nextBed, section: nextSection },
        cfg,
      )
      .catch((err) =>
        console.error(`Error updating device ${devId} bed/section:`, err.message),
      );
  };

  // 新增模式換區域 = 換後端，原本選的裝置在新的後端不存在 → 清掉重選
  const handleSectionSelect = (value) => {
    if (value === section) return;
    setSection_POST(value);
    if (!isEdit) setDeviceId_POST("");
  };

  // 收合時顯示的摘要：什麼都沒填就是「未指派」
  const optionalSummary = () => {
    const parts = [];
    if (patientId) parts.push(`${t("AddBedModal.PatientID")} ${patientId}`);
    if (deviceId) parts.push(`${t("AddBedModal.Device")} ${deviceId}`);
    if (nurseId) parts.push(`${t("AddBedModal.Nurse")} ${nurseId}`);
    return parts.length ? parts.join("・") : t("AddBedModal.Unassigned");
  };

  const handleConfirmClick = () => {
    setBedIdError(false);
    setDeviceError("");

    if (!bedId.trim()) {
      setBedIdError(true); // Bed ID Input Required
      return;
    }
    // 規則 1：床位一定要先有住民，才能綁定裝置
    if (deviceId && !patientId.trim()) {
      setDeviceError(t("AddBedModal.DeviceNeedsPatient"));
      setOptionalOpen(true);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    const pid = patientId.trim();
    const pname = patientName.trim();

    try {
      setLoading(true);

      // 有填住民編號 + 姓名 → 先試著建立住民；
      // 已存在（409）代表是既有住民，改用 PUT 更新它的資料（編輯時載入的欄位才改得動）。
      // 只填編號沒填姓名 → 當作指派既有住民，不建立也不更新。
      if (pid && pname) {
        const profile = {
          patientname: pname,
          // 這張床有綁裝置就一併寫進住民資料；沒有就送 null（DTO 可為空）
          deviceid: deviceId || null,
          sex,
          birthday: format(birthday, "yyyy-MM-dd"),
          height: parseInt(height, 10) || 0,
          weight: parseInt(weight, 10) || 0,
          jlog: {},
        };
        try {
          await api.post(
            "/api/7284/db/Patient",
            { ...profile, patientid: pid },
            cfg,
          );
        } catch (error) {
          if (error.response?.status === 409) {
            // 既有住民 → 更新。後端只有在真的有欄位變動時才回 code 0，
            // 沒改任何東西時會回非 0，那不算失敗，所以不看 code。
            try {
              await api.put(`/api/7284/db/Patient/${pid}`, profile, cfg);
            } catch (putError) {
              alert(
                `Error: ${
                  putError.response?.data?.message ||
                  "Failed to update resident."
                }`,
              );
              return;
            }
          } else {
            alert(
              `Error: ${
                error.response?.data?.message || "Failed to create resident."
              }`,
            );
            return;
          }
        }
      }

      // 未填的欄位送 null，等同「未指派」
      const requestBody = {
        bedId: bedId.trim(),
        section: section || null,
        patientId: pid || null,
        deviceId: deviceId || null,
        nurseId: nurseId.trim() || null,
      };

      const response = isEdit
        ? await api.put(`/api/7284/db/Bed/${bed.bedId}`, requestBody, cfg)
        : await api.post("/api/7284/db/Bed", requestBody, cfg);

      if (response.status === 200 || response.status === 201) {
        // 裝置資料表的 bed / section 跟著更新
        const prevDeviceId = isEdit ? bed.deviceId : null;
        if (prevDeviceId && prevDeviceId !== deviceId) {
          // 換綁或解除 → 舊裝置的 bed / section 清掉
          await syncDeviceBed(prevDeviceId, null, null);
        }
        if (deviceId) {
          await syncDeviceBed(deviceId, bedId.trim(), section || null);
        }

        setDoneMessage(isEdit ? "BedUpdated" : "NewBedAdded");
        onCreated?.();
      } else {
        alert(`Error: ${response.data?.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
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
    /* 住民出院：
         1. 床位解除住民；連同裝置一起解除（規則上沒有住民就不能綁裝置）。
            用 PUT 一次寫完，只需要 Roles.User 權限，也不會動到護理人員。
         2. 刪掉該住民的警示設定
         3. 刪掉住民本身（與 PatientProfile 的出院一致） */
  }
  const handleDischarge = async () => {
    const pid = bed?.patientId;
    if (!pid) return;

    try {
      setLoading(true);

      await api.put(
        `/api/7284/db/Bed/${bed.bedId}`,
        {
          bedId: bed.bedId,
          section: bed.section || null,
          patientId: null,
          deviceId: null,
          nurseId: bed.nurseId || null,
        },
        cfg,
      );

      // 床位上的裝置也解除了 → 裝置資料表的 bed / section 一併清掉
      await syncDeviceBed(bed.deviceId, null, null);

      // 警示設定沒有不算錯，失敗只記錄不中斷
      await api
        .delete(`/api/7284/db/Alert/${pid}`, cfg)
        .catch((err) => console.error("Error deleting alert:", err.message));

      await api.delete(`/api/7284/db/Patient/${pid}`, cfg);

      setConfirmMode(null);
      setDoneMessage("PatientDischarged");
      onCreated?.();
    } catch (error) {
      console.error("Error while discharging patient:", error);
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
    /* 刪除床位。床上若有住民，該住民（與其警示設定）也一併刪除。
       順序：先刪床位再刪住民 —— bed.patient_id 參照 patient，
       反過來會踩到外鍵限制。 */
  }
  const handleDelete = async () => {
    const pid = bed?.patientId;
    try {
      setLoading(true);
      // DELETE 需要 engineer 以上權限，權限不足時後端會回 401/403
      const response = await api.delete(`/api/7284/db/Bed/${bed.bedId}`, cfg);

      if (response.status === 204 || response.status === 200) {
        // 床位沒了 → 這張床上的裝置 bed / section 清掉
        await syncDeviceBed(bed.deviceId, null, null);

        if (pid) {
          // 警示設定沒有不算錯，失敗只記錄不中斷
          await api
            .delete(`/api/7284/db/Alert/${pid}`, cfg)
            .catch((err) =>
              console.error("Error deleting alert:", err.message),
            );
          // 床位已經刪掉了，住民刪失敗就提示一下，不回頭擋流程
          await api.delete(`/api/7284/db/Patient/${pid}`, cfg).catch((err) => {
            console.error("Error deleting patient:", err);
            alert(
              `Error: ${
                err.response?.data?.message || "Failed to delete resident."
              }`,
            );
          });
        }

        setConfirmMode(null);
        setDoneMessage("BedDeleted");
        onCreated?.();
      } else {
        alert(`Error: ${response.data?.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while deleting bed:", error);
      alert(
        `Error: ${
          error.response?.data?.message || "Unable to connect to the server."
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />

      <div className="addBed" onClick={handleWindowClick}>
        <div className={`window ${doneMessage ? "done" : ""}`}>
          <a onClick={callback}>
            <img
              src="/src/assets/close.svg"
              alt="close icon"
              className="close"
            />
          </a>

          {doneMessage ? (
            /* ─────────── 完成（新增 / 更新 / 刪除） ─────────── */
            <>
              <img src="/src/assets/check-active.svg" alt="" className="icon" />
              <div className="title">{t(`AddBedModal.${doneMessage}`)}</div>
              <div className="btn-gp">
                <a className="btn text-only pri" onClick={callback}>
                  <img src="" alt="" className="prefix" />
                  <p className="btn-text pri-text">{t("AddBedModal.Okay")}</p>
                </a>
              </div>
            </>
          ) : (
            /* ─────────── 填寫表單 ─────────── */
            <>
              <div className="title">
                {isEdit ? t("AddBedModal.EditBed") : t("AddBedModal.AddBed")}
              </div>
              <div className="tab-list">
                <a href="#" className="tab active tab-1">
                  {t("AddBedModal.BedProfile")}
                </a>
              </div>

              <form action="POST">
                <div className="bed-form">
                  {/* ── 一定顯示：床位編號 ── */}
                  <TextField
                    id="bedId"
                    label={t("AddBedModal.BedID")}
                    value={bedId}
                    onChange={setBedId_POST}
                    maxLength={50}
                    disabled={isEdit}
                    error={bedIdError}
                    errorText={t("AddBedModal.Required")}
                  />

                  {/* ── 一定顯示：區域 ── */}
                  <SelectField
                    id="sectionInNewBed"
                    label={t("AddBedModal.Section")}
                    value={section}
                    placeholder=""
                    options={sectionSelectOptions}
                    onSelect={handleSectionSelect}
                  />

                  {/* ── 選填：住民與指派 ── */}
                  <div className={`bed-optional ${isOptionalOpen ? "open" : ""}`}>
                    <div
                      className="bed-optional-head"
                      onClick={() => setOptionalOpen((prev) => !prev)}
                    >
                      <span className="bed-optional-title">
                        {t("AddBedModal.OptionalSection")}
                      </span>
                      <span className="bed-optional-state">
                        {isOptionalOpen ? "" : optionalSummary()}
                      </span>
                      <img
                        className="bed-optional-chevron"
                        src="/src/assets/menu-down.svg"
                        alt=""
                      />
                    </div>

                    {isOptionalOpen && (
                      <div className="bed-optional-body">
                        <TextField
                          id="patientIdInNewBed"
                          label={t("AddBedModal.PatientID")}
                          value={patientId}
                          onChange={handlePatientIdChange}
                          maxLength={50}
                        />
                        <TextField
                          id="patientNameInNewBed"
                          label={t("AddBedModal.PatientName")}
                          value={patientName}
                          onChange={setPatientName_POST}
                        />
                        <div className="bed-row-2">
                          <TextField
                            id="heightInNewBed"
                            label={t("AddBedModal.Height")}
                            value={height}
                            onChange={setHeight_POST}
                          />
                          <TextField
                            id="weightInNewBed"
                            label={t("AddBedModal.Weight")}
                            value={weight}
                            onChange={setWeight_POST}
                          />
                        </div>
                        <div className="bed-row-2">
                          <div className="bed-dob">
                            <label
                              htmlFor="dobInNewBed"
                              className="label-container"
                            >
                              <p>{t("AddBedModal.DOB")}</p>
                              <img
                                className="info"
                                src="/src/assets/information-outline.svg"
                                alt="gray outline information icon"
                              />
                            </label>
                            <div className="dob-input">
                              <DatePicker
                                id="dobInNewBed"
                                dateFormat="yyyy/MM/dd"
                                selected={birthday}
                                onChange={(date) => setBirthday(date)}
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                className="react-date-picker"
                              />
                            </div>
                          </div>
                          <SelectField
                            id="sexInNewBed"
                            label={t("AddBedModal.Sex")}
                            value={sex}
                            placeholder=""
                            options={sexOptions}
                            onSelect={setSex_POST}
                          />
                        </div>
                        <SelectField
                          id="deviceInNewBed"
                          label={t("AddBedModal.Device")}
                          value={deviceId}
                          placeholder={
                            deviceLocked
                              ? t("AddBedModal.DeviceNeedsPatient")
                              : t("AddBedModal.Unassigned")
                          }
                          options={deviceSelectOptions}
                          onSelect={(value) => {
                            setDeviceError("");
                            setDeviceId_POST(value);
                          }}
                          disabled={deviceLocked}
                          error={Boolean(deviceError)}
                          errorText={deviceError}
                        />
                        <TextField
                          id="nurseInNewBed"
                          label={t("AddBedModal.Nurse")}
                          value={nurseId}
                          onChange={setNurseId_POST}
                          maxLength={16}
                        />
                        <p className="bed-optional-note">
                          {t("AddBedModal.OptionalNote")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {confirmMode ? (
                  /* 二次確認（不使用瀏覽器對話框，避免中斷畫面） */
                  <div className="bed-confirm">
                    <p className="bed-confirm-text">
                      {confirmMode === "discharge"
                        ? t("AddBedModal.DischargeConfirm", {
                            patientId: bed?.patientId,
                          })
                        : t(
                            bed?.patientId
                              ? "AddBedModal.DeleteConfirmWithPatient"
                              : "AddBedModal.DeleteConfirm",
                            { bedId: bed?.bedId, patientId: bed?.patientId },
                          )}
                    </p>
                    <div className="btn-gp">
                      <div
                        className="btn text-only danger"
                        onClick={
                          confirmMode === "discharge"
                            ? handleDischarge
                            : handleDelete
                        }
                      >
                        <img src="" alt="" className="prefix" />
                        <p className="btn-text pri-text">
                          {confirmMode === "discharge"
                            ? t("AddBedModal.DischargeYes")
                            : t("AddBedModal.DeleteYes")}
                        </p>
                      </div>
                      <div
                        className="btn text-only outline sec"
                        onClick={() => setConfirmMode(null)}
                      >
                        <img src="" alt="" className="prefix" />
                        <p className="btn-text sec-text">
                          {t("AddBedModal.Cancel")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="btn-gp">
                    <div
                      className="btn text-only pri"
                      onClick={handleConfirmClick}
                    >
                      <img src="" alt="" className="prefix" />
                      <p className="btn-text pri-text">
                        {isEdit
                          ? t("AddBedModal.Save")
                          : t("AddBedModal.Continue")}
                      </p>
                    </div>
                    {isEdit && bed?.patientId && (
                      <div
                        className="btn text-only outline danger"
                        onClick={() => setConfirmMode("discharge")}
                      >
                        <img src="" alt="" className="prefix" />
                        <p className="btn-text sec-text">
                          {t("AddBedModal.Discharge")}
                        </p>
                      </div>
                    )}
                    {isEdit && (
                      <div
                        className="btn text-only outline danger"
                        onClick={() => setConfirmMode("delete")}
                      >
                        <img src="" alt="" className="prefix" />
                        <p className="btn-text sec-text">
                          {t("AddBedModal.Delete")}
                        </p>
                      </div>
                    )}
                    <div
                      className="btn text-only outline sec"
                      onClick={callback}
                    >
                      <img src="" alt="" className="prefix" />
                      <p className="btn-text sec-text">
                        {t("AddBedModal.Cancel")}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AddNewBed;
