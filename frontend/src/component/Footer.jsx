import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left side links (4 columns) */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>About Us</h4>
            <ul>
              <li>
                <a href="#">Our Story</a>
              </li>
              <li>
                <a href="#">Mission</a>
              </li>
              <li>
                <a href="#">Vision</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Our Work</h4>
            <ul>
              <li>
                <a href="#">Projects</a>
              </li>
              <li>
                <a href="#">Case Studies</a>
              </li>
              <li>
                <a href="#">Research</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Get Involved</h4>
            <ul>
              <li>
                <a href="#">Volunteer</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Donate</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Media Corner</h4>
            <ul>
              <li>
                <a href="#">News</a>
              </li>
              <li>
                <a href="#">Press Release</a>
              </li>
              <li>
                <a href="#">Gallery</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Row with Address + Social + LinkedIn */}
      <div className="footer-bottom">
        {/* Left side */}
        <div className="footer-left">
          <div className="footer-address">
            <strong>Address:</strong>
            <p>Head Office | Mumbai Office</p>
          </div>
          <div className="footer-social">
            <strong>Social Media Handles:</strong>
            <div className="social-icons">
              <a href="#">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Right side - LinkedIn Embed */}
        <div className="footer-linkedin">
          <h4>LinkedIn</h4>
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:share:7242738242133864448"
            height="250"
            width="100%"
            frameBorder="0"
            allowFullScreen
            title="LinkedIn Post"
          ></iframe>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
