import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left side links (4 columns) - unchanged */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>About Us</h4>
            <ul>
              <li>
                <a href="#">Reach & Presence</a>
              </li>
              <li>
                <a href="#">Our Team</a>
              </li>
              <li>
                <a href="#">Legal Status</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Our Work</h4>
            <ul>
              <li>
                <a href="#">Quality Education</a>
              </li>
              <li>
                <a href="#">Livelihood</a>
              </li>
              <li>
                <a href="#">Healthcare</a>
              </li>
              <li>
                <a href="#">Envirnment Sustainability</a>
              </li>
              <li>
                <a href="#">IDP</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Get Involved</h4>
            <ul>
              <li>
                <a href="#">Corporate Partnership</a>
              </li>
              <li>
                <a href="#">Volunteers & Internship</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Media Corner</h4>
            <ul>
              <li>
                <a href="#">Newsletters</a>
              </li>
              <li>
                <a href="#">Stories of Empowerment</a>
              </li>
              <li>
                <a href="#">Events</a>
              </li>
              <li>
                <a href="#">Blogs</a>
              </li>
              <li>
                <a href="#">Documentaries</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Row with Address + Social + LinkedIn */}
      <div className="footer-bottom">
        <div className="footer-left">
          <div className="footer-address">
            <p style={{ fontWeight: "bold" }}>Head Office:</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Y4D+Foundation,+402,+The+Onyx,+Near+Euro+School,+Wakad,+Pune,+Maharashtra,+India+411057"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-address-link"
            >
              Y4D Foundation, 402, The Onyx, Near Euro School,
              <br /> Wakad, Pune, Maharashtra, India - 411057
            </a>

            <p style={{ fontWeight: "bold", marginTop: "10px" }}>
              Mumbai Office:
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=305+A,+Janmabhoomi+Chambers,+Ballard+Estate,+Mumbai+38"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-address-link"
            >
              305 A, Janmabhoomi Chambers, Ballard Estate, Mumbai-38
            </a>
          </div>
          <div className="footer-social">
            <p
              style={{
                marginBottom: "0px",
                fontWeight: "bolder",
                fontSize: "18px",
              }}
            >
              Social Media Handles:
            </p>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/Y4DTeam"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="https://x.com/intent/follow?source=followbutton&variant=1.0&screen_name=y4dteam"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* X Logo SVG */}
                <svg
                  width="25"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/y4dteam/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/y4dteam/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="https://www.youtube.com/user/Y4DTeam"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

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
