// src/pages/Careers.jsx
import React, { useState, useEffect } from "react";
import { getCareers } from "../services/api";
import "./Careers.css";

const Careers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null); // for popup modal
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const fetchCareersData = async () => {
      try {
        setLoading(true);
        const careersData = await getCareers();
        setCareers(careersData);
      } catch (err) {
        setError(
          "Failed to load career opportunities. Please try again later."
        );
        console.error("Error fetching careers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareersData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(
      "Thank you for your interest! We will contact you when opportunities become available."
    );
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  if (loading)
    return (
      <div className="careers-page">
        <div className="careers-loading">Loading career opportunities...</div>
      </div>
    );

  if (error)
    return (
      <div className="careers-page">
        <div className="careers-error">{error}</div>
      </div>
    );

  return (
    <div className="careers-page">
      <section className="careers-section">
        <div className="careers-container">
          <h2 className="careers-title">
            Career Opportunities<span></span>
          </h2>

          {careers.length === 0 ? (
            <div className="careers-no-openings">
              <p>Currently, we don't have any open positions.</p>
              <p>
                Please fill out the contact form below for future opportunities.
              </p>

              {/* Interest Form */}
              <div className="careers-form">
                <h3>Express Interest</h3>
                <form onSubmit={handleContactSubmit}>
                  <div className="careers-form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="careers-form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="careers-form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your Phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="careers-form-group">
                    <textarea
                      name="message"
                      placeholder="Your Message and Areas of Interest"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    />
                  </div>
                  <button type="submit" className="careers-btn">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="careers-list">
              <h3>Current Openings</h3>
              {careers.map((career) => (
                <div key={career.id} className="careers-card">
                  <h4>{career.title}</h4>
                  <div className="careers-details">
                    <p>
                      <strong>Location:</strong> {career.location}
                    </p>
                    <p>
                      <strong>Type:</strong> {career.type}
                    </p>
                  </div>

                  {/* Short description */}
                  <div className="careers-description">
                    {career.shortDescription || (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: career.description.substring(0, 120) + "...",
                        }}
                      />
                    )}
                  </div>

                  <div className="careers-card-actions">
                    <button className="careers-btn">Apply Now</button>
                    <button
                      className="careers-btn"
                      onClick={() => setSelectedCareer(career)}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* -------- POPUP MODAL -------- */}
      {selectedCareer && (
        <div className="career-modal">
          <div className="career-modal-content">
            <button
              className="career-modal-close"
              onClick={() => setSelectedCareer(null)}
            >
              &times;
            </button>

            <h2>{selectedCareer.title}</h2>
            <p>
              <strong>Location:</strong> {selectedCareer.location}
            </p>
            <p>
              <strong>Type:</strong> {selectedCareer.type}
            </p>
            <p>
              <strong>Requirements:</strong> {selectedCareer.requirements}
            </p>

            <div
              className="career-modal-description"
              dangerouslySetInnerHTML={{
                __html: selectedCareer.description,
              }}
            />

            <button className="careers-btn">Apply Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
