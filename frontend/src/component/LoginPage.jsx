import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";
import { setToken, setUser } from "../utils/tokenManager";
import {
  extractData,
  extractErrorMessage,
  handleApiError,
} from "../utils/apiResponse";
import RegistrationModal from "./RegistrationModal";
import PasswordResetModal from "./PasswordResetModal";
import "./LoginPage.css";
import logo from "../assets/Y4D LOGO LOADING.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const LoginPage = ({ onLogin, onAdminLogin }) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const navigate = useNavigate();

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, loginData);

      // Handle standardized response - login returns token and user directly
      const data = extractData(response) || response.data;
      setToken(data.token || response.data.token);
      setUser(data.user || response.data.user);
      onLogin(data.user || response.data.user);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage || "Login failed");
      handleApiError(error, { showToast: false }); // Don't show toast, we show error in form
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    // This would open admin-specific login modal or redirect
    onAdminLogin();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} alt="Y4D Foundation" className="login-logo" />

        {/* User Login Form */}
        <form onSubmit={handleUserLogin} className="login-form">
          <h3>Login</h3>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email:</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group password-input-group">
            <label>Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
                placeholder="Enter your password"
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Options */}
        <div className="login-options">
          <div className="option-group">
            <button
              onClick={() => navigate("/register")}
              className="option-btn"
            >
              Registration
            </button>
            <button
              onClick={() => setShowPasswordReset(true)}
              className="option-btn"
            >
              Password Reset
            </button>
          </div>
        </div>

        {/* Modals */}
        {showRegistration && (
          <RegistrationModal onClose={() => setShowRegistration(false)} />
        )}
        {showPasswordReset && (
          <PasswordResetModal onClose={() => setShowPasswordReset(false)} />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
