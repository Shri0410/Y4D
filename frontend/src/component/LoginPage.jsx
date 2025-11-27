import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";
import { setToken, setUser } from "../utils/tokenManager";
import RegistrationModal from "./RegistrationModal";
import PasswordResetModal from "./PasswordResetModal";
import "./LoginPage.css";

const LoginPage = ({ onLogin, onAdminLogin }) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        loginData
      );
      setToken(response.data.token);
      setUser(response.data.user);
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    // This would open admin-specific login modal or redirect
    onAdminLogin();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Youth4Development Dashboard</h2>

        {/* User Login Form */}
        <form onSubmit={handleUserLogin} className="login-form">
          <h3>User Login</h3>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Username or Email:</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
            />
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
              New User Registration
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
