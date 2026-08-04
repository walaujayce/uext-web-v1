import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.jsx";
import Footer from "./components/Footer.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./JS/AuthContext.jsx";
import { FloorSectionProvider } from "./JS/FloorSectionContext.jsx";
import "./i18n.js";

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <AuthProvider>
        <FloorSectionProvider>
          <App />
          <Footer />
        </FloorSectionProvider>
      </AuthProvider>
    </BrowserRouter>
  </>,
);

// ReactDOM.render(
//   <React.StrictMode>
//       <App />
//       <Footer/>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
