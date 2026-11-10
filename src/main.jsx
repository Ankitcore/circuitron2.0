import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initPerformanceOptimizations } from './utils/performance';

// Initialize hardware performance tier detection
initPerformanceOptimizations();

// Security: Self-XSS Protection Warning
if (typeof window !== "undefined") {
  console.log(
    "%c⚠️ SECURITY NOTICE",
    "color: #00f0ff; font-family: sans-serif; font-size: 28px; font-weight: bold;"
  );
  console.log(
    "%cTechXpo 2.O / Circuitron Client Portal.\nPasting unverified scripts into this console compromises security and violates system integrity (Self-XSS protection active).",
    "color: #a0aec0; font-family: sans-serif; font-size: 13px;"
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
