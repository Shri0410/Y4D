import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";

const UserManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("users");
  const [selectedUserForPermissions, setSelectedUserForPermissions] =
    useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
    mobile_number: "",
    address: "",
  });
  const [permissions, setPermissions] = useState([]);

  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  // Define all sections and sub-sections for permissions
  const allSections = [
    {
      section: "interventions",
      label: "Interventions",
      subSections: [
        "quality_education",
        "livelihood",
        "healthcare",
        "environment_sustainability",
        "integrated_development",
      ],
    },
    {
      section: "media",
      label: "Media Corner",
      subSections: [
        "newsletters",
        "stories",
        "events",
        "blogs",
        "documentaries",
      ],
    },
    { section: "impact", label: "Impact Data", subSections: [] },
    { section: "banners", label: "Banner Management", subSections: [] },
    { section: "accreditations", label: "Accreditations", subSections: [] },
    {
      section: "team",
      label: "Team",
      subSections: ["mentors", "management", "board-trustees"],
    },
    { section: "careers", label: "Career", subSections: [] },
    { section: "reports", label: "Legal Report", subSections: [] },
    {
      section: "users",
      label: "User Management",
      subSections: ["users", "registrations"],
    },
  ];

  useEffect(() => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);

      if (error.response) {
        setError(
          error.response.data?.error || `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        setError("Network error: Could not connect to server");
      } else {
        setError(error.message || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/permissions/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPermissions(response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      // If permissions API doesn't exist yet, set empty permissions
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/users`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          mobile_number: formData.mobile_number,
          address: formData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowCreateModal(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "viewer",
        mobile_number: "",
        address: "",
      });
      fetchUsers();
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create user");
    }
    setLoading(false);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/users/${userId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update user status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(
        `${API_BASE}/users/${userId}/role`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`
      )
    ) {
      try {
        await axios.delete(`${API_BASE}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers();
      } catch (error) {
        setError(error.response?.data?.error || "Failed to delete user");
      }
    }
  };

  // Permission Management Functions
  const handleUserSelectForPermissions = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUserForPermissions(user);
    fetchUserPermissions(userId);
  };

  const getPermissionForSection = (section, subSection = null) => {
    const perm = permissions.find(
      (p) => p.section === section && p.sub_section === subSection
    );

    if (perm) return perm;

    // Return default permissions based on role
    const defaultPerms = {
      viewer: {
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_publish: false,
      },
      editor: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: false,
        can_publish: false,
      },
      admin: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_publish: true,
      },
      super_admin: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_publish: true,
      },
    };

    return (
      defaultPerms[selectedUserForPermissions?.role] || defaultPerms.viewer
    );
  };

  const updatePermission = async (section, subSection, field, value) => {
    const updatedPermissions = [...permissions];
    const existingIndex = updatedPermissions.findIndex(
      (p) => p.section === section && p.sub_section === subSection
    );

    if (existingIndex >= 0) {
      updatedPermissions[existingIndex][field] = value;
    } else {
      updatedPermissions.push({
        user_id: selectedUserForPermissions.id,
        section,
        sub_section: subSection,
        can_view: field === "can_view" ? value : false,
        can_create: field === "can_create" ? value : false,
        can_edit: field === "can_edit" ? value : false,
        can_delete: field === "can_delete" ? value : false,
        can_publish: field === "can_publish" ? value : false,
      });
    }

    setPermissions(updatedPermissions);
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Validate we have a selected user
      if (!selectedUserForPermissions) {
        alert("No user selected");
        setLoading(false);
        return;
      }

      // Validate permissions data
      if (!permissions || permissions.length === 0) {
        alert("No permissions data to save");
        setLoading(false);
        return;
      }

      console.log("Saving permissions:", {
        userId: selectedUserForPermissions.id,
        permissions: permissions,
      });

      const response = await axios.put(
        `${API_BASE}/permissions/user/${selectedUserForPermissions.id}`,
        { permissions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Save response:", response.data);
      alert("Permissions updated successfully!");

      // Refresh the permissions to ensure sync
      fetchUserPermissions(selectedUserForPermissions.id);
    } catch (error) {
      console.error("Error saving permissions:", error);

      let errorMessage = "Failed to save permissions";

      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || errorMessage;
        console.error("Server error details:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network error: Could not connect to server";
        console.error("Network error:", error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }

      alert(errorMessage);
    }
    setLoading(false);
  };

  const resetToRoleDefault = async () => {
    if (!selectedUserForPermissions) return;

    try {
      const response = await axios.get(
        `${API_BASE}/permissions/role/${selectedUserForPermissions.role}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const defaultPerms = response.data;
      const newPermissions = [];

      // Apply default permissions to all sections
      allSections.forEach((sectionConfig) => {
        newPermissions.push({
          user_id: selectedUserForPermissions.id,
          section: sectionConfig.section,
          sub_section: null,
          ...defaultPerms,
        });

        sectionConfig.subSections.forEach((subSection) => {
          newPermissions.push({
            user_id: selectedUserForPermissions.id,
            section: sectionConfig.section,
            sub_section: subSection,
            ...defaultPerms,
          });
        });
      });

      setPermissions(newPermissions);
    } catch (error) {
      console.error("Error resetting permissions:", error);
      // If API doesn't exist, use hardcoded defaults
      const defaultPerms = {
        viewer: {
          can_view: true,
          can_create: false,
          can_edit: false,
          can_delete: false,
          can_publish: false,
        },
        editor: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: false,
          can_publish: false,
        },
        admin: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          can_publish: true,
        },
        super_admin: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          can_publish: true,
        },
      };

      const userDefaultPerms =
        defaultPerms[selectedUserForPermissions.role] || defaultPerms.viewer;
      const newPermissions = [];

      allSections.forEach((sectionConfig) => {
        newPermissions.push({
          user_id: selectedUserForPermissions.id,
          section: sectionConfig.section,
          sub_section: null,
          ...userDefaultPerms,
        });

        sectionConfig.subSections.forEach((subSection) => {
          newPermissions.push({
            user_id: selectedUserForPermissions.id,
            section: sectionConfig.section,
            sub_section: subSection,
            ...userDefaultPerms,
          });
        });
      });

      setPermissions(newPermissions);
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, id, disabled = false }) => {
    return (
      <label className="usermgmt-toggle-switch" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          checked={checked || false}
          onChange={onChange}
          disabled={disabled}
        />
        <span className="usermgmt-toggle-slider"></span>
      </label>
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      approved: "status-approved",
      pending: "status-pending",
      rejected: "status-rejected",
      suspended: "status-suspended",
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      super_admin: "role-super-admin",
      admin: "role-admin",
      editor: "role-editor",
      viewer: "role-viewer",
    };

    return (
      <span className={`role-badge ${roleClasses[role]}`}>
        {role.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderUserList = () => (
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
              users.map((user) => (
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
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="role-select"
                      disabled={user.role === "super_admin"}
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
                      onChange={(e) =>
                        handleStatusChange(user.id, e.target.value)
                      }
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
                        disabled={user.role === "super_admin"}
                        title={
                          user.role === "super_admin"
                            ? "Cannot delete super admin"
                            : "Delete user"
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab("permissions");
                          handleUserSelectForPermissions(user.id);
                        }}
                        className="btn btn-info btn-sm"
                        title="Manage Permissions"
                      >
                        <i className="fas fa-shield-alt"></i>
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
  );

  const renderAddUserForm = () => (
    <div className="add-user-form-container">
      <div className="form-header">
        <h3>Add New User Manually</h3>
        <p>Create a new user account with specific role and permissions</p>
      </div>

      <form onSubmit={handleCreateUser} className="user-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Confirm password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile_number: e.target.value,
                })
              }
              placeholder="Optional mobile number"
            />
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Optional address"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("users")}
            className="btn btn-secondary"
          >
            Back to Users
          </button>
        </div>
      </form>
    </div>
  );

  const renderPermissionManagement = () => (
    <div className="permission-management">
      <div className="permission-header">
        <h3>User Permission Management</h3>
        <p>Control section-wise access for each user</p>
      </div>

      {/* User Selection */}
      <div className="user-selection">
        <label>Select User:</label>
        <select
          value={selectedUserForPermissions?.id || ""}
          onChange={(e) =>
            handleUserSelectForPermissions(parseInt(e.target.value))
          }
        >
          <option value="">Choose a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.role}) - {user.email}
            </option>
          ))}
        </select>
      </div>

      {selectedUserForPermissions && (
        <div className="permission-content">
          <div className="user-info">
            <h4>Permissions for: {selectedUserForPermissions.username}</h4>
            <p>
              Role: <strong>{selectedUserForPermissions.role}</strong>
            </p>
            <div className="permission-actions">
              <button
                onClick={resetToRoleDefault}
                className="btn btn-secondary"
              >
                Reset to Role Default
              </button>
              <button
                onClick={savePermissions}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Permissions"}
              </button>
              <button
                onClick={() => setActiveSubTab("users")}
                className="btn btn-outline"
              >
                Back to Users
              </button>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="permissions-grid">
            {allSections.map((sectionConfig) => (
              <div key={sectionConfig.section} className="permission-section">
                <div className="section-header">
                  <h5>{sectionConfig.label}</h5>
                  <div className="usermgmt-action-labels">
                    {["view", "create", "edit", "delete", "publish"].map(
                      (action) => (
                        <span key={action} className="usermgmt-action-label">
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Main Section Permissions */}
                <div className="usermgmt-permission-row usermgmt-main-section">
                  <span className="usermgmt-section-label">Main Section</span>
                  <div className="usermgmt-toggle-container">
                    {["view", "create", "edit", "delete", "publish"].map(
                      (action) => (
                        <div key={action} className="usermgmt-toggle-item">
                          <ToggleSwitch
                            id={`${sectionConfig.section}-main-${action}`}
                            checked={
                              getPermissionForSection(sectionConfig.section)[
                                `can_${action}`
                              ]
                            }
                            onChange={(e) =>
                              updatePermission(
                                sectionConfig.section,
                                null,
                                `can_${action}`,
                                e.target.checked
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Sub-section Permissions */}
                {sectionConfig.subSections.map((subSection) => (
                  <div
                    key={subSection}
                    className="usermgmt-permission-row usermgmt-sub-section"
                  >
                    <span className="usermgmt-section-label">
                      <span className="usermgmt-subsection-icon">↳</span>
                      {subSection.replace(/_/g, " ")}
                    </span>
                    <div className="usermgmt-toggle-container">
                      {["view", "create", "edit", "delete", "publish"].map(
                        (action) => (
                          <div key={action} className="usermgmt-toggle-item">
                            <ToggleSwitch
                              id={`${sectionConfig.section}-${subSection}-${action}`}
                              checked={
                                getPermissionForSection(
                                  sectionConfig.section,
                                  subSection
                                )[`can_${action}`]
                              }
                              onChange={(e) =>
                                updatePermission(
                                  sectionConfig.section,
                                  subSection,
                                  `can_${action}`,
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="usermgmt-legend-section">
            <div className="usermgmt-legend-title">Permissions Legend:</div>
            <div className="usermgmt-legend-items">
              <div className="usermgmt-legend-item">
                <span className="usermgmt-legend-color usermgmt-legend-view"></span>
                <span>View - Can see content</span>
              </div>
              <div className="usermgmt-legend-item">
                <span className="usermgmt-legend-color usermgmt-legend-create"></span>
                <span>Create - Can add new items</span>
              </div>
              <div className="usermgmt-legend-item">
                <span className="usermgmt-legend-color usermgmt-legend-edit"></span>
                <span>Edit - Can modify existing items</span>
              </div>
              <div className="usermgmt-legend-item">
                <span className="usermgmt-legend-color usermgmt-legend-delete"></span>
                <span>Delete - Can remove items</span>
              </div>
              <div className="usermgmt-legend-item">
                <span className="usermgmt-legend-color usermgmt-legend-publish"></span>
                <span>Publish - Can change status</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading && activeSubTab === "users")
    return (
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
          <button onClick={() => setError("")} className="alert-close">
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
          <h3>{users.filter((u) => u.status === "approved").length}</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter((u) => u.status === "pending").length}</h3>
          <p>Pending Users</p>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="sub-tabs-navigation">
        <button
          className={`sub-tab ${activeSubTab === "users" ? "active" : ""}`}
          onClick={() => setActiveSubTab("users")}
        >
          <i className="fas fa-users"></i> View Users
        </button>
        <button
          className={`sub-tab ${activeSubTab === "add-user" ? "active" : ""}`}
          onClick={() => setActiveSubTab("add-user")}
        >
          <i className="fas fa-user-plus"></i> Add User
        </button>
        <button
          className={`sub-tab ${
            activeSubTab === "permissions" ? "active" : ""
          }`}
          onClick={() => setActiveSubTab("permissions")}
        >
          <i className="fas fa-shield-alt"></i> User Permissions
        </button>
      </div>

      {/* Content based on active sub tab */}
      <div className="sub-tab-content">
        {activeSubTab === "users" && renderUserList()}
        {activeSubTab === "add-user" && renderAddUserForm()}
        {activeSubTab === "permissions" && renderPermissionManagement()}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
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
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    placeholder="Confirm password"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobile_number: e.target.value,
                      })
                    }
                    placeholder="Optional mobile number"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Optional address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create User"}
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
