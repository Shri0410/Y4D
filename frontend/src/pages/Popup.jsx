import React, { useState, useEffect } from "react";
import "./Popup.css";

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Set timer for 3 minutes (180000 ms)
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 180000);

    // Cleanup if user leaves earlier
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>👋 Still with us?</h2>
            <p>
              Thanks for staying! Don’t miss out on our latest updates and
              initiatives. 💡
            </p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
