import React from "react";
import { useTranslation } from "react-i18next";
import "/src/CSS/risk-region.css";

// 樣式全部移到 src/CSS/risk-region.css：
//   - 深/淺模式沿用專案既有機制（html.dark 切換 CSS 變數），
//     不用在這裡讀 isDarkMode，切主題時不會觸發 re-render。
//   - 字級與間距用 clamp() 隨視窗流動，再於 1366 / 647 斷點微調。
function RiskRegion({ data = [] }) {
  const { t } = useTranslation();

  // 依照 idx 排序 (不修改原 array)
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => a.idx - b.idx)
    : [];

  // 不同等級對應的樣式 class
  const getLevelClass = (level) => {
    switch (level ?? 0) {
      case 2:
        return "risk-region__badge risk-region__badge--high";
      case 1:
        return "risk-region__badge risk-region__badge--medium";
      case 0:
        return "risk-region__badge risk-region__badge--low";
      default:
        return "risk-region__badge risk-region__badge--low";
    }
  };

  const getLevelChar = (level) => {
    switch (level) {
      case 2:
        return t("RiskRegion.High");
      case 1:
        return t("RiskRegion.Medium");
      case 0:
        return t("RiskRegion.Low");
      default:
        return t("RiskRegion.Unusual");
    }
  };

  return (
    <div className="respiration risk-region" style={{ gridRow: "span 6" }}>
      <div className="risk-region__wrapper">
        <table className="risk-region__table">
          <thead className="risk-region__thead">
            <tr>
              <th className="risk-region__th">{t("RiskRegion.Id")}</th>
              <th className="risk-region__th">{t("RiskRegion.HoldTime")}</th>
              <th className="risk-region__th">
                {t("RiskRegion.PressureArea")}(cm&sup2;)
              </th>
              <th className="risk-region__th">{t("RiskRegion.Level")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={4} className="risk-region__empty">
                  {t("RiskRegion.NaN")}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={item.idx ?? index}
                  className={`risk-region__row${
                    index % 2 === 0 ? "" : " risk-region__row--alt"
                  }`}
                >
                  <td className="risk-region__td">{item.idx}</td>
                  <td className="risk-region__td">{item.duration_sec}</td>
                  <td className="risk-region__td">{item.radius}</td>
                  <td className="risk-region__td">
                    <span className={getLevelClass(item.risk_level)}>
                      {getLevelChar(item.risk_level)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RiskRegion;
