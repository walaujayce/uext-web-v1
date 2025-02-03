import React, { useState, useEffect, useRef } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";

const ChangePasswordModal = ({ callback }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false); //loading screen

  {
    /* Handle Overlay Logic */
  }
  const handleWindowClick = (e) => {
    e.stopPropagation();
  };

  {
    /* Handle Stage 1 Btn Logic */
  }
  const [isActiveStage2, setActiveStage2] = useState(false);
  const handleActiveStage2 = () => {
    setActiveStage2(!isActiveStage2);
  };

  {
    /* INPUT LOGIC */
  }
  function useSetInput(initialPlaceholder) {
    const [isActive, setIsActive] = useState(false);
    const [placeholder, setPlaceholder] = useState(initialPlaceholder);
    const [input, setInput] = useState("");
    const toggleActive = () => {
      setIsActive(!isActive);
    };
    const handleInputChange = (e) => {
      setInput(e.target.value);
    };

    return {
      isActive,
      placeholder,
      toggleActive,
      input,
      handleInputChange,
    };
  }

  const currentPw = useSetInput(t("ChangePassword.EnterHere"));
  const NewPw = useSetInput(t("ChangePassword.EnterHere"));
  const ConfirmPw = useSetInput(t("ChangePassword.EnterHere"));

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const handleChangePassword = () => {
    if (currentPw.input === "") {
      alert("Please fill in 'Current Password'!");
      return;
    }
    if (NewPw.input === "") {
      alert("Please fill in 'New Password'!");
      return;
    }
    if (ConfirmPw.input === "") {
      alert("Please fill in 'Confirm Password'!");
      return;
    }
    if (!passwordValidationRegex.test(NewPw.input)) {
      alert(
        "Password must include at least one uppercase letter, one lowercase letter, one number, and be at least 6 characters long."
      );
      return;
    }
    if (NewPw.input === currentPw.input) {
      alert("The new password cannot be the same as the old password!");
      return;
    }
    if (NewPw.input !== ConfirmPw.input) {
      alert("Please ensure 'Password' and 'Confirm Password' are the same!");
      return;
    }
    handlePUT_API();
  };
  const requestBody_PUT_Password = {
    password: NewPw.input,
  };
  const handlePUT_API = async () => {
    try {
      setLoading(true);
      // Get userid based on username in local storage
      const response = await fetch("/api/7284/User", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const stored_username = JSON.parse(localStorage.getItem("username"));
      const selected_user = data.find((user)=>(user.username == stored_username));
      //check current password with database password
      if(selected_user.password!==currentPw.input){
        alert("Current Password is not correct!");
        return;
      }else{
        //update new password
        console.log("userInfo data is :", selected_user);

        const { lastlogin, userid, ...filteredUserInfo } = selected_user; // Destructure to exclude alertguid

        const updatedData = { ...filteredUserInfo, ...requestBody_PUT_Password };
        console.log("updated data is :", updatedData);
  
        const response = await fetch(`/api/7284/User/${selected_user.userid}`, {
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
        if(response.status!==200){
            alert("Failed to update password!");
        }else{
            setActiveStage2(true);
        }
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />
      <div
        className={`changePassword ${isActiveStage2 ? "" : "active"}`}
        onClick={handleWindowClick}
      >
        <div className="window">
          <div className="title">New Password</div>
          <div className="subtitle"></div>
          <img
            src="/src/assets/close.svg"
            alt=""
            className="close"
            onClick={callback}
          />
          <form action="">
            <div className="grid">
              {/* Current Password */}
              <div className="input g-c-6 suffix">
                <label htmlFor="cpw" className="label-container">
                  <p>{t("ChangePassword.CurrentPw")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type={`${currentPw.isActive ? "text" : "password"}`}
                    className="placeholder"
                    name="cpw"
                    placeholder={currentPw.placeholder}
                    value={currentPw.input}
                    onChange={currentPw.handleInputChange}
                    required
                    autoComplete="false"
                  />
                  <img
                    className="suffix hide"
                    src={`${
                      currentPw.isActive
                        ? "/src/assets/eye.svg"
                        : "/src/assets/eye-off.svg"
                    }`}
                    alt="eye icon"
                    onClick={currentPw.toggleActive}
                  />
                </div>
                <div className="assistive-text">
                  Must include one upper and one lower case alphabet.
                </div>
              </div>
              {/* New Password */}
              <div className="input g-c-6 suffix">
                <label htmlFor="npw" className="label-container">
                  <p>{t("ChangePassword.NewPw")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type={`${NewPw.isActive ? "text" : "password"}`}
                    className="placeholder"
                    name="npw"
                    placeholder={NewPw.placeholder}
                    value={NewPw.input}
                    onChange={NewPw.handleInputChange}
                    required
                    autoComplete="false"
                  />
                  <img
                    className="suffix hide"
                    src={`${
                      NewPw.isActive
                        ? "/src/assets/eye.svg"
                        : "/src/assets/eye-off.svg"
                    }`}
                    alt="eye icon"
                    onClick={NewPw.toggleActive}
                  />
                </div>
                <div className="assistive-text">
                  Must include one upper and one lower case alphabet.
                </div>
              </div>
              {/* Confirm Password */}
              <div className="input g-c-6 suffix">
                <label htmlFor="cnpw" className="label-container">
                  <p>{t("ChangePassword.ConfirmNewPw")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type={`${ConfirmPw.isActive ? "text" : "password"}`}
                    className="placeholder"
                    name="cnpw"
                    placeholder={ConfirmPw.placeholder}
                    value={ConfirmPw.input}
                    onChange={ConfirmPw.handleInputChange}
                    required
                    autoComplete="false"
                  />
                  <img
                    className="suffix hide"
                    src={`${
                      ConfirmPw.isActive
                        ? "/src/assets/eye.svg"
                        : "/src/assets/eye-off.svg"
                    }`}
                    alt="eye icon"
                    onClick={ConfirmPw.toggleActive}
                  />
                </div>
                <div className="assistive-text">
                  Must include one upper and one lower case alphabet.
                </div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only pri" onClick={handleChangePassword}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">
                  {t("ChangePassword.Confirm")}
                </p>
              </div>
              <div className="btn text-only outline sec" onClick={callback}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">{t("ChangePassword.Back")}</p>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Confirm messages overlay */}
      <div className={`overlay newpwConfirm ${isActiveStage2 ? "active" : ""}`}>
        <div className="warn">
          <img
            className="icon"
            src="/src/assets/check-active.svg"
            alt="tick icon"
          />
          <h1 className="title">{t("ChangePassword.OkayMessageTitle")}</h1>
          <p className="desc">{t("ChangePassword.OkayMessageH1")}</p>
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">{t("ChangePassword.Okay")}</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
