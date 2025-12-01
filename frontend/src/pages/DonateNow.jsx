import React, { useState, useEffect } from "react";
import "./DonateNow.css";
import { getBanners } from "../services/api.jsx";
import { API_BASE, UPLOADS_BASE } from "../config/api";

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

  /*  SAFE ENV VARIABLE DETECTION*/
  const RAZORPAY_KEY =
    process.env.development.REACT_APP_RAZORPAY_KEY_ID || null;

  useEffect(() => {
    if (!RAZORPAY_KEY) {
      console.error(
        "❌ Razorpay key missing. Add REACT_APP_RAZORPAY_KEY_ID in your .env file"
      );
    }
  }, []);

  /* Fetch Donate Banners*/
  useEffect(() => {
    const fetchDonateBanners = async () => {
      try {
        setBannersLoading(true);
        const bannersData = await getBanners("donate", "hero");
        setDonateBanners(bannersData || []);
      } catch (error) {
        console.error("❌ Error fetching banners:", error);
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
    if (!RAZORPAY_KEY) {
      alert("Payment setup incomplete. Please contact support.");
      return;
    }

    try {
      setIsProcessing(true);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Payment gateway failed to load. Check your connection.");
        return;
      }

      // Step 1 — Create Order
      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!orderRes.ok) {
        throw new Error(`Server Error: ${orderRes.status}`);
      }

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.message || "Order creation failed. Try again.");
        return;
      }

      const { order } = orderData;

      // Razorpay Options
      const options = {
        key: RAZORPAY_KEY,
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
          try {
            const verifyRes = await fetch(
              `${API_BASE}/payment/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            if (!verifyRes.ok) {
              throw new Error("Verification failed");
            }

            const verifyJson = await verifyRes.json();

            if (verifyJson.success) {
              setSuccessMessage(
                "Thank you! Your donation receipt will be sent to your email."
              );
              setShowSuccessPopup(true);

              // Reset form
              setFormData({
                name: "",
                email: "",
                amount: "",
                pan: "",
                message: "",
              });

              setTimeout(() => setShowSuccessPopup(false), 5000);
            } else {
              alert("Payment verification failed.");
            }
          } catch (error) {
            alert("Verification error. Contact support with your Payment ID.");
          }
        },

        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Payment failure
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment initialization failed. Please try again.");
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
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thank You! 🎉</h2>
            <p>{successMessage}</p>
            <button
              className="ok-btn"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateNow;
