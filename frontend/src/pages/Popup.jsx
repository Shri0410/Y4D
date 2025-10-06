import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Popup.css";

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasShown = localStorage.getItem("popupShown");

    if (!hasShown) {
      // Show popup after 2 seconds (2000 ms)
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("popupShown", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleExplore = () => {
    setShowPopup(false);
    navigate("/corporate-partnership");
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="popup-close" onClick={handleClose}>
              &times;
            </button>
            <h2>Let’s Create Impact Together!</h2>
            <p>
              Partner with Y4D to drive meaningful CSR initiatives or stay
              connected with our latest updates.
            </p>
            <button className="popup-explore" onClick={handleExplore}>
              Explore Partnership
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
