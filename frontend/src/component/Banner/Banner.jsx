import React from 'react';
import './Banner.css';

const Banner = () => {
  return (
    <section className="banner">
      <div className="banner-content">
        <h1>Empowering Communities for a Better Tomorrow</h1>
        <p>Y4D Foundation is committed to creating sustainable change through education, healthcare, and livelihood programs</p>
        <button className="btn">Learn More</button>
      </div>
      <div className="banner-overlay"></div>
    </section>
  );
};

export default Banner;