import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css'; // We'll create this CSS file

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    mobile_number: '',
    address: ''
  });

  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response) {
        setError(error.response.data?.error || `Server error: ${error.response.status}`);
      } else if (error.request) {
        setError('Network error: Could not connect to server');
      } else {
        setError(error.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/users`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        mobile_number: formData.mobile_number,
        address: formData.address
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setShowCreateModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        mobile_number: '',
        address: ''
      });
      fetchUsers();
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create user');
    }
    setLoading(false);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/users/${userId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`${API_BASE}/users/${userId}/role`, {
        role: newRole
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_BASE}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchUsers();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      approved: 'status-approved',
      pending: 'status-pending',
      rejected: 'status-rejected',
      suspended: 'status-suspended'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      super_admin: 'role-super-admin',
      admin: 'role-admin',
      editor: 'role-editor',
      viewer: 'role-viewer'
    };
    
    return (
      <span className={`role-badge ${roleClasses[role]}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="user-management-loading">
      <div className="spinner"></div>
      <p>Loading users...</p>
    </div>
  );

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i> Create New User
          </button>
          <button onClick={fetchUsers} className="btn btn-secondary">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={() => setError('')} className="alert-close">
            &times;
          </button>
        </div>
      )}

      <div className="user-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.status === 'approved').length}</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.status === 'pending').length}</h3>
          <p>Pending Users</p>
        </div>
      </div>

      <div className="users-table-container">
        <div className="table-header">
          <h3>All Users</h3>
          <span className="table-count">{users.length} users found</span>
        </div>
        
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Information</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <i className="fas fa-users"></i>
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="user-row">
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <strong>{user.username}</strong>
                          {user.created_by_name && (
                            <small>Created by: {user.created_by_name}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>{user.email}</div>
                        {user.mobile_number && (
                          <small>{user.mobile_number}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                        disabled={user.role === 'super_admin'}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td>
                      <div className="date-info">
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="btn btn-danger btn-sm"
                          disabled={user.role === 'super_admin'}
                          title={user.role === 'super_admin' ? 'Cannot delete super admin' : 'Delete user'}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="Enter password (min 6 characters)"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    placeholder="Confirm password"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                    placeholder="Optional mobile number"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Optional address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
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

export default UserManagement;