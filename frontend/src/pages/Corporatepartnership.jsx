import React from "react";
import "./CorporatePartnership.css";
import bannerImg from "../assets/BannerImages/f.jpeg";

const CorporatePartnership = () => {
  return (
    <div className="corporate-page">
      {/* Banner */}
      <div className="banner">
        <img src={bannerImg} alt="Corporate Partnership" />
      </div>

      {/* About Section */}
      <section className="about-section">
        <h2>
          Corporate Partnership <span></span>
        </h2>
        <p>
          We believe in building strong, long-term partnerships with
          corporations to drive meaningful change. Through collaboration, we
          create impactful programs that contribute to both social development
          and organizational growth.
        </p>
      </section>

      {/* Form Section */}
      <section className="form-section">
        <h3>Partner With Us</h3>
        <form className="partnership-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" required />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input type="text" placeholder="Enter company name" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="Enter phone number" />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="Write your message here..." rows="4" />
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </section>
    </div>
  );
};

export default CorporatePartnership;
