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
import { getAccessToken, isTokenExpired } from "../auth/authStore";

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
  const { login, isAuthenticated, authReady, toggleThemeMode, isDarkMode } =
    useAuth();

  // ⚠ 判準必須與 PrivateRoute 一致，否則會出現
  //     Login → navigate("/home") → PrivateRoute → <Navigate to="/" /> → Login → ...
  //   的無限迴圈（React 會丟 "Maximum update depth exceeded"）。
  //
  // 要等 authReady：AuthContext 開機時若發現 access token 過期，會先去打
  // /auth/refresh 續期。在那之前 isTokenExpired() 仍為 true，若此時就下判斷，
  // 使用者會被留在登入頁；authReady 轉 true 後這個 effect 會重跑，拿到新 token
  // 就會正確導向 /home。
  useEffect(() => {
    if (authReady && isAuthenticated && !isTokenExpired()) {
      navigate("/home", { replace: true });
    }
  }, [authReady, isAuthenticated, navigate]);

  const loginRequest = {
    userid: username,
    password: password,
  };
  const handleLogin = async () => {
    try {
      if (!username || !password) {
        // 注意：不能 alert(error)，setError 是非同步的，這裡讀到的還是「上一次」的值。
        const msg = "User account and password are required";
        setError(msg);
        alert(msg);
        return;
      }
      // console.log("Click: ");
      const res = await login_auth(username, password);

      if (res.code === 200) {

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
        console.log("Unauthorized: Access denied.");
        // Clear local storage or redirect user
      } else {
        console.log("An error occurred:", error.message);
        // alert(error.response.status);
      }
      setError("An error occurred while logging in");
      console.error(error);
    }
  };

  // 只印出「如果送出會長怎樣」，不會真的登入。
  // ⚠ 原本的寫法在 post 之前就把 adapter 還原了 → 那個 dry-run adapter 根本沒被用到，
  //   等於真的送出一次 dummy/dummy 登入。還原必須放在 post「之後」的 finally。
  const handleLogin2 = async () => {
    const orig = api.defaults.adapter;
    api.defaults.adapter = async (config) => {
      const h = config.headers;
      console.group("%c=== DRY RUN (沒有送出) ===", "color:#0a0");
      console.log("method :", config.method?.toUpperCase(), config.url);
      console.log(
        "X-Target-IP :",
        h.get?.("X-Target-IP") ??
          h["X-Target-IP"] ??
          "(未帶 → 由 proxy fallback 到預設主機)",
      );
      console.log("headers:", JSON.parse(JSON.stringify(h)));
      console.log("body   :", config.data);
      console.groupEnd();
      return Promise.reject(new Error("DRY_RUN_ABORTED"));
    };

    try {
      await api.post("/api/7284/auth/login", {
        userId: "dummy",
        password: "dummy",
      });
    } catch (e) {
      console.log("已中止:", e.message);
    } finally {
      api.defaults.adapter = orig; // 一定要還原，否則之後的請求全部會被擋掉
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
            {/* type="submit" 會觸發 form 的 onSubmit={handleKeyPress} → handleLogin()。
                原本的 onClick={()=>handleLogin} 只是「回傳函式」而沒有呼叫，是無效的，故移除。 */}
            <button className="btn text-only pri" type="submit">
              <p className="btn-text pri-text">{t("Login.Login")}</p>
            </button>

            {/* forget password button */}
            <div
              className="btn text-only outline sec"
              id="forget-pw"
              // onClick={handleForgetPassword}
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
