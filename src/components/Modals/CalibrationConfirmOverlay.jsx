import React, { useState, useEffect } from "react";
import "../Modals/overlay.css";
import { useTranslation } from "react-i18next";

/**
 * CalibrationConfirmOverlay
 *
 * 三個階段都在「同一個 modal」內完成，不再由外部用 SimpleBackdrop 遮 15 秒：
 *   idle     → 詢問是否執行校正（確認 / 取消）
 *   counting → 已送出校正請求，即時倒數 countdownSeconds 秒（此時不給按鈕，避免中途關掉）
 *   done     → 倒數結束，只剩一顆「確認」，按下才收掉 modal
 *
 * Props:
 *  - callback              取消 / 關閉 modal（原有）
 *  - calibrationbtn_click  按下第一顆「確認」時要執行的動作，通常是打校正 API（原有）
 *  - onFinish              倒數結束後按下「確認」時呼叫；沒給就退回用 callback
 *  - countdownSeconds      倒數秒數，預設 15
 */

const PHASE = { IDLE: "idle", COUNTING: "counting", DONE: "done" };

function CalibrationConfirmOverlay({
  callback,
  calibrationbtn_click,
  onFinish,
  countdownSeconds = 15,
}) {
  const { t } = useTranslation();

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [remaining, setRemaining] = useState(countdownSeconds);

  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  // 倒數：每秒扣 1，歸零就切到 done。
  // 用 setTimeout + [phase, remaining] 依賴而不是 setInterval，
  // 這樣每一 tick 都是獨立的 effect，React StrictMode 重跑也不會累積計時器。
  useEffect(() => {
    if (phase !== PHASE.COUNTING) return;
    if (remaining <= 0) {
      setPhase(PHASE.DONE);
      return;
    }
    const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, remaining]);

  {
    /* Handle Stage 1 Btn Logic */
  }
  // 第一顆「確認」：倒數「立刻」開始，不等 API 回來，
  // 所以就算後端慢，使用者看到的秒數也是準的。
  const handleConfirm = async () => {
    if (phase !== PHASE.IDLE) return; // 防連點
    setRemaining(countdownSeconds);
    setPhase(PHASE.COUNTING);
    try {
      await calibrationbtn_click?.();
    } catch (err) {
      console.error("calibration failed:", err);
    }
  };

  // 倒數結束後的「確認」：收掉 modal
  const handleDone = () => {
    (onFinish ?? callback)?.();
  };

  return (
    <>
      <div className="overlay discharge active" onClick={handleWindowClick}>
        <div className="warn">
          <img
            className="icon"
            src="/src/assets/alert-box.svg"
            alt="alert box"
          />

          {phase === PHASE.IDLE && (
            <>
              <h1 className="title">{t("CalibrationModal.description")}</h1>
              <p className="desc"></p>
              <div className="btn-gp">
                <a className="btn text-only pri" onClick={handleConfirm}>
                  <img src="" alt="" className="prefix" />
                  <p className="btn-text pri-text">
                    {t("CalibrationModal.Confirm")}
                  </p>
                </a>
                <a className="btn text-only outline sec" onClick={callback}>
                  <img src="" alt="" className="prefix" />
                  <p className="btn-text sec-text">
                    {t("CalibrationModal.Cancel")}
                  </p>
                </a>
              </div>
            </>
          )}

          {phase === PHASE.COUNTING && (
            <>
              <h1 className="title">
                {t("CalibrationModal.Calibrating", "校正中...")}
              </h1>
              <p
                className="desc"
                style={{
                  fontSize: "40px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontVariantNumeric: "tabular-nums", // 秒數變動時寬度不跳動
                }}
              >
                {remaining}
                <span style={{ fontSize: "20px", fontWeight: 400 }}>
                  {t("CalibrationModal.SecondsSuffix", "秒")}
                </span>
              </p>
              {/* 倒數期間刻意不給任何按鈕，避免中途關掉 modal */}
            </>
          )}

          {phase === PHASE.DONE && (
            <>
              <h1 className="title">
                {t("CalibrationModal.Completed", "校正完成")}
              </h1>
              <p className="desc"></p>
              <div className="btn-gp">
                <a className="btn text-only pri" onClick={handleDone}>
                  <img src="" alt="" className="prefix" />
                  <p className="btn-text pri-text">
                    {t("CalibrationModal.Confirm")}
                  </p>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default CalibrationConfirmOverlay;
