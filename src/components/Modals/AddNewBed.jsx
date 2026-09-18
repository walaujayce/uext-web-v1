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
//   1. 裝置不記在床位上，而是記在住民身上（patient.deviceid）。
//      所以一定要先有住民才能綁裝置（沒填住民編號時裝置下拉是鎖住的），
//      沒有住民的床位一定也沒有裝置。
//   2. 裝置非必填；有選的話會寫進該住民的 deviceid。
//
// 床位編號與住民編號都限制在 8 個字元：裝置資料表的 devices.bed 只有 8 個字元，
// 綁定裝置時床位編號要寫進去，超過會被 PostgreSQL 以 22001 擋下（整個綁定失敗）。
//
// 綁定／解除裝置時，裝置資料表的 bed / section 兩欄由後端同步維護
// （WebAPI 的 Utility/DeviceBedSync.cs），前端不需要也不應該自己去改裝置。
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
  // 裝置來自住民（patient.deviceid），編輯模式下由底下載入住民資料時帶入
  const [deviceId, setDeviceId_POST] = useState("");
  // 表單上的住民資料是從資料庫載進來的（編輯模式）→ 送出時才能拿表單的值當準
  const profileLoadedRef = useRef(false);
  // 載進來的是哪一位住民；使用者把編號改掉之後，表單上那份資料就不再適用
  const loadedPatientIdRef = useRef("");
  const [nurseId, setNurseId_POST] = useState(bed?.nurseId ?? "");

  // 編輯模式下這張床本來就有指派 → 一進來就展開，讓使用者直接看到現有內容
  const [isOptionalOpen, setOptionalOpen] = useState(
    Boolean(bed?.patientId || bed?.nurseId),
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
  // 已經被其他住民綁走的裝置。裝置記在 patient.deviceid，所以這裡看的是住民清單，
  // 不是床位清單。
  const [takenDeviceIds, setTakenDeviceIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const cfgLocal = targetIp ? { targetIp } : undefined;

    const fetchDevices = async () => {
      const [deviceRes, patientRes] = await Promise.all([
        api.get("/api/7284/db/Device", cfgLocal).catch((err) => {
          console.error("Error fetching device list:", err.message);
          return null;
        }),
        api.get("/api/7284/db/Patient", cfgLocal).catch((err) => {
          console.error("Error fetching patient list:", err.message);
          return null;
        }),
      ]);
      if (cancelled) return;

      setDevices(Array.isArray(deviceRes?.data) ? deviceRes.data : []);

      // 這張床自己的住民所綁的裝置不算「被佔用」，否則會從選單裡消失
      const others = (
        Array.isArray(patientRes?.data) ? patientRes.data : []
      ).filter((p) => !bed?.patientId || p.patientid !== bed.patientId);
      setTakenDeviceIds(others.map((p) => p.deviceid).filter(Boolean));
    };

    fetchDevices();
    // 切換區域時，前一次還在飛的請求可能比新的晚回來 → 用旗標丟棄過期結果
    return () => {
      cancelled = true;
    };
  }, [targetIp, isEdit, bed]);

  // 顯示這個區域、且尚未被其他住民綁定的裝置：
  //   - 裝置自己標了 section 就比對，沒標的（尚未歸屬）也一併列出
  //   - 已被別的住民綁走的一律排除
  const deviceSelectOptions = useMemo(() => {
    const list = devices
      .filter((d) => !d.section || !section || d.section === section)
      .filter((d) => !takenDeviceIds.includes(d.deviceid))
      .map((d) => ({ value: d.deviceid, label: d.deviceid }));

    // 目前綁定的裝置若不在清單裡（例如區域被改過），仍要顯示出來
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
        // 裝置記在住民身上
        setDeviceId_POST(p.deviceid ?? "");
        profileLoadedRef.current = true;
        loadedPatientIdRef.current = p.patientid;
        if (p.deviceid) setOptionalOpen(true);
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
    const next = value.trim();
    if (!next) setDeviceId_POST("");

    // 編輯模式換成另一位住民：表單上載入的是「上一位」的姓名／生日／裝置，
    // 不清掉的話會被寫到新的住民身上
    if (loadedPatientIdRef.current && next !== loadedPatientIdRef.current) {
      profileLoadedRef.current = false;
      setPatientName_POST("");
      setHeight_POST("");
      setWeight_POST("");
      setSex_POST(0);
      setBirthday(new Date());
      setDeviceId_POST("");
    }
  };

  // 裝置欄位何時鎖住：還沒填住民、且目前也沒有已綁定的裝置。
  // （舊資料可能有「有裝置但沒住民」的床位，這時不鎖，讓使用者能把它解除掉）
  const deviceLocked = !patientId.trim() && !deviceId;

  {
    /* 裝置資料表自己也有 bed / section 兩欄，但那兩欄已經改由後端維護：
       BedController / PatientController 在寫入時會依
           bed.patient_id → patient.deviceid → device
       這條鏈同步裝置的 bed / section（見 Utility/DeviceBedSync.cs）。

       前端不要再自己打 PUT /db/Device/{id}：那支端點需要 Roles.Engineer
       （護理人員會靜默失敗），而且是整筆覆寫，漏欄位就會把裝置設定清掉。 */
  }

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

  {
    /* 後端的錯誤訊息可能是 camelCase 或 PascalCase，也可能整包不是 JSON。
       以前一律吞成「Unable to connect to the server.」，實際上多半是 4xx/5xx，
       訊息被吃掉就完全查不出原因，所以這裡盡量把狀態碼和內容攤出來。 */
  }
  const fmtErr = (error, fallback) => {
    if (error?.response) {
      const { status, data } = error.response;
      const msg =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.Message ||
        data?.title ||
        error.message;
      return `${status} ${msg || fallback}`;
    }
    // 沒有 response = 請求根本沒送到（連線失敗），或是前端自己丟的例外
    return `${error?.message || fallback}`;
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

      // ── 住民（裝置就記在住民身上的 deviceid）──
      //   住民編號不存在 → 新增一筆。姓名沒填就用編號頂著，
      //                    因為 patient.patientname 是 NOT NULL，
      //                    而且床位上掛著一個資料庫裡不存在的住民編號才是更糟的狀態。
      //   住民編號已存在 → 更新。使用者沒填的欄位沿用資料庫現值，
      //                    避免表單的預設值（性別女、生日今天）把既有資料洗掉。
      if (pid) {
        // 1. 先確認這位住民存不存在
        let existing = null;
        try {
          const res = await api.get(
            `/api/7284/db/Patient/${encodeURIComponent(pid)}`,
            cfg,
          );
          const p = res.data;
          // 查無此住民時後端是回 200 + { code: -1 }，不是 404，要自己判斷
          if (p && p.code === undefined && p.patientid) existing = p;
        } catch (error) {
          // 404 才算「不存在」，其他錯誤（連線、權限）不能當成要新增
          if (error.response?.status !== 404) {
            alert(`Error: ${fmtErr(error, "Failed to look up resident.")}`);
            return;
          }
        }

        // 2. 表單上的住民資料算不算數：
        //    新增住民 → 一定算（使用者填什麼就是什麼）
        //    既有住民 → 只有在進來時把他的資料載進表單才算。
        //               新增床位時只是從下拉選了一個既有編號，表單是空的／預設值，
        //               直接送出去會把他的姓名、生日、性別清掉。
        const formIsAuthoritative =
          !existing ||
          (profileLoadedRef.current && pid === loadedPatientIdRef.current);

        const numOr = (value, fallback) => {
          const n = parseInt(String(value).trim(), 10);
          return Number.isNaN(n) ? fallback : n;
        };

        const profile = {
          patientname: pname || existing?.patientname || pid,
          deviceid: deviceId || null,
          sex: formIsAuthoritative ? sex : existing.sex ?? 0,
          birthday: format(
            formIsAuthoritative
              ? birthday
              : existing.birthday
                ? new Date(existing.birthday)
                : birthday,
            "yyyy-MM-dd",
          ),
          height: numOr(height, existing?.height ?? 0),
          weight: numOr(weight, existing?.weight ?? 0),
          jlog: {},
        };

        // 3. 寫入。POST 撞到 409（剛好被別人建走）就改成 PUT。
        //    後端只有在真的有欄位變動時才回 code 0，沒改任何東西時會回非 0，
        //    那不算失敗，所以不看 code。
        try {
          if (existing) {
            await api.put(`/api/7284/db/Patient/${pid}`, profile, cfg);
          } else {
            try {
              await api.post(
                "/api/7284/db/Patient",
                { ...profile, patientid: pid },
                cfg,
              );
            } catch (error) {
              if (error.response?.status !== 409) throw error;
              await api.put(`/api/7284/db/Patient/${pid}`, profile, cfg);
            }
          }
        } catch (error) {
          alert(`Error: ${fmtErr(error, "Failed to save resident.")}`);
          return;
        }
      }

      // ── 床位。裝置已經不是床位的欄位了 ──
      const requestBody = {
        bedId: bedId.trim(),
        section: section || null,
        patientId: pid || null,
        nurseId: nurseId.trim() || null,
      };

      const response = isEdit
        ? await api.put(`/api/7284/db/Bed/${bed.bedId}`, requestBody, cfg)
        : await api.post("/api/7284/db/Bed", requestBody, cfg);

      if (response.status === 200 || response.status === 201) {
        // 裝置資料表的 bed / section 由後端在上面這些寫入裡一起維護，這裡不用再動
        setDoneMessage(isEdit ? "BedUpdated" : "NewBedAdded");
        onCreated?.();
      } else {
        alert(`Error: ${response.data?.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert(`Error: ${fmtErr(error, "Unable to connect to the server.")}`);
    } finally {
      setLoading(false);
    }
  };

  {
    /* 住民出院：
         1. 床位解除住民。裝置記在住民身上，住民一走裝置自然跟著解除。
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
          nurseId: bed.nurseId || null,
        },
        cfg,
      );

      // 床位解除住民時，後端已經把該住民所綁裝置的 bed / section 清掉了

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
      alert(`Error: ${fmtErr(error, "Unable to connect to the server.")}`);
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
        // 床位沒了 → 後端在刪床位時已經把該住民所綁裝置的 bed / section 清掉

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
            alert(`Error: ${fmtErr(err, "Failed to delete resident.")}`);
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
      alert(`Error: ${fmtErr(error, "Unable to connect to the server.")}`);
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
                    maxLength={8}
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
                          maxLength={8}
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
