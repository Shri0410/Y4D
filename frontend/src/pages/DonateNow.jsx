// src/pages/DonateNow.jsx
import React, { useState, useEffect } from "react";
import "./DonateNow.css";
import { getBanners } from "../services/api.jsx";

const DonateNow = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    pan: "", // new field for PAN
    message: "",
  });

  const [donateBanners, setDonateBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  const suggestedAmounts = [500, 1000, 2000, 5000];

  // Fetch donate page banners
  useEffect(() => {
    const fetchDonateBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('🔄 Fetching donate page banners...');
        const bannersData = await getBanners('donate', 'hero');
        console.log('✅ Donate banners received:', bannersData);
        setDonateBanners(bannersData);
      } catch (error) {
        console.error('❌ Error fetching donate banners:', error);
        setDonateBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchDonateBanners();
  }, []);

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
        name: "Y4D Foundation",
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

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="donate-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (donateBanners.length === 0) {
      return (
        <div className="donate-banner">
          <div className="no-banner-message">
            <p>Donate page banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="donate-banner">
        {donateBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === 'image' ? (
              <img
                src={`http://localhost:5000/uploads/banners/${banner.media}`}
                alt={`Donate Banner - ${banner.page}`}
                className="donate-banner-image"
              />
            ) : (
              <video
                src={`http://localhost:5000/uploads/banners/${banner.media}`}
                className="donate-banner-video"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            {(banner.title || banner.description) && (
              <div className="banner-overlay">
                <div className="banner-content">
                  {banner.title && <h1>{banner.title}</h1>}
                  {banner.description && <p>{banner.description}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="donate-page">
      {/* Dynamic Banner Section */}
      {renderBanner()}

      {/* Main Content Section */}
      <div className="donate-content">
        <div className="donate-left">
          <h2>Why Donate to Y4D Foundation?</h2>
          <p>
            Your contribution helps us empower underprivileged communities through 
            education, healthcare, livelihood programs, and environmental sustainability 
            initiatives. Every donation counts and brings hope to countless lives.
          </p>
          <ul>
            <li>📚 Empower through Quality Education</li>
            <li>💼 Create Sustainable Livelihood Opportunities</li>
            <li>🏥 Improve Healthcare Access</li>
            <li>🌱 Protect and Sustain Our Environment</li>
            <li>🤝 Support Integrated Community Development</li>
          </ul>
          <p>
            Join our mission today and help us create a better, more equitable world. 
            Together, we can transform lives and build sustainable communities.
          </p>
          
          <div className="impact-stats">
            <div className="impact-stat">
              <h3>10+ Years</h3>
              <p>Of dedicated service</p>
            </div>
            <div className="impact-stat">
              <h3>20+ States</h3>
              <p>Across India</p>
            </div>
            <div className="impact-stat">
              <h3>50K+ Lives</h3>
              <p>Impacted annually</p>
            </div>
          </div>
        </div>

        <div className="donate-right">
          <h2>Make a Donation</h2>
          <p className="donation-subtitle">
            Your donation is eligible for tax exemption under Section 80G of Income Tax Act
          </p>
          
          <div className="suggested-amounts">
            <p>Quick Select Amount:</p>
            <div className="amount-buttons">
              {suggestedAmounts.map((amt) => (
                <button
                  key={amt}
                  className={`suggest-btn ${formData.amount == amt ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, amount: amt })}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="donation-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Donation Amount (₹) *</label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
                min="1"
              />
            </div>

            {/* PAN Card Input for Tax Exemption */}
            <div className="form-group">
              <label htmlFor="pan">
                PAN Card Number *
                <span className="help-text">(For 80G tax exemption certificate)</span>
              </label>
              <input
                id="pan"
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                maxLength="10"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Enter valid PAN format: ABCDE1234F"
                required
              />
              <small className="pan-help">
                Format: 5 letters + 4 numbers + 1 letter (e.g., ABCDE1234F)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any specific cause you'd like to support or message for us..."
                rows="3"
              />
            </div>

            <div className="tax-benefit-note">
              <strong>Tax Benefit:</strong> Your donation is eligible for 50% tax exemption under Section 80G of Income Tax Act, 1961.
            </div>

            <button type="submit" className="submit-btn">
              Donate Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonateNow;