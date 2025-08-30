import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    status: 'pending'
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
}, []);

  const fetchUsers = async () => {
  try {
    setLoading(true);
    setError('');
    console.log('Fetching users from:', `${API_BASE}/users`);
    
    const response = await axios.get(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Users fetched successfully:', response.data);
    setUsers(response.data);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // More detailed error handling
    if (error.response) {
      // Server responded with error status
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      setError(error.response.data?.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      setError('Network error: Could not connect to server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
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
        role: formData.role
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
        status: 'pending'
      });
      fetchUsers();
      alert('User created successfully!');
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
      alert(`User status updated to ${newStatus}`);
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
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await axios.delete(`${API_BASE}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchUsers();
        alert('User deleted successfully!');
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
        {status.toUpperCase()}
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

if (loading) return (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading users...</p>
  </div>
);
  return (
    <div className="user-management">
      <div className="section-header">
        <h3>User Management</h3>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-create"
          >
            + Create New User
          </button>
          <button onClick={fetchUsers} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
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
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <strong>{user.username}</strong>
                      {user.created_by_name && (
                        <small>Created by: {user.created_by_name}</small>
                      )}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
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
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="user-actions">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="btn-delete"
                        title="Delete User"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="Enter password"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password:</label>
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
                <label>Role:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <div className="message error">{error}</div>}

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}>
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