// src/component/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Y4D</h3>
            <p>Y4D Foundation is a non-profit organization dedicated to creating sustainable change in communities across India.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/our-work">Our Work</Link></li>
              <li><Link to="/get-involved">Get Involved</Link></li>
              <li><Link to="/media-corner">Media Corner</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Information</h3>
            <p><strong>Head Office:</strong> Address line 1, City, State - PIN</p>
            <p><strong>Mumbai Office:</strong> Address line 1, Mumbai, Maharashtra - PIN</p>
            <p><strong>Email:</strong> info@y4d.org</p>
            <p><strong>Phone:</strong> +91 XXXXX XXXXX</p>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Y4D Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;