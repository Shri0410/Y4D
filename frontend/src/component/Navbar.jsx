// src/component/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Y4D LOGO NAVBAR.png";
import "./Navbar.css";
import helpingHands from "../assets/handshake.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const goToDonate = () => {
    navigate("/DonateNow");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dropdownItems = {
    about: [
      { id: "/about", label: "About Us" },
      { id: "/reach-presence", label: "Reach and Presence" },
      { id: "/our-team", label: "Our Team" },
      { id: "/legalreports", label: "Legal Status" },
    ],
    work: [
      { id: "/quality-education", label: "Quality Education" },
      { id: "/livelihood", label: "Livelihood" },
      { id: "/healthcare", label: "Healthcare" },
      {
        id: "/environment-sustainability",
        label: "Environment Sustainability",
      },
      { id: "/idp", label: "Integrated Development Program (IDP)" },
    ],
    involved: [
      { id: "/corporate-partnership", label: "Corporate Partnership" },
      { id: "/volunteers-internship", label: "Volunteers & Internship" },
      { id: "/careers", label: "Careers" },
    ],
    media: [
      { id: "/newsletters", label: "Newsletters" },
      { id: "/stories", label: "Stories of Empowerment" },
      { id: "/events", label: "Events" },
      { id: "/blogs", label: "Blogs" },
      { id: "/documentaries", label: "Documentaries" },
    ],
  };

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const isDropdownItemActive = (items) => {
    return items.some((item) => location.pathname === item.id);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="Nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <Link to="/" onClick={closeAllDropdowns}>
            <img src={logo} alt="Y4D Logo" className="logo" />
          </Link>
        </div>

        {/* Helping hands - show only on mobile, centered */}
        <div className="mobile-only-content" style={{ display: "none" }}>
          <div
            className="mobile-center-help"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={helpingHands}
              alt="Helping Hands"
              style={{ width: "50px", height: "50px" }}
            />
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Helping...</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            <li>
              <Link
                to="/"
                onClick={closeAllDropdowns}
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </Link>
            </li>

            {/* About Us Dropdown */}
            <li
              className={`dropdown ${
                activeDropdown === "about" ? "active" : ""
              } ${
                isDropdownItemActive(dropdownItems.about) ? "has-active" : ""
              }`}
              onMouseEnter={() =>
                window.innerWidth > 1024 && setActiveDropdown("about")
              }
              onMouseLeave={() =>
                window.innerWidth > 1024 && setActiveDropdown(null)
              }
            >
              <button
                onClick={() => toggleDropdown("about")}
                className={
                  isDropdownItemActive(dropdownItems.about) ? "active" : ""
                }
              >
                About Us
                <span className="dropdown-icon">
                  {activeDropdown === "about" ? "−" : "+"}
                </span>
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "about" ? "up" : "down"
                  } desktop-chevron`}
                ></i>
              </button>
              <div className="dropdown-menu">
                {dropdownItems.about.map((item) => (
                  <Link
                    key={item.id}
                    to={item.id}
                    onClick={closeAllDropdowns}
                    className={location.pathname === item.id ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </li>

            {/* Work Dropdown */}
            <li
              className={`dropdown ${
                activeDropdown === "work" ? "active" : ""
              } ${
                isDropdownItemActive(dropdownItems.work) ? "has-active" : ""
              }`}
              onMouseEnter={() =>
                window.innerWidth > 1024 && setActiveDropdown("work")
              }
              onMouseLeave={() =>
                window.innerWidth > 1024 && setActiveDropdown(null)
              }
            >
              <button
                onClick={() => toggleDropdown("work")}
                className={
                  isDropdownItemActive(dropdownItems.work) ? "active" : ""
                }
              >
                Our Work
                <span className="dropdown-icon">
                  {activeDropdown === "work" ? "−" : "+"}
                </span>
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "work" ? "up" : "down"
                  } desktop-chevron`}
                ></i>
              </button>
              <div className="dropdown-menu">
                {dropdownItems.work.map((item) => (
                  <Link
                    key={item.id}
                    to={item.id}
                    onClick={closeAllDropdowns}
                    className={location.pathname === item.id ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </li>

            {/* Media Corner Dropdown */}
            <li
              className={`dropdown ${
                activeDropdown === "media" ? "active" : ""
              } ${
                isDropdownItemActive(dropdownItems.media) ? "has-active" : ""
              }`}
              onMouseEnter={() =>
                window.innerWidth > 1024 && setActiveDropdown("media")
              }
              onMouseLeave={() =>
                window.innerWidth > 1024 && setActiveDropdown(null)
              }
            >
              <button
                onClick={() => toggleDropdown("media")}
                className={
                  isDropdownItemActive(dropdownItems.media) ? "active" : ""
                }
              >
                Media Corner
                <span className="dropdown-icon">
                  {activeDropdown === "media" ? "−" : "+"}
                </span>
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "media" ? "up" : "down"
                  } desktop-chevron`}
                ></i>
              </button>
              <div className="dropdown-menu">
                {dropdownItems.media.map((item) => (
                  <Link
                    key={item.id}
                    to={item.id}
                    onClick={closeAllDropdowns}
                    className={location.pathname === item.id ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </li>

            <li>
              <Link
                to="/contact"
                onClick={closeAllDropdowns}
                className={location.pathname === "/contact" ? "active" : ""}
              >
                Contact Us
              </Link>
            </li>
            <li className="nav-buttons-group">
              <button 
                className="nav-link-btn" 
                onClick={() => window.open("https://global.y4dinfo.org", "_blank")}
                title="Visit Global Y4D"
              >
                Global
              </button>
              <button className="D-btn" onClick={goToDonate}>
                Donate Now
              </button>
            </li>
          </ul>
        </div>

        {/* Hamburger Menu */}
        <div
          className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile view activation logic */}
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-only-content {
              display: flex !important;
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
          @media (min-width: 769px) {
            .mobile-only-content {
              display: none !important;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
