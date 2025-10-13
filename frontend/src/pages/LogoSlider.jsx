import React from "react";
import "./LogoSlider.css";
import sdg1 from "../assets/SDG/SDG1.png";
import sdg2 from "../assets/SDG/SDG2.png";
import sdg3 from "../assets/SDG/SDG3.png";
import sdg4 from "../assets/SDG/SDG4.png";
import sdg5 from "../assets/SDG/SDG5.png";
import sdg6 from "../assets/SDG/SDG6.png";
import sdg8 from "../assets/SDG/SDG8.png";
import sdg9 from "../assets/SDG/SDG9.png";
import sdg10 from "../assets/SDG/SDG10.png";
import sdg11 from "../assets/SDG/SDG11.png";

const LogoSlider = () => {
  const logos = [sdg1, sdg2, sdg3, sdg4, sdg5, sdg6, sdg8, sdg9, sdg10, sdg11];
  // Duplicate twice for a seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="logo-slider-section">
      <div className="slider-container">
        <h2 className="sdg-title">
          Towards Achieving SDGs<span></span>
        </h2>
        <div className="slider-track">
          {duplicatedLogos.map((logo, index) => (
            <div key={index} className="slide">
              <img
                src={logo}
                alt={`Logo ${(index % logos.length) + 1}`}
                className="logo-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoSlider;
