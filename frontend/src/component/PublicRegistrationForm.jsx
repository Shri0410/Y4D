// src/components/PublicRegistrationForm.jsx
import React, { useState } from "react";
import { API_BASE } from "../config/api";
import axios from "axios";
import "./RegistrationForm.css";
import logo from "../assets/Y4D LOGO LOADING.png";

const PublicRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/registration/request`, {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        address: formData.address,
        password: formData.password,
      });

      setMessage(
        "Registration request submitted successfully! Please wait for admin approval."
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        address: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <img src={logo} alt="Youth4Development" className="registration-logo" />

        <form onSubmit={handleSubmit} className="registration-form">
          <h3>Create Your Account</h3>

          {message && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number *</label>
            <input
              type="tel"
              id="mobile_number"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Create a password (min. 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Submitting Request...
              </>
            ) : (
              "Submit Registration Request"
            )}
          </button>

          <div className="registration-footer">
            <p>
              <small>
                After submission, your request will be reviewed by an
                administrator. You will receive an email notification once your
                account is approved.
              </small>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicRegistrationForm;