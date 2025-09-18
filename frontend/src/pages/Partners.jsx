// src/components/Partners.jsx
import React from "react";
import Slider from "react-slick";
import "./Partners.css"; // CSS for this component

import p1 from "../assets/Partner/Partner01.png";
import p2 from "../assets/Partner/Partner02.png";
import p3 from "../assets/Partner/Partner03.png";
import p4 from "../assets/Partner/Partner04.png";
import p5 from "../assets/Partner/Partner05.png";
import p6 from "../assets/Partner/Partner06.png";
import p7 from "../assets/Partner/Partner07.png";
import p8 from "../assets/Partner/Partner08.png";
import p9 from "../assets/Partner/Partner09.png";
import p10 from "../assets/Partner/Partner10.png";
import p11 from "../assets/Partner/Partner11.png";
import p12 from "../assets/Partner/Partner12.png";
import p13 from "../assets/Partner/Partner13.png";
import p14 from "../assets/Partner/Partner14.png";
import p15 from "../assets/Partner/Partner15.png";
import p16 from "../assets/Partner/Partner16.png";
import p17 from "../assets/Partner/Partner17.png";
import p18 from "../assets/Partner/Partner18.png";
import p19 from "../assets/Partner/Partner19.png";
import p20 from "../assets/Partner/Partner20.png";
import p21 from "../assets/Partner/Partner21.png";
import p22 from "../assets/Partner/Partner22.png";
import p23 from "../assets/Partner/Partner23.png";
import p24 from "../assets/Partner/Partner24.png";
import p25 from "../assets/Partner/Partner25.png";
import p26 from "../assets/Partner/Partner26.png";
import p27 from "../assets/Partner/Partner27.png";
import p28 from "../assets/Partner/Partner28.png";
import p29 from "../assets/Partner/Partner29.png";
import p30 from "../assets/Partner/Partner30.png";
import p31 from "../assets/Partner/Partner31.png";
import p32 from "../assets/Partner/Partner32.png";
import p33 from "../assets/Partner/Partner33.png";
import p34 from "../assets/Partner/Partner34.png";
import p35 from "../assets/Partner/Partner35.png";
import p36 from "../assets/Partner/Partner36.png";
import p37 from "../assets/Partner/Partner37.png";
import p38 from "../assets/Partner/Partner38.png";
import p39 from "../assets/Partner/Partner39.png";
import p40 from "../assets/Partner/Partner40.png";
import p41 from "../assets/Partner/Partner41.png";
import p42 from "../assets/Partner/Partner42.png";
import p43 from "../assets/Partner/Partner43.png";
import p44 from "../assets/Partner/Partner44.png";
import p45 from "../assets/Partner/Partner45.png";
import p46 from "../assets/Partner/Partner46.png";
import p47 from "../assets/Partner/Partner47.png";
import p48 from "../assets/Partner/Partner48.png";
import p49 from "../assets/Partner/Partner49.png";
import p50 from "../assets/Partner/Partner50.png";
import p51 from "../assets/Partner/Partner51.png";
import p52 from "../assets/Partner/Partner52.png";
import p53 from "../assets/Partner/Partner53.png";
import p54 from "../assets/Partner/Partner54.png";
import p55 from "../assets/Partner/Partner55.png";

const Partners = () => {
  // 55 logos dynamically
  const partnerLogos = [
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    p8,
    p9,
    p10,
    p11,
    p12,
    p13,
    p14,
    p15,
    p16,
    p17,
    p18,
    p19,
    p20,
    p21,
    p22,
    p23,
    p24,
    p25,
    p26,
    p27,
    p28,
    p29,
    p30,
    p31,
    p32,
    p33,
    p34,
    p35,
    p36,
    p37,
    p38,
    p39,
    p40,
    p41,
    p42,
    p43,
    p44,
    p45,
    p46,
    p47,
    p48,
    p49,
    p50,
    p51,
    p52,
    p53,
    p54,
    p55,
  ];

  const settings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 800,
    cssEase: "ease",

    arrows: false,
    dots: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section className="partners-section">
      <div className="partners-container">
        <h2 className="partner-title">
          Our Partners<span></span>
        </h2>
        <Slider {...settings}>
          {partnerLogos.map((logo, index) => (
            <div key={index} className="partner-item">
              <img src={logo} alt={`Partner ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Partners;
