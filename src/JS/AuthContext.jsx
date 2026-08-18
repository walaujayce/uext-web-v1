import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, clearAccessToken } from "../auth/authStore";
import { ensureAccessToken } from "../api/apiClient";
// mp3 已移到 public/src/assets，改用 URL 字串引用(public 的檔不能用 import)
const alertLeftBedSound = "/src/assets/AlertLeftBed.mp3";
const AlertAboutToLeaveSound = "/src/assets/AlertAboutToLeave.mp3";
const isDevMode = false;
const AuthContext = createContext();

const readAuthFlag = () => localStorage.getItem("isAuthenticated") === "true";

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    if (!readAuthFlag()) return null;
    const storedUserRole = localStorage.getItem("role");
    return storedUserRole ? JSON.parse(storedUserRole) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(readAuthFlag);

  // 開機自檢是否完成。false 時代表「還在確認登入狀態(可能正在 refresh)」，
  // 消費端(例如 Login)應該先等一下再決定要不要導頁。
  const [authReady, setAuthReady] = useState(false);

  const navigate = useNavigate();
  // ⚠ 不能寫 useRef(new Audio(...))：useRef 雖然只保留第一次的值，
  //   但 new Audio(...) 這個「參數」每次 render 都會被求值 → 每 render 產生 3 個
  //   媒體播放器並立刻丟棄。一旦發生大量 re-render，就會撞到 Chrome 的上限
  //   「Blocked attempt to create a WebMediaPlayer...」。改成 lazy init 只建一次。
  const audioLeftBedRef = useRef(null);
  const audioAboutToLeaveRef = useRef(null);
  const audioAboutToLeaveRef2 = useRef(null);
  if (!audioLeftBedRef.current) {
    audioLeftBedRef.current = new Audio(alertLeftBedSound);
  }
  if (!audioAboutToLeaveRef.current) {
    audioAboutToLeaveRef.current = new Audio(AlertAboutToLeaveSound);
  }
  if (!audioAboutToLeaveRef2.current) {
    audioAboutToLeaveRef2.current = new Audio(AlertAboutToLeaveSound);
  }
  const [isAboutToLeavePlaying, setIsAboutToLeavePlaying] = useState(false);
  const [isAboutToLeave2Playing, setIsAboutToLeave2Playing] = useState(false);
  const [isLeftBedPlaying, setIsLeftBedPlaying] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [isAudioAllowed, setIsAudioAllowed] = useState(false);

  // ✅ Check and Load Authentication Status
  // 開機自檢：localStorage 說已登入，但 access token 可能已經過期
  // （例如使用者把分頁放著過夜、或重新整理）。
  // 此時「不能」直接當成登出 —— refresh token(HttpOnly cookie) 可能還有效，
  // 要先打一次 /auth/refresh 換新的 access token，真的換不到才清 session。
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!readAuthFlag()) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAuthReady(true);
        }
        return;
      }

      if (!isTokenExpired()) {
        if (!cancelled) {
          setIsAuthenticated(true);
          setAuthReady(true);
        }
        return;
      }

      // 過期 → 嘗試續期（與 PrivateRoute / 401 攔截器共用同一個 refresh promise，
      // 所以就算同時觸發也只會打一支 /auth/refresh）
      const token = await ensureAccessToken();
      if (cancelled) return;

      if (token) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        setRole(null);
        setIsAuthenticated(false);
      }
      setAuthReady(true);
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Handle Login
  const login = (role) => {
    setRole(role);
    localStorage.setItem("role", JSON.stringify(role));
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  // ✅ Handle Logout
  const logout = () => {
    setRole(null);
    stopSound();
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    // 同時清掉 access token，否則旗標沒了但 token 還在，狀態不一致
    clearAccessToken();
    navigate("/");
  };

  // ✅ Handle Authentication Change Across Tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "isAuthenticated") {
        const authStatus = event.newValue === "true";
        setIsAuthenticated(authStatus);
        if (!authStatus) {
          stopSound();
          navigate("/");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // ✅ Request Sound Permission
  useEffect(() => {
    const requestAudioPermission = async () => {
      try {
        // ✅ Try playing audio silently to check permission
        audioLeftBedRef.current.volume = 0;
        await audioLeftBedRef.current.play();
        audioLeftBedRef.current.pause();
        audioLeftBedRef.current.currentTime = 0;
        audioLeftBedRef.current.volume = 1;
        setIsAudioAllowed(true);
      } catch (error) {
        console.warn("Audio playback blocked:", error);
        //window.alert(
        //   "🔊 Your browser has blocked autoplay audio. \n\nTo enable sound:\n1️⃣ Click the 🔒 lock icon in the address bar.\n2️⃣ Go to 'Site Settings'.\n3️⃣ Find 'Sound' and set it to 'Allow'.\n4️⃣ Reload this page."
        // );
      }
    };

    requestAudioPermission();
  }, []);

  // ✅ Fake Click to Simulate User Interaction
  useEffect(() => {
    const fakeClick = () => {
      document.body.click(); // Simulate user click
      setIsUserInteracted(true);
      //console.log(
      //   "Fake Click Executed! Audio permission should now be granted.",
      // );
    };

    setTimeout(fakeClick, 500);
  }, []);

  // ✅ Play Alert Sound(About to leave Bed)
  const playAboutToLeaveSound = () => {
    console.log("play about to leave");
    if (!isAboutToLeavePlaying) {
      setIsAboutToLeavePlaying(true);
      audioAboutToLeaveRef.current.loop = false;
      audioAboutToLeaveRef.current.volume = 1;
      audioAboutToLeaveRef.current
        .play()
        .catch((error) => console.error("Error playing sound:", error));

      stopSound("aboutToLeave", 6000);
    }
  };
  // ✅ Play Alert Sound(About to leave Bed)
  const playAboutToLeaveSound2 = () => {
    console.log("play about to leave 2");
    if (!isAboutToLeave2Playing) {
      setIsAboutToLeave2Playing(true);
      audioAboutToLeaveRef2.current.loop = false;
      audioAboutToLeaveRef2.current.volume = 1;
      audioAboutToLeaveRef2.current
        .play()
        .catch((error) => console.error("Error playing sound:", error));
      stopSound("aboutToLeave2", 6000);
    }
  };
  // ✅ Play Alert Sound(Leave Bed)
  const playLeaveBedSound = () => {
    console.log("play left bed");

    if (!isLeftBedPlaying) {
      setIsLeftBedPlaying(true);
      audioLeftBedRef.current.loop = false;
      audioLeftBedRef.current.volume = 1;
      audioLeftBedRef.current
        .play()
        .catch((error) => console.error("Error playing sound:", error));
      stopSound("leftBed", 5000);
    }
  };

  // ✅ Stop Alert Sound
  const stopSound = (sound, timeLapse) => {
    setTimeout(() => {
      switch (sound) {
        case "aboutToLeave":
          audioAboutToLeaveRef.current.pause();
          audioAboutToLeaveRef.current.currentTime = 0;
          setIsAboutToLeavePlaying(false);
          console.log("stop leave bed");
          break;
        case "aboutToLeave2":
          audioAboutToLeaveRef2.current.pause();
          audioAboutToLeaveRef2.current.currentTime = 0;
          setIsAboutToLeave2Playing(false);
          console.log("stop leave bed 2");
          break;
        case "leftBed":
          audioLeftBedRef.current.pause();
          audioLeftBedRef.current.currentTime = 0;
          setIsLeftBedPlaying(false);
          console.log("stop left bed");
          break;
        default:
          audioLeftBedRef.current.pause();
          audioLeftBedRef.current.currentTime = 0;
          setIsLeftBedPlaying(false);
          audioAboutToLeaveRef.current.pause();
          audioAboutToLeaveRef.current.currentTime = 0;
          setIsAboutToLeavePlaying(false);
          audioAboutToLeaveRef2.current.pause();
          audioAboutToLeaveRef2.current.currentTime = 0;
          setIsAboutToLeave2Playing(false);
        console.log("stop all");
      }
    }, timeLapse || 0);
  };

  // toggle light/dark mode
const [isDarkMode, setDarkMode] = useState(() => {
  // const root = document.documentElement;
  // return root.classList.contains("dark");
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");  
    } else {
      root.classList.remove("dark");
      localStorage.removeItem("theme");
    }
  }, [isDarkMode]);

  const toggleThemeMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authReady,
        login,
        logout,
        isDevMode,
        role,
        isLeftBedPlaying,
        isAboutToLeavePlaying,
        isAboutToLeave2Playing,
        playAboutToLeaveSound,
        playAboutToLeaveSound2,
        playLeaveBedSound,
        stopSound,
        isUserInteracted,
        toggleThemeMode,
        isDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
