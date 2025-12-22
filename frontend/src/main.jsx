// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "typeface-poppins";

// Suppress harmless third-party script errors (LinkedIn, Elfsight, etc.)
if (typeof window !== 'undefined') {
  // List of error patterns to suppress (harmless third-party errors)
  const suppressedErrorPatterns = [
    'getInstalledRelatedApps', // LinkedIn widget error
    'AccessibleComponent but is missing a11y options', // LinkedIn video player warning
    'static.licdn.com', // LinkedIn scripts
    'elfsight', // Elfsight widget errors
    'protechts.net', // Third-party analytics
    'crcldu.com', // Third-party analytics
    'auditor.js', // Third-party tracking
  ];

  // Check if error should be suppressed
  const shouldSuppressError = (error) => {
    const errorString = typeof error === 'string' 
      ? error 
      : error?.message || error?.toString?.() || JSON.stringify(error) || '';
    
    return suppressedErrorPatterns.some(pattern => 
      errorString.includes(pattern)
    );
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldSuppressError(event.reason)) {
      // Silently ignore harmless third-party errors
      event.preventDefault();
      return;
    }
    // Let other unhandled rejections through for debugging
  });

  // Filter console errors and warnings
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const errorMessage = args.join(' ');
    if (shouldSuppressError(errorMessage)) {
      return; // Silently ignore
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const warnMessage = args.join(' ');
    if (shouldSuppressError(warnMessage)) {
      return; // Silently ignore
    }
    originalWarn.apply(console, args);
  };

  // Also handle global error events (for non-promise errors)
  window.addEventListener('error', (event) => {
    if (shouldSuppressError(event.message) || shouldSuppressError(event.filename)) {
      event.preventDefault();
      return;
    }
    // Let other errors through
  }, true); // Use capture phase to catch errors early
}

// Render React app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
