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

  const handleAccreditationAction = (action) => {
    setCurrentAccreditationType("accreditations");
    setAccreditationAction(action);
    setOpenDropdown(null);
  };

  const handleBannerAction = (action) => {
    setCurrentBannerType("banners");
    setBannerAction(action);
    setOpenDropdown(null);
  };

  const canManageContent =
    currentUser &&
    ["super_admin", "admin", "editor"].includes(currentUser.role);
  const canManageUsers =
    currentUser && ["super_admin", "admin"].includes(currentUser.role);
  const API_BASE = "http://localhost:5000/api";

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
      activeTab !== "banners"
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
          }}
          onActionChange={(action) => setInterventionsAction(action)}
        />
      );
    }
    return null;
  };

  const renderAccreditationContent = () => {
    return (
      <div className="accreditation-content-section">
        <AccreditationManagement
          action={accreditationAction}
          onClose={() => {
            setCurrentAccreditationType(null);
            setAccreditationAction("view");
          }}
          onActionChange={(action) => setAccreditationAction(action)}
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
          }}
          onActionChange={(action) => setBannerAction(action)}
        />
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
      switch (type) {
        case "reports":
          response = await axios.get(`${API_BASE}/reports`);
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
      alert(`Error fetching ${type}: ${error.message}`);
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
      await axios.put(`${API_BASE}/careers/${id}`, {
        ...careers.find((c) => c.id === id),
        is_active: newStatus,
      });

      alert(
        `Career opening ${
          newStatus ? "activated" : "deactivated"
        } successfully!`
      );
      fetchData("careers");
    } catch (error) {
      console.error("Error toggling career status:", error);
      alert(`Error updating career status: ${error.message}`);
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

      if (type === "board-trustees") {
        endpoint = `${API_BASE}/board-trustees`;
      }

      const response = await axios.delete(`${endpoint}/${id}`);

      if (response.data) {
        console.log("Delete successful:", response.data);
        alert(`${type.slice(0, -1)} deleted successfully!`);
      } else {
        console.log("Delete successful (no content returned)");
        alert(`${type.slice(0, -1)} deleted successfully!`);
      }

      fetchAllTeamData();
      fetchData(type);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);

      if (error.response) {
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

    if (action === "add") {
      setEditingMediaId(null);
      setMediaForm({
        title: "",
        description: "",
        content: "",
        image: null,
        pdf: null,
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

          {["stories", "blogs"].includes(currentMediaType) && (
            <div className="form-group">
              <label>Content:</label>
              <textarea
                value={mediaForm.content}
                onChange={(e) =>
                  setMediaForm({ ...mediaForm, content: e.target.value })
                }
                rows="5"
              />
            </div>
          )}

          <div className="form-group">
            <label>Featured Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setMediaForm)}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          {currentMediaType === "newsletters" && (
            <div className="form-group">
              <label>PDF Document:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setMediaForm((prev) => ({ ...prev, pdf: file }));
                }}
              />
            </div>
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
            <button
              className="team-type-btn"
              onClick={() => setCurrentTeamType("mentors")}
            >
              <span>👥</span>
              <div>
                <h4>Mentors</h4>
                <p>Add new mentor to the team</p>
              </div>
            </button>
            <button
              className="team-type-btn"
              onClick={() => setCurrentTeamType("management")}
            >
              <span>💼</span>
              <div>
                <h4>Management Team</h4>
                <p>Add new management team member</p>
              </div>
            </button>
            <button
              className="team-type-btn"
              onClick={() => setCurrentTeamType("board-trustees")}
            >
              <span>🏛️</span>
              <div>
                <h4>Board of Trustees</h4>
                <p>Add new board trustee</p>
              </div>
            </button>
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
          <button
            className="btn-primary"
            onClick={() => {
              setTeamAction("add");
              setCurrentTeamType(null);
            }}
          >
            + Add User
          </button>
        </div>

        {/* Mentors Section */}
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
                    <th>Actions</th>
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
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(mentor, "mentors")}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(mentor.id, "mentors")}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Management Team Section */}
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {management.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.position}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(member, "management")}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() =>
                              handleDelete(member.id, "management")
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Board of Trustees Section */}
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
                    <th>Actions</th>
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
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() =>
                              handleEdit(trustee, "board-trustees")
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() =>
                              handleDelete(trustee.id, "board-trustees")
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
      const response = await axios.get(`${API_BASE}/media/${currentMediaType}`);
      setMediaItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${currentMediaType}:`, error);
      alert(`Error fetching ${currentMediaType}: ${error.message}`);
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
              }}
            >
              + Add {currentMediaType ? currentMediaType.slice(0, -1) : "Media"}
            </button>
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

                  <div className="item-actions">
                    <button
                      className={`status-toggle-btn ${
                        item.is_published ? "btn-inactive" : "btn-active"
                      }`}
                      onClick={() =>
                        handleMediaStatusToggle(item.id, !item.is_published)
                      }
                    >
                      {item.is_published ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() => handleMediaEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleMediaDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
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

      // Append form data based on media type requirements
      formData.append("title", mediaForm.title);
      formData.append("description", mediaForm.description);

      // Add content for types that need it
      if (["stories", "blogs"].includes(currentMediaType)) {
        formData.append("content", mediaForm.content);
      }

      // Add specific fields for different media types
      switch (currentMediaType) {
        case "events":
          formData.append("date", new Date().toISOString().split("T")[0]);
          formData.append("time", "12:00");
          formData.append("location", "TBD");
          break;
        case "blogs":
          formData.append("author", "Admin");
          formData.append("tags", JSON.stringify([]));
          break;
        case "documentaries":
          formData.append("video_url", "");
          formData.append("duration", "0:00");
          break;
      }

      // Handle file uploads
      if (mediaForm.image) {
        formData.append("image", mediaForm.image);
      }
      if (mediaForm.pdf) {
        formData.append("file", mediaForm.pdf); // Note: backend expects 'file' for newsletters
      }

      formData.append("published_date", new Date().toISOString().split("T")[0]);
      formData.append("is_published", mediaForm.is_active);

      const endpoint = editingMediaId
        ? `${API_BASE}/media/${currentMediaType}/${editingMediaId}`
        : `${API_BASE}/media/${currentMediaType}`;

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const response = editingMediaId
        ? await axios.put(endpoint, formData, config)
        : await axios.post(endpoint, formData, config);

      alert(
        `${currentMediaType.slice(0, -1)} ${
          editingMediaId ? "updated" : "created"
        } successfully!`
      );

      // Refresh the data
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
      setImagePreview(null);

      // Refresh the media list
      fetchMediaData();
    } catch (error) {
      console.error("Error saving media:", error);
      alert(
        `Error saving media: ${error.response?.data?.error || error.message}`
      );
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
      is_active: item.is_published || true,
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
      await axios.patch(`${API_BASE}/media/${currentMediaType}/${id}/publish`, {
        is_published: newStatus,
      });
      alert(`Item ${newStatus ? "published" : "unpublished"} successfully!`);
      fetchMediaData();
    } catch (error) {
      console.error("Error toggling media status:", error);
      alert(`Error updating status: ${error.message}`);
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
      await axios.delete(`${API_BASE}/media/${currentMediaType}/${id}`);
      alert(`${currentMediaType.slice(0, -1)} deleted successfully!`);
      fetchMediaData();
    } catch (error) {
      console.error("Error deleting media:", error);
      alert(`Error deleting item: ${error.message}`);
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
                ].map((type) => (
                  <div
                    key={type}
                    className="media-type-card"
                    onClick={() => setCurrentMediaType(type)}
                  >
                    <h4>
                      {getMediaTypeIcon(type)}{" "}
                      {type.charAt(0).toUpperCase() +
                        type.slice(1).replace("_", " ")}
                    </h4>
                    <p>{getMediaTypeDescription(type)}</p>
                  </div>
                ))}
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
                ].map((category) => (
                  <div
                    key={category}
                    className="media-type-card"
                    onClick={() => setCurrentOurWorkCategory(category)}
                  >
                    <h4>
                      {getOurWorkCategoryIcon(category)}{" "}
                      {getOurWorkCategoryLabel(category)}
                    </h4>
                    <p>{getOurWorkCategoryDescription(category)}</p>
                  </div>
                ))}
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
        return (
          <div className="content-list">
            <div className="content-header">
              <div className="header-row">
                <h3>Legal Reports</h3>
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
                  }}
                >
                  + Add Report
                </button>
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

                            <button
                              className="btn-edit"
                              onClick={() => {
                                setLegalReportAction("update");
                                handleEdit(report, "reports");
                              }}
                            >
                              Edit
                            </button>

                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(report.id, "reports")}
                            >
                              Delete
                            </button>
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
                  }}
                >
                  + Add Opening
                </button>
              </div>

              <div className="filter-options">
                <select
                  value={careerAction}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setCareerAction(selectedValue);
                    setEditingId(null);
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

                        <div className="item-actions">
                          {/* Status Toggle Buttons */}
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

                          {/* Edit Button */}
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setCareerAction("update");
                              handleEdit(career, "careers");
                            }}
                          >
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(career.id, "careers")}
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
  };

  const handleTeamAction = (action) => {
    if (action === "team") {
      setTeamAction("view");
    } else if (action === "add") {
      setTeamAction("add");
      setCurrentTeamType(null);
    } else if (action === "update") {
      setTeamAction("update");
      setCurrentTeamType(null);
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
            {canManageContent && (
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
                    ].map((category) => (
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
                                  handleInterventionsAction(category, "view")
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
                            <li>
                              <button
                                onClick={() =>
                                  handleInterventionsAction(category, "add")
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
                            <li>
                              <button
                                onClick={() =>
                                  handleInterventionsAction(category, "update")
                                }
                                className={
                                  currentOurWorkCategory === category &&
                                  interventionsAction === "update"
                                    ? "active-sub"
                                    : ""
                                }
                              >
                                ✏️ Update {getOurWorkCategoryLabel(category)}
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* Media Corner with Sub Dropdown */}
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
                  ].map((type) => (
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
                          <span>{mediaSubDropdown === type ? "▴" : "▾"}</span>
                        </button>
                      </div>

                      {mediaSubDropdown === type && (
                        <ul className="media-submenu">
                          <li>
                            <button
                              onClick={() => handleMediaAction(type, "view")}
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
                          <li>
                            <button
                              onClick={() => handleMediaAction(type, "add")}
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
                          <li>
                            <button
                              onClick={() => handleMediaAction(type, "update")}
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
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Impact Data */}
            {canManageContent && (
              <li className={activeTab === "impact" ? "active" : ""}>
                <button
                  onClick={() => {
                    setActiveTab("impact");
                    setOpenDropdown(null);
                  }}
                >
                  Impact Data
                </button>
              </li>
            )}

            {/* Banner Management */}
            {canManageContent && (
              <li className={activeTab === "banners" ? "active" : ""}>
                <button
                  onClick={() => {
                    if (openDropdown === "banners") {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown("banners");
                      setActiveTab("banners");
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
                    <li>
                      <button
                        onClick={() => {
                          handleBannerAction("add");
                        }}
                      >
                        Add Banner
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleBannerAction("update");
                        }}
                      >
                        Update Banner
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* Accreditations Section */}
            <li className={activeTab === "accreditations" ? "active" : ""}>
              <button
                onClick={() => {
                  if (openDropdown === "accreditations") {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown("accreditations");
                    setActiveTab("accreditations");
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
                  <li>
                    <button
                      onClick={() => {
                        handleAccreditationAction("add");
                      }}
                    >
                      Add Accreditation
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleAccreditationAction("update");
                      }}
                    >
                      Update Accreditation
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* Team */}
            <li className={activeTab === "our-team" ? "active" : ""}>
              <button
                onClick={() => {
                  if (openDropdown === "our-team") {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown("our-team");
                    setActiveTab("our-team");
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
                </ul>
              )}
            </li>

            {/* Career */}
            <li className={activeTab === "careers" ? "active" : ""}>
              <button
                onClick={() => {
                  if (openDropdown === "careers") {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown("careers");
                    setActiveTab("careers");
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
                </ul>
              )}
            </li>

            {/* Legal Report */}
            <li className={activeTab === "reports" ? "active" : ""}>
              <button
                onClick={() => {
                  if (openDropdown === "reports") {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown("reports");
                    setActiveTab("reports");
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
                </ul>
              )}
            </li>

            {/* User Management */}
            {canManageUsers && (
              <li
                className={
                  activeTab === "users" || activeTab === "registrations"
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
                    }
                  }}
                >
                  User Management {openDropdown === "users" ? "▴" : "▾"}
                </button>
                {openDropdown === "users" && (
                  <ul className="submenu">
                    <li>
                      <button
                        className={activeTab === "users" ? "active-sub" : ""}
                        onClick={() => {
                          setActiveTab("users");
                          setOpenDropdown(null);
                        }}
                      >
                        Users
                      </button>
                    </li>
                    <li>
                      <button
                        className={
                          activeTab === "registrations" ? "active-sub" : ""
                        }
                        onClick={() => {
                          setActiveTab("registrations");
                          setOpenDropdown(null);
                        }}
                      >
                        Registration Requests
                      </button>
                    </li>
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
                      } else {
                        setCurrentMediaType(null);
                      }
                      setMediaForm({
                        title: "",
                        description: "",
                        content: "",
                        image: null,
                        pdf: null,
                        is_active: true,
                      });
                    }}
                  >
                    ← Back to{" "}
                    {mediaAction !== "view" ? currentMediaType : "Media Corner"}
                  </button>
                  {mediaAction === "view" && (
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
                      }}
                    >
                      + Add {currentMediaType.slice(0, -1)}
                    </button>
                  )}
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
          ) : activeTab === "users" && canManageUsers ? (
            <UserManagement />
          ) : activeTab === "registrations" && canManageUsers ? (
            <RegistrationRequests />
          ) : activeTab === "impact" && canManageContent ? (
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