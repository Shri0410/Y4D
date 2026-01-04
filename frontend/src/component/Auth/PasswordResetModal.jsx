import React, { useState } from "react";
import { authService } from "../api/services/auth.service";
import { useLoadingState } from "../hooks/useLoadingState";
import { extractErrorMessage } from "../utils/apiResponse";
import "./PasswordResetModal.css";

const PasswordResetModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { loading: requestOtpLoading, execute: executeRequestOtp } = useLoadingState();
  const { loading: resetPasswordLoading, execute: executeResetPassword } = useLoadingState();
  const { loading: resendOtpLoading, execute: executeResendOtp } = useLoadingState();
  const loading = requestOtpLoading || resetPasswordLoading || resendOtpLoading;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await executeRequestOtp(() =>
        authService.requestPasswordReset({ email })
      );

      if (response?.success || response?.message) {
        setOtpSent(true);
        setEmailVerified(true);
        setError("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response?.error || "Failed to send OTP");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Failed to send OTP");
    }
  };

  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!otp) {
      setError("Please enter the OTP received in your email");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await executeResetPassword(() =>
        authService.resetPassword({
          email,
          token: otp,
          newPassword,
        })
      );

      if (response?.success) {
        setResetComplete(true);
        setSuccess(true);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(response?.error || "Failed to reset password");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Failed to reset password");
    }
  };

  const handleResendOtp = async () => {
    setError("");

    try {
      const response = await executeResendOtp(() =>
        authService.requestPasswordReset({ email })
      );

      if (response?.success || response?.message) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response?.error || "Failed to resend OTP");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Failed to resend OTP");
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setEmailVerified(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  return (
    <div className="password-reset-modal-overlay">
      <div className="password-reset-modal-container">
        <button className="password-reset-modal-close" onClick={onClose}>
          ×
        </button>

        <h3>Reset Password</h3>

        {resetComplete ? (
          <div className="password-reset-success-container">
            <div className="password-reset-success-icon">✓</div>
            <h4>Password Reset Successful!</h4>
            <p>Your password has been changed successfully.</p>
            <p>You can now login with your new password.</p>
            <button
              className="password-reset-btn-primary"
              onClick={onClose}
              style={{ marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form
            onSubmit={otpSent ? handleVerifyOtpAndReset : handleRequestOtp}
            className="password-reset-form"
          >
            {/* Email field - always visible unless OTP is sent */}
            {!otpSent ? (
              <>
                <p className="password-reset-modal-description">
                  Enter your email address to receive a password reset OTP.
                </p>

                {error && (
                  <div className="password-reset-error-message">{error}</div>
                )}
                {success && (
                  <div className="password-reset-success-message">
                    OTP has been sent to your email!
                  </div>
                )}

                <div className="password-reset-form-group">
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

                <div className="password-reset-modal-actions">
                  <button
                    type="button"
                    className="password-reset-btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="password-reset-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="password-reset-modal-description">
                  Enter the OTP sent to <strong>{email}</strong> and your new
                  password.
                </p>

                {error && (
                  <div className="password-reset-error-message">{error}</div>
                )}
                {success && (
                  <div className="password-reset-success-message">
                    OTP has been sent! Check your email.
                  </div>
                )}

                {/* OTP Field */}
                <div className="password-reset-form-group">
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
                    className="password-reset-otp-input"
                  />
                  <div className="password-reset-otp-actions">
                    <small className="password-reset-form-hint">
                      Enter the 6-digit code sent to your email
                    </small>
                    <button
                      type="button"
                      className="password-reset-btn-resend"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </div>

                {/* New Password Fields */}
                <div className="password-reset-form-group">
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
                  <small className="password-reset-form-hint">
                    Must be at least 6 characters long
                  </small>
                </div>

                <div className="password-reset-form-group">
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

                <div className="password-reset-modal-actions">
                  <button
                    type="button"
                    className="password-reset-btn-secondary"
                    onClick={handleBackToEmail}
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="password-reset-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Progress Indicator */}
        {!resetComplete && (
          <div className="password-reset-progress-indicator">
            <div
              className={`password-reset-step ${
                !otpSent ? "password-reset-active" : "password-reset-completed"
              }`}
            >
              <span className="password-reset-step-number">1</span>
              <span className="password-reset-step-label">Enter Email</span>
            </div>
            <div className="password-reset-step-line"></div>
            <div
              className={`password-reset-step ${
                otpSent ? "password-reset-active" : ""
              }`}
            >
              <span className="password-reset-step-number">2</span>
              <span className="password-reset-step-label">Reset Password</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;