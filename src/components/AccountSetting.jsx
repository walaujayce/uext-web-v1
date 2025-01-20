import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "/src/CSS/account.css";
import AlertList from "./AlertList";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";

function AccountSetting() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const storedUserRole = localStorage.getItem("role");

  const navigate = useNavigate();

  const handleBackBtnClick = () => {
    navigate("/account");
  };
  const [searchParams] = useSearchParams();

  const userid = searchParams.get("userid") || "";

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const [isUserProfileChanged, setUserProfileIsChanged] = useState(false); // Track changes to enable SAVE button
  const [isRoleChanged, setRoleIsChanged] = useState(false); // Track changes to enable SAVE button
  const [isPasswordChanged, setPasswordIsChanged] = useState(false); // Track changes to enable SAVE button

  function useSetInfoInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setUserProfileIsChanged(true);
    };

    return {
      inputValue,
      handleInputChange,
      setInputValue,
    };
  }

  const userNameInput = useSetInfoInput("");
  const userEmailInput = useSetInfoInput("");
  const userIdInput = useSetInfoInput("");

  const [passwordValue, setPasswordValue] = useState("");
  const handlePasswordChange = (e) => {
    setPasswordValue(e.target.value);
    setPasswordIsChanged(true);
  };

  {
    /* ROLE  */
  }
  const [isRoleActive, setRoleActive] = useState(false);
  const handleRoleDropdown = () => {
    setRoleActive((prev) => !prev);
  };
  const ROLE = ["Administrator", "Engineer", "User"];
  const [placeholderRole, setPlaceholderRole] = useState(ROLE[0]); // Input placeholder
  const handleRoleItemClick = (role) => {
    setPlaceholderRole(role);
    handleRoleDropdown;
    ROLE.indexOf(role) === userInfo.role
      ? setRoleIsChanged(false)
      : setRoleIsChanged(true);
  };
  {
    /* Handle Item Select */
  }
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleActive(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const [userInfo, setUserInfo] = useState([]);

  const fetchUserInfo = async (userid) => {
    try {
      const response = await fetch(`/api/7284/User/${userid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }

      const data = await response.json();
      console.log(data);
      setUserInfo(data);

      userNameInput.setInputValue(data.username);
      userIdInput.setInputValue(data.userid);
      userEmailInput.setInputValue(data.email);
      setPasswordValue(data.password);

      setPlaceholderRole(ROLE[data.role]);
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    fetchUserInfo(userid);
  }, []);

  const requestBody_PUT_Profile = {
    username: userNameInput.inputValue,
    email: userEmailInput.inputValue,
  };
  const requestBody_PUT_Role = {
    role: placeholderRole === ROLE[0] ? 0 : placeholderRole === ROLE[1] ? 1 : 2,
  };
  const requestBody_PUT_Password = {
    password: passwordValue,
  };
  const handlePUT_API = (print_inputvalue) => {
    if (isUserProfileChanged && print_inputvalue === requestBody_PUT_Profile) {
      console.log("the input requestbody is User Profile ", print_inputvalue);
      PUT_UserInfo(userid, print_inputvalue);
    } else if (isRoleChanged && print_inputvalue === requestBody_PUT_Role) {
      console.log("the input requestbody is Role", print_inputvalue);
      if (userInfo.role===0) {
        alert("Cannot modify Administrator role!");
        window.location.reload();
        return;
      } else {
        PUT_UserInfo(userid, print_inputvalue);
      }
    } else if (
      isPasswordChanged &&
      print_inputvalue === requestBody_PUT_Password
    ) {
      if (passwordValue === "") {
        alert("Please fill in a valid Password!");
        return;
      }
      if (!passwordValidationRegex.test(passwordValue)) {
        alert(
          "Password must include at least one uppercase letter, one lowercase letter, one number, and be at least 6 characters long."
        );
        return;
      }
      console.log("the input requestbody is Password", print_inputvalue);
      PUT_UserInfo(userid, print_inputvalue);
    }
  };

  const PUT_UserInfo = async (userid, requestBody) => {
    try {
      // Remove 'alertguid' from the alertList
      const { lastlogin, userid, ...filteredUserInfo } = userInfo; // Destructure to exclude alertguid

      const updatedData = { ...filteredUserInfo, ...requestBody };
      console.log("updated data is :", updatedData);

      setLoading(true);

      const response = await fetch(`/api/7284/User/${userid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Convert the requestBody to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        console.log("User fail to update:", data);
        alert("User fail to update!");
      } else {
        console.log("User updated successfully:", data);
        alert("Update Successfully!");
        window.location.reload();
      }
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userid) => {
    console.log("delete userid is ", userid);
    if (userInfo.role===0) {
      alert("Cannot delete Administrator account!");
      return;
    } else {
      deleteUser_API(userid);
    }
  };

  const deleteUser_API = async (userid) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/7284/User/${userid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      const data = await response.json();
      console.log("Delete successfully!:", data);
      alert("Delete successfully!");
      navigate("/account");
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />
      <Navbar />
      <div className="wrap">
        <AlertList />
        <div className="main">
          <div className="box">
            <h1>{t("AccountSettings.AccountSettings")}</h1>
            <a className="btn frameless" onClick={handleBackBtnClick}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text">{t("AccountSettings.Back")}</p>
            </a>
          </div>
          <div className="accSection">
            <div className="accSetting">
              <h2>{t("AccountSettings.UserProfile")}</h2>
              <div className="opt-list">
                <div className="opt-grid">
                  <div className="input g-col-3">
                    <label htmlFor="u-id" className="label-container">
                      <p>{t("AccountSettings.Id")}</p>
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
                        id="u-id"
                        placeholder={userIdInput.inputValue}
                        value={userIdInput.inputValue}
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                  <div className="input g-col-3">
                    <label htmlFor="u-name" className="label-container">
                      <p>{t("AccountSettings.Name")}</p>
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
                        id="u-name"
                        placeholder={userNameInput.inputValue}
                        value={userNameInput.inputValue}
                        onChange={userNameInput.handleInputChange}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>

                  <div className="input g-col-3">
                    <label htmlFor="email" className="label-container">
                      <p>{t("AccountSettings.Email")}</p>
                      <img
                        className="info"
                        src="/src/assets/information-outline.svg"
                        alt="gray outline information icon"
                      />
                    </label>
                    <div className="input-gp">
                      <input
                        type="email"
                        className="placeholder"
                        id="email"
                        placeholder={userEmailInput.inputValue}
                        value={userEmailInput.inputValue}
                        onChange={userEmailInput.handleInputChange}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div
                    className={`btn text-only ${
                      isUserProfileChanged ? "" : "inactive"
                    }`}
                    onClick={() => handlePUT_API(requestBody_PUT_Profile)}
                  >
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">{t("AccountSettings.Save")}</p>
                  </div>
                  <div
                    className="btn text-only outline"
                    id="deleteUser"
                    onClick={() => handleDeleteUser(userid)}
                  >
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">
                      {t("AccountSettings.DeleteUser")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="accSetting">
              <h2>{t("AccountSettings.RoleAndAuthority")}</h2>
              <div className="opt-list">
                <div className="opt-grid">
                  <div
                    className="input dropdown role g-col-3 suffix"
                    onClick={handleRoleDropdown}
                    ref={dropdownRef}
                  >
                    <label htmlFor="role" className="label-container">
                      <p>{t("AccountSettings.Role")}</p>
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
                        id="role"
                        placeholder={placeholderRole}
                        readOnly
                      />
                      <img
                        className="suffix active"
                        src=""
                        alt="dropdown icon"
                      />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                    <div className={`list ${isRoleActive ? "active" : ""}`}>
                      {ROLE.map((a) => (
                        <div
                          className="item"
                          key={a}
                          onClick={() => handleRoleItemClick(a)}
                        >
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="opt-grid">
                  <div className="opt-box g-col-3 user">
                    <div className="opt on">
                      <img
                        src="/src/assets/checkbox-blank-outline.svg"
                        alt=""
                      />
                      <div className="desc-box">
                        <p>Function 1</p>
                        <div className="desc">
                          <p>
                            This is a brief description of the function above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="assistive-text">This is a line of text</div>
                  </div>
                  <div className="opt-box g-col-3 user">
                    <div className="opt on">
                      <img
                        src="/src/assets/checkbox-blank-outline.svg"
                        alt=""
                      />
                      <div className="desc-box">
                        <p>Function 2</p>
                        <div className="desc">
                          <p>
                            This is a brief description of the function above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="assistive-text">This is a line of text</div>
                  </div>
                  <div className="opt-box g-col-3 engineer">
                    <div className="opt on">
                      <img
                        src="/src/assets/checkbox-blank-outline.svg"
                        alt=""
                      />
                      <div className="desc-box">
                        <p>Function 3</p>
                        <div className="desc">
                          <p>
                            This is a brief description of the function above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="assistive-text">This is a line of text</div>
                  </div>
                  <div className="opt-box g-col-3 engineer">
                    <div className="opt on">
                      <img
                        src="/src/assets/checkbox-blank-outline.svg"
                        alt=""
                      />
                      <div className="desc-box">
                        <p>Function 4</p>
                        <div className="desc">
                          <p>
                            This is a brief description of the function above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="assistive-text">This is a line of text</div>
                  </div>
                  <div className="opt-box g-col-3 admin">
                    <div className="opt on">
                      <img
                        src="/src/assets/checkbox-blank-outline.svg"
                        alt=""
                      />
                      <div className="desc-box">
                        <p>Function 5</p>
                        <div className="desc">
                          <p>
                            This is a brief description of the function above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="assistive-text">This is a line of text</div>
                  </div>
                  <div className="opt-box g-col-3 admin">
                    <div className="opt on">
                      <img
                        src="/src/assets/checkbox-blank-outline.svg"
                        alt=""
                      />
                      <div className="desc-box">
                        <p>Function 6</p>
                        <div className="desc">
                          <p>
                            This is a brief description of the function above.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="assistive-text">This is a line of text</div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div
                    className={`btn text-only ${
                      isRoleChanged ? "" : "inactive"
                    }`}
                    onClick={() => handlePUT_API(requestBody_PUT_Role)}
                  >
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">{t("AccountSettings.Save")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="accSetting">
              <h2>{t("AccountSettings.UsernameAndPassword")}</h2>
              <div className="opt-list">
                <div className="opt-grid">
                  {/* <div className="input g-col-3">
                    <label htmlFor="login" className="label-container">
                      <p>{t("AccountSettings.LoginUserName")}</p>
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
                        id="login"
                        placeholder="********"
                        readOnly
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div> */}
                  <div className="input g-col-3">
                    <label htmlFor="pw" className="label-container">
                      <p>{t("AccountSettings.Password")}</p>
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
                        id="pw"
                        placeholder=""
                        value={passwordValue}
                        onChange={handlePasswordChange}
                      />
                      <img className="suffix" src="" alt="dropdown icon" />
                    </div>
                    <div className="assistive-text">
                      this is a line of assistive text
                    </div>
                  </div>
                </div>
                <div className="btn-gp">
                  <div
                    className={`btn text-only ${
                      isPasswordChanged ? "" : "inactive"
                    }`}
                    id="changePassword-2"
                    onClick={() => handlePUT_API(requestBody_PUT_Password)}
                  >
                    <img src="" alt="" className="prefix" />
                    <p className="btn-text">
                      {t("AccountSettings.ChangePassword")}
                    </p>
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

export default AccountSetting;
