import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import axios from 'axios';
import logger from "../utils/logger";

const RegistrationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_number: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.mobile_number || !formData.address) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/registration/request`, formData);
      setMessage(response.data.message);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      logger.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>New User Registration</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="form-group">
            <label>Mobile Number:</label>
            <input
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
              required
              placeholder="Enter your mobile number"
            />
          </div>
          
          <div className="form-group">
            <label>Address:</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              rows="3"
              placeholder="Enter your complete address"
            />
          </div>
          
          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}
          
          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Register'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
