import React, { useState } from "react";
import "./CorporatePartnership.css";
import bannerImg from "../assets/BannerImages/f.jpeg";
import { contactService } from "../api/services/contact.service";
import { useLoadingState } from "../hooks/useLoadingState";
import logger from "../utils/logger";

const CorporatePartnership = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    contact: "",
    details: "",
  });
  const { loading: isSubmitting, execute } = useLoadingState();
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validate required fields
    if (!formData.companyName || !formData.email || !formData.contact) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields (Company Name, Email, Contact).",
      });
      return;
    }

    try {
      const result = await execute(() =>
        contactService.submitCorporatePartnership(formData)
      );

      if (result?.success) {
        setMessage({
          type: "success",
          text: "Your partnership form has been submitted successfully!",
        });
        // Reset form
        setFormData({
          companyName: "",
          email: "",
          contact: "",
          details: "",
        });
      } else {
        setMessage({
          type: "error",
          text: result?.message || "Failed to submit form. Please try again.",
        });
      }
    } catch (error) {
      logger.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <div className="corporate-page">
      {/* Banner */}
      <div className="banner">
        <img src={bannerImg} alt="Corporate Partnership" />
      </div>

      {/* About Section */}
      <section className="about-section">
        <h2 className="cp-title">
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
        {message.text && (
          <div
            className={`message ${
              message.type === "success" ? "success" : "error"
            }`}
          >
            {message.text}
          </div>
        )}
        <form className="partnership-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="tel"
              name="contact"
              placeholder="Enter phone number"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Details / Message</label>
            <textarea
              name="details"
              placeholder="Write your message here..."
              rows="4"
              value={formData.details}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default CorporatePartnership;
