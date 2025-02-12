/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "/src/CSS/Login.css";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import { useAuth } from "../JS/AuthContext";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";

function LoginPassword() {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  const [error, setError] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const handleEmailInputChange = (e) => {
    setEmailInput(e.target.value);
  };

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  {
    /* Navigate to forget password Page */
  }
  const [isActive_Stage2, setIsActive_Stage2] = useState(false);
  const handleForgetPassword = () => {
    handleSendResetLink(requestBody_POST);
  };
  const handleBackToLogin = () => {
    navigate("/");
  };

  {
    /* Generate Email Token */
  }
  const handleGenerateEmailToken = async (requestBody_POST) => {
    // console.log(requestBody_POST);
    try {
      const response = await fetch("/api/7284/SendEmail/generate-email-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody_POST),
      });
      const data = await response.json();
      if (response.status === 200) {
        return data.token;
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert("Error: Unable to connect to the server.");
    }
  };
  {
    /* handle send reset link */
  }
  const send_message_email = `Click link below to reset password`;
  const requestBody_POST = {
    email: emailInput,
    message: "",
  };
  const handleSendResetLink = async (requestBody_POST) => {
    // console.log(requestBody_POST);
    if (emailInput === "") {
      alert("Please fill in a valid Email!");
      return;
    }
    try {
      setLoading(true);
      const token = await handleGenerateEmailToken(requestBody_POST);
      const url = `http://${
        import.meta.env.VITE_WEBAPI_URL
      }:8005/reset-password`;
      requestBody_POST.message = `${send_message_email}\r\n${url}?email=${emailInput}&token=${token}`;
      console.log("message is ", requestBody_POST.message);
      const response = await fetch("/api/7284/SendEmail/send-email", {
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
      <img className="background" src="/src/assets/login-bg.svg" alt="" />
      <div
        className="login"
        style={{
          transform: isActive_Stage2 ? "translateY(101%)" : "translateY(105%)",
        }}
      >
        <img className="uextLogo" src="/src/assets/uneo-logo.svg" alt="" />
        {/* <div className="title">{t("Login.ForgetPassword")}</div> */}
        {/* Login Page */}
        {/* Forget Password */}
        <form className={`st2 ${isActive_Stage2 ? "" : "active"}`}>
          {/* Forget Password */}
          <div className="input g-c-6">
            <label htmlFor="reset" className="label-container">
              <p>{t("Login.forgetpassword-inputbox-title")}</p>
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
                name="reset"
                placeholder="example@gmail.com"
                value={emailInput}
                onChange={handleEmailInputChange}
                required
              />
              <img
                className="suffix"
                src="/src/assets/eye-off.svg"
                alt="eye icon"
              />
            </div>
            <div className="assistive-text">
              Must include one upper and one lower case alphabet.
            </div>
          </div>
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={handleForgetPassword}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">
                {t("Login.send-me-reset-link")}
              </p>
            </a>
            <a
              className="btn text-only outline pri"
              onClick={handleBackToLogin}
            >
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">{t("Login.back-to-login")}</p>
            </a>
          </div>
        </form>
        {/* Confirm reset link sent */}
        <div className={`st3 ${isActive_Stage2 ? "active" : ""}`}>
          <h1>
            {t("Login.reset-link-send")}({emailInput})
          </h1>
          <div className="btn-gp">
            <a className="btn text-only pri" onClick={handleBackToLogin}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">{t("Login.back-to-login")}</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPassword;
