import React from "react";
import Slider from "react-slick";
import "./Partners.css";

const Partners2 = () => {
  // logos 28–55
  const partnerLogos = Array.from({ length: 28 }, (_, i) => {
    const num = (i + 28).toString().padStart(2, "0");
    return `/partners/Partners-${num}.png`;
  });

  const settings = {
    slidesToShow: 6,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 5000,
    cssEase: "linear",
    arrows: false,
    dots: false,
    pauseOnHover: false,
    pauseOnFocus: false,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section className="partners-section">
      <div className="partners-container">
        <Slider {...settings}>
          {partnerLogos.map((logo, index) => (
            <div key={index} className="partner-item">
              <img
                src={logo}
                alt={`Partner ${index + 28}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Partners2;
