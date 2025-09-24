// src/component/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Y4D LOGO NAVBAR.png";
import "./Navbar.css";

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
        <div className="nav-brand">
          <Link to="/" onClick={closeAllDropdowns}>
            <img src={logo} alt="Y4D Logo" className="logo" />
          </Link>
        </div>

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
              onMouseEnter={() => setActiveDropdown("about")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => toggleDropdown("about")}
                className={
                  isDropdownItemActive(dropdownItems.about) ? "active" : ""
                }
              >
                About Us
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "about" ? "up" : "down"
                  }`}
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

            {/* Our Work Dropdown */}
            <li
              className={`dropdown ${
                activeDropdown === "work" ? "active" : ""
              } ${
                isDropdownItemActive(dropdownItems.work) ? "has-active" : ""
              }`}
              onMouseEnter={() => setActiveDropdown("work")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => toggleDropdown("work")}
                className={
                  isDropdownItemActive(dropdownItems.work) ? "active" : ""
                }
              >
                Our Work
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "work" ? "up" : "down"
                  }`}
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

            {/* Get Involved Dropdown */}
            <li
              className={`dropdown ${
                activeDropdown === "involved" ? "active" : ""
              } ${
                isDropdownItemActive(dropdownItems.involved) ? "has-active" : ""
              }`}
              onMouseEnter={() => setActiveDropdown("involved")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => toggleDropdown("involved")}
                className={
                  isDropdownItemActive(dropdownItems.involved) ? "active" : ""
                }
              >
                Get Involved
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "involved" ? "up" : "down"
                  }`}
                ></i>
              </button>
              <div className="dropdown-menu">
                {dropdownItems.involved.map((item) => (
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
              onMouseEnter={() => setActiveDropdown("media")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => toggleDropdown("media")}
                className={
                  isDropdownItemActive(dropdownItems.media) ? "active" : ""
                }
              >
                Media Corner
                <i
                  className={`fas fa-chevron-${
                    activeDropdown === "media" ? "up" : "down"
                  }`}
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
            <li>
              <button className="D-btn" onClick={goToDonate}>
                Donate Now
              </button>
            </li>
          </ul>
        </div>

        <div
          className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
