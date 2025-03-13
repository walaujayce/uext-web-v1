import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import alertSound from "/src/assets/alert.mp3"; // Import MP3 file

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
  const audioRef = useRef(new Audio(alertSound));
  const [isPlaying, setIsPlaying] = useState(false);
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
        audioRef.current.volume = 0;
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1;
        setIsAudioAllowed(true);
      } catch (error) {
        console.warn("Audio playback blocked:", error);
        window.alert(
          "🔊 Your browser has blocked autoplay audio. \n\nTo enable sound:\n1️⃣ Click the 🔒 lock icon in the address bar.\n2️⃣ Go to 'Site Settings'.\n3️⃣ Find 'Sound' and set it to 'Allow'.\n4️⃣ Reload this page."
        );
      }
    };

    requestAudioPermission();
  }, []);

  // ✅ Fake Click to Simulate User Interaction
  useEffect(() => {
    const fakeClick = () => {
      document.body.click(); // Simulate user click
      setIsUserInteracted(true);
      console.log("Fake Click Executed! Audio permission should now be granted.");
    };

    setTimeout(fakeClick, 500);
  }, []);

  // ✅ Play Alert Sound
  const playSound = () => {


    if (!isPlaying) {
      setIsPlaying(true);
      audioRef.current.loop = false;
      audioRef.current.volume = 1;
      audioRef.current.play().catch((error) => console.error("Error playing sound:", error));

      setTimeout(() => {
        stopSound();
      }, 4000);
    }
  };

  // ✅ Stop Alert Sound
  const stopSound = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isDevMode,
        role,
        isPlaying,
        playSound,
        stopSound,
        isUserInteracted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
