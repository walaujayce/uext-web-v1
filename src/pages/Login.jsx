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
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setError("User account and password are required");
        alert(error);
        return;
      }

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
      console.log(data);
      // Assuming `data.password` contains the stored password
      const user = data.find((user) => user.userid === username);

      if (user) {
        console.log("Password:", user.password);
        if (user.password === password) {
          localStorage.setItem("username", JSON.stringify(user.username)); // Save user to localStorage

          switch (user.role) {
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
      }
    } catch (error) {
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
      <img className="background" src="/src/assets/login-bg.svg" alt="" />
      <div className="login">
        <img className="uextLogo" src="/src/assets/uext.svg" alt="" />
        <div className="title">{t("Login.title")}</div>
        {/* Login Page */}
        <form className="st2 active">
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
                type="email"
                pattern=""
                className="placeholder"
                name="login"
                placeholder="Enter here"
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
                placeholder="Enter here"
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
            <a className="btn text-only pri" onClick={handleLogin}>
              <p className="btn-text pri-text">{t("Login.Login")}</p>
            </a>

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
