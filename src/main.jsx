import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import App from './App.jsx'
import Footer from './components/Footer.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Footer/>
  </>
)

// ReactDOM.render(
//   <React.StrictMode>
//       <App />
//       <Footer/>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
