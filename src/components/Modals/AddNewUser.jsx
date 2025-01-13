import React, { useState, useRef, useEffect } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";

const AddNewUser = ({ callback }) => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  {
    /* Handle Overlay Logic */
  }
  const handleOverlayClick = (e) => {
    // Close the modal when clicking outside the modal window
    callback(e);
  };

  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  const [isActive_Stage2, setIsActive_Stage2] = useState(false);

  function useSetInfoInput(initialPlaceHolder) {
    const [inputValue, setInputValue] = useState(initialPlaceHolder);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
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
  const userPasswordInput = useSetInfoInput("");
  const userConfirmPasswordInput = useSetInfoInput("");

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  {
    /* ROLE  */
  }
  const [isRoleActive, setRoleActive] = useState(false);
  const handleRoleDropdown = () => {
    setRoleActive((prev) => !prev);
  };
  const ROLE = ["Administrator", "Engineer", "User"];
  const [placeholderRole, setPlaceholderRole] = useState("Select Role"); // Input placeholder
  const handleRoleItemClick = (role) => {
    setPlaceholderRole(role);
    handleRoleDropdown;
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

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const requestBody_POST = {
    userid: userIdInput.inputValue,
    username: userNameInput.inputValue,
    password: userPasswordInput.inputValue,
    email: userEmailInput.inputValue,
    role: ROLE.indexOf(placeholderRole),
  };
  const handlePOST_API = async () => {
    console.log(requestBody_POST);
    if (!ROLE.includes(placeholderRole)) {
      alert("Please select role!");
      return;
    }
    if (userIdInput.inputValue === "") {
      alert("Please fill in a valid ID!");
      return;
    }
    if (userNameInput.inputValue === "") {
      alert("Please fill in a valid Name!");
      return;
    }
    if (userEmailInput.inputValue === "") {
      alert("Please fill in a valid Email!");
      return;
    }
    if (userPasswordInput.inputValue === "") {
      alert("Please fill in a valid Password!");
      return;
    }
    if (userConfirmPasswordInput.inputValue === "") {
      alert("Please fill in 'Confirm Password'!");
      return;
    }
    if (!passwordValidationRegex.test(userConfirmPasswordInput.inputValue)) {
      alert(
        "Password must include at least one uppercase letter, one lowercase letter, one number, and be at least 6 characters long."
      );
      return;
    }
    if (userConfirmPasswordInput.inputValue !== userPasswordInput.inputValue) {
      alert("Please ensure 'Password' and 'Confirm Password' are same!");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/7284/User", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody_POST),
      });

      if (response.status === 200) {
        setIsActive_Stage2(true);
      } else {
        const errorData = await response.json();
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
              ? t("AddUserModal.NewUserCreate")
              : t("AddUserModal.AddUserTitle")
          }`}</div>
          <div
            className="tab-list"
            style={{ display: isActive_Stage2 ? "none" : "" }}
          >
            <a href="#" className="tab active tab-1">
              {t("AddUserModal.AddUser-p")}
            </a>
            {/* <a href="#" className="tab tab-2">Device Connection</a> */}
          </div>
          {/* User Profile */}
          <form action="POST" autoComplete="off">
            <div
              className="grid st3 active"
              style={{ display: isActive_Stage2 ? "none" : "" }}
            >
              {/* Role */}
              <div
                className="input g-c-3 suffix"
                onClick={handleRoleDropdown}
                ref={dropdownRef}
              >
                <label htmlFor="role" className="label-container">
                  <p>{t("AddUserModal.Role")}</p>
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
                    src="/src/assets/menu-down.svg"
                    alt="dropdown icon"
                  />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className={`list ${isRoleActive ? "active" : ""}`}>
                  {ROLE.map((role) => (
                    <div
                      className="item"
                      key={role}
                      onClick={() => handleRoleItemClick(role)}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              </div>
              {/* Id */}
              <div className="input g-c-3">
                <label htmlFor="id" className="label-container">
                  <p>{t("AddUserModal.Id")}</p>
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
                    id="id"
                    placeholder="Enter here"
                    value={userIdInput.inputValue}
                    onChange={userIdInput.handleInputChange}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text`}>Invalid format.</div>
              </div>
              {/* Name */}
              <div className="input g-c-3">
                <label htmlFor="name" className="label-container">
                  <p>{t("AddUserModal.Name")}</p>
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
                    placeholder="Enter here"
                    value={userNameInput.inputValue}
                    onChange={userNameInput.handleInputChange}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text `}>
                  Oops! Something went wrong.
                </div>
              </div>
              {/* Email */}
              <div className="input g-c-3">
                <label htmlFor="email" className="label-container">
                  <p>{t("AddUserModal.Email")}</p>
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
                    placeholder="Enter here"
                    value={userEmailInput.inputValue}
                    onChange={userEmailInput.handleInputChange}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className={`assistive-text `}>
                  Oops! Something went wrong.
                </div>
              </div>
              {/* Password */}
              <div className="input g-c-3 suffix">
                <label htmlFor="pw_new" className="label-container">
                  <p>{t("AddUserModal.Password")}</p>
                  <div className="info-container">
                    <img
                      className="info active"
                      src="/src/assets/information-outline.svg"
                      alt="gray outline information icon"
                    />
                    <div className="tooltip">
                      <ul>
                        <li>At least 1 uppercase letter.</li>
                        <li>At least 1 lowercase letter.</li>
                        <li>At least 1 number.</li>
                        <li>At least 6 characters.</li>
                      </ul>
                    </div>
                  </div>
                </label>
                <div className="input-gp">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="placeholder"
                    name="pw_new"
                    placeholder="Enter here"
                    value={userPasswordInput.inputValue}
                    onChange={userPasswordInput.handleInputChange}
                    required
                    autoComplete="off"
                  />
                  <img
                    className="suffix hide"
                    src={`${
                      showPassword
                        ? "/src/assets/eye.svg"
                        : "/src/assets/eye-off.svg"
                    }`}
                    alt="eye icon"
                    onClick={togglePasswordVisibility}
                  />
                </div>
                <div className="assistive-text"></div>
              </div>
              {/* Confirm Password */}
              <div className="input g-c-3 suffix">
                <label htmlFor="pw_confirm" className="label-container">
                  <p>{t("AddUserModal.ConfirmPassword")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="placeholder"
                    name="pw_confirm"
                    placeholder="Enter here"
                    value={userConfirmPasswordInput.inputValue}
                    onChange={userConfirmPasswordInput.handleInputChange}
                    required
                    autoComplete="off"
                  />
                  <img
                    className="suffix hide"
                    src={`${
                      showConfirmPassword
                        ? "/src/assets/eye.svg"
                        : "/src/assets/eye-off.svg"
                    }`}
                    alt="eye icon"
                    onClick={toggleConfirmPasswordVisibility}
                  />
                </div>
                <div className="assistive-text">
                  Must include one upper and one lower case alphabet.
                </div>
              </div>
            </div>
            <div
              className="btn-gp st-2"
              style={{ display: isActive_Stage2 ? "none" : "" }}
            >
              <div className="btn text-only pri" onClick={handlePOST_API}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">{t("AddUserModal.Confirm")}</p>
              </div>
              <div className="btn text-only outline sec" onClick={callback}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">{t("AddUserModal.Cancel")}</p>
              </div>
            </div>
          </form>
          {/* Successful / Link to Patient */}
          <div className={`btn-gp st2 ${isActive_Stage2 ? "active" : ""}`}>
            <a className="btn text-only pri" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">{t("AddUserModal.Okay")}</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewUser;
