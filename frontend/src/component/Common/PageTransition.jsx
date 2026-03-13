// src/component/PageTransition.jsx
import React from "react";
import logo from "../../assets/landing_logo.png";
import globalLogo from "../../assets/GlobalLogo.png";
import { useRegion } from "../../hooks/useRegion";

const PageTransition = () => {
  const region = useRegion();
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <img
        src={region === "global" ? globalLogo : logo}
        alt="Transition Logo"
        style={{ width: "150px", animation: "zoom 1.5s ease-in-out infinite" }}
      />
    </div>
  );
};

export default PageTransition;
