import React, { useState, useEffect } from "react";
import { API_BASE } from "../config/api";
import axios from "axios";
import logger from "../utils/logger";
import {
  canView,
  canCreate,
  canEdit,
  canDelete,
  canPublish,
} from "../utils/permissions";

const AccreditationManagement = ({
  action,
  onClose,
  onActionChange,
  currentUser,
}) => {
  const [accreditations, setAccreditations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Permission check functions
  const canUserPerformAction = (actionType) => {
    if (!currentUser) return false;
    if (currentUser.role === "super_admin") return true;

    switch (actionType) {
      case "view":
        return canView(currentUser, "accreditations");
      case "create":
        return canCreate(currentUser, "accreditations");
      case "edit":
        return canEdit(currentUser, "accreditations");
      case "delete":
        return canDelete(currentUser, "accreditations");
      case "publish":
        return canPublish(currentUser, "accreditations");
      default:
        return false;
    }
  };

  const renderLastModifiedInfo = (item) => {
    // Only show last modified info to admin and super_admin
    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.role !== "super_admin")
    ) {
      return null;
    }

    const modifiedByName = item.last_modified_by_name || item.modified_by_name;
    const modifiedAt = item.last_modified_at || item.modified_at;

    if (!modifiedByName && !modifiedAt) {
      return null;
    }

    return (
      <div className="last-modified-info admin-only">
        <small>
          Last modified by: <strong>{modifiedByName || "Unknown user"}</strong>{" "}
          •{" "}
          {modifiedAt
            ? new Date(modifiedAt).toLocaleDateString()
            : "Unknown date"}
        </small>
      </div>
    );
  };

  useEffect(() => {
    if (action === "view") {
      fetchAccreditations();
    }
  }, [action]);

  const fetchAccreditations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/accreditations`);

      // Ensure we have last_modified_by_name for each accreditation
      const accreditationsWithModifier = response.data.map((item) => ({
        ...item,
        last_modified_by_name: item.last_modified_by_name || "Unknown",
      }));

      setAccreditations(accreditationsWithModifier);
    } catch (error) {
      logger.error("Error fetching accreditations:", error);
      setError("Failed to fetch accreditations");
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUserPerformAction(editingItem ? "edit" : "create")) {
      alert("You don't have permission to perform this action");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image" && formData.image) {
          formDataToSend.append("image", formData.image);
        } else if (key === "is_active") {
          formDataToSend.append(key, formData[key] ? "1" : "0");
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingItem) {
        response = await axios.put(
          `${API_BASE}/accreditations/${editingItem.id}`,
          formDataToSend,
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE}/accreditations`,
          formDataToSend,
          config
        );
      }

      resetForm();
      onActionChange("view");
      fetchAccreditations();
      alert(
        `Accreditation ${editingItem ? "updated" : "created"} successfully!`
      );
    } catch (error) {
      logger.error("Error saving accreditation:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        "Failed to save accreditation";
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    if (!canUserPerformAction("edit")) {
      alert("You don't have permission to edit accreditations");
      return;
    }
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image: null,
      issuing_organization: item.issuing_organization,
      issue_date: item.issue_date,
      expiry_date: item.expiry_date,
      is_active: item.is_active,
    });
    if (item.image) {
      setImagePreview(`${API_BASE}/uploads/accreditations/${item.image}`);
    }
    onActionChange("update");
  };

  const handleDelete = async (id) => {
    if (!canUserPerformAction("delete")) {
      alert("You don't have permission to delete accreditations");
      return;
    }

    if (window.confirm("Are you sure you want to delete this accreditation?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE}/accreditations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAccreditations();
        alert("Accreditation deleted successfully!");
      } catch (error) {
        logger.error("Error deleting accreditation:", error);
        alert("Failed to delete accreditation");
      }
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!canUserPerformAction("publish")) {
      alert("You don't have permission to change accreditation status");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to ${
          currentStatus ? "deactivate" : "activate"
        } this accreditation?`
      )
    )
      return;

    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/accreditations/${id}/toggle-status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAccreditations();
      alert(
        `Accreditation ${
          !currentStatus ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      logger.error("Error toggling status:", error);
      alert("Failed to update accreditation status");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      image: null,
      issuing_organization: "",
      issue_date: "",
      expiry_date: "",
      is_active: true,
    });
    setImagePreview(null);
    setError("");
  };

  const cancelAction = () => {
    resetForm();
    onActionChange("view");
  };

  // Render action buttons for each item
  const renderItemActions = (item) => {
    const canEditItem = canUserPerformAction("edit");
    const canDeleteItem = canUserPerformAction("delete");
    const canPublishItem = canUserPerformAction("publish");

    if (!canEditItem && !canDeleteItem && !canPublishItem) {
      return (
        <div className="item-actions">
          <span className="view-only-badge">View Only</span>
        </div>
      );
    }

    return (
      <div className="item-actions">
        {canPublishItem && (
          <button
            className={`status-toggle-btn ${
              item.is_active ? "btn-inactive" : "btn-active"
            }`}
            onClick={() => toggleStatus(item.id, item.is_active)}
            disabled={loading}
          >
            {item.is_active ? "Deactivate" : "Activate"}
          </button>
        )}

        {canEditItem && (
          <button
            className="btn-edit"
            onClick={() => handleEdit(item)}
            disabled={loading}
          >
            Edit
          </button>
        )}

        {canDeleteItem && (
          <button
            className="btn-delete"
            onClick={() => handleDelete(item.id)}
            disabled={loading}
          >
            Delete
          </button>
        )}
      </div>
    );
  };

  // Render View Mode
  const renderViewMode = () => {
    if (loading) return <div className="loading">Loading...</div>;

    return (
      <div className="accreditation-management">
        <div className="accreditation-header">
          <h2>Accreditations Management</h2>
          {canUserPerformAction("create") && (
            <button
              onClick={() => {
                resetForm();
                onActionChange("add");
              }}
              className="btn-primary"
              disabled={loading}
            >
              + Add New Accreditation
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="accreditation-list">
          {accreditations.length === 0 ? (
            <div className="no-items">
              <p>No accreditations found</p>
              <p>
                <small>
                  Click "Add Accreditation" to create your first accreditation.
                </small>
              </p>
            </div>
          ) : (
            <div className="items-grid">
              {accreditations.map((item) => {
                const isActive =
                  item.is_active === true ||
                  item.is_active === 1 ||
                  item.is_active === "true";

                return (
                  <div
                    key={item.id}
                    className="item-card"
                    style={{
                      borderLeft: `4px solid ${
                        isActive ? "#4CAF50" : "#ff9800"
                      }`,
                    }}
                  >
                    {item.image && (
                      <div className="item-image">
                        <img
                          src={`${API_BASE}/uploads/accreditations/${item.image}`}
                          alt={item.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="item-content">
                      <div className="accreditation-header">
                        <h4>{item.title}</h4>
                        <span
                          className={`status-badge ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <p>{item.description}</p>

                      <div className="item-meta">
                        <p>
                          <strong>Organization:</strong>{" "}
                          {item.issuing_organization}
                        </p>
                        {item.issue_date && (
                          <p>
                            <strong>Issued:</strong>{" "}
                            {new Date(item.issue_date).toLocaleDateString()}
                          </p>
                        )}
                        {item.expiry_date && (
                          <p>
                            <strong>Expires:</strong>{" "}
                            {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* ADDED: Last modified info display */}
                      {renderLastModifiedInfo(item)}

                      {renderItemActions(item)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Form Mode
  const renderFormMode = () => {
    return (
      <div className="accreditation-management">
        <div className="accreditation-form-header">
          <div className="form-header-top">
            <button
              onClick={cancelAction}
              className="back-to-accreditations-btn"
            >
              <span className="back-arrow">←</span>
              <span>Back to Accreditations</span>
            </button>
          </div>

          <div className="form-header-title">
            <h2>{editingItem ? "Edit" : "Add New"} Accreditation</h2>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="accreditation-form">
          {/* Form fields remain the same */}
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Issuing Organization:</label>
            <input
              type="text"
              value={formData.issuing_organization}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issuing_organization: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Issue Date:</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Expiry Date:</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.is_active}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "true",
                })
              }
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? "Saving..."
                : editingItem
                ? "Update Accreditation"
                : "Create Accreditation"}
            </button>
            <button
              type="button"
              onClick={cancelAction}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (action === "view") {
    return renderViewMode();
  } else if (action === "add" || action === "update") {
    return renderFormMode();
  }

  return null;
};

export default AccreditationManagement;
