import React, { useState, useEffect } from "react";
import { API_BASE } from "../config/api";
import axios from "axios";
import "./UserManagement.css"; // reuse the same styles
import logger from "../utils/logger";

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registration/requests`);
      setRequests(response.data);
    } catch (error) {
      logger.error("Error fetching requests:", error);
      setError("Failed to fetch registration requests");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registration/stats`);
      setStats(response.data);
    } catch (error) {
      logger.error("Error fetching stats:", error);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    const usernameFromEmail = request.email.split("@")[0];
    setApproveForm({
      username: usernameFromEmail,
      password: "",
      confirmPassword: "",
      role: "viewer",
    });
    setShowApproveModal(true);
    setError("");
    setMessage("");
  };

  const handleReject = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to reject this registration request?"
      )
    ) {
      try {
        await axios.post(
          `${API_BASE}/registration/requests/${requestId}/reject`,
          {
            reason: "Rejected by administrator",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessage("Registration request rejected successfully");
        fetchRequests();
        fetchStats();
      } catch (error) {
        setError(error.response?.data?.error || "Failed to reject request");
      }
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (approveForm.password !== approveForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (approveForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/registration/requests/${selectedRequest.id}/approve`,
        {
          username: approveForm.username,
          password: approveForm.password,
          role: approveForm.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("User account created successfully!");
      setShowApproveModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to approve request");
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
    };
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="user-management-loading">
        <div className="spinner"></div>
        <p>Loading registration requests...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-management-header">
        <h2>Registration Requests</h2>
        <div className="header-actions">
          <button onClick={fetchRequests} className="btn btn-secondary">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {message}
          <button onClick={() => setMessage("")} className="alert-close">
            &times;
          </button>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={() => setError("")} className="alert-close">
            &times;
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="user-stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Requests</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{stats.approved}</h3>
          <p>Approved</p>
        </div>
        <div className="stat-card">
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h3>All Registration Requests</h3>
          <span className="table-count">{requests.length} requests found</span>
        </div>
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Info</th>
                <th>Contact</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <i className="fas fa-user-clock"></i>
                    <p>No pending registration requests</p>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <strong>{request.name}</strong>
                          <small>{request.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>{request.mobile_number}</div>
                        <small>{request.address}</small>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        {formatDate(request.created_at)}
                      </div>
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      {request.status === "pending" && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApprove(request)}
                            className="btn btn-primary btn-sm"
                          >
                            <i className="fas fa-check"></i> Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="btn btn-danger btn-sm"
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Approve Registration Request</h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="modal-form">
              {/* Request Details Section */}
              <div className="form-group">
                <label>Request Details</label>
                <div className="request-details">
                  <p>
                    <strong>Name:</strong> {selectedRequest.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedRequest.email}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {selectedRequest.mobile_number}
                  </p>
                  {selectedRequest.address && (
                    <p>
                      <strong>Address:</strong> {selectedRequest.address}
                    </p>
                  )}
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={approveForm.username}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        username: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter username for the new account"
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={approveForm.password}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        password: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={approveForm.confirmPassword}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    placeholder="Confirm the password"
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={approveForm.role}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, role: e.target.value })
                    }
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div
                        className="spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></div>
                      Creating User...
                    </>
                  ) : (
                    "Create User Account"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                >
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
