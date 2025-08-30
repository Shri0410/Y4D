import React, { useState } from 'react';
import axios from 'axios';

const PasswordResetModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: reset password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // This would typically send a reset link to email
      // For now, we'll simulate success and move to next step
      setMessage('Password reset instructions sent to your email');
      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset instructions');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, you'd use a token from email
      // For now, we'll use current password verification
      const response = await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        currentPassword,
        newPassword
      });
      
      setMessage('Password reset successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Password reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Password Reset</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
              />
            </div>
            
            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}
            
            <div className="modal-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
              />
            </div>
            
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
            
            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}
            
            <div className="modal-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep(1)}>Back</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;