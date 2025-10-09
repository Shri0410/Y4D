// src/components/BannerManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const BannerManagement = ({ action, onClose, onActionChange }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [filterPage, setFilterPage] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [availablePages, setAvailablePages] = useState([]);
  
  const bannerFormInitialState = {
    media_type: "image",
    media: null,
    page: "home",
    section: "hero",
    category: "main",
    is_active: true,
  };

  const [bannerForm, setBannerForm] = useState(bannerFormInitialState);

  const API_BASE = "http://localhost:5000/api";

  // Updated predefined pages with your specific options
  const predefinedPages = [
    "home", 
    "about", 
    "our-team", 
    "legal-status", 
    "our-work", 
    "media-corner",
    "donate"
  ];

  // Main sections for all pages
  const mainSections = [
    "hero", 
    "header", 
    "footer"
  ];

  // Our Work specific sections
  const ourWorkSections = [
    "quality-education",
    "livelihood", 
    "healthcare", 
    "environmental-sustainability",
    "idp"
  ];

  // Media Corner specific sections
  const mediaCornerSections = [
    "newsletters",
    "stories",
    "blogs",
    "events",
    "documentaries"
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

  useEffect(() => {
    if (action === "view") {
      fetchBanners();
      fetchAvailablePages();
    }
  }, [action, filterPage, filterSection]);

  const fetchAvailablePages = async () => {
    try {
      const response = await axios.get(`${API_BASE}/banners/pages/list`);
      setAvailablePages(response.data);
    } catch (error) {
      console.error("Error fetching pages list:", error);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/banners`;
      const params = new URLSearchParams();
      
      if (filterPage !== "all") params.append('page', filterPage);
      if (filterSection !== "all") params.append('section', filterSection);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log("📋 Fetching banners with filters:", { filterPage, filterSection });
      const response = await axios.get(url);
      console.log("✅ Banners fetched:", response.data);
      setBanners(response.data);
    } catch (error) {
      console.error("❌ Error fetching banners:", error);
      alert(`Error fetching banners: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("📁 Media selected:", file.name, file.size, file.type);
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
    setLoading(true);

    try {
      console.log("📤 Submitting banner form...");

      const formData = new FormData();
      formData.append("media_type", bannerForm.media_type);
      formData.append("page", bannerForm.page);
      formData.append("section", bannerForm.section);
      formData.append("category", bannerForm.category);
      formData.append("is_active", bannerForm.is_active);

      if (bannerForm.media) {
        formData.append("media", bannerForm.media);
      }

      const endpoint = editingId
        ? `${API_BASE}/banners/${editingId}`
        : `${API_BASE}/banners`;

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = editingId
        ? await axios.put(endpoint, formData, config)
        : await axios.post(endpoint, formData, config);

      console.log("✅ Banner saved successfully:", response.data);
      
      alert(`Banner ${editingId ? "updated" : "created"} successfully!`);
      
      // Reset form
      setBannerForm(bannerFormInitialState);
      setEditingId(null);
      setMediaPreview(null);
      
      // Refresh the list
      fetchBanners();
      fetchAvailablePages();
      onActionChange("view");
    } catch (error) {
      console.error("❌ Error saving banner:", error);
      alert(`Error saving banner: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleEdit = (banner) => {
    console.log("✏️ Editing banner:", banner);
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
      setMediaPreview(`${API_BASE}/uploads/banners/${banner.media}`);
    }
    onActionChange("update");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/banners/${id}`);
      alert("Banner deleted successfully!");
      fetchBanners();
      fetchAvailablePages();
    } catch (error) {
      console.error("❌ Error deleting banner:", error);
      alert(`Error deleting banner: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const handleStatusToggle = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} this banner?`)) return;

    setLoading(true);
    try {
      const banner = banners.find(b => b.id === id);
      if (!banner) {
        throw new Error("Banner not found");
      }

      const formData = new FormData();
      formData.append("media_type", banner.media_type);
      formData.append("page", banner.page);
      formData.append("section", banner.section);
      formData.append("category", banner.category);
      formData.append("is_active", newStatus);

      await axios.put(`${API_BASE}/banners/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(`Banner ${newStatus ? "activated" : "deactivated"} successfully!`);
      fetchBanners();
    } catch (error) {
      console.error("❌ Error toggling banner status:", error);
      alert(`Error updating banner status: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBannerForm(bannerFormInitialState);
    setMediaPreview(null);
    onActionChange("view");
  };

  // Helper function to format page/section names for display
  const formatDisplayName = (name) => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderForm = () => {
    const availableSections = getAvailableSections();

    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <button className="btn-back" onClick={cancelEdit}>
              ← Back to Banners
            </button>
            <h3>{editingId ? "Edit Banner" : "Add New Banner"}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-form">
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
                    section: getDefaultSection(e.target.value)
                  })
                }
                required
              >
                <option value="">Select Page</option>
                {predefinedPages.map(page => (
                  <option key={page} value={page}>
                    {formatDisplayName(page)}
                  </option>
                ))}
                <option value="custom">Custom Page</option>
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
                  {mainSections.map(section => (
                    <option key={section} value={section}>
                      {formatDisplayName(section)}
                    </option>
                  ))}
                </optgroup>
                
                {/* Our Work specific sections - only show when Our Work is selected */}
                {bannerForm.page === "our-work" && (
                  <optgroup label="Our Work Programs">
                    {ourWorkSections.map(section => (
                      <option key={section} value={section}>
                        {formatDisplayName(section)}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Media Corner specific sections - only show when Media Corner is selected */}
                {bannerForm.page === "media-corner" && (
                  <optgroup label="Media Corner Sections">
                    {mediaCornerSections.map(section => (
                      <option key={section} value={section}>
                        {formatDisplayName(section)}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                <option value="custom">Custom Section</option>
              </select>
              
              {/* Help text for Our Work sections */}
              {bannerForm.page === "our-work" && (
                <small className="section-help">
                  Select "hero" for main Our Work page banner, or choose specific program for sub-page banners
                </small>
              )}
              
              {/* Help text for Media Corner sections */}
              {bannerForm.page === "media-corner" && (
                <small className="section-help">
                  Select "hero" for main Media Corner page banner, or choose specific media section for sub-page banners
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
            <label>{bannerForm.media_type === 'image' ? 'Image' : 'Video'}: *</label>
            <input
              type="file"
              accept={bannerForm.media_type === 'image' ? 'image/*' : 'video/*'}
              onChange={handleMediaChange}
              required={!editingId}
            />
            <small>
              {bannerForm.media_type === 'image' 
                ? 'Supported formats: JPG, PNG, GIF. Max size: 10MB'
                : 'Supported formats: MP4, WebM. Max size: 50MB'
              }
            </small>
            {mediaPreview && (
              <div className="media-preview">
                {bannerForm.media_type === 'image' ? (
                  <img src={mediaPreview} alt="Preview" />
                ) : (
                  <video controls src={mediaPreview} style={{ maxWidth: '100%', maxHeight: '200px' }} />
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
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update" : "Create"} Banner
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
    // Get available sections for filter based on selected page
    const getFilterSections = () => {
      if (filterPage === "our-work") {
        return [...mainSections, ...ourWorkSections];
      } else if (filterPage === "media-corner") {
        return [...mainSections, ...mediaCornerSections];
      } else {
        return mainSections;
      }
    };

    const filterSections = getFilterSections();

    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <h3>Banner Management</h3>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingId(null);
                setBannerForm(bannerFormInitialState);
                setMediaPreview(null);
                onActionChange("add");
              }}
              disabled={loading}
            >
              + Add Banner
            </button>
          </div>

          {/* Filters */}
          <div className="filter-controls">
            <div className="filter-group">
              <label>Filter by Page:</label>
              <select
                value={filterPage}
                onChange={(e) => {
                  setFilterPage(e.target.value);
                  // Reset section filter when page changes
                  setFilterSection("all");
                }}
                className="filter-select"
              >
                <option value="all">All Pages</option>
                {availablePages.map(page => (
                  <option key={page} value={page}>
                    {formatDisplayName(page)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Section:</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Sections</option>
                {filterSections.map(section => (
                  <option key={section} value={section}>
                    {formatDisplayName(section)}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn-secondary"
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
          <div className="no-data-message">
            <p>No banners found</p>
            <p><small>Click "Add Banner" to create your first banner.</small></p>
          </div>
        ) : (
          <div className="items-grid">
            {banners.map((banner) => {
              const isActive = banner.is_active === true || 
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
                      {banner.media_type === 'image' ? (
                        <img
                          src={`${API_BASE}/uploads/banners/${banner.media}`}
                          alt={`Banner for ${banner.page} - ${banner.section}`}
                          style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <video 
                          src={`${API_BASE}/uploads/banners/${banner.media}`}
                          style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover' }}
                          muted
                        />
                      )}
                    </div>
                  )}

                  <div className="item-content">
                    <div className="banner-header">
                      <h4>{formatDisplayName(banner.page)} - {formatDisplayName(banner.section)}</h4>
                      <div className="banner-meta">
                        <span className="page-badge">{formatDisplayName(banner.page)}</span>
                        <span className="section-badge">{formatDisplayName(banner.section)}</span>
                        <span
                          className={`status-badge ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </div>
                    
                    <p><strong>Type:</strong> {banner.media_type}</p>
                    
                    <p><strong>Category:</strong> {banner.category || 'main'}</p>
                    
                    <p><strong>Order:</strong> {banner.display_order || 0}</p>

                    <div className="item-actions">
                      <button
                        className={`status-toggle-btn ${
                          isActive ? "btn-inactive" : "btn-active"
                        }`}
                        onClick={() => handleStatusToggle(banner.id, !isActive)}
                        disabled={loading}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(banner)}
                        disabled={loading}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(banner.id)}
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
    <div className="banner-management">
      {action === "view" && renderListView()}
      {(action === "add" || action === "update") && renderForm()}
    </div>
  );
};

export default BannerManagement;