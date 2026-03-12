import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import alertLeftBedSound from "/src/assets/AlertLeftBed.mp3"; // Import MP3 file
import AlertAboutToLeaveSound from "/src/assets/AlertAboutToLeave.mp3"; // Import MP3 file
const isDevMode = false;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    const storedUserRole = localStorage.getItem("role");
    return storedUserRole ? JSON.parse(storedUserRole) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const navigate = useNavigate();
  const audioLeftBedRef = useRef(new Audio(alertLeftBedSound));
  const audioAboutToLeaveRef = useRef(new Audio(AlertAboutToLeaveSound));
  const audioAboutToLeaveRef2 = useRef(new Audio(AlertAboutToLeaveSound));
  const [isAboutToLeavePlaying, setIsAboutToLeavePlaying] = useState(false);
  const [isAboutToLeave2Playing, setIsAboutToLeave2Playing] = useState(false);
  const [isLeftBedPlaying, setIsLeftBedPlaying] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [isAudioAllowed, setIsAudioAllowed] = useState(false);

  // ✅ Check and Load Authentication Status
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
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
    localStorage.removeItem("username");
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
    //console.log("play about to leave");
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
    //console.log("play about to leave 2");
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
    //console.log("play left bed");

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
          break;
        case "aboutToLeave2":
          audioAboutToLeaveRef2.current.pause();
          audioAboutToLeaveRef2.current.currentTime = 0;
          setIsAboutToLeave2Playing(false);
          break;
        case "leftBed":
          audioLeftBedRef.current.pause();
          audioLeftBedRef.current.currentTime = 0;
          setIsLeftBedPlaying(false);
          // //console.log("stop left bed");
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
        // //console.log("stop all");
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
