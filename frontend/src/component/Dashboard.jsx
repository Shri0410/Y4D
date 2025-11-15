import React, { useState, useEffect } from "react";
import axios from "axios";
import UserManagement from "./UserManagement";
import RegistrationRequests from "./RegistrationRequests";
import MediaManager from "./MediaManager";
import OurWorkManagement from "./OurWorkManagement";
import ImpactDataEditor from "./ImpactDataEditor";
import AccreditationManagement from "./AccreditationManagement";
import BannerManagement from "./BannerManagement";
import "./Dashboard.css";

import {
  canView,
  canCreate,
  canEdit,
  canDelete,
  canPublish,
  fetchUserPermissions,
  clearPermissionsCache,
} from "../utils/permissions";

const Dashboard = ({ currentUser: propCurrentUser }) => {
  const [activeTab, setActiveTab] = useState("ourWork");
  const [reports, setReports] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [boardTrustees, setBoardTrustees] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);
  const [mediaAction, setMediaAction] = useState("view");
  const [editingMediaId, setEditingMediaId] = useState(null);

  const [mediaForm, setMediaForm] = useState({
    title: "",
    description: "",
    content: "",
    image: null,
    pdf: null,
    video_url: "",
    video_file: null,
    is_active: true,
  });
  const [currentMediaType, setCurrentMediaType] = useState(null);
  const [currentOurWorkCategory, setCurrentOurWorkCategory] = useState(null);
  const [currentTeamType, setCurrentTeamType] = useState(null);
  const [teamAction, setTeamAction] = useState("view");
  const [careerAction, setCareerAction] = useState("current");
  const [legalReportAction, setLegalReportAction] = useState("view");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mediaSubDropdown, setMediaSubDropdown] = useState(null);
  const [interventionsSubDropdown, setInterventionsSubDropdown] =
    useState(null);
  const [interventionsAction, setInterventionsAction] = useState("view");
  const [currentAccreditationType, setCurrentAccreditationType] =
    useState(null);
  const [accreditationAction, setAccreditationAction] = useState("view");
  const [currentBannerType, setCurrentBannerType] = useState(null);
  const [bannerAction, setBannerAction] = useState("view");

  // Form states
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    content: "",
    image: null,
  });
  const [mentorForm, setMentorForm] = useState({
    name: "",
    position: "",
    bio: "",
    image: null,
    social_links: "{}",
  });
  const [managementForm, setManagementForm] = useState({
    name: "",
    position: "",
    bio: "",
    image: null,
    social_links: "{}",
  });
  const [trusteeForm, setTrusteeForm] = useState({
    name: "",
    position: "",
    bio: "",
    image: null,
    social_links: "{}",
  });
  const [careerForm, setCareerForm] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    type: "full-time",
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);

  const API_BASE = "https://y4dorg-backend.onrender.com/api";

  // Permission check functions
  const canUserPerformAction = (
    section,
    subSection = null,
    action = "view"
  ) => {
    if (!currentUser) return false;
    if (currentUser.role === "super_admin") return true;

    switch (action) {
      case "view":
        return canView(currentUser, section, subSection);
      case "create":
        return canCreate(currentUser, section, subSection);
      case "edit":
        return canEdit(currentUser, section, subSection);
      case "delete":
        return canDelete(currentUser, section, subSection);
      case "publish":
        return canPublish(currentUser, section, subSection);
      default:
        return false;
    }
  };

  // Update URL path function
  const updateUrlPath = (section, action = null, subSection = null) => {
    let path = `/admin/${section}`;
    if (subSection) {
      path += `/${subSection}`;
    }
    if (action && action !== "view") {
      path += `/${action}`;
    }
    window.history.pushState(null, "", path);
  };

  // Clear sub-sections when switching tabs
  useEffect(() => {
    setCurrentMediaType(null);
    setCurrentOurWorkCategory(null);
    setCurrentTeamType(null);
    setCurrentAccreditationType(null);
    setCurrentBannerType(null);
    setTeamAction("view");
    setCareerAction("current");
    setLegalReportAction("view");
    setBannerAction("view");
    setMediaSubDropdown(null);
    setInterventionsSubDropdown(null);
    setInterventionsAction("view");
    setAccreditationAction("view");
  }, [activeTab]);

  useEffect(() => {
    console.log("Careers data updated:", careers);
  }, [careers]);

  // Fetch user permissions when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserPermissions(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dashboard-sidebar")) {
        setOpenDropdown(null);
      }
      if (mediaSubDropdown && !event.target.closest(".media-dropdown-item")) {
        setMediaSubDropdown(null);
      }
      if (
        interventionsSubDropdown &&
        !event.target.closest(".interventions-dropdown-item")
      ) {
        setInterventionsSubDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, mediaSubDropdown, interventionsSubDropdown]);

  useEffect(() => {
    if (!currentUser) {
      const userData = localStorage.getItem("user");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }

    if (activeTab === "our-team" && teamAction === "view") {
      fetchAllTeamData();
    } else if (activeTab === "careers") {
      fetchData("careers");
    } else if (activeTab === "reports") {
      fetchData("reports");
    } else if (
      activeTab !== "media" &&
      !currentMediaType &&
      activeTab !== "ourWork" &&
      !currentOurWorkCategory &&
      activeTab !== "impact" &&
      activeTab !== "users" &&
      activeTab !== "registrations" &&
      activeTab !== "banners" &&
      activeTab !== "add-user" &&
      activeTab !== "permissions"
    ) {
      fetchData(activeTab);
    }
  }, [
    activeTab,
    currentUser,
    currentMediaType,
    currentOurWorkCategory,
    teamAction,
  ]);

  const renderOurWorkManagement = () => {
    if (currentOurWorkCategory) {
      return (
        <OurWorkManagement
          category={currentOurWorkCategory}
          action={interventionsAction}
          onClose={() => {
            setCurrentOurWorkCategory(null);
            setInterventionsAction("view");
            updateUrlPath("interventions");
          }}
          onActionChange={(action) => setInterventionsAction(action)}
          currentUser={currentUser}
        />
      );
    }
    return null;
  };

  const handleAccreditationAction = (action) => {
    setCurrentAccreditationType("accreditations");
    setAccreditationAction(action);
    setOpenDropdown(null);
    updateUrlPath("accreditations", action);
  };

  const handleBannerAction = (action) => {
    setCurrentBannerType("banners");
    setBannerAction(action);
    setOpenDropdown(null);
    updateUrlPath("banners", action);
  };

  // Modified render functions to check permissions
  const renderActionButtons = (item, section, subSection = null) => {
    const canEditItem = canUserPerformAction(section, subSection, "edit");
    const canDeleteItem = canUserPerformAction(section, subSection, "delete");
    const canPublishItem = canUserPerformAction(section, subSection, "publish");

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
            className={`status-toggle-btn ${
              item.is_published ? "btn-inactive" : "btn-active"
            }`}
            onClick={() => handleMediaStatusToggle(item.id, !item.is_published)}
          >
            {item.is_published ? "Unpublish" : "Publish"}
          </button>
        )}

        {canEditItem && (
          <button
            className="btn-edit"
            onClick={() => {
              handleMediaEdit(item);
              updateUrlPath("media", "update", currentMediaType);
            }}
          >
            Edit
          </button>
        )}

        {canDeleteItem && (
          <button
            className="btn-delete"
            onClick={() => handleMediaDelete(item.id)}
          >
            Delete
          </button>
        )}
      </div>
    );
  };

  // Update the add button rendering
  const renderAddButton = (section, subSection = null) => {
    const canCreateItem = canUserPerformAction(section, subSection, "create");

    if (!canCreateItem) return null;

    return (
      <button
        className="btn-primary"
        onClick={() => {
          // Your existing add button logic
        }}
      >
        + Add {section.slice(0, -1)}
      </button>
    );
  };

  const renderAccreditationContent = () => {
    return (
      <div className="accreditation-content-section">
        <AccreditationManagement
          action={accreditationAction}
          onClose={() => {
            setCurrentAccreditationType(null);
            setAccreditationAction("view");
            updateUrlPath("accreditations");
          }}
          onActionChange={(action) => setAccreditationAction(action)}
          currentUser={currentUser}
        />
      </div>
    );
  };

  const renderBannerContent = () => {
    return (
      <div className="banner-content-section">
        <BannerManagement
          action={bannerAction}
          onClose={() => {
            setCurrentBannerType(null);
            setBannerAction("view");
            updateUrlPath("banners");
          }}
          onActionChange={(action) => setBannerAction(action)}
          currentUser={currentUser}
        />
      </div>
    );
  };

  // ADDED: Function to render last modified info for reports (admin/super_admin only)
  const renderReportLastModifiedInfo = (item) => {
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

  // ADDED: Generic function to render last modified info for other sections
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

  // ADDED: Function to render last modified info for banners
  const renderBannerLastModifiedInfo = (item) => {
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

  // ADDED: Function to render last modified info for accreditations
  const renderAccreditationLastModifiedInfo = (item) => {
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

  const fetchAllTeamData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, managementRes, trusteesRes] = await Promise.all([
        axios.get(`${API_BASE}/mentors`),
        axios.get(`${API_BASE}/management`),
        axios.get(`${API_BASE}/board-trustees`),
      ]);

      setMentors(mentorsRes.data);
      setManagement(managementRes.data);
      setBoardTrustees(trusteesRes.data);
    } catch (error) {
      console.error("Error fetching team data:", error);
      alert(`Error fetching team data: ${error.message}`);
    }
    setLoading(false);
  };

  const fetchData = async (type) => {
    setLoading(true);
    try {
      let response;
      const token = localStorage.getItem("token");

      switch (type) {
        case "reports":
          response = await axios.get(`${API_BASE}/reports`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReports(response.data);
          break;
        case "mentors":
          response = await axios.get(`${API_BASE}/mentors`);
          setMentors(response.data);
          break;
        case "management":
          response = await axios.get(`${API_BASE}/management`);
          setManagement(response.data);
          break;
        case "careers":
          response = await axios.get(`${API_BASE}/careers`);
          setCareers(response.data);
          console.log("Fetched careers:", response.data);
          break;
        case "board-trustees":
          response = await axios.get(`${API_BASE}/board-trustees`);
          setBoardTrustees(response.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);

      // Handle 401 error specifically
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(`Error fetching ${type}: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const handleImageChange = (e, setFormFunction) => {
    const file = e.target.files[0];
    setFormFunction((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handlePdfChange = (e, setFormFunction) => {
    const file = e.target.files[0];
    setFormFunction((prev) => ({ ...prev, pdf: file }));
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);

    try {
      let formData = new FormData();
      let endpoint = "";

      switch (type) {
        case "reports":
          const reportFormData = new FormData();
          reportFormData.append("title", reportForm.title);
          reportFormData.append("description", reportForm.description);
          reportFormData.append("content", reportForm.content);

          if (reportForm.image) {
            reportFormData.append("image", reportForm.image);
          }
          if (reportForm.pdf) {
            reportFormData.append("pdf", reportForm.pdf);
          }

          endpoint = editingId
            ? `${API_BASE}/reports/${editingId}`
            : `${API_BASE}/reports`;

          try {
            const config = {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            };

            await (editingId
              ? axios.put(endpoint, reportFormData, config)
              : axios.post(endpoint, reportFormData, config));

            setReportForm({
              title: "",
              description: "",
              content: "",
              image: null,
              pdf: null,
            });
            setLegalReportAction("view");
            setImagePreview(null);
            fetchData("reports");
            alert(`Report ${editingId ? "updated" : "created"} successfully!`);
          } catch (error) {
            console.error("Error saving report:", error);
            alert(
              `Error saving report: ${
                error.response?.data?.error || error.message
              }`
            );
          }
          break;

        case "mentors":
          Object.keys(mentorForm).forEach((key) => {
            if (key === "image" && mentorForm.image) {
              formData.append("image", mentorForm.image);
            } else {
              formData.append(key, mentorForm[key]);
            }
          });
          endpoint = editingId
            ? `${API_BASE}/mentors/${editingId}`
            : `${API_BASE}/mentors`;
          await (editingId
            ? axios.put(endpoint, formData)
            : axios.post(endpoint, formData));
          setMentorForm({
            name: "",
            position: "",
            bio: "",
            image: null,
            social_links: "{}",
          });
          break;

        case "management":
          Object.keys(managementForm).forEach((key) => {
            if (key === "image" && managementForm.image) {
              formData.append("image", managementForm.image);
            } else {
              formData.append(key, managementForm[key]);
            }
          });
          endpoint = editingId
            ? `${API_BASE}/management/${editingId}`
            : `${API_BASE}/management`;
          await (editingId
            ? axios.put(endpoint, formData)
            : axios.post(endpoint, formData));
          setManagementForm({
            name: "",
            position: "",
            bio: "",
            image: null,
            social_links: "{}",
          });
          break;

        case "careers":
          endpoint = editingId
            ? `${API_BASE}/careers/${editingId}`
            : `${API_BASE}/careers`;
          await (editingId
            ? axios.put(endpoint, careerForm)
            : axios.post(endpoint, careerForm));
          setCareerForm({
            title: "",
            description: "",
            requirements: "",
            location: "",
            type: "full-time",
            status: "active",
          });
          setCareerAction("current");
          break;

        case "board-trustees":
          Object.keys(trusteeForm).forEach((key) => {
            if (key === "image" && trusteeForm.image) {
              formData.append("image", trusteeForm.image);
            } else {
              formData.append(key, trusteeForm[key]);
            }
          });
          endpoint = editingId
            ? `${API_BASE}/board-trustees/${editingId}`
            : `${API_BASE}/board-trustees`;
          await (editingId
            ? axios.put(endpoint, formData)
            : axios.post(endpoint, formData));
          setTrusteeForm({
            name: "",
            position: "",
            bio: "",
            image: null,
            social_links: "{}",
          });
          break;

        default:
          break;
      }

      setEditingId(null);
      setImagePreview(null);
      setTeamAction("view");
      fetchAllTeamData();
      fetchData(type);
      alert(
        `${type.slice(0, -1)} ${
          editingId ? "updated" : "created"
        } successfully!`
      );
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      alert(`Error saving ${type}: ${error.message}`);
    }
    setLoading(false);
  };

  const handleEdit = (item, type) => {
    setEditingId(item.id);

    if (type === "reports") {
      setLegalReportAction("update");
    } else if (type === "careers") {
      setCareerAction("update");
    } else {
      setTeamAction("update");
      setCurrentTeamType(type);
    }

    switch (type) {
      case "reports":
        setLegalReportAction("update");
        setReportForm({
          title: item.title,
          description: item.description,
          content: item.content,
          image: null,
          pdf: null,
        });
        if (item.image)
          setImagePreview(`${API_BASE}/uploads/reports/${item.image}`);
        break;
      case "careers":
        setCareerForm({
          title: item.title,
          description: item.description,
          requirements: item.requirements,
          location: item.location,
          type: item.type,
          is_active: item.is_active,
        });
        break;
      case "mentors":
        setMentorForm({
          name: item.name,
          position: item.position,
          bio: item.bio,
          image: null,
          social_links: JSON.stringify(item.social_links || {}),
        });
        if (item.image)
          setImagePreview(`${API_BASE}/uploads/mentors/${item.image}`);
        break;
      case "management":
        setManagementForm({
          name: item.name,
          position: item.position,
          bio: item.bio,
          image: null,
          social_links: JSON.stringify(item.social_links || {}),
        });
        if (item.image)
          setImagePreview(`${API_BASE}/uploads/management/${item.image}`);
        break;
      case "board-trustees":
        setTrusteeForm({
          name: item.name,
          position: item.position,
          bio: item.bio,
          image: null,
          social_links: JSON.stringify(item.social_links || {}),
        });
        if (item.image)
          setImagePreview(`${API_BASE}/uploads/board-trustees/${item.image}`);
        break;
      default:
        break;
    }
  };

  const handleStatusToggle = async (id, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus ? "activate" : "deactivate"
        } this career opening?`
      )
    )
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/careers/${id}`,
        {
          ...careers.find((c) => c.id === id),
          is_active: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        `Career opening ${
          newStatus ? "activated" : "deactivated"
        } successfully!`
      );
      fetchData("careers");
    } catch (error) {
      console.error("Error toggling career status:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(`Error updating career status: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id, type) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${type.slice(0, -1)}?`
      )
    )
      return;

    setLoading(true);
    try {
      let endpoint = `${API_BASE}/${type}`;
      const token = localStorage.getItem("token");

      if (type === "board-trustees") {
        endpoint = `${API_BASE}/board-trustees`;
      } else if (type === "careers") {
        endpoint = `${API_BASE}/careers`;
      }

      const response = await axios.delete(`${endpoint}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("Delete successful:", response.data);
        alert(`${type.slice(0, -1)} deleted successfully!`);
      } else {
        console.log("Delete successful (no content returned)");
        alert(`${type.slice(0, -1)} deleted successfully!`);
      }

      if (type === "our-team") {
        fetchAllTeamData();
      } else {
        fetchData(type);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        alert(
          `Error deleting ${type}: ${
            error.response.data?.error || error.message
          }`
        );
      } else if (error.request) {
        console.error("Error request:", error.request);
        alert(`Error deleting ${type}: No response from server`);
      } else {
        console.error("Error message:", error.message);
        alert(`Error deleting ${type}: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTeamAction("view");
    setCurrentTeamType(null);
    setCareerAction("all");
    setLegalReportAction("view");
    setReportForm({
      title: "",
      description: "",
      content: "",
      image: null,
      pdf: null,
    });
    setMentorForm({
      name: "",
      position: "",
      bio: "",
      image: null,
      social_links: "{}",
    });
    setManagementForm({
      name: "",
      position: "",
      bio: "",
      image: null,
      social_links: "{}",
    });
    setCareerForm({
      title: "",
      description: "",
      requirements: "",
      location: "",
      type: "full-time",
      is_active: true,
    });
    setTrusteeForm({
      name: "",
      position: "",
      bio: "",
      image: null,
      social_links: "{}",
    });
    setImagePreview(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearPermissionsCache();
    window.location.href = "/admin";
  };

  // Media Corner dropdown handlers
  const handleMediaSubDropdown = (type) => {
    setMediaSubDropdown(mediaSubDropdown === type ? null : type);
  };

  const handleMediaAction = (type, action) => {
    setCurrentMediaType(type);
    setMediaAction(action);
    setMediaSubDropdown(null);
    setOpenDropdown(null);
    updateUrlPath("media", action, type);

    if (action === "add") {
      setEditingMediaId(null);
      setMediaForm({
        title: "",
        description: "",
        content: "",
        image: null,
        pdf: null,
        video_url: "",
        video_file: null,
        is_active: true,
      });
    }
  };

  // Interventions dropdown handlers
  const handleInterventionsSubDropdown = (category) => {
    setInterventionsSubDropdown(
      interventionsSubDropdown === category ? null : category
    );
  };

  const handleInterventionsAction = (category, action) => {
    setCurrentOurWorkCategory(category);
    setInterventionsAction(action);
    setInterventionsSubDropdown(null);
    setOpenDropdown(null);
    updateUrlPath("interventions", action, category);
  };

  // Helper functions
  const getMediaTypeIcon = (type) => {
    const icons = {
      newsletters: "📰",
      stories: "📖",
      events: "🎉",
      blogs: "✍️",
      documentaries: "🎬",
    };
    return icons[type] || "📁";
  };

  const getMediaTypeDescription = (type) => {
    const descriptions = {
      newsletters: "Manage monthly newsletters and publications",
      stories: "Share inspiring success stories",
      events: "Manage upcoming events and workshops",
      blogs: "Create and manage blog posts",
      documentaries: "Upload and manage video content",
    };
    return descriptions[type] || "Manage content";
  };

  const getOurWorkCategoryIcon = (category) => {
    const icons = {
      quality_education: "",
      livelihood: "",
      healthcare: "",
      environment_sustainability: "",
      integrated_development: "",
    };
    return icons[category] || "";
  };

  const getOurWorkCategoryLabel = (category) => {
    const labels = {
      quality_education: "Quality Education",
      livelihood: "Livelihood",
      healthcare: "Healthcare",
      environment_sustainability: "Environment Sustainability",
      integrated_development: "Integrated Development (IDP)",
    };
    return labels[category] || category;
  };

  const getOurWorkCategoryDescription = (category) => {
    const descriptions = {
      quality_education: "Manage quality education programs and initiatives",
      livelihood: "Manage livelihood and employment programs",
      healthcare: "Manage healthcare services and initiatives",
      environment_sustainability:
        "Manage environmental sustainability programs",
      integrated_development: "Manage integrated development programs",
    };
    return descriptions[category] || "Manage content";
  };

  const renderMediaForm = () => {
    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <button
              className="btn-back"
              onClick={() => {
                setMediaAction("view");
                setEditingMediaId(null);
                setMediaForm({
                  title: "",
                  description: "",
                  content: "",
                  image: null,
                  pdf: null,
                  is_active: true,
                });
                updateUrlPath("media", "view", currentMediaType);
              }}
            >
              ← Back to{" "}
              {currentMediaType
                ? currentMediaType.charAt(0).toUpperCase() +
                  currentMediaType.slice(1)
                : "Media"}
            </button>
            <h3>
              {editingMediaId ? "Edit" : "Add New"}
              {currentMediaType
                ? " " +
                  currentMediaType.slice(0, -1).charAt(0).toUpperCase() +
                  currentMediaType.slice(0, -1).slice(1)
                : " Media"}
            </h3>
          </div>
        </div>

        <form onSubmit={(e) => handleMediaSubmit(e)} className="dashboard-form">
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={mediaForm.title}
              onChange={(e) =>
                setMediaForm({ ...mediaForm, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={mediaForm.description}
              onChange={(e) =>
                setMediaForm({ ...mediaForm, description: e.target.value })
              }
              required
              rows="3"
            />
          </div>

          {/* Only show content field for stories and blogs */}
          {["stories", "blogs"].includes(currentMediaType) && (
            <div className="form-group">
              <label>Content:</label>
              <textarea
                value={mediaForm.content || ""}
                onChange={(e) =>
                  setMediaForm({ ...mediaForm, content: e.target.value })
                }
                rows="5"
              />
            </div>
          )}

          {/* Show image upload for all types except newsletters */}
          {currentMediaType !== "newsletters" && (
            <div className="form-group">
              <label>Featured Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setMediaForm({ ...mediaForm, image: file });
                }}
              />
            </div>
          )}

          {/* SPECIAL HANDLING FOR NEWSLETTERS - PDF UPLOAD */}
          {currentMediaType === "newsletters" && (
            <div className="form-group">
              <label>PDF Document (Required for newsletters):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setMediaForm({ ...mediaForm, pdf: file });
                }}
                required={currentMediaType === "newsletters"}
              />
              <small>Upload PDF document for newsletter</small>
              {mediaForm.pdf && (
                <div className="file-preview">
                  <span>📄 {mediaForm.pdf.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Show image upload for other types that need images */}
          {["events", "blogs", "stories", "documentaries"].includes(
            currentMediaType
          ) && (
            <div className="form-group">
              <label>
                {currentMediaType === "documentaries"
                  ? "Thumbnail Image:"
                  : "Featured Image:"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setMediaForm({ ...mediaForm, image: file });
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result);
                  };
                  if (file) reader.readAsDataURL(file);
                }}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          )}

          {currentMediaType === "documentaries" && (
            <>
              <div className="form-group">
                <label>Video Link (YouTube, Vimeo, etc.)</label>
                <input
                  type="url"
                  value={mediaForm.video_url}
                  onChange={(e) =>
                    setMediaForm({ ...mediaForm, video_url: e.target.value })
                  }
                  placeholder="Enter video link (YouTube, Vimeo, etc.)"
                />
                <small>Example: https://www.youtube.com/watch?v=abc123</small>
              </div>

              <div className="form-group">
                <label>OR Upload Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setMediaForm({
                      ...mediaForm,
                      video_file: file,
                      video_url: file ? "" : mediaForm.video_url,
                    });
                  }}
                />
                <small>Supported formats: MP4, WebM, MOV. Max size: 50MB</small>
                {mediaForm.video_file && (
                  <div className="file-preview">
                    <span>🎥 Selected: {mediaForm.video_file.name}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Duration (optional)</label>
                <input
                  type="text"
                  value={mediaForm.duration}
                  onChange={(e) =>
                    setMediaForm({ ...mediaForm, duration: e.target.value })
                  }
                  placeholder="e.g., 15:30, 1h 25m"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Status:</label>
            <select
              value={mediaForm.is_active}
              onChange={(e) =>
                setMediaForm({
                  ...mediaForm,
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
              {loading ? "Processing..." : editingMediaId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaAction("view");
                setEditingMediaId(null);
                setMediaForm({
                  title: "",
                  description: "",
                  content: "",
                  image: null,
                  pdf: null,
                  is_active: true,
                });
                updateUrlPath("media", "view", currentMediaType);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderTeamForm = () => {
    if (!currentTeamType) {
      return (
        <div className="team-type-selection">
          <h3>Select Team Type</h3>
          <div className="team-type-options">
            {canUserPerformAction("team", "mentors", "create") && (
              <button
                className="team-type-btn"
                onClick={() => {
                  setCurrentTeamType("mentors");
                  updateUrlPath("team", "add", "mentors");
                }}
              >
                <span>👥</span>
                <div>
                  <h4>Mentors</h4>
                  <p>Add new mentor to the team</p>
                </div>
              </button>
            )}
            {canUserPerformAction("team", "management", "create") && (
              <button
                className="team-type-btn"
                onClick={() => {
                  setCurrentTeamType("management");
                  updateUrlPath("team", "add", "management");
                }}
              >
                <span>💼</span>
                <div>
                  <h4>Management Team</h4>
                  <p>Add new management team member</p>
                </div>
              </button>
            )}
            {canUserPerformAction("team", "board-trustees", "create") && (
              <button
                className="team-type-btn"
                onClick={() => {
                  setCurrentTeamType("board-trustees");
                  updateUrlPath("team", "add", "board-trustees");
                }}
              >
                <span>🏛️</span>
                <div>
                  <h4>Board of Trustees</h4>
                  <p>Add new board trustee</p>
                </div>
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (currentTeamType) {
      case "mentors":
        return (
          <form
            onSubmit={(e) => handleSubmit(e, "mentors")}
            className="dashboard-form"
          >
            <h3>{editingId ? "Edit" : "Add New"} Mentor</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={mentorForm.name}
                onChange={(e) =>
                  setMentorForm({ ...mentorForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={mentorForm.position}
                onChange={(e) =>
                  setMentorForm({ ...mentorForm, position: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setMentorForm)}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : editingId ? "Update" : "Create"}{" "}
                Mentor
              </button>
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        );

      case "management":
        return (
          <form
            onSubmit={(e) => handleSubmit(e, "management")}
            className="dashboard-form"
          >
            <h3>{editingId ? "Edit" : "Add New"} Management Member</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={managementForm.name}
                onChange={(e) =>
                  setManagementForm({ ...managementForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={managementForm.position}
                onChange={(e) =>
                  setManagementForm({
                    ...managementForm,
                    position: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : editingId ? "Update" : "Create"}{" "}
                Member
              </button>
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        );

      case "board-trustees":
        return (
          <form
            onSubmit={(e) => handleSubmit(e, "board-trustees")}
            className="dashboard-form"
          >
            <h3>{editingId ? "Edit" : "Add New"} Board Trustee</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={trusteeForm.name}
                onChange={(e) =>
                  setTrusteeForm({ ...trusteeForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={trusteeForm.position}
                onChange={(e) =>
                  setTrusteeForm({ ...trusteeForm, position: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setTrusteeForm)}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : editingId ? "Update" : "Create"}{" "}
                Trustee
              </button>
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const renderTeamView = () => {
    if (loading) return <div className="loading">Loading...</div>;

    return (
      <div className="team-dashboard">
        <div className="team-header">
          <h3>Team</h3>
          {canUserPerformAction("team", null, "create") && (
            <button
              className="btn-primary"
              onClick={() => {
                setTeamAction("add");
                setCurrentTeamType(null);
                updateUrlPath("team", "add");
              }}
            >
              + Add User
            </button>
          )}
        </div>

        {/* Mentors Section */}
        {canUserPerformAction("team", "mentors", "view") && (
          <div className="team-section">
            <h4>Mentors ({mentors.length})</h4>
            {mentors.length === 0 ? (
              <p className="no-data">No mentors found</p>
            ) : (
              <div className="team-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Designation</th>
                      {(canUserPerformAction("team", "mentors", "edit") ||
                        canUserPerformAction("team", "mentors", "delete")) && (
                        <th>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {mentors.map((mentor) => (
                      <tr key={mentor.id}>
                        <td>
                          {mentor.image ? (
                            <img
                              src={`${API_BASE}/uploads/mentors/${mentor.image}`}
                              alt={mentor.name}
                              className="team-avatar"
                            />
                          ) : (
                            <div className="avatar-placeholder">👤</div>
                          )}
                        </td>
                        <td>{mentor.name}</td>
                        <td>{mentor.position}</td>
                        {(canUserPerformAction("team", "mentors", "edit") ||
                          canUserPerformAction(
                            "team",
                            "mentors",
                            "delete"
                          )) && (
                          <td>
                            <div className="action-buttons">
                              {canUserPerformAction(
                                "team",
                                "mentors",
                                "edit"
                              ) && (
                                <button
                                  className="btn-edit"
                                  onClick={() => {
                                    handleEdit(mentor, "mentors");
                                    updateUrlPath("team", "update", "mentors");
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                              {canUserPerformAction(
                                "team",
                                "mentors",
                                "delete"
                              ) && (
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDelete(mentor.id, "mentors")
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Management Team Section */}
        {canUserPerformAction("team", "management", "view") && (
          <div className="team-section">
            <h4>Management Team ({management.length})</h4>
            {management.length === 0 ? (
              <p className="no-data">No management members found</p>
            ) : (
              <div className="team-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Designation</th>
                      {(canUserPerformAction("team", "management", "edit") ||
                        canUserPerformAction(
                          "team",
                          "management",
                          "delete"
                        )) && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {management.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.position}</td>
                        {(canUserPerformAction("team", "management", "edit") ||
                          canUserPerformAction(
                            "team",
                            "management",
                            "delete"
                          )) && (
                          <td>
                            <div className="action-buttons">
                              {canUserPerformAction(
                                "team",
                                "management",
                                "edit"
                              ) && (
                                <button
                                  className="btn-edit"
                                  onClick={() => {
                                    handleEdit(member, "management");
                                    updateUrlPath(
                                      "team",
                                      "update",
                                      "management"
                                    );
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                              {canUserPerformAction(
                                "team",
                                "management",
                                "delete"
                              ) && (
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDelete(member.id, "management")
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Board of Trustees Section */}
        {canUserPerformAction("team", "board-trustees", "view") && (
          <div className="team-section">
            <h4>Board of Trustees ({boardTrustees.length})</h4>
            {boardTrustees.length === 0 ? (
              <p className="no-data">No board trustees found</p>
            ) : (
              <div className="team-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Designation</th>
                      {(canUserPerformAction(
                        "team",
                        "board-trustees",
                        "edit"
                      ) ||
                        canUserPerformAction(
                          "team",
                          "board-trustees",
                          "delete"
                        )) && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {boardTrustees.map((trustee) => (
                      <tr key={trustee.id}>
                        <td>
                          {trustee.image ? (
                            <img
                              src={`${API_BASE}/uploads/board-trustees/${trustee.image}`}
                              alt={trustee.name}
                              className="team-avatar"
                            />
                          ) : (
                            <div className="avatar-placeholder">👤</div>
                          )}
                        </td>
                        <td>{trustee.name}</td>
                        <td>{trustee.position}</td>
                        {(canUserPerformAction(
                          "team",
                          "board-trustees",
                          "edit"
                        ) ||
                          canUserPerformAction(
                            "team",
                            "board-trustees",
                            "delete"
                          )) && (
                          <td>
                            <div className="action-buttons">
                              {canUserPerformAction(
                                "team",
                                "board-trustees",
                                "edit"
                              ) && (
                                <button
                                  className="btn-edit"
                                  onClick={() => {
                                    handleEdit(trustee, "board-trustees");
                                    updateUrlPath(
                                      "team",
                                      "update",
                                      "board-trustees"
                                    );
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                              {canUserPerformAction(
                                "team",
                                "board-trustees",
                                "delete"
                              ) && (
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDelete(trustee.id, "board-trustees")
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Add this useEffect to fetch media data
  useEffect(() => {
    if (activeTab === "media" && currentMediaType && mediaAction === "view") {
      fetchMediaData();
    }
  }, [activeTab, currentMediaType, mediaAction]);

  const fetchMediaData = async () => {
    if (!currentMediaType) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/media/${currentMediaType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMediaItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${currentMediaType}:`, error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(`Error fetching ${currentMediaType}: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const renderMediaList = () => {
    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <h3>
              {currentMediaType
                ? currentMediaType.charAt(0).toUpperCase() +
                  currentMediaType.slice(1) +
                  " Management"
                : "Media Corner"}
            </h3>
            {canUserPerformAction("media", currentMediaType, "create") && (
              <button
                className="btn-primary"
                onClick={() => {
                  setMediaAction("add");
                  setEditingMediaId(null);
                  setMediaForm({
                    title: "",
                    description: "",
                    content: "",
                    image: null,
                    pdf: null,
                    is_active: true,
                  });
                  updateUrlPath("media", "add", currentMediaType);
                }}
              >
                + Add{" "}
                {currentMediaType ? currentMediaType.slice(0, -1) : "Media"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : mediaItems.length === 0 ? (
          <div className="no-data-message">
            <p>No {currentMediaType || "media items"} found</p>
            <p>
              <small>Total items: {mediaItems.length}</small>
            </p>
          </div>
        ) : (
          <div className="items-list">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="item-card"
                style={{
                  borderLeft: `4px solid ${
                    item.is_published ? "#4CAF50" : "#ff9800"
                  }`,
                }}
              >
                <div className="item-content">
                  <div className="media-header">
                    <h4>{item.title}</h4>
                    <span
                      className={`status-badge ${
                        item.is_published ? "active" : "inactive"
                      }`}
                    >
                      {item.is_published ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>

                  {item.image && (
                    <div className="media-image-preview">
                      <img
                        src={`${API_BASE}/uploads/media/${currentMediaType}/${item.image}`}
                        alt={item.title}
                      />
                    </div>
                  )}

                  <p>
                    <strong>Description:</strong> {item.description}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>

                  {/* ADDED: Last modified info display */}
                  {renderLastModifiedInfo(item)}

                  {renderActionButtons(item, "media", currentMediaType)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCareerForm = () => {
    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <button
              className="btn-back"
              onClick={() => {
                setCareerAction("all");
                setEditingId(null);
                cancelEdit();
                updateUrlPath("careers");
              }}
            >
              ← Back to Openings
            </button>
            <h3>
              {editingId ? "Edit Career Opening" : "Add New Career Opening"}
            </h3>
          </div>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, "careers")}
          className="dashboard-form"
        >
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={careerForm.title}
              onChange={(e) =>
                setCareerForm({ ...careerForm, title: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={careerForm.description}
              onChange={(e) =>
                setCareerForm({ ...careerForm, description: e.target.value })
              }
              required
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Requirements:</label>
            <textarea
              value={careerForm.requirements}
              onChange={(e) =>
                setCareerForm({ ...careerForm, requirements: e.target.value })
              }
              required
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              value={careerForm.location}
              onChange={(e) =>
                setCareerForm({ ...careerForm, location: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={careerForm.type}
              onChange={(e) =>
                setCareerForm({ ...careerForm, type: e.target.value })
              }
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={careerForm.is_active}
              onChange={(e) =>
                setCareerForm({
                  ...careerForm,
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
              {loading ? "Processing..." : editingId ? "Update" : "Create"}{" "}
              Opening
            </button>
            <button
              type="button"
              onClick={() => {
                setCareerAction("all");
                cancelEdit();
                updateUrlPath("careers");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      const token = localStorage.getItem("token");

      console.log("Current media type:", currentMediaType);
      console.log("Form data:", mediaForm);

      // Append basic fields
      formData.append("title", mediaForm.title || "");
      formData.append("description", mediaForm.description || "");

      // Handle different media types
      if (["stories", "blogs"].includes(currentMediaType)) {
        formData.append("content", mediaForm.content || "");
      }

      if (currentMediaType === "documentaries") {
        formData.append("video_url", mediaForm.video_url || "");
        formData.append("duration", mediaForm.duration || "0:00");
        if (mediaForm.video_file) {
          formData.append("video_file", mediaForm.video_file);
        }
      }

      // Handle file uploads
      if (mediaForm.image) {
        formData.append("image", mediaForm.image);
      }

      // SPECIAL HANDLING FOR NEWSLETTERS
      if (currentMediaType === "newsletters" && mediaForm.pdf) {
        formData.append("file", mediaForm.pdf);
      } else if (mediaForm.pdf) {
        formData.append("pdf", mediaForm.pdf);
      }

      // For newsletters, we might need additional fields
      if (currentMediaType === "newsletters") {
        formData.append(
          "published_date",
          new Date().toISOString().split("T")[0]
        );
        formData.append("is_published", mediaForm.is_active);
      } else {
        formData.append(
          "published_date",
          new Date().toISOString().split("T")[0]
        );
        formData.append("is_published", mediaForm.is_active);
      }

      // Debug: Log all form data entries
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const endpoint = editingMediaId
        ? `${API_BASE}/media/${currentMediaType}/${editingMediaId}`
        : `${API_BASE}/media/${currentMediaType}`;

      console.log("API Endpoint:", endpoint);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = editingMediaId
        ? await axios.put(endpoint, formData, config)
        : await axios.post(endpoint, formData, config);

      console.log("API Response:", response.data);

      alert(
        `${currentMediaType.slice(0, -1)} ${
          editingMediaId ? "updated" : "created"
        } successfully!`
      );

      // Reset and refresh
      setMediaAction("view");
      setEditingMediaId(null);
      setMediaForm({
        title: "",
        description: "",
        content: "",
        image: null,
        pdf: null,
        video_url: "",
        video_file: null,
        duration: "",
        is_active: true,
      });
      setImagePreview(null);
      fetchMediaData();
      updateUrlPath("media", "view", currentMediaType);
    } catch (error) {
      console.error("Error saving media:", error);
      console.error("Full error response:", error.response);

      // More detailed error message
      if (error.response?.data) {
        console.error("Backend error details:", error.response.data);
        alert(
          `Error: ${error.response.data.error || "Unknown error"}\nDetails: ${
            error.response.data.details || ""
          }\nSQL: ${error.response.data.sqlMessage || ""}`
        );
      } else {
        alert(`Error saving media: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const handleMediaEdit = (item) => {
    setEditingMediaId(item.id);
    setMediaAction("update");
    setMediaForm({
      title: item.title || "",
      description: item.description || "",
      content: item.content || "",
      image: null,
      pdf: null,
      video_url: item.video_url || "",
      video_file: null,
      duration: item.duration || "",
      is_active: item.is_published !== undefined ? item.is_published : true,
    });
    if (item.image) {
      setImagePreview(
        `${API_BASE}/uploads/media/${currentMediaType}/${item.image}`
      );
    }
  };

  const handleMediaStatusToggle = async (id, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus ? "publish" : "unpublish"
        } this item?`
      )
    )
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE}/media/${currentMediaType}/${id}/publish`,
        { is_published: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`Item ${newStatus ? "published" : "unpublished"} successfully!`);
      fetchMediaData();
    } catch (error) {
      console.error("Error toggling media status:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(`Error updating status: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const handleMediaDelete = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${currentMediaType.slice(0, -1)}?`
      )
    )
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/media/${currentMediaType}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert(`${currentMediaType.slice(0, -1)} deleted successfully!`);
      fetchMediaData();
    } catch (error) {
      console.error("Error deleting media:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(`Error deleting item: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const renderLegalReportForm = () => {
    return (
      <div className="content-list">
        <div className="content-header">
          <div className="header-row">
            <button
              className="btn-back"
              onClick={() => {
                setLegalReportAction("view");
                setEditingId(null);
                cancelEdit();
                updateUrlPath("reports");
              }}
            >
              ← Back to Reports
            </button>
            <h3>{editingId ? "Edit Legal Report" : "Add New Legal Report"}</h3>
          </div>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, "reports")}
          className="dashboard-form"
        >
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={reportForm.title}
              onChange={(e) =>
                setReportForm({ ...reportForm, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={reportForm.description}
              onChange={(e) =>
                setReportForm({ ...reportForm, description: e.target.value })
              }
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={reportForm.content}
              onChange={(e) =>
                setReportForm({ ...reportForm, content: e.target.value })
              }
              required
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Featured Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setReportForm)}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>PDF Document:</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handlePdfChange(e, setReportForm)}
            />
            <small>Upload PDF document (optional)</small>
            {reportForm.pdf && (
              <div className="file-preview">
                <span>📄 {reportForm.pdf.name}</span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update" : "Create"}{" "}
              Report
            </button>
            <button
              type="button"
              onClick={() => {
                setLegalReportAction("view");
                cancelEdit();
                updateUrlPath("reports");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderForm = () => {
    if (activeTab === "our-team") {
      if (teamAction === "view") {
        return renderTeamView();
      } else if (teamAction === "add" || teamAction === "update") {
        return renderTeamForm();
      }
    }

    // Only show media form when we're in add/update mode for a specific media type
    if (
      activeTab === "media" &&
      currentMediaType &&
      (mediaAction === "add" || mediaAction === "update")
    ) {
      return renderMediaForm();
    }

    if (activeTab === "careers") {
      return null;
    }

    if (activeTab === "reports") {
      return null;
    }

    switch (activeTab) {
      case "media":
        if (!currentMediaType) {
          return (
            <div className="media-dashboard">
              <h3>Media Corner</h3>
              <div className="media-types-grid">
                {[
                  "newsletters",
                  "stories",
                  "events",
                  "blogs",
                  "documentaries",
                ].map(
                  (type) =>
                    canUserPerformAction("media", type, "view") && (
                      <div
                        key={type}
                        className="media-type-card"
                        onClick={() => {
                          setCurrentMediaType(type);
                          updateUrlPath("media", "view", type);
                        }}
                      >
                        <h4>
                          {getMediaTypeIcon(type)}{" "}
                          {type.charAt(0).toUpperCase() +
                            type.slice(1).replace("_", " ")}
                        </h4>
                        <p>{getMediaTypeDescription(type)}</p>
                      </div>
                    )
                )}
              </div>
            </div>
          );
        }
        return null;

      case "ourWork":
        if (!currentOurWorkCategory) {
          return (
            <div className="media-dashboard">
              <h3>Our Interventions</h3>
              <div className="media-types-grid">
                {[
                  "quality_education",
                  "livelihood",
                  "healthcare",
                  "environment_sustainability",
                  "integrated_development",
                ].map(
                  (category) =>
                    canUserPerformAction("interventions", category, "view") && (
                      <div
                        key={category}
                        className="media-type-card"
                        onClick={() => {
                          setCurrentOurWorkCategory(category);
                          updateUrlPath("interventions", "view", category);
                        }}
                      >
                        <h4>
                          {getOurWorkCategoryIcon(category)}{" "}
                          {getOurWorkCategoryLabel(category)}
                        </h4>
                        <p>{getOurWorkCategoryDescription(category)}</p>
                      </div>
                    )
                )}
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (activeTab === "our-team") {
      return null;
    }

    if (loading) return <div className="loading">Loading...</div>;
    if (activeTab === "media" && currentMediaType && mediaAction === "view") {
      return renderMediaList();
    }

    switch (activeTab) {
      case "reports":
        if (!canUserPerformAction("reports", null, "view")) {
          return (
            <div className="no-permission">
              <h3>Access Denied</h3>
              <p>You don't have permission to view legal reports.</p>
            </div>
          );
        }

        return (
          <div className="content-list">
            <div className="content-header">
              <div className="header-row">
                <h3>Legal Reports</h3>
                {canUserPerformAction("reports", null, "create") && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setLegalReportAction("add");
                      setEditingId(null);
                      setReportForm({
                        title: "",
                        description: "",
                        content: "",
                        image: null,
                        pdf: null,
                      });
                      setImagePreview(null);
                      updateUrlPath("reports", "add");
                    }}
                  >
                    + Add Report
                  </button>
                )}
              </div>
            </div>

            {legalReportAction === "add" || legalReportAction === "update" ? (
              renderLegalReportForm()
            ) : (
              <>
                {reports.length === 0 ? (
                  <p>No reports found</p>
                ) : (
                  <div className="items-grid">
                    {reports.map((report) => (
                      <div key={report.id} className="item-card">
                        {/* Display Image if exists */}
                        {report.image && (
                          <div className="item-image">
                            <img
                              src={`${API_BASE}/uploads/reports/${report.image}`}
                              alt={report.title}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {/* Display PDF icon if PDF exists */}
                        {report.pdf && (
                          <div className="pdf-indicator">
                            <span className="pdf-icon">📄</span>
                            <span>PDF Available</span>
                          </div>
                        )}

                        <div className="item-content">
                          <h4>{report.title}</h4>
                          <p>{report.description}</p>

                          {/* ADDED: Last modified info for reports - ADMIN/SUPER_ADMIN ONLY */}
                          {renderReportLastModifiedInfo(report)}

                          {/* Action Buttons */}
                          <div className="item-actions">
                            {/* View PDF Button if PDF exists */}
                            {report.pdf && (
                              <button
                                className="btn-pdf"
                                onClick={() =>
                                  window.open(
                                    `${API_BASE}/uploads/reports/${report.pdf}`,
                                    "_blank"
                                  )
                                }
                              >
                                View PDF
                              </button>
                            )}

                            {canUserPerformAction("reports", null, "edit") && (
                              <button
                                className="btn-edit"
                                onClick={() => {
                                  setLegalReportAction("update");
                                  handleEdit(report, "reports");
                                  updateUrlPath("reports", "update");
                                }}
                              >
                                Edit
                              </button>
                            )}

                            {canUserPerformAction(
                              "reports",
                              null,
                              "delete"
                            ) && (
                              <button
                                className="btn-delete"
                                onClick={() =>
                                  handleDelete(report.id, "reports")
                                }
                              >
                                Delete
                              </button>
                            )}

                            {/* Show View Only if no actions available */}
                            {!canUserPerformAction("reports", null, "edit") &&
                              !canUserPerformAction(
                                "reports",
                                null,
                                "delete"
                              ) && (
                                <span className="view-only-badge">
                                  View Only
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "careers":
        if (!canUserPerformAction("careers", null, "view")) {
          return (
            <div className="no-permission">
              <h3>Access Denied</h3>
              <p>You don't have permission to view career openings.</p>
            </div>
          );
        }

        // Filter careers based on selected filter
        const getFilteredCareers = () => {
          switch (careerAction) {
            case "active":
              return careers.filter((career) => {
                return (
                  career.is_active === true ||
                  career.is_active === 1 ||
                  career.is_active === "true" ||
                  career.status === "active" ||
                  career.status === true ||
                  career.status === 1
                );
              });
            case "inactive":
              return careers.filter((career) => {
                return (
                  career.is_active === false ||
                  career.is_active === 0 ||
                  career.is_active === "false" ||
                  career.status === "inactive" ||
                  career.status === false ||
                  career.status === 0 ||
                  career.is_active === null ||
                  career.is_active === undefined
                );
              });
            case "all":
            default:
              return careers;
          }
        };

        const filteredCareers = getFilteredCareers();

        // FIX: Only show form when explicitly in add/update mode
        if (careerAction === "add" || careerAction === "update") {
          return renderCareerForm();
        }

        // Show the careers list for view modes (all, active, inactive)
        return (
          <div className="content-list">
            <div className="content-header">
              <div className="header-row">
                <h3>Career Openings</h3>
                {canUserPerformAction("careers", null, "create") && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setCareerAction("add");
                      setEditingId(null);
                      setCareerForm({
                        title: "",
                        description: "",
                        requirements: "",
                        location: "",
                        type: "full-time",
                        is_active: true,
                      });
                      updateUrlPath("careers", "add");
                    }}
                  >
                    + Add Opening
                  </button>
                )}
              </div>

              <div className="filter-options">
                <select
                  value={careerAction}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setCareerAction(selectedValue);
                    setEditingId(null);
                    updateUrlPath("careers", selectedValue);
                  }}
                  className="dropdown-select"
                >
                  <option value="all">All Openings ({careers.length})</option>
                  <option value="active">
                    Active Openings (
                    {
                      careers.filter((c) => {
                        return (
                          c.is_active === true ||
                          c.is_active === 1 ||
                          c.is_active === "true" ||
                          c.status === "active" ||
                          c.status === true ||
                          c.status === 1
                        );
                      }).length
                    }
                    )
                  </option>
                  <option value="inactive">
                    Inactive Openings (
                    {
                      careers.filter((c) => {
                        return (
                          c.is_active === false ||
                          c.is_active === 0 ||
                          c.is_active === "false" ||
                          c.status === "inactive" ||
                          c.status === false ||
                          c.status === 0 ||
                          c.is_active === null ||
                          c.is_active === undefined
                        );
                      }).length
                    }
                    )
                  </option>
                </select>
              </div>
            </div>

            {filteredCareers.length === 0 ? (
              <div className="no-data-message">
                <p>No career openings found for "{careerAction}" filter</p>
              </div>
            ) : (
              <div className="items-list">
                {filteredCareers.map((career) => {
                  const isActive =
                    career.is_active === true ||
                    career.is_active === 1 ||
                    career.is_active === "true" ||
                    career.status === "active" ||
                    career.status === true ||
                    career.status === 1;

                  return (
                    <div
                      key={career.id}
                      className="item-card"
                      style={{
                        borderLeft: `4px solid ${
                          isActive ? "#4CAF50" : "#ff9800"
                        }`,
                      }}
                    >
                      <div className="item-content">
                        <div className="career-header">
                          <h4>{career.title}</h4>
                          <span
                            className={`status-badge ${
                              isActive ? "active" : "inactive"
                            }`}
                          >
                            {isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                        <p>
                          <strong>Location:</strong> {career.location}
                        </p>
                        <p>
                          <strong>Type:</strong> {career.type}
                        </p>
                        <p>
                          <strong>Created:</strong>{" "}
                          {career.created_at
                            ? new Date(career.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>

                        <div className="career-description">
                          <strong>Description:</strong>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: career.description
                                ? career.description.substring(0, 150) + "..."
                                : "No description available",
                            }}
                          />
                        </div>

                        {/* ADDED: Last modified info for careers */}
                        {renderLastModifiedInfo(career)}

                        <div className="item-actions">
                          {/* Status Toggle Buttons - only for users with publish permission */}
                          {canUserPerformAction("careers", null, "publish") && (
                            <button
                              className={`status-toggle-btn ${
                                isActive ? "btn-inactive" : "btn-active"
                              }`}
                              onClick={() =>
                                handleStatusToggle(career.id, !isActive)
                              }
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}

                          {/* Edit Button - only for users with edit permission */}
                          {canUserPerformAction("careers", null, "edit") && (
                            <button
                              className="btn-edit"
                              onClick={() => {
                                setCareerAction("update");
                                handleEdit(career, "careers");
                                updateUrlPath("careers", "update");
                              }}
                            >
                              Edit
                            </button>
                          )}

                          {/* Delete Button - only for users with delete permission */}
                          {canUserPerformAction("careers", null, "delete") && (
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(career.id, "careers")}
                            >
                              Delete
                            </button>
                          )}

                          {/* View Only Indicator */}
                          {!canUserPerformAction("careers", null, "edit") &&
                            !canUserPerformAction("careers", null, "delete") &&
                            !canUserPerformAction(
                              "careers",
                              null,
                              "publish"
                            ) && (
                              <span className="view-only-badge">View Only</span>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const selectTopLevelTab = (tab) => {
    setActiveTab(tab);
    setOpenDropdown(null);
    setCurrentTeamType(null);
    setCurrentMediaType(null);
    setCurrentOurWorkCategory(null);
    setTeamAction("view");
    setCareerAction("current");
    setLegalReportAction("view");
    updateUrlPath(tab);
  };

  const handleTeamAction = (action) => {
    if (action === "team") {
      setTeamAction("view");
      updateUrlPath("team");
    } else if (action === "add") {
      setTeamAction("add");
      setCurrentTeamType(null);
      updateUrlPath("team", "add");
    } else if (action === "update") {
      setTeamAction("update");
      setCurrentTeamType(null);
      updateUrlPath("team", "update");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        {currentUser && (
          <div className="user-info">
            <span>
              Welcome, {currentUser.username} ({currentUser.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        )}
      </header>

      <div className="dashboard-container">
        <nav className="dashboard-sidebar">
          <ul>
            {/* Interventions with Sub Dropdown */}
            {canUserPerformAction("interventions", null, "view") && (
              <li className={activeTab === "ourWork" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "ourWork") {
                      setOpenDropdown(null);
                      setInterventionsSubDropdown(null);
                    } else {
                      setOpenDropdown("ourWork");
                      setActiveTab("ourWork");
                      setCurrentOurWorkCategory(null);
                      setInterventionsAction("view");
                      updateUrlPath("interventions");
                    }
                  }}
                >
                  Interventions {openDropdown === "ourWork" ? "▴" : "▾"}
                </button>
                {openDropdown === "ourWork" && (
                  <ul className="submenu">
                    {[
                      "quality_education",
                      "livelihood",
                      "healthcare",
                      "environment_sustainability",
                      "integrated_development",
                    ].map(
                      (category) =>
                        canUserPerformAction(
                          "interventions",
                          category,
                          "view"
                        ) && (
                          <li
                            key={category}
                            className="interventions-dropdown-item"
                          >
                            <div className="interventions-type-header">
                              <button
                                className="interventions-type-btn"
                                onClick={() =>
                                  handleInterventionsSubDropdown(category)
                                }
                              >
                                <span className="interventions-type-label">
                                  {getOurWorkCategoryIcon(category)}{" "}
                                  {getOurWorkCategoryLabel(category)}
                                </span>
                                <span>
                                  {interventionsSubDropdown === category
                                    ? "▴"
                                    : "▾"}
                                </span>
                              </button>
                            </div>

                            {interventionsSubDropdown === category && (
                              <ul className="interventions-submenu">
                                <li>
                                  <button
                                    onClick={() =>
                                      handleInterventionsAction(
                                        category,
                                        "view"
                                      )
                                    }
                                    className={
                                      currentOurWorkCategory === category &&
                                      interventionsAction === "view"
                                        ? "active-sub"
                                        : ""
                                    }
                                  >
                                    📋 View {getOurWorkCategoryLabel(category)}
                                  </button>
                                </li>
                                {canUserPerformAction(
                                  "interventions",
                                  category,
                                  "create"
                                ) && (
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleInterventionsAction(
                                          category,
                                          "add"
                                        )
                                      }
                                      className={
                                        currentOurWorkCategory === category &&
                                        interventionsAction === "add"
                                          ? "active-sub"
                                          : ""
                                      }
                                    >
                                      ➕ Add {getOurWorkCategoryLabel(category)}
                                    </button>
                                  </li>
                                )}
                                {canUserPerformAction(
                                  "interventions",
                                  category,
                                  "edit"
                                ) && (
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleInterventionsAction(
                                          category,
                                          "update"
                                        )
                                      }
                                      className={
                                        currentOurWorkCategory === category &&
                                        interventionsAction === "update"
                                          ? "active-sub"
                                          : ""
                                      }
                                    >
                                      ✏️ Update{" "}
                                      {getOurWorkCategoryLabel(category)}
                                    </button>
                                  </li>
                                )}
                              </ul>
                            )}
                          </li>
                        )
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Media Corner with Sub Dropdown */}
            {canUserPerformAction("media", null, "view") && (
              <li className={activeTab === "media" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "media") {
                      setOpenDropdown(null);
                      setMediaSubDropdown(null);
                    } else {
                      setOpenDropdown("media");
                      setActiveTab("media");
                      setCurrentMediaType(null);
                      setMediaAction("view");
                      updateUrlPath("media");
                    }
                  }}
                >
                  Media Corner {openDropdown === "media" ? "▴" : "▾"}
                </button>
                {openDropdown === "media" && (
                  <ul className="submenu">
                    {[
                      "newsletters",
                      "stories",
                      "events",
                      "blogs",
                      "documentaries",
                    ].map(
                      (type) =>
                        canUserPerformAction("media", type, "view") && (
                          <li key={type} className="media-dropdown-item">
                            <div className="media-type-header">
                              <button
                                className="media-type-btn"
                                onClick={() => handleMediaSubDropdown(type)}
                              >
                                <span className="media-type-label">
                                  {getMediaTypeIcon(type)}{" "}
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </span>
                                <span>
                                  {mediaSubDropdown === type ? "▴" : "▾"}
                                </span>
                              </button>
                            </div>

                            {mediaSubDropdown === type && (
                              <ul className="media-submenu">
                                <li>
                                  <button
                                    onClick={() =>
                                      handleMediaAction(type, "view")
                                    }
                                    className={
                                      currentMediaType === type &&
                                      mediaAction === "view"
                                        ? "active-sub"
                                        : ""
                                    }
                                  >
                                    📋 View {type}
                                  </button>
                                </li>
                                {canUserPerformAction(
                                  "media",
                                  type,
                                  "create"
                                ) && (
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleMediaAction(type, "add")
                                      }
                                      className={
                                        currentMediaType === type &&
                                        mediaAction === "add"
                                          ? "active-sub"
                                          : ""
                                      }
                                    >
                                      ➕ Add {type.slice(0, -1)}
                                    </button>
                                  </li>
                                )}
                                {canUserPerformAction(
                                  "media",
                                  type,
                                  "edit"
                                ) && (
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleMediaAction(type, "update")
                                      }
                                      className={
                                        currentMediaType === type &&
                                        mediaAction === "update"
                                          ? "active-sub"
                                          : ""
                                      }
                                    >
                                      ✏️ Update {type.slice(0, -1)}
                                    </button>
                                  </li>
                                )}
                              </ul>
                            )}
                          </li>
                        )
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Impact Data */}
            {canUserPerformAction("impact", null, "view") && (
              <li className={activeTab === "impact" ? "active" : ""}>
                <button
                  onClick={() => {
                    setActiveTab("impact");
                    setOpenDropdown(null);
                    updateUrlPath("impact");
                  }}
                >
                  Impact Data
                </button>
              </li>
            )}

            {/* Banner Management */}
            {canUserPerformAction("banners", null, "view") && (
              <li className={activeTab === "banners" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "banners") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("banners");
                      setActiveTab("banners");
                      updateUrlPath("banners");
                    }
                  }}
                >
                  Banner Management {openDropdown === "banners" ? "▴" : "▾"}
                </button>
                {openDropdown === "banners" && (
                  <ul className="submenu">
                    <li>
                      <button
                        onClick={() => {
                          handleBannerAction("view");
                        }}
                      >
                        Show Banners
                      </button>
                    </li>
                    {canUserPerformAction("banners", null, "create") && (
                      <li>
                        <button
                          onClick={() => {
                            handleBannerAction("add");
                          }}
                        >
                          Add Banner
                        </button>
                      </li>
                    )}
                    {canUserPerformAction("banners", null, "edit") && (
                      <li>
                        <button
                          onClick={() => {
                            handleBannerAction("update");
                          }}
                        >
                          Update Banner
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Accreditations Section */}
            {canUserPerformAction("accreditations", null, "view") && (
              <li className={activeTab === "accreditations" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "accreditations") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("accreditations");
                      setActiveTab("accreditations");
                      updateUrlPath("accreditations");
                    }
                  }}
                >
                  Accreditations {openDropdown === "accreditations" ? "▴" : "▾"}
                </button>
                {openDropdown === "accreditations" && (
                  <ul className="submenu">
                    <li>
                      <button
                        onClick={() => {
                          handleAccreditationAction("view");
                        }}
                      >
                        Show Accreditations
                      </button>
                    </li>
                    {canUserPerformAction("accreditations", null, "create") && (
                      <li>
                        <button
                          onClick={() => {
                            handleAccreditationAction("add");
                          }}
                        >
                          Add Accreditation
                        </button>
                      </li>
                    )}
                    {canUserPerformAction("accreditations", null, "edit") && (
                      <li>
                        <button
                          onClick={() => {
                            handleAccreditationAction("update");
                          }}
                        >
                          Update Accreditation
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Team */}
            {canUserPerformAction("team", null, "view") && (
              <li className={activeTab === "our-team" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "our-team") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("our-team");
                      setActiveTab("our-team");
                      updateUrlPath("team");
                    }
                  }}
                >
                  Team {openDropdown === "our-team" ? "▴" : "▾"}
                </button>
                {openDropdown === "our-team" && (
                  <ul className="submenu">
                    <li>
                      <button
                        onClick={() => {
                          handleTeamAction("team");
                          setOpenDropdown(null);
                        }}
                      >
                        Team
                      </button>
                    </li>
                    {canUserPerformAction("team", null, "create") && (
                      <li>
                        <button
                          onClick={() => {
                            handleTeamAction("add");
                            setOpenDropdown(null);
                          }}
                        >
                          Add User
                        </button>
                      </li>
                    )}
                    {canUserPerformAction("team", null, "edit") && (
                      <li>
                        <button
                          onClick={() => {
                            handleTeamAction("update");
                            setOpenDropdown(null);
                          }}
                        >
                          Update User
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Career */}
            {canUserPerformAction("careers", null, "view") && (
              <li className={activeTab === "careers" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "careers") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("careers");
                      setActiveTab("careers");
                      updateUrlPath("careers");
                    }
                  }}
                >
                  Career {openDropdown === "careers" ? "▴" : "▾"}
                </button>
                {openDropdown === "careers" && (
                  <ul className="submenu">
                    <li>
                      <button
                        onClick={() => {
                          setCareerAction("current");
                          setOpenDropdown(null);
                        }}
                      >
                        Career
                      </button>
                    </li>
                    {canUserPerformAction("careers", null, "create") && (
                      <li>
                        <button
                          onClick={() => {
                            setCareerAction("add");
                            setOpenDropdown(null);
                          }}
                        >
                          Add Opening
                        </button>
                      </li>
                    )}
                    {canUserPerformAction("careers", null, "edit") && (
                      <li>
                        <button
                          onClick={() => {
                            setCareerAction("update");
                            setOpenDropdown(null);
                          }}
                        >
                          Update Opening
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* Legal Report */}
            {canUserPerformAction("reports", null, "view") && (
              <li className={activeTab === "reports" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "reports") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("reports");
                      setActiveTab("reports");
                      updateUrlPath("reports");
                    }
                  }}
                >
                  Legal Report {openDropdown === "reports" ? "▴" : "▾"}
                </button>
                {openDropdown === "reports" && (
                  <ul className="submenu">
                    <li>
                      <button
                        onClick={() => {
                          setLegalReportAction("view");
                          setOpenDropdown(null);
                        }}
                      >
                        Show Legal Reports
                      </button>
                    </li>
                    {canUserPerformAction("reports", null, "create") && (
                      <li>
                        <button
                          onClick={() => {
                            setLegalReportAction("add");
                            setOpenDropdown(null);
                          }}
                        >
                          Add Report
                        </button>
                      </li>
                    )}
                    {canUserPerformAction("reports", null, "edit") && (
                      <li>
                        <button
                          onClick={() => {
                            setLegalReportAction("update");
                            setOpenDropdown(null);
                          }}
                        >
                          Update Report
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}

            {/* User Management - UPDATED WITH THREE BUTTONS */}
            {canUserPerformAction("users", null, "view") && (
              <li
                className={
                  activeTab === "users" ||
                  activeTab === "registrations" ||
                  activeTab === "add-user" ||
                  activeTab === "permissions"
                    ? "active"
                    : ""
                }
              >
                <button
                  onClick={() => {
                    if (openDropdown === "users") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("users");
                      setActiveTab("users");
                      updateUrlPath("users");
                    }
                  }}
                >
                  User Management {openDropdown === "users" ? "▴" : "▾"}
                </button>
                {openDropdown === "users" && (
                  <ul className="submenu">
                    {canUserPerformAction("users", "users", "view") && (
                      <>
                        <li>
                          <button
                            className={
                              activeTab === "users" ? "active-sub" : ""
                            }
                            onClick={() => {
                              setActiveTab("users");
                              setOpenDropdown(null);
                              updateUrlPath("users");
                            }}
                          >
                            <i className="fas fa-shield-alt"></i> User
                            Permissions
                          </button>
                        </li>
                        <li>
                          <button
                            className={
                              activeTab === "add-user" ? "active-sub" : ""
                            }
                            onClick={() => {
                              setActiveTab("add-user");
                              setOpenDropdown(null);
                              updateUrlPath("users", "add");
                            }}
                          >
                            <i className="fas fa-user-plus"></i> Add User
                          </button>
                        </li>
                        {/* <li>
                          <button
                            className={
                              activeTab === "permissions" ? "active-sub" : ""
                            }
                            onClick={() => {
                              setActiveTab("permissions");
                              setOpenDropdown(null);
                              updateUrlPath("users", "permissions");
                            }}
                          >
                            <i className="fas fa-shield-alt"></i> User
                            Permissions
                          </button>
                        </li> */}
                      </>
                    )}
                    {canUserPerformAction("users", "registrations", "view") && (
                      <li>
                        <button
                          className={
                            activeTab === "registrations" ? "active-sub" : ""
                          }
                          onClick={() => {
                            setActiveTab("registrations");
                            setOpenDropdown(null);
                            updateUrlPath("registrations");
                          }}
                        >
                          <i className="fas fa-users"></i> New Users
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        <main className="dashboard-content">
          {currentMediaType ? (
            <div className="media-content-section">
              <div className="media-content-header">
                <h3>
                  {currentMediaType.charAt(0).toUpperCase() +
                    currentMediaType.slice(1)}{" "}
                  Management
                  {mediaAction === "add" && " - Add New"}
                  {mediaAction === "update" && " - Edit"}
                </h3>
                <div className="media-action-controls">
                  <button
                    className="btn-back"
                    onClick={() => {
                      if (mediaAction !== "view") {
                        setMediaAction("view");
                        setEditingMediaId(null);
                        updateUrlPath("media", "view", currentMediaType);
                      } else {
                        setCurrentMediaType(null);
                        updateUrlPath("media");
                      }
                      setMediaForm({
                        title: "",
                        description: "",
                        content: "",
                        image: null,
                        pdf: null,
                        video_url: "",
                        video_file: null,
                        is_active: true,
                      });
                    }}
                  >
                    ← Back to{" "}
                    {mediaAction !== "view" ? currentMediaType : "Media Corner"}
                  </button>
                </div>
              </div>

              {mediaAction === "view" ? renderMediaList() : renderMediaForm()}
            </div>
          ) : currentOurWorkCategory ? (
            renderOurWorkManagement()
          ) : currentAccreditationType ? (
            renderAccreditationContent()
          ) : currentBannerType ? (
            renderBannerContent()
          ) : activeTab === "users" &&
            canUserPerformAction("users", "users", "view") ? (
            <UserManagement activeSubTab="users" />
          ) : activeTab === "add-user" &&
            canUserPerformAction("users", "users", "create") ? (
            <UserManagement activeSubTab="add-user" />
          ) : activeTab === "permissions" &&
            canUserPerformAction("users", "users", "edit") ? (
            <UserManagement activeSubTab="permissions" />
          ) : activeTab === "registrations" &&
            canUserPerformAction("users", "registrations", "view") ? (
            <RegistrationRequests />
          ) : activeTab === "impact" &&
            canUserPerformAction("impact", null, "view") ? (
            <ImpactDataEditor />
          ) : (
            <>
              {renderForm()}
              {renderContent()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
