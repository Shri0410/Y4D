import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";
import { extractErrorMessage } from "../utils/apiResponse";
import "./PasswordResetPage.css";
import logo from "../assets/Y4D LOGO LOADING.png";

const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/auth/request-password-reset`,
        {
          email,
        }
      );

      if (response.data.success || response.data.message) {
        setOtpSent(true);
        setError(""); // Clear any previous errors
        // Show success message for OTP sent
        setSuccess(true); // This will show a temporary success message
        setTimeout(() => setSuccess(false), 3000); // Hide after 3 seconds
      } else {
        setError(response.data.error || "Failed to send OTP");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!otp) {
      setError("OTP is required");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        token: otp,
        newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        // Clear form
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.error || "Failed to reset password");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Failed to reset password");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/auth/request-password-reset`,
        {
          email,
        }
      );

      if (response.data.success || response.data.message) {
        setSuccess(true); // Show success message
        setTimeout(() => setSuccess(false), 3000); // Hide after 3 seconds
      } else {
        setError(response.data.error || "Failed to resend OTP");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Failed to resend OTP");
    }
    setLoading(false);
  };

  return (
    <div className="password-reset-page">
      <div className="password-reset-page-container">
        <img
          src={logo}
          alt="Y4D Foundation"
          className="password-reset-page-logo"
        />

        <div className="password-reset-page-card">
          <h2>Reset Password</h2>

          {success && otpSent ? (
            <div className="password-reset-page-success-message">
              <div className="password-reset-page-success-icon">✓</div>
              <p>OTP has been sent to your email!</p>
              <p>Please check your inbox and enter the OTP below.</p>
            </div>
          ) : success && !otpSent ? (
            <div className="password-reset-page-success-message password-reset-page-full-success">
              <div className="password-reset-page-success-icon">✓</div>
              <h3>Password Reset Successful!</h3>
              <p>Your password has been reset successfully.</p>
              <p>Redirecting to login page...</p>
              <button
                className="password-reset-page-btn-primary"
                onClick={() => navigate("/login")}
                style={{ marginTop: "20px" }}
              >
                Go to Login Now
              </button>
            </div>
          ) : (
            <form
              onSubmit={otpSent ? handleResetPassword : handleRequestOtp}
              className="password-reset-page-form"
            >
              {!otpSent ? (
                // Step 1: Email input to request OTP
                <>
                  <p className="password-reset-page-form-description">
                    Enter your email address to receive a password reset OTP.
                  </p>

                  {error && (
                    <div className="password-reset-page-error-message">
                      {error}
                    </div>
                  )}

                  <div className="password-reset-page-form-group">
                    <label>Email Address:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your registered email"
                      disabled={loading}
                    />
                  </div>

                  <div className="password-reset-page-form-actions">
                    <button
                      type="submit"
                      className="password-reset-page-btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                    <button
                      type="button"
                      className="password-reset-page-btn-secondary"
                      onClick={() => navigate("/login")}
                      disabled={loading}
                    >
                      Back to Login
                    </button>
                  </div>
                </>
              ) : (
                // Step 2: OTP and new password inputs
                <>
                  <p className="password-reset-page-form-description">
                    Enter the OTP sent to <strong>{email}</strong> and your new
                    password.
                  </p>

                  {error && (
                    <div className="password-reset-page-error-message">
                      {error}
                    </div>
                  )}

                  <div className="password-reset-page-form-group">
                    <label>OTP Code:</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      title="Please enter 6-digit OTP"
                      disabled={loading}
                    />
                    <div className="password-reset-page-otp-actions">
                      <small className="password-reset-page-form-hint">
                        Enter the 6-digit code sent to your email
                      </small>
                      <button
                        type="button"
                        className="password-reset-page-btn-resend"
                        onClick={handleResendOtp}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>

                  <div className="password-reset-page-form-group">
                    <label>New Password:</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password (min. 6 characters)"
                      disabled={loading}
                      minLength="6"
                    />
                    <small className="password-reset-page-form-hint">
                      Must be at least 6 characters long
                    </small>
                  </div>

                  <div className="password-reset-page-form-group">
                    <label>Confirm Password:</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      disabled={loading}
                      minLength="6"
                    />
                  </div>

                  <div className="password-reset-page-form-actions">
                    <button
                      type="submit"
                      className="password-reset-page-btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                    <button
                      type="button"
                      className="password-reset-page-btn-secondary"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError("");
                      }}
                      disabled={loading}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
