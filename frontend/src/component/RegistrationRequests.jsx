import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'viewer'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registration/requests`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch registration requests');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registration/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    // Generate username from email (first part before @)
    const usernameFromEmail = request.email.split('@')[0];
    setApproveForm({
      username: usernameFromEmail,
      password: '',
      confirmPassword: '',
      role: 'viewer'
    });
    setShowApproveModal(true);
    setError('');
    setMessage('');
  };

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this registration request?')) {
      try {
        await axios.post(`${API_BASE}/registration/requests/${requestId}/reject`, {
          reason: 'Rejected by administrator'
        });
        setMessage('Registration request rejected successfully');
        fetchRequests();
        fetchStats();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to reject request');
      }
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (approveForm.password !== approveForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (approveForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/registration/requests/${selectedRequest.id}/approve`, {
        username: approveForm.username,
        password: approveForm.password,
        role: approveForm.role
      });
      
      setMessage('User account created successfully!');
      setShowApproveModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to approve request');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="loading">Loading registration requests...</div>;

  return (
    <div className="registration-requests">
      <div className="section-header">
        <h3>Registration Requests</h3>
        <div className="stats">
          <span className="stat total">Total: {stats.total}</span>
          <span className="stat pending">Pending: {stats.pending}</span>
          <span className="stat approved">Approved: {stats.approved}</span>
          <span className="stat rejected">Rejected: {stats.rejected}</span>
        </div>
        <button onClick={fetchRequests} className="refresh-btn">Refresh</button>
      </div>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <div className="requests-grid">
        {requests.length === 0 ? (
          <div className="empty-state">
            <p>No pending registration requests</p>
          </div>
        ) : (
          requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h4>{request.name}</h4>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="request-details">
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Mobile:</strong> {request.mobile_number}</p>
                <p><strong>Address:</strong> {request.address}</p>
                <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {request.status}</p>
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    onClick={() => handleApprove(request)}
                    className="btn-approve"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(request.id)}
                    className="btn-reject"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Approve Registration</h3>
              <button onClick={() => setShowApproveModal(false)} className="close-btn">&times;</button>
            </div>

            <div className="user-info">
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Mobile:</strong> {selectedRequest.mobile_number}</p>
              <p><strong>Address:</strong> {selectedRequest.address}</p>
            </div>

            <form onSubmit={handleApproveSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={approveForm.username}
                  onChange={(e) => setApproveForm({...approveForm, username: e.target.value})}
                  required
                  placeholder="Choose a username"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={approveForm.password}
                  onChange={(e) => setApproveForm({...approveForm, password: e.target.value})}
                  required
                  placeholder="Set temporary password"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={approveForm.confirmPassword}
                  onChange={(e) => setApproveForm({...approveForm, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm password"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Role:</label>
                <select
                  value={approveForm.role}
                  onChange={(e) => setApproveForm({...approveForm, role: e.target.value})}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <div className="message error">{error}</div>}

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User Account'}
                </button>
                <button type="button" onClick={() => setShowApproveModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequests;