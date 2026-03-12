/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "/src/CSS/Login.css";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import { useAuth } from "../JS/AuthContext";
import { useTranslation } from "react-i18next";
import { login_auth } from "../auth/authService";
import api from "../api/apiClient";
import { getAccessToken } from "../auth/authStore";

function Login() {
  const { t, i18n } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (event) => {
    event.preventDefault(); // Prevents the page from reloading
      handleLogin();
  };


  const navigate = useNavigate();
  const { login, isAuthenticated, toggleThemeMode, isDarkMode } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const loginRequest = {
    userid: username,
    password: password,
  };
  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setError("User account and password are required");
        alert(error);
        return;
      }
      const res = await login_auth(username, password);
      //console.log("Result: ", res);

      // const res = api.get('/api/7284/User');
      // const response = await fetch("/api/7284/User", {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      // const user = data.find((user) => user.userid === username);

      if (res.code === 200) {
        ////console.log("Password:", user.password);
        localStorage.setItem("username", JSON.stringify(username)); // Save user to localStorage

        switch (res.data.role) {
          case 0:
            login("administrator");
            break;
          case 1:
            login("engineer");
            break;
          case 2:
            login("user");
            break;
        }
        navigate("/home");
      } else {
        setError("Incorrect password");
        alert("Invalid User account or Password!");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        //console.log("Unauthorized: Access denied.");
        // Clear local storage or redirect user
      } else {
        //console.log("An error occurred:", error.message);
      }
      setError("An error occurred while logging in");
      console.error(error);
    }
  };

  {
    /* Navigate to forget password Page */
  }
  const handleForgetPassword = () => {
    navigate("/forget-password");
  };

  return (
    <>
      <img className={`background ${isDarkMode ? "dark" : ""}`} src="/src/assets/login-bg.svg" alt="" />
      <div className={`toggle-btn ${isDarkMode ? "dark" : ""}`} onClick={toggleThemeMode}><img className="img" src="/src/assets/light-mode-grey.svg" alt="" /></div>
      <div className="login">
        <img className="uextLogo" src="/src/assets/uneo-logo.svg" alt="" />
        {/* <div className="title">{t("Login.title")}</div> */}
        {/* Login Page */}
        <form className="st2 active" onSubmit={handleKeyPress} noValidate>
          {/* login input box */}
          <div className="input g-c-6">
            <label htmlFor="login" className="label-container">
              <p>{t("Login.Username")}</p>
              <img
                className="info"
                src="/src/assets/information-outline.svg"
                alt="gray outline information icon"
              />
            </label>
            <div className="input-gp">
              <input
                type="text"
                pattern=""
                className="placeholder"
                name="login"
                placeholder={t("Login.InputboxPlaceholder")}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
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

          {/* password input box */}
          <div className="input g-c-6 suffix">
            <label htmlFor="pw" className="label-container">
              <p>{t("Login.Password")}</p>
              <img
                className="info"
                src="/src/assets/information-outline.svg"
                alt="gray outline information icon"
              />
            </label>
            <div className="input-gp">
              <input
                type={showPassword ? "text" : "password"}
                className="placeholder"
                name="pw"
                placeholder={t("Login.InputboxPlaceholder")}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div className="assistive-text">
              Must include one upper and one lower case alphabet.
            </div>
          </div>
          <div className="btn-gp">
            {/* login button */}
            <button className="btn text-only pri" onClick={handleLogin} type="submit">
              <p className="btn-text pri-text">{t("Login.Login")}</p>
            </button>

            {/* forget password button */}
            <div
              className="btn text-only outline sec"
              id="forget-pw"
              onClick={handleForgetPassword}
            >
              <p className="btn-text sec-text">{t("Login.ForgetPassword")}</p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
