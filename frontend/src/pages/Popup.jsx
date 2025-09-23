import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate
import "./Popup.css";

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was already shown
    const hasShown = localStorage.getItem("popupShown");

    if (!hasShown) {
      // Show popup after 2 minutes (120000 ms)
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("popupShown", "true"); // Mark as shown
      }, 120000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleExplore = () => {
    setShowPopup(false); // close popup
    navigate("/corporate-partnership"); // navigate to the page
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Let’s Create Impact Together!</h2>
            <p>
              Partner with Y4D to drive meaningful CSR initiatives or stay
              connected with our latest updates.
            </p>
            <button onClick={handleExplore}>Explore Partnership</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
