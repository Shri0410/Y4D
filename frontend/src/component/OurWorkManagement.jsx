import React, { useState, useEffect } from "react";
import { API_BASE } from "../config/api";
import axios from "axios";
import toast from "../utils/toast";
import logger from "../utils/logger";
import confirmDialog from "../utils/confirmDialog";
import "./OurWorkManagement.css";
import {
  canView,
  canCreate,
  canEdit,
  canDelete,
  canPublish,
} from "../utils/permissions";

const OurWorkManagement = ({
  category,
  action,
  onClose,
  onActionChange,
  currentUser,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    video_url: "",
    additional_images: [],
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_active: true,
    display_order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Permission check functions for this component
  const canUserPerformAction = (actionType) => {
    if (!currentUser) return false;
    if (currentUser.role === "super_admin") return true;

    switch (actionType) {
      case "view":
        return canView(currentUser, "interventions", category);
      case "create":
        return canCreate(currentUser, "interventions", category);
      case "edit":
        return canEdit(currentUser, "interventions", category);
      case "delete":
        return canDelete(currentUser, "interventions", category);
      case "publish":
        return canPublish(currentUser, "interventions", category);
      default:
        return false;
    }
  };

  const categoryLabels = {
    quality_education: "Quality Education",
    livelihood: "Livelihood",
    healthcare: "Healthcare",
    environment_sustainability: "Environment Sustainability",
    integrated_development: "Integrated Development Program (IDP)",
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/uploads/")) {
      return `${API_BASE}${imageUrl}`;
    }
    return `${API_BASE}/uploads/our-work/${category}/${imageUrl}`;
  };

  useEffect(() => {
    if (category && (action === "view" || action === "update")) {
      fetchItems();
    }
  }, [category, action]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_BASE}/our-work/admin/${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Ensure we have last_modified_by_name for each item
      const itemsWithModifier = response.data.map((item) => ({
        ...item,
        last_modified_by_name: item.last_modified_by_name || "Unknown",
      }));

      setItems(itemsWithModifier);
    } catch (error) {
      logger.error("Error fetching items:", error);
      setError("Failed to load items. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUserPerformAction(editingItem ? "edit" : "create")) {
      toast.warning("You don't have permission to perform this action");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "additional_images") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === "is_active") {
          formDataToSend.append(key, formData[key] ? "1" : "0");
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      let response;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingItem) {
        response = await axios.put(
          `${API_BASE}/our-work/admin/${category}/${editingItem.id}`,
          formDataToSend,
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE}/our-work/admin/${category}`,
          formDataToSend,
          config
        );
      }

      resetForm();
      onActionChange("view");
      fetchItems();
      toast.success(`Item ${editingItem ? "updated" : "created"} successfully!`);
    } catch (error) {
      logger.error("Error saving item:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        "Failed to save. Please check console for details.";
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    if (!canUserPerformAction("edit")) {
      toast.warning("You don't have permission to edit items");
      return;
    }
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      image_url: item.image_url,
      video_url: item.video_url,
      additional_images: item.additional_images || [],
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      meta_keywords: item.meta_keywords,
      is_active: item.is_active,
      display_order: item.display_order,
    });
    if (item.image_url) {
      setImagePreview(getImageUrl(item.image_url));
    }
    onActionChange("update");
  };

  const handleDelete = async (id) => {
    if (!canUserPerformAction("delete")) {
      toast.warning("You don't have permission to delete items");
      return;
    }

    const confirmed = await confirmDialog("Are you sure you want to delete this item?");
    if (confirmed) {
      try {
        await axios.delete(`${API_BASE}/our-work/admin/${category}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchItems();
        toast.success("Item deleted successfully!");
      } catch (error) {
        logger.error("Error deleting item:", error);
        toast.error(error.response?.data?.error || "Failed to delete item");
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!canUserPerformAction("publish")) {
      toast.warning("You don't have permission to change item status");
      return;
    }

    try {
      await axios.patch(
        `${API_BASE}/our-work/admin/${category}/${id}/status`,
        {
          is_active: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchItems();
      toast.success(
        `Item ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      logger.error("Error toggling status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update status"
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      content: "",
      image_url: "",
      video_url: "",
      additional_images: [],
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      is_active: true,
      display_order: 0,
    });
    setImageFile(null);
    setImagePreview(null);
    setError("");
  };

  const cancelAction = () => {
    resetForm();
    onActionChange("view");
  };

  // Render last modified info for each item

  const renderLastModifiedInfo = (item) => {
    // Only show last modified info to admin and super_admin
    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.role !== "super_admin")
    ) {
      return null;
    }

    if (!item.last_modified_by_name && !item.last_modified_at) {
      return null;
    }

    return (
      <div className="last-modified-info admin-only">
        <small>
          Last modified by: <strong>{item.last_modified_by_name}</strong> •{" "}
          {item.last_modified_at
            ? new Date(item.last_modified_at).toLocaleDateString()
            : "Unknown date"}
        </small>
      </div>
    );
  };

  // Render action buttons for each item
  const renderItemActions = (item) => {
    const canEditItem = canUserPerformAction("edit");
    const canDeleteItem = canUserPerformAction("delete");
    const canPublishItem = canUserPerformAction("publish");

    // If user only has view permission, show nothing or "View Only" badge
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
            className={`btn-status ${
              item.is_active ? "btn-deactivate" : "btn-activate"
            }`}
            onClick={() => toggleStatus(item.id, item.is_active)}
          >
            {item.is_active ? "Deactivate" : "Activate"}
          </button>
        )}

        {canEditItem && (
          <button className="btn-edit" onClick={() => handleEdit(item)}>
            Edit
          </button>
        )}

        {canDeleteItem && (
          <button className="btn-delete" onClick={() => handleDelete(item.id)}>
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
      <div className="our-work-manager">
        <div className="our-work-header">
          <button onClick={onClose} className="close-btn">
            ← Back to Interventions
          </button>
          <h2>View {categoryLabels[category]}</h2>
          {canUserPerformAction("create") && (
            <button
              onClick={() => onActionChange("add")}
              className="btn-primary"
            >
              + Add New Item
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="our-work-list">
          <h3>Existing Items ({items.length})</h3>
          {items.length === 0 ? (
            <div className="no-items">
              <p>No items found for {categoryLabels[category]}</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => {
                const imageUrl = getImageUrl(item.image_url);
                return (
                  <div key={item.id} className="item-card">
                    {imageUrl ? (
                      <div className="item-image">
                        <img
                          src={imageUrl}
                          alt={item.title || "No title"}
                          onError={(e) => {
                            logger.error("Image failed to load:", imageUrl);
                            e.target.style.display = "none";
                            const placeholder = document.createElement("div");
                            placeholder.className = "image-placeholder";
                            placeholder.innerHTML = "📷 Image not available";
                            e.target.parentNode.appendChild(placeholder);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="image-placeholder">📷 No image</div>
                    )}
                    <div className="item-content">
                      <h4>{item.title || "Untitled"}</h4>
                      <p className="item-description">
                        {item.description || "No description"}
                      </p>
                      <div className="item-meta">
                        <span
                          className={`status ${
                            item.is_active ? "active" : "inactive"
                          }`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="order">
                          Order: {item.display_order || 0}
                        </span>
                      </div>

                      {/* Add last modified info */}
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

  // Render Add/Update Mode
  const renderFormMode = () => {
    return (
      <div className="our-work-manager">
        <div className="our-work-header">
          <button onClick={cancelAction} className="close-btn">
            ← Back to View {categoryLabels[category]}
          </button>
          <h2>
            {editingItem ? "Edit" : "Add New"} {categoryLabels[category]}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="our-work-form">
          {error && <div className="error-message">{error}</div>}

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
            <label>Content:</label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows="6"
              placeholder="Detailed content (HTML supported)"
            />
          </div>

          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Or Upload Image:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Video URL:</label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              placeholder="https://youtube.com/embed/video-id"
            />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.is_active ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "true",
                })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingItem ? "Update" : "Create"} Item
            </button>
            <button type="button" onClick={cancelAction}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render based on current action
  if (action === "view") {
    return renderViewMode();
  } else if (action === "add" || action === "update") {
    return renderFormMode();
  }

  return null;
};

export default OurWorkManagement;
