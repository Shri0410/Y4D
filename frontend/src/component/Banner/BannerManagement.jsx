// Updated BannerManagement.jsx file with toast integration
import React, { useState, useEffect } from "react";
import { API_BASE, UPLOADS_BASE } from "../config/api";
import { bannerService } from "../api/services/banners.service";
import { useLoadingState } from "../hooks/useLoadingState";
import "./BannerManagement.css";
import logger from "../utils/logger";
import toast from "../utils/toast";
import {
  canView,
  canCreate,
  canEdit,
  canDelete,
  canPublish,
} from "../utils/permissions";

const BannerManagement = ({
  action,
  onClose,
  onActionChange,
  currentUser,
  onShowConfirmation,
  onHideConfirmation,
}) => {
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [filterPage, setFilterPage] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [availablePages, setAvailablePages] = useState([]);
  const [error, setError] = useState("");

  const bannerFormInitialState = {
    media_type: "image",
    media: null,
    page: "home",
    section: "hero",
    category: "main",
    is_active: true,
  };

  const [bannerForm, setBannerForm] = useState(bannerFormInitialState);

  // Use useLoadingState hook for loading management
  const { loading, execute } = useLoadingState();

  // Permission check functions
  const canUserPerformAction = (actionType) => {
    if (!currentUser) return false;
    if (currentUser.role === "super_admin") return true;

    switch (actionType) {
      case "view":
        return canView(currentUser, "banners");
      case "create":
        return canCreate(currentUser, "banners");
      case "edit":
        return canEdit(currentUser, "banners");
      case "delete":
        return canDelete(currentUser, "banners");
      case "publish":
        return canPublish(currentUser, "banners");
      default:
        return false;
    }
  };

  // Updated predefined pages with your specific options
  const predefinedPages = [
    "home",
    "about",
    "our-team",
    "legal-status",
    "our-work",
    "media-corner",
    "donate",
  ];

  // Main sections for all pages
  const mainSections = ["hero", "header", "footer"];

  // Our Work specific sections
  const ourWorkSections = [
    "quality-education",
    "livelihood",
    "healthcare",
    "environmental-sustainability",
    "idp",
  ];

  // Media Corner specific sections
  const mediaCornerSections = [
    "newsletters",
    "stories",
    "blogs",
    "events",
    "documentaries",
  ];

  // Get available sections based on selected page
  const getAvailableSections = () => {
    if (bannerForm.page === "our-work") {
      return [...mainSections, ...ourWorkSections];
    } else if (bannerForm.page === "media-corner") {
      return [...mainSections, ...mediaCornerSections];
    } else {
      return mainSections;
    }
  };

  // Get filter sections based on selected page
  const getFilterSections = () => {
    if (filterPage === "our-work") {
      return [...mainSections, ...ourWorkSections];
    } else if (filterPage === "media-corner") {
      return [...mainSections, ...mediaCornerSections];
    } else {
      return mainSections;
    }
  };

  // Get default section when page changes
  const getDefaultSection = (page) => {
    if (page === "our-work") {
      return "quality-education";
    } else if (page === "media-corner") {
      return "newsletters";
    } else {
      return "hero";
    }
  };

  // Function to render last modified info for banners
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

    // If no modification info exists, don't show anything
    if (!modifiedByName && !modifiedAt) {
      return null;
    }

    // Format the date properly
    const formatDate = (dateString) => {
      if (!dateString) return "Unknown date";
      try {
        return new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return "Invalid date";
      }
    };

    return (
      <div className="last-modified-info admin-only">
        <small>
          Last modified by: <strong>{modifiedByName || "Unknown user"}</strong>
          {modifiedAt && <> • {formatDate(modifiedAt)}</>}
        </small>
      </div>
    );
  };

  useEffect(() => {
    if (action === "view") {
      fetchBanners();
      fetchAvailablePages();
    }
  }, [action, filterPage, filterSection]);

  const fetchAvailablePages = async () => {
    try {
      const pages = await bannerService.getPagesList();
      setAvailablePages(pages);
    } catch (error) {
      logger.error("Error fetching pages list:", error);
    }
  };

  const fetchBanners = async () => {
    await execute(async () => {
      try {
        const filters = {};
        if (filterPage !== "all") filters.page = filterPage;
        if (filterSection !== "all") filters.section = filterSection;

        logger.log("📋 Fetching banners with filters:", {
          filterPage,
          filterSection,
        });

        const bannersData = await bannerService.getAllBanners(filters);
        logger.log("✅ Banners fetched:", bannersData);

        // Enhanced data handling for last modified info
        const bannersWithModifier = bannersData.map((banner) => ({
          ...banner,
          last_modified_by_name:
            banner.last_modified_by_name || banner.modified_by_name || "Unknown",
          last_modified_at: banner.last_modified_at || banner.modified_at,
        }));

        setBanners(bannersWithModifier);
      } catch (error) {
        logger.error("❌ Error fetching banners:", error);
        setError(
          `Error fetching banners: ${
            error.response?.data?.error || error.message
          }`
        );
        toast.error(`Error fetching banners: ${error.message}`);
      }
    });
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      logger.log("📁 Media selected:", file.name, file.size, file.type);
      setBannerForm((prev) => ({ ...prev, media: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canUserPerformAction(editingId ? "edit" : "create")) {
      toast.warning("You don't have permission to perform this action");
      return;
    }

    setError("");

    await execute(async () => {
      try {
        logger.log("📤 Submitting banner form...");

        const formDataToSend = new FormData();
        formDataToSend.append("media_type", bannerForm.media_type);
        formDataToSend.append("page", bannerForm.page);
        formDataToSend.append("section", bannerForm.section);
        formDataToSend.append("category", bannerForm.category);
        formDataToSend.append("is_active", bannerForm.is_active);

        // ADDED: Send user information for tracking
        if (currentUser) {
          formDataToSend.append("modified_by_id", currentUser.id);
          formDataToSend.append(
            "modified_by_name",
            currentUser.username || currentUser.name
          );
        }

        if (bannerForm.media) {
          formDataToSend.append("media", bannerForm.media);
        }

        if (editingId) {
          await bannerService.updateBanner(editingId, formDataToSend);
        } else {
          await bannerService.createBanner(formDataToSend);
        }

        logger.log("✅ Banner saved successfully");

        toast.success(
          `Banner ${editingId ? "updated" : "created"} successfully!`
        );

        // Reset form
        setBannerForm(bannerFormInitialState);
        setEditingId(null);
        setMediaPreview(null);

        // Refresh the list
        fetchBanners();
        fetchAvailablePages();
        onActionChange("view");
      } catch (error) {
        logger.error("❌ Error saving banner:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to save banner. Please check console for details.";
        setError(errorMessage);
        toast.error(`Error saving banner: ${errorMessage}`);
        throw error;
      }
    });
  };

  const handleEdit = (banner) => {
    if (!canUserPerformAction("edit")) {
      toast.warning("You don't have permission to edit banners");
      return;
    }

    logger.log("✏ Editing banner:", banner);
    setEditingId(banner.id);
    setBannerForm({
      media_type: banner.media_type || "image",
      media: null,
      page: banner.page || "home",
      section: banner.section || "hero",
      category: banner.category || "main",
      is_active: banner.is_active,
    });
    if (banner.media) {
      setMediaPreview(`${UPLOADS_BASE}/banners/${banner.media}`);
    }
    onActionChange("update");
  };

  const handleDelete = async (id) => {
    if (!canUserPerformAction("delete")) {
      toast.warning("You don't have permission to delete banners");
      return;
    }

    await execute(async () => {
      try {
        await bannerService.deleteBanner(id);
        toast.success("Banner deleted successfully!");
        fetchBanners();
        fetchAvailablePages();
      } catch (error) {
        logger.error("❌ Error deleting banner:", error);
        toast.error(`Error deleting banner: ${error.message}`);
        throw error;
      }
    });
  };

  const handleStatusToggle = async (id, newStatus) => {
    if (!canUserPerformAction("publish")) {
      toast.warning("You don't have permission to change banner status");
      return;
    }

    await execute(async () => {
      try {
        const banner = banners.find((b) => b.id === id);
        if (!banner) {
          throw new Error("Banner not found");
        }

        const formData = new FormData();
        formData.append("media_type", banner.media_type);
        formData.append("page", banner.page);
        formData.append("section", banner.section);
        formData.append("category", banner.category);
        formData.append("is_active", newStatus);

        // ADDED: Send user information for tracking
        if (currentUser) {
          formData.append("modified_by_id", currentUser.id);
          formData.append(
            "modified_by_name",
            currentUser.username || currentUser.name
          );
        }

        await bannerService.updateBanner(id, formData);

        toast.success(
          `Banner ${newStatus ? "activated" : "deactivated"} successfully!`
        );
        fetchBanners();
      } catch (error) {
        logger.error("❌ Error toggling banner status:", error);
        toast.error(`Error updating banner status: ${error.message}`);
        throw error;
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBannerForm(bannerFormInitialState);
    setMediaPreview(null);
    onActionChange("view");
  };

  // Helper function to format page/section names for display
  const formatDisplayName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Render action buttons for each banner
  const renderBannerActions = (banner) => {
    const canEditItem = canUserPerformAction("edit");
    const canDeleteItem = canUserPerformAction("delete");
    const canPublishItem = canUserPerformAction("publish");

    // If user only has view permission, show "View Only" badge
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
              banner.is_active ? "btn-inactive" : "btn-active"
            }`}
            onClick={() => {
              onShowConfirmation(
                banner.is_active ? "Deactivate Banner" : "Activate Banner",
                `Are you sure you want to ${
                  banner.is_active ? "deactivate" : "activate"
                } "${formatDisplayName(banner.page)} - ${formatDisplayName(
                  banner.section
                )}" banner?`,
                banner.is_active ? "deactivate" : "activate",
                banner.id,
                "banners",
                `${formatDisplayName(banner.page)} - ${formatDisplayName(
                  banner.section
                )}`,
                () => handleStatusToggle(banner.id, !banner.is_active)
              );
            }}
            disabled={loading}
          >
            {banner.is_active ? "Deactivate" : "Activate"}
          </button>
        )}

        {canEditItem && (
          <button
            className="btn-edit"
            onClick={() => handleEdit(banner)}
            disabled={loading}
          >
            Edit
          </button>
        )}

        {canDeleteItem && (
          <button
            className="btn-delete"
            onClick={() => {
              onShowConfirmation(
                "Delete Banner",
                `Are you sure you want to delete "${formatDisplayName(
                  banner.page
                )} - ${formatDisplayName(
                  banner.section
                )}" banner? This action cannot be undone.`,
                "delete",
                banner.id,
                "banners",
                `${formatDisplayName(banner.page)} - ${formatDisplayName(
                  banner.section
                )}`,
                () => handleDelete(banner.id)
              );
            }}
            disabled={loading}
          >
            Delete
          </button>
        )}
      </div>
    );
  };

  const renderForm = () => {
    const availableSections = getAvailableSections();

    return (
      <div className="content-list">
        {/* UPDATED HEADER FOR FORM MODE */}
        <div className="content-header">
          <div className="header-row">
            <div className="header-left">
              <h3>{editingId ? "Edit Banner" : "Add New Banner"}</h3>
            </div>
            <div className="header-right">
              <button className="btn-back" onClick={cancelEdit}>
                ← Back to Banners
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Page: *</label>
              <select
                value={bannerForm.page}
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    page: e.target.value,
                    // Reset section to appropriate default when page changes
                    section: getDefaultSection(e.target.value),
                  })
                }
                required
              >
                <option value="">Select Page</option>
                {predefinedPages.map((page) => (
                  <option key={page} value={page}>
                    {formatDisplayName(page)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Section: *</label>
              <select
                value={bannerForm.section}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, section: e.target.value })
                }
                required
              >
                <option value="">Select Section</option>

                {/* Main sections for all pages */}
                <optgroup label="Main Sections">
                  {mainSections.map((section) => (
                    <option key={section} value={section}>
                      {formatDisplayName(section)}
                    </option>
                  ))}
                </optgroup>

                {/* Our Work specific sections - only show when Our Work is selected */}
                {bannerForm.page === "our-work" && (
                  <optgroup label="Our Work Programs">
                    {ourWorkSections.map((section) => (
                      <option key={section} value={section}>
                        {formatDisplayName(section)}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Media Corner specific sections - only show when Media Corner is selected */}
                {bannerForm.page === "media-corner" && (
                  <optgroup label="Media Corner Sections">
                    {mediaCornerSections.map((section) => (
                      <option key={section} value={section}>
                        {formatDisplayName(section)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Help text for Our Work sections */}
              {bannerForm.page === "our-work" && (
                <small className="section-help">
                  Select "hero" for main Our Work page banner, or choose
                  specific program for sub-page banners
                </small>
              )}

              {/* Help text for Media Corner sections */}
              {bannerForm.page === "media-corner" && (
                <small className="section-help">
                  Select "hero" for main Media Corner page banner, or choose
                  specific media section for sub-page banners
                </small>
              )}
            </div>
          </div>

          {bannerForm.page === "custom" && (
            <div className="form-group">
              <label>Custom Page Name:</label>
              <input
                type="text"
                value={bannerForm.page}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, page: e.target.value })
                }
                placeholder="Enter custom page name"
              />
            </div>
          )}

          {bannerForm.section === "custom" && (
            <div className="form-group">
              <label>Custom Section Name:</label>
              <input
                type="text"
                value={bannerForm.section}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, section: e.target.value })
                }
                placeholder="Enter custom section name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Media Type: *</label>
            <select
              value={bannerForm.media_type}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, media_type: e.target.value })
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {bannerForm.media_type === "image" ? "Image" : "Video"}: *
            </label>
            <input
              type="file"
              accept={bannerForm.media_type === "image" ? "image/*" : "video/*"}
              onChange={handleMediaChange}
              required={!editingId}
            />
            <small>
              {bannerForm.media_type === "image"
                ? "Supported formats: JPG, PNG, GIF. Max size: 10MB"
                : "Supported formats: MP4, WebM. Max size: 50MB"}
            </small>
            {mediaPreview && (
              <div className="media-preview">
                {bannerForm.media_type === "image" ? (
                  <img src={mediaPreview} alt="Preview" />
                ) : (
                  <video
                    controls
                    src={mediaPreview}
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                )}
                <p>Media Preview</p>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status:</label>
              <select
                value={bannerForm.is_active}
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    is_active: e.target.value === "true",
                  })
                }
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? "Processing..."
                : editingId
                ? "Update Banner"
                : "Create Banner"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
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

  const renderListView = () => {
    const filterSections = getFilterSections();

    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <div className="header-left">
              <h2>Banner Management</h2>
            </div>
            <div className="header-right">
              {canUserPerformAction("create") && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setBannerForm(bannerFormInitialState);
                    setMediaPreview(null);
                    onActionChange("add");
                  }}
                  className="btn-primary"
                  disabled={loading}
                >
                  + Add New Banner
                </button>
              )}

              {/* Back button moved to right side */}
              <button onClick={onClose} className="btn-back-right">
                ← Back to Banner Management
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Filters */}
          <div className="filter-controls">
            <div className="filter-group">
              <label>Filter by Page</label>
              <select
                value={filterPage}
                onChange={(e) => setFilterPage(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Pages</option>
                {predefinedPages.map((page) => (
                  <option key={page} value={page}>
                    {formatDisplayName(page)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Sections</option>
                {filterSections.map((section) => (
                  <option key={section} value={section}>
                    {formatDisplayName(section)}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="clear-filters-btn"
              onClick={() => {
                setFilterPage("all");
                setFilterSection("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="no-items">
            <p>No banners found</p>
            <p>
              <small>Click "Add Banner" to create your first banner.</small>
            </p>
          </div>
        ) : (
          <div className="items-grid">
            {banners.map((banner) => {
              const isActive =
                banner.is_active === true ||
                banner.is_active === 1 ||
                banner.is_active === "true";

              return (
                <div
                  key={banner.id}
                  className="item-card"
                  style={{
                    borderLeft: `4px solid ${isActive ? "#4CAF50" : "#ff9800"}`,
                  }}
                >
                  {banner.media && (
                    <div className="item-media">
                      {banner.media_type === "image" ? (
                        <img
                          src={`${UPLOADS_BASE}/banners/${banner.media}`}
                          alt={`Banner for ${banner.page} - ${banner.section}`}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <video
                          src={`${UPLOADS_BASE}/banners/${banner.media}`}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                          muted
                        />
                      )}
                    </div>
                  )}

                  <div className="item-content">
                    <div className="banner-header">
                      <h4>
                        {formatDisplayName(banner.page)} -{" "}
                        {formatDisplayName(banner.section)}
                      </h4>
                      <div className="banner-meta">
                        <span className="page-badge">
                          {formatDisplayName(banner.page)}
                        </span>
                        <span className="section-badge">
                          {formatDisplayName(banner.section)}
                        </span>
                        <span
                          className={`status-badge ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </div>

                    <p>
                      <strong>Type:</strong> {banner.media_type}
                    </p>

                    <p>
                      <strong>Category:</strong> {banner.category || "main"}
                    </p>

                    <p>
                      <strong>Order:</strong> {banner.display_order || 0}
                    </p>

                    {/* ADDED: Last modified info display */}
                    {renderLastModifiedInfo(banner)}

                    {renderBannerActions(banner)}
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
    <div className="banner-management">
      {action === "view" && renderListView()}
      {(action === "add" || action === "update") && renderForm()}
    </div>
  );
};

export default BannerManagement;
