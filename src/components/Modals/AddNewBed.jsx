import React, { useState, useEffect, useRef, useMemo } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/bed.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";
import api from "../../api/apiClient";
import { useFloorSection } from "../../JS/FloorSectionContext";

// ─────────────────────────────────────────────────────────────
// 下拉選單欄位（樣式與 AddNewDevice.jsx 的 .input.dropdown 完全一致）
// options 形式：[{ value, label }]，value 為實際要送出的值。
// 元件定義在模組層級，避免每次 render 產生新的 component type 造成重新掛載。
// ─────────────────────────────────────────────────────────────
const SelectField = ({ id, label, value, placeholder, options, onSelect }) => {
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
      className="input dropdown suffix"
      onClick={() => setActive((prev) => !prev)}
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
        />
        <img
          className="suffix active"
          src="/src/assets/menu-down.svg"
          alt="dropdown icon"
        />
      </div>
      <div className="assistive-text">this is a line of assistive text</div>
      <div className={`list ${isActive ? "active" : ""}`} ref={listRef}>
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

// 新增／編輯床位 Modal（外框版型參考 AddNewDevice.jsx）
//
//   不帶 bed  → 新增模式：POST /db/Bed
//   帶  bed  → 編輯模式：PUT /db/Bed/{bedId}，並可 DELETE /db/Bed/{bedId}
//
// 單一表單，欄位對應 BedPostDto / BedPutDto：
//   床位編號(必填, 編輯時不可改) / 區域 / 護理人員 / 住民編號 / 裝置
// 住民與裝置只做「指派」，選項來自該後端的既有資料；
// 已被其他床位佔用的住民或裝置會先過濾掉（DB 有唯一鍵，送出也會擋）。
//
// 樣式全部寫在 /src/CSS/bed.css，本檔不使用 inline style。
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
    /* 表單欄位（即 BedPostDto / BedPutDto），編輯模式帶入現有資料 */
  }
  const [bedId, setBedId_POST] = useState(bed?.bedId ?? "");
  const [section, setSection_POST] = useState(bed?.section ?? "");
  const [nurseId, setNurseId_POST] = useState(bed?.nurseId ?? "");
  const [patientId, setPatientId_POST] = useState(bed?.patientId ?? "");
  const [deviceId, setDeviceId_POST] = useState(bed?.deviceId ?? "");

  const [bedIdError, setBedIdError] = useState(false);
  const [isDeleteConfirm, setDeleteConfirm] = useState(false);
  // null = 還在填表；其餘為完成後要顯示的訊息 key
  const [doneMessage, setDoneMessage] = useState(null);

  {
    /* Section 選項 */
  }
  const sectionOptions = useMemo(
    () => [...new Set(servers.map((s) => s.section).filter(Boolean))],
    [servers],
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

  {
    /* 住民 / 裝置 / 護理人員 選項：都跟著目標後端走 */
  }
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [devices, setDevices] = useState([]);
  const [takenPatientIds, setTakenPatientIds] = useState([]);
  const [takenDeviceIds, setTakenDeviceIds] = useState([]);

  useEffect(() => {
    const cfg = targetIp ? { targetIp } : undefined;

    // GET /api/7284/User 需要 administrator 權限；非管理者會拿到 401/403，
    // 這裡不擋流程，只是讓護理人員下拉沒有選項。
    const fetchAll = async () => {
      const [userRes, patientRes, deviceRes, bedRes] = await Promise.all([
        api.get("/api/7284/User", cfg).catch((err) => {
          console.error("Error fetching user list:", err.message);
          return null;
        }),
        api.get("/api/7284/db/Patient", cfg).catch((err) => {
          console.error("Error fetching patient list:", err.message);
          return null;
        }),
        api.get("/api/7284/db/Device", cfg).catch((err) => {
          console.error("Error fetching device list:", err.message);
          return null;
        }),
        api.get("/api/7284/db/Bed", cfg).catch((err) => {
          console.error("Error fetching bed list:", err.message);
          return null;
        }),
      ]);

      setUsers(Array.isArray(userRes?.data) ? userRes.data : []);
      setPatients(Array.isArray(patientRes?.data) ? patientRes.data : []);
      setDevices(Array.isArray(deviceRes?.data) ? deviceRes.data : []);

      // 編輯模式下，這張床自己已指派的住民／裝置不算「被佔用」
      const beds = (Array.isArray(bedRes?.data) ? bedRes.data : []).filter(
        (b) => !isEdit || b.bedId !== bed.bedId,
      );
      setTakenPatientIds(beds.map((b) => b.patientId).filter(Boolean));
      setTakenDeviceIds(beds.map((b) => b.deviceId).filter(Boolean));
    };

    fetchAll();
  }, [targetIp, isEdit, bed]);

  // 未指派選項；選了之後還能選回「未指派」把它清掉
  const unassigned = { value: "", label: t("AddBedModal.Unassigned") };

  const sectionSelectOptions = useMemo(
    () => sectionOptions.map((s) => ({ value: s, label: s })),
    [sectionOptions],
  );

  const nurseSelectOptions = useMemo(
    () => [
      unassigned,
      ...users.map((u) => ({ value: u.userid, label: u.username })),
    ],
    [users, t],
  );

  // 一位住民只能在一張床 → 已被別張床指派的不列出來
  const patientSelectOptions = useMemo(
    () => [
      unassigned,
      ...patients
        .filter((p) => !takenPatientIds.includes(p.patientid))
        .map((p) => ({
          value: p.patientid,
          label: p.patientname
            ? `${p.patientid}（${p.patientname}）`
            : p.patientid,
        })),
    ],
    [patients, takenPatientIds, t],
  );

  // 一台裝置只能在一張床 → 已被別張床指派的不列出來
  const deviceSelectOptions = useMemo(
    () => [
      unassigned,
      ...devices
        .filter((d) => !takenDeviceIds.includes(d.deviceid))
        .map((d) => ({ value: d.deviceid, label: d.deviceid })),
    ],
    [devices, takenDeviceIds, t],
  );

  // 新增模式換區域 = 換後端，原本選的住民／裝置／護理人員不通用 → 清掉重選
  const handleSectionSelect = (value) => {
    if (value === section) return;
    setSection_POST(value);
    if (!isEdit) {
      setPatientId_POST("");
      setDeviceId_POST("");
      setNurseId_POST("");
    }
  };

  const handleConfirmClick = () => {
    setBedIdError(false);
    if (!bedId) {
      setBedIdError(true); // Bed ID Input Required
      return;
    }
    handleSubmit();
  };

  const cfg = targetIp ? { targetIp } : undefined;

  const handleSubmit = async () => {
    // 未選的欄位送 null，等同「未指派」
    const requestBody = {
      bedId,
      section: section || null,
      patientId: patientId || null,
      deviceId: deviceId || null,
      nurseId: nurseId || null,
    };

    try {
      setLoading(true);
      const response = isEdit
        ? await api.put(`/api/7284/db/Bed/${bed.bedId}`, requestBody, cfg)
        : await api.post("/api/7284/db/Bed", requestBody, cfg);

      if (response.status === 200 || response.status === 201) {
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

  const handleDelete = async () => {
    try {
      setLoading(true);
      // DELETE 需要 engineer 以上權限，權限不足時後端會回 401/403
      const response = await api.delete(`/api/7284/db/Bed/${bed.bedId}`, cfg);

      if (response.status === 204 || response.status === 200) {
        setDeleteConfirm(false);
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
                  {/* 床位編號（必填；編輯時為主鍵，不可變更） */}
                  <div className="input">
                    <label htmlFor="bedId" className="label-container">
                      <p>{t("AddBedModal.BedID")}</p>
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
                        id="bedId"
                        name="bedId"
                        placeholder="Enter here"
                        required
                        maxLength={50}
                        value={bedId}
                        disabled={isEdit}
                        onChange={(e) => setBedId_POST(e.target.value)}
                      />
                      <img className="suffix" src="" alt="" />
                    </div>
                    <div
                      className={`assistive-text ${bedIdError ? "active" : ""}`}
                    >
                      {t("AddBedModal.Required")}
                    </div>
                  </div>

                  {/* 區域（來源 /api/7284/IpAddress/all） */}
                  <SelectField
                    id="sectionInNewBed"
                    label={t("AddBedModal.Section")}
                    value={section}
                    placeholder=""
                    options={sectionSelectOptions}
                    onSelect={handleSectionSelect}
                  />

                  {/* 護理人員（顯示 username、送出 userid） */}
                  <SelectField
                    id="nurseInNewBed"
                    label={t("AddBedModal.Nurse")}
                    value={nurseId}
                    placeholder={t("AddBedModal.Unassigned")}
                    options={nurseSelectOptions}
                    onSelect={setNurseId_POST}
                  />

                  {/* 住民編號（來源 /api/7284/db/Patient） */}
                  <SelectField
                    id="patientInNewBed"
                    label={t("AddBedModal.PatientID")}
                    value={patientId}
                    placeholder={t("AddBedModal.Unassigned")}
                    options={patientSelectOptions}
                    onSelect={setPatientId_POST}
                  />

                  {/* 裝置（來源 /api/7284/db/Device） */}
                  <SelectField
                    id="deviceInNewBed"
                    label={t("AddBedModal.Device")}
                    value={deviceId}
                    placeholder={t("AddBedModal.Unassigned")}
                    options={deviceSelectOptions}
                    onSelect={setDeviceId_POST}
                  />
                </div>

                {isDeleteConfirm ? (
                  /* 刪除二次確認（不使用瀏覽器對話框，避免中斷畫面） */
                  <div className="bed-confirm">
                    <p className="bed-confirm-text">
                      {t("AddBedModal.DeleteConfirm", { bedId: bed?.bedId })}
                    </p>
                    <div className="btn-gp">
                      <div
                        className="btn text-only danger"
                        onClick={handleDelete}
                      >
                        <img src="" alt="" className="prefix" />
                        <p className="btn-text pri-text">
                          {t("AddBedModal.DeleteYes")}
                        </p>
                      </div>
                      <div
                        className="btn text-only outline sec"
                        onClick={() => setDeleteConfirm(false)}
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
                    {isEdit && (
                      <div
                        className="btn text-only outline danger"
                        onClick={() => setDeleteConfirm(true)}
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
