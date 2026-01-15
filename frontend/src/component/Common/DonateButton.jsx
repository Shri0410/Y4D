// src/components/DonateButton.jsx
import React from "react";
import "./DonateButton.css";
import donateImg from "../../assets/Donate.png";

const DonateButton = () => {
  return (
    <a href="/DonateNow" className="donate-btn">
      <img src={donateImg}></img>
    </a>
  );
};

export default DonateButton;
