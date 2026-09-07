import React, { useEffect, useState } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";
import api from "../../api/apiClient";
import { useAuth } from "../../JS/AuthContext";

// Backend (IpAddressController.cs) routes:
//   GET    /api/7284/IpAddress/all
//   POST   /api/7284/IpAddress           body: { Ip, Section, IsSelf }
//   PUT    /api/7284/IpAddress/{ip}      body: { Section, IsSelf }
//   DELETE /api/7284/IpAddress/{ip}
//
// ⚠ 後端已移除 Floor，IpAddress 只剩 Ip / Section / IsSelf。
//   Section 在後端是唯一鍵：POST 與 PUT 都會擋重複的 Section。
//
// ⚠ PUT 的後端寫法是 entity.IsSelf = request.IsSelf ?? false，
//   也就是「沒送 IsSelf 就會被重設為 false」。所以編輯時一定要把
//   目前的 IsSelf 一起送回去，否則會在使用者只改 Section 時把旗標洗掉。
const BASE = "/api/7284/IpAddress";

const MultiServerSetting = ({ callback }) => {
  const { t } = useTranslation();

  const { isDarkMode } = useAuth();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]); // [{ ip, section, isSelf }]

  // Inline-edit state for an existing row
  const [editingIp, setEditingIp] = useState(null);
  const [editSection, setEditSection] = useState("");
  const [editIsSelf, setEditIsSelf] = useState(false);

  // "Add new IP" form
  const [newIp, setNewIp] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newIsSelf, setNewIsSelf] = useState(false);

  // Click on the dim backdrop should not bubble to whatever sits below it.
  const handleWindowClick = (e) => e.stopPropagation();

  // ─────────────────────────────────────────────────────────
  // GET /all  – refresh the table
  // ─────────────────────────────────────────────────────────
  const refresh = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE}/all`);
      // Backend may serialize PascalCase or camelCase depending on settings —
      // normalize both to lowercase for the UI.
      const list = (res.data || []).map((x) => ({
        ip: x.ip ?? x.Ip ?? "",
        section: x.section ?? x.Section ?? "",
        isSelf: Boolean(x.isSelf ?? x.IsSelf ?? false),
      }));
      // Floor 已移除，改成單純依 Section 排序
      list.sort((a, b) => (a.section || "").localeCompare(b.section || ""));
      setRows(list);
    } catch (err) {
      console.error("GET /IpAddress/all failed:", err);
      alert("Failed to load IP list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Pretty-print whatever shape the backend put in the error response body.
  const fmtErr = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.Message) return data.Message;
    return err?.message || fallback;
  };

  // ─────────────────────────────────────────────────────────
  // POST  – add a new IP
  // ─────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const ip = newIp.trim();
    const section = newSection.trim();
    if (!ip || !section) {
      alert("Please fill in IP and Section.");
      return;
    }
    try {
      setLoading(true);
      await api.post(BASE, { Ip: ip, Section: section, IsSelf: newIsSelf });
      setNewIp("");
      setNewSection("");
      setNewIsSelf(false);
      await refresh();
    } catch (err) {
      console.error("POST /IpAddress failed:", err);
      alert(`Add failed: ${fmtErr(err, "unknown error")}`);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // PUT  – inline edit Section / IsSelf for an existing IP
  // ─────────────────────────────────────────────────────────
  const handleEditStart = (row) => {
    setEditingIp(row.ip);
    setEditSection(row.section);
    setEditIsSelf(row.isSelf);
  };
  const handleEditCancel = () => {
    setEditingIp(null);
    setEditSection("");
    setEditIsSelf(false);
  };
  const handleEditSave = async (ip) => {
    const section = editSection.trim();
    if (!section) {
      alert("Section cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      // IsSelf 一定要一起送：後端是 request.IsSelf ?? false，漏送會被清成 false
      await api.put(`${BASE}/${encodeURIComponent(ip)}`, {
        Section: section,
        IsSelf: editIsSelf,
      });
      handleEditCancel();
      await refresh();
    } catch (err) {
      console.error("PUT /IpAddress failed:", err);
      alert(`Update failed: ${fmtErr(err, "unknown error")}`);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────
  const handleDelete = async (row) => {
    const ok = window.confirm(`Delete IP ${row.ip}  (Section ${row.section}) ?`);
    if (!ok) return;
    try {
      setLoading(true);
      await api.delete(`${BASE}/${encodeURIComponent(row.ip)}`);
      // If we were editing the row we just deleted, drop the edit state too.
      if (editingIp === row.ip) handleEditCancel();
      await refresh();
    } catch (err) {
      console.error("DELETE /IpAddress failed:", err);
      alert(`Delete failed: ${fmtErr(err, "unknown error")}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />

      <div
        className="changePassword active"
        onClick={handleWindowClick}
        style={{ display: "block" }}
      >
        <div className="window" style={{ maxWidth: 780 }}>
          <div className="title">區域 IP 設定</div>
          <div className="subtitle">新增、修改、或刪除伺服器 IP</div>
          <img
            src="/src/assets/close.svg"
            alt=""
            className="close"
            onClick={callback}
          />

          {/* ── IP list ──────────────────────────────────── */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                maxHeight: 280,
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f5f5f5",
                    zIndex: 1,
                  }}
                >
                  <tr>
                    <th style={thStyle}>Section</th>
                    <th style={thStyle}>IP</th>
                    <th style={{ ...thStyle, width: 80, textAlign: "center" }}>
                      Self
                    </th>
                    <th style={{ ...thStyle, width: 170, textAlign: "right" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: 14,
                          color: "#888",
                          fontSize: 13,
                        }}
                      >
                        No IP configured.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => {
                    const isEditing = editingIp === row.ip;
                    return (
                      <tr
                        key={row.ip}
                        style={{ borderTop: "1px solid #ececec" }}
                      >
                        <td style={tdStyle}>
                          {isEditing ? (
                            <input
                              className="placeholder"
                              style={inlineInputStyle}
                              value={editSection}
                              onChange={(e) => setEditSection(e.target.value)}
                            />
                          ) : (
                            row.section
                          )}
                        </td>
                        <td style={tdStyle}>{row.ip}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isEditing ? editIsSelf : row.isSelf}
                            disabled={!isEditing}
                            onChange={(e) => setEditIsSelf(e.target.checked)}
                          />
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                style={smallBtnPrimary}
                                onClick={() => handleEditSave(row.ip)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                style={smallBtnGhost}
                                onClick={handleEditCancel}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                style={smallBtnGhost}
                                onClick={() => handleEditStart(row)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                style={smallBtnDanger}
                                onClick={() => handleDelete(row)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Add new IP ───────────────────────────────── */}
          <div
            style={{
              marginTop: 18,
              borderTop: "1px dashed #ccc",
              paddingTop: 14,
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: 8 }}>新增 IP</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr auto auto",
                gap: 8,
                alignItems: "end",
              }}
            >
              <div className="input">
                <label className="label-container">
                  <p>Section</p>
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    placeholder="e.g. A"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                  />
                </div>
              </div>
              <div className="input">
                <label className="label-container">
                  <p>IP</p>
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    placeholder="e.g. 192.168.1.10"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                </div>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  paddingBottom: 10,
                  whiteSpace: "nowrap",
                }}
              >
                <input
                  type="checkbox"
                  checked={newIsSelf}
                  onChange={(e) => setNewIsSelf(e.target.checked)}
                />
                Self
              </label>
              <div
                className="btn text-only pri"
                onClick={handleAdd}
                style={{ minWidth: 96, justifyContent: "center" }}
              >
                <p className="btn-text pri-text">Add</p>
              </div>
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────── */}
          <div className="btn-gp" style={{ marginTop: 20 }}>
            <div className="btn text-only outline sec" onClick={callback}>
              <p className="btn-text sec-text" style={{ color: "black" }}>
                Close
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── inline styles for the table / row actions ─────────────
const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 600,
  fontSize: 13,
};
const tdStyle = {
  padding: "10px 12px",
  fontSize: 13,
  verticalAlign: "middle",
};
const inlineInputStyle = {
  width: "100%",
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 13,
};
const smallBtnBase = {
  padding: "4px 10px",
  marginLeft: 4,
  cursor: "pointer",
  border: "none",
  borderRadius: 4,
  fontSize: 12,
};
const smallBtnPrimary = {
  ...smallBtnBase,
  background: "#4caf50",
  color: "white",
};
const smallBtnGhost = {
  ...smallBtnBase,
  background: "white",
  color: "#444",
  border: "1px solid #ccc",
};
const smallBtnDanger = {
  ...smallBtnBase,
  background: "#e74c3c",
  color: "white",
};

export default MultiServerSetting;
