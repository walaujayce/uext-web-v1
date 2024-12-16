import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.jsx";
import Footer from "./components/Footer.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./JS/AuthContext.jsx";

  createRoot(document.getElementById("root")).render(
    <>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Footer/>
        </AuthProvider>
      </BrowserRouter>
    </>
  );  

// ReactDOM.render(
//   <React.StrictMode>
//       <App />
//       <Footer/>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
