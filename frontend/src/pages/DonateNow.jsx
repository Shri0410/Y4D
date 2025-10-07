import React, { useState } from "react";
import "./DonateNow.css";
import bannerImg from "../assets/BannerImages/f.jpeg";

const DonateNow = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    pan: "", // new field for PAN
    message: "",
  });

  const suggestedAmounts = [500, 1000, 2000, 5000];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Automatically convert PAN input to uppercase
    if (name === "pan") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const loadRazorpay = (amount) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () =>
      alert("Razorpay SDK failed to load. Are you online?");
    script.onload = async () => {
      const options = {
        key: "YOUR_RAZORPAY_KEY", // Replace with your Razorpay Key
        amount: amount * 100, // in paise
        currency: "INR",
        name: "Your Organization Name",
        description: "Donation",
        handler: function (response) {
          alert(
            `Payment successful! Payment ID: ${response.razorpay_payment_id}`
          );
        },
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: "#007bff",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    };
    document.body.appendChild(script);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    loadRazorpay(formData.amount);
  };

  return (
    <div className="donate-page">
      {/* Banner Section */}
      <div className="donate-banner">
        <img src={bannerImg} alt="Donate Now" />
      </div>

      {/* Main Content Section */}
      <div className="donate-content">
        <div className="donate-left">
          <h2>Why Donate?</h2>
          <p>
            Your contribution helps us provide essential services to those in
            need. Every donation counts and brings hope, education, and support
            to countless lives.
          </p>
          <ul>
            <li>Empower communities</li>
            <li>Support education</li>
            <li>Improve healthcare</li>
            <li>Protect the environment</li>
          </ul>
          <p>
            Join our mission today and help us create a better world. Together,
            we can transform lives.
          </p>
        </div>

        <div className="donate-right">
          <h2>Make a Donation</h2>
          <div className="suggested-amounts">
            {suggestedAmounts.map((amt) => (
              <button
                key={amt}
                className="suggest-btn"
                onClick={() => setFormData({ ...formData, amount: amt })}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="donation-form">
            <label>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
              />
            </label>

            {/* New PAN Card Input */}
            <label>
              PAN Card Number
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                  maxLength="10"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Enter valid PAN format: ABCDE1234F"
                required
              />
            </label>

            <label>
              Message (Optional)
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonateNow;