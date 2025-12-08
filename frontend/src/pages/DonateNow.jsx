import React, { useState, useEffect } from "react";
import "./DonateNow.css";
import { getBanners } from "../services/api.jsx";
import { API_BASE, UPLOADS_BASE } from "../config/api";
import logger from "../utils/logger";

const DonateNow = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    pan: "",
    message: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [donateBanners, setDonateBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  const suggestedAmounts = [500, 1000, 2000, 5000];

  /*  SAFE ENV VARIABLE DETECTION
   * In Vite, environment variables must be prefixed with VITE_
   * Frontend only needs the public key (not the secret)
   */



  /* Fetch Donate Banners*/
  useEffect(() => {
    const fetchDonateBanners = async () => {
      try {
        setBannersLoading(true);
        const bannersData = await getBanners("donate", "hero");
        setDonateBanners(bannersData || []);
      } catch (error) {
        logger.error("❌ Error fetching banners:", error);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchDonateBanners();
  }, []);

  /* Input Handler*/
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "pan" ? value.toUpperCase() : value,
    });
  };

  /* Enhanced Validation */
  const validateForm = () => {
    const { name, email, amount, pan } = formData;

    if (!name.trim() || name.length < 2)
      return "Name must be at least 2 characters";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email))
      return "Enter a valid email address";

    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0)
      return "Enter a valid donation amount";

    if (donationAmount > 1000000)
      return "Maximum donation amount is ₹10,00,000";

    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(pan)) return "Invalid PAN (Format: ABCDE1234F)";

    return null;
  };

  /* Load Razorpay Script Once */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        return resolve(true);
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  /* Razorpay Checkout Logic*/
  const loadRazorpay = async () => {
  try {
    setIsProcessing(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) return alert("Payment gateway failed to load");

    // Get Razorpay Key from backend instead of .env
    const keyRes = await fetch(`${API_BASE}/payment/key`);
    const { key } = await keyRes.json();

    if (!key) return alert("Payment key missing from server");

    // Create order
    const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const { success, order } = await orderRes.json();
    if (!success) return alert("Order failed");

    const options = {
      key,
      amount: order.amount,
      currency: "INR",
      name: "Y4D Foundation",
      description: "Donation",
      order_id: order.id,
      prefill: {
        name: formData.name,
        email: formData.email,
      },
      handler: async function (response) {
        // Show success immediately
        setShowSuccessPopup(true);
        setSuccessMessage("Verifying payment...");

        // Disable form instantly
        setIsProcessing(true);

        const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const data = await verifyRes.json();

        if (!data.success) {
          setSuccessMessage("Payment verified but processing failed.");
          return;
        }

        // 🌟 Update message now that verification is complete
        setSuccessMessage(`Thank you for your contribution!`);

        // 🌟 Clear form so old data is not visible
        setFormData({
          name: "",
          email: "",
          amount: "",
          pan: "",
          message: "",
        });

        // Allow user to interact again if needed
        setIsProcessing(false);
      },

    };

    new window.Razorpay(options).open();
  } catch {
    alert("Payment error");
  } finally {
    setIsProcessing(false);
  }
};

  /*  Submit Handler*/
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsProcessing(true);
    loadRazorpay();
  };

  /* Banner Rendering */
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
          <p>No banner added yet</p>
        </div>
      );
    }

    return (
      <div className="donate-banner">
        {donateBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === "image" ? (
              <img
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                alt="Donate Banner"
              />
            ) : (
              <video
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
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

  /* RETURN JSX (Final UI) */
  return (
    <div className="donate-page">
      {renderBanner()}

      <div className="donate-content">
        {/* LEFT SECTION */}
        <div className="donate-left">
          <h2>Why Donate to Y4D Foundation?</h2>
          <p>
            Empower underprivileged communities with education, healthcare,
            livelihood, and sustainable development.
          </p>

          <ul>
            <li>📚 Education Support</li>
            <li>💼 Livelihood Opportunities</li>
            <li>🏥 Healthcare Access</li>
            <li>🌱 Environmental Protection</li>
            <li>🤝 Community Development</li>
          </ul>
        </div>

        {/* DONATION FORM */}
        <div className="donate-right">
          <h2>Make a Donation</h2>
          <p className="donation-subtitle">
            Your donation is eligible for tax exemption under Section 80G.
          </p>

          <div className="suggested-amounts">
            <p>Quick Select Amount:</p>
            <div className="amount-buttons">
              {suggestedAmounts.map((amt) => (
                <button
                  key={amt}
                  className={`suggest-btn ${
                    formData.amount == amt ? "active" : ""
                  }`}
                  onClick={() => setFormData({ ...formData, amount: amt })}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="donation-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength="2"
                maxLength="100"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Donation Amount (₹) *</label>
              <input
                name="amount"
                type="number"
                min="1"
                max="1000000"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="Enter amount"
              />
            </div>

            <div className="form-group">
              <label>PAN Card Number *</label>
              <input
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                maxLength="10"
                pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                title="Format: ABCDE1234F"
                required
                placeholder="ABCDE1234F"
              />
            </div>

            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea
                name="message"
                rows="3"
                maxLength="500"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any specific cause you'd like to support?"
              ></textarea>
            </div>

            <button className="submit-btn" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Donate Now"}
            </button>
          </form>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="popup-overlay donate-popup-overlay">
          <div className="popup-box donate-success-box">
            <div className="donate-success-icon">✔</div>
            <h2 className="donate-success-title">Payment Successful</h2>
            <p className="donate-success-text">
              {successMessage.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <div className="donate-success-footer">
              <p className="donate-success-note">
                You will also receive a confirmation email with your receipt.
              </p>
              <button
                className="ok-btn donate-success-btn"
                onClick={() => setShowSuccessPopup(false)}
              >
                Back to Donation Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateNow;
