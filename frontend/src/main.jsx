// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "typeface-poppins";

// Suppress harmless browser extension/third-party errors
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections (like getInstalledRelatedApps)
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes?.('getInstalledRelatedApps') ||
      event.reason?.toString?.()?.includes?.('getInstalledRelatedApps')
    ) {
      // Silently ignore harmless browser extension errors
      event.preventDefault();
      return;
    }
    // Let other unhandled rejections through
  });

  // Also filter console errors for the same issue
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0]?.message || args[0]?.toString?.() || '';
    if (errorMessage.includes('getInstalledRelatedApps')) {
      return; // Silently ignore
    }
    originalError.apply(console, args);
  };
}

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
