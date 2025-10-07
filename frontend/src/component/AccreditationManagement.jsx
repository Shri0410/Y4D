import React, { useState, useEffect } from "react";
import axios from "axios";

const AccreditationManagement = ({ action, onClose, onActionChange }) => {
  const [accreditations, setAccreditations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [accreditationForm, setAccreditationForm] = useState({
    title: "",
    description: "",
    image: null,
    is_active: true,
  });

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    if (action === "view") {
      fetchAccreditations();
    }
  }, [action]);

  const fetchAccreditations = async () => {
    setLoading(true);
    try {
      console.log("📋 Fetching accreditations...");
      const response = await axios.get(`${API_BASE}/accreditations`);
      console.log("✅ Accreditations fetched:", response.data);
      setAccreditations(response.data);
    } catch (error) {
      console.error("❌ Error fetching accreditations:", error);
      console.error("❌ Error details:", error.response?.data);
      alert(`Error fetching accreditations: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("🖼️ Image selected:", file.name, file.size, file.type);
      setAccreditationForm((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📤 Submitting accreditation form...");
      console.log("📤 Form data:", accreditationForm);

      const formData = new FormData();
      formData.append("title", accreditationForm.title);
      formData.append("description", accreditationForm.description);
      formData.append("is_active", accreditationForm.is_active);

      if (accreditationForm.image) {
        formData.append("image", accreditationForm.image);
        console.log("📤 Image appended to form data");
      }

      // Log form data contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`📤 FormData: ${key} =`, value);
      }

      const endpoint = editingId
        ? `${API_BASE}/accreditations/${editingId}`
        : `${API_BASE}/accreditations`;

      console.log("📤 Making request to:", endpoint);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = editingId
        ? await axios.put(endpoint, formData, config)
        : await axios.post(endpoint, formData, config);

      console.log("✅ Accreditation saved successfully:", response.data);
      
      alert(`Accreditation ${editingId ? "updated" : "created"} successfully!`);
      
      // Reset form
      setAccreditationForm({
        title: "",
        description: "",
        image: null,
        is_active: true,
      });
      setEditingId(null);
      setImagePreview(null);
      
      // Refresh the list
      fetchAccreditations();
      onActionChange("view");
    } catch (error) {
      console.error("❌ Error saving accreditation:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error message:", error.message);
      
      alert(`Error saving accreditation: ${error.response?.data?.error || error.response?.data?.details || error.message}`);
    }
    setLoading(false);
  };

  const handleEdit = (accreditation) => {
    console.log("✏️ Editing accreditation:", accreditation);
    setEditingId(accreditation.id);
    setAccreditationForm({
      title: accreditation.title,
      description: accreditation.description || "",
      image: null,
      is_active: accreditation.is_active,
    });
    if (accreditation.image) {
      setImagePreview(`${API_BASE}/uploads/accreditations/${accreditation.image}`);
    }
    onActionChange("update");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this accreditation?")) return;

    setLoading(true);
    try {
      console.log("🗑️ Deleting accreditation ID:", id);
      await axios.delete(`${API_BASE}/accreditations/${id}`);
      console.log("✅ Accreditation deleted successfully");
      alert("Accreditation deleted successfully!");
      fetchAccreditations();
    } catch (error) {
      console.error("❌ Error deleting accreditation:", error);
      console.error("❌ Error details:", error.response?.data);
      alert(`Error deleting accreditation: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleStatusToggle = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} this accreditation?`)) return;

    setLoading(true);
    try {
      console.log("🔄 Toggling status for ID:", id, "to:", newStatus);
      
      // Get current accreditation data
      const accreditation = accreditations.find(a => a.id === id);
      if (!accreditation) {
        throw new Error("Accreditation not found");
      }

      // Update with current data but change is_active
      const formData = new FormData();
      formData.append("title", accreditation.title);
      formData.append("description", accreditation.description || "");
      formData.append("is_active", newStatus);

      await axios.put(`${API_BASE}/accreditations/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Status updated successfully");
      alert(`Accreditation ${newStatus ? "activated" : "deactivated"} successfully!`);
      fetchAccreditations();
    } catch (error) {
      console.error("❌ Error toggling accreditation status:", error);
      console.error("❌ Error details:", error.response?.data);
      alert(`Error updating accreditation status: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    console.log("❌ Canceling edit");
    setEditingId(null);
    setAccreditationForm({
      title: "",
      description: "",
      image: null,
      is_active: true,
    });
    setImagePreview(null);
    onActionChange("view");
  };

  const renderForm = () => {
    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <button className="btn-back" onClick={cancelEdit}>
              ← Back to Accreditations
            </button>
            <h3>{editingId ? "Edit Accreditation" : "Add New Accreditation"}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-group">
            <label>Title: *</label>
            <input
              type="text"
              value={accreditationForm.title}
              onChange={(e) =>
                setAccreditationForm({ ...accreditationForm, title: e.target.value })
              }
              required
              placeholder="Enter accreditation title"
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={accreditationForm.description}
              onChange={(e) =>
                setAccreditationForm({ ...accreditationForm, description: e.target.value })
              }
              rows="3"
              placeholder="Enter accreditation description (optional)"
            />
          </div>

          <div className="form-group">
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>Supported formats: JPG, PNG, GIF. Max size: 5MB</small>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <p>Image Preview</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select
              value={accreditationForm.is_active}
              onChange={(e) =>
                setAccreditationForm({
                  ...accreditationForm,
                  is_active: e.target.value === "true",
                })
              }
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update" : "Create"} Accreditation
            </button>
            <button type="button" onClick={cancelEdit} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <h3>Accreditations Management</h3>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingId(null);
                setAccreditationForm({
                  title: "",
                  description: "",
                  image: null,
                  is_active: true,
                });
                setImagePreview(null);
                onActionChange("add");
              }}
              disabled={loading}
            >
              + Add Accreditation
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading accreditations...</div>
        ) : accreditations.length === 0 ? (
          <div className="no-data-message">
            <p>No accreditations found</p>
            <p><small>Click "Add Accreditation" to create your first one.</small></p>
          </div>
        ) : (
          <div className="items-grid">
            {accreditations.map((accreditation) => {
              const isActive = accreditation.is_active === true || 
                              accreditation.is_active === 1 || 
                              accreditation.is_active === "true";

              return (
                <div
                  key={accreditation.id}
                  className="item-card"
                  style={{
                    borderLeft: `4px solid ${isActive ? "#4CAF50" : "#ff9800"}`,
                  }}
                >
                  {accreditation.image && (
                    <div className="item-image">
                      <img
                        src={`${API_BASE}/uploads/accreditations/${accreditation.image}`}
                        alt={accreditation.title}
                        onError={(e) => {
                          console.error("❌ Image failed to load:", e.target.src);
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="item-content">
                    <div className="accreditation-header">
                      <h4>{accreditation.title}</h4>
                      <span
                        className={`status-badge ${
                          isActive ? "active" : "inactive"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    
                    {accreditation.description && (
                      <p>{accreditation.description}</p>
                    )}
    
                    <p>
                      <strong>ID:</strong> {accreditation.id}
                    </p>

                    <div className="item-actions">
                      <button
                        className={`status-toggle-btn ${
                          isActive ? "btn-inactive" : "btn-active"
                        }`}
                        onClick={() => handleStatusToggle(accreditation.id, !isActive)}
                        disabled={loading}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(accreditation)}
                        disabled={loading}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(accreditation.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="accreditation-management">
      {action === "view" && renderListView()}
      {(action === "add" || action === "update") && renderForm()}
    </div>
  );
};

export default AccreditationManagement;