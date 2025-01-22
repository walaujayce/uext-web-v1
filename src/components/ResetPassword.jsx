/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "/src/CSS/Login.css";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import { useAuth } from "../JS/AuthContext";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";

function ResetPassword() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  const userid = searchParams.get("userid") || "User123";

  const [passwordInput, setPasswordInput] = useState("");
  const handlePasswordInputChange = (e) => {
    setPasswordInput(e.target.value);
  };
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const handleConfirmPasswordInputChange = (e) => {
    setConfirmPasswordInput(e.target.value);
  };
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  {
    /* handle renew password */
  }
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
    } catch (error) {
      console.error("Error fetching device data:", error.message, error);
    }
  };
  useEffect(() => {
    fetchUserInfo(userid);
  }, []);

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const handleChangePassword = () => {
    if (passwordInput === "") {
      alert("Please fill in a valid Password!");
      return;
    }
    if (confirmPasswordInput === "") {
      alert("Please fill in 'Confirm Password'!");
      return;
    }
    if (!passwordValidationRegex.test(passwordInput)) {
      alert(
        "Password must include at least one uppercase letter, one lowercase letter, one number, and be at least 6 characters long."
      );
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      alert("Please ensure 'Password' and 'Confirm Password' are same!");
      return;
    }
    handlePUT_API();
  };
  const requestBody_PUT_Password = {
    password: passwordInput,
  };

  const handlePUT_API = () => {
    PUT_UserInfo(userid, requestBody_PUT_Password);
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
        navigate("/");
      }
      return data; // Return the response data if needed
    } catch (error) {
      console.error("Error updating device:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleBackdrop open={loading} />

      <img className="background" src="/src/assets/login-bg.svg" alt="" />
      <div
        className="login"
        style={{
          transform: "translateY(55%)",
        }}
      >
        <img className="uextLogo" src="/src/assets/uneo-logo.svg" alt="" />
        {/* <div className="title">{t("Login.ResetPassword")}</div> */}
        {/* Login Page */}
        {/* Reset Password */}
        <form className="st4 active">
          {/* Password */}
          <div className="input g-c-6 suffix">
            <label htmlFor="pw" className="label-container">
              <p>{t("Login.NewPassword")}</p>
              <img
                className="info"
                src="/src/assets/information-outline.svg"
                alt="gray outline information icon"
              />
            </label>
            <div className="input-gp">
              <input
                type={`${showPassword ? "text" : "password"}`}
                className="placeholder"
                name="pw"
                placeholder="Enter here"
                value={passwordInput}
                onChange={handlePasswordInputChange}
                required
                autoComplete="false"
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
            <div className="assistive-text">
              Must include one upper and one lower case alphabet.
            </div>
          </div>
          {/* Confirm Password */}
          <div className="input g-c-6 suffix">
            <label htmlFor="cpw" className="label-container">
              <p>{t("Login.ConfirmYourNewPassword")}</p>
              <img
                className="info"
                src="/src/assets/information-outline.svg"
                alt="gray outline information icon"
              />
            </label>
            <div className="input-gp">
              <input
                type={`${showConfirmPassword ? "text" : "password"}`}
                className="placeholder"
                name="cpw"
                placeholder="Enter here"
                value={confirmPasswordInput}
                onChange={handleConfirmPasswordInputChange}
                required
                autoComplete="false"
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
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={handleChangePassword}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">
                {t("Login.ConfirmChangePassword")}
              </p>
            </a>
          </div>
        </form>
      </div>
    </>
  );
}

export default ResetPassword;
