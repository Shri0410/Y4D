import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from './UserManagement';
import RegistrationRequests from './RegistrationRequests';
import MediaManager from './MediaManager';
import OurWorkManagement from './OurWorkManagement'; 
import ImpactDataEditor from './ImpactDataEditor';
import './Dashboard.css';

const Dashboard = ({ currentUser: propCurrentUser }) => {
  const [activeTab, setActiveTab] = useState('ourWork');
  const [reports, setReports] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [boardTrustees, setBoardTrustees] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);

  // Sub-selections
  const [currentMediaType, setCurrentMediaType] = useState(null);
  const [currentOurWorkCategory, setCurrentOurWorkCategory] = useState(null); 
  const [currentTeamType, setCurrentTeamType] = useState(null);
  const [teamAction, setTeamAction] = useState('view'); // 'view', 'add', 'update'
  
  // Career dropdown state
  const [careerAction, setCareerAction] = useState('current'); // 'current', 'add', 'update'
  
  // Legal Report action state
  const [legalReportAction, setLegalReportAction] = useState('view'); // 'view', 'add', 'update'

  // Sidebar dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Form states
  const [reportForm, setReportForm] = useState({ title: '', description: '', content: '', image: null });
  const [mentorForm, setMentorForm] = useState({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  const [managementForm, setManagementForm] = useState({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  const [careerForm, setCareerForm] = useState({ title: '', description: '', requirements: '', location: '', type: 'full-time', is_active: true });  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const canManageContent = currentUser && ['super_admin', 'admin', 'editor'].includes(currentUser.role);
  const canManageUsers = currentUser && ['super_admin', 'admin'].includes(currentUser.role);
  const API_BASE = 'http://localhost:5000/api';

  // Clear sub-sections when switching tabs
  useEffect(() => {
    setCurrentMediaType(null);
    setCurrentOurWorkCategory(null);
    setCurrentTeamType(null);
    setTeamAction('view');
    setCareerAction('current');
    setLegalReportAction('view');
  }, [activeTab]);
useEffect(() => {
  console.log('Careers data updated:', careers);
}, [careers]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dashboard-sidebar')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    if (!currentUser) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
    
    // Fetch data based on active tab
    if (activeTab === 'our-team' && teamAction === 'view') {
      fetchAllTeamData();
    } else if (activeTab === 'careers') {
      fetchData('careers');
    } else if (activeTab === 'reports') {
      fetchData('reports');
    } else if (activeTab !== 'media' && !currentMediaType && 
        activeTab !== 'ourWork' && !currentOurWorkCategory && 
        activeTab !== 'impact' && activeTab !== 'users' && activeTab !== 'registrations') {
      fetchData(activeTab);
    }
  }, [activeTab, currentUser, currentMediaType, currentOurWorkCategory, teamAction]);

  const fetchAllTeamData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, managementRes, trusteesRes] = await Promise.all([
        axios.get(`${API_BASE}/mentors`),
        axios.get(`${API_BASE}/management`),
        axios.get(`${API_BASE}/board-trustees`)
      ]);
      
      setMentors(mentorsRes.data);
      setManagement(managementRes.data);
      setBoardTrustees(trusteesRes.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
      alert(`Error fetching team data: ${error.message}`);
    }
    setLoading(false);
  };

  const fetchData = async (type) => {
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'reports':
          response = await axios.get(`${API_BASE}/reports`);
          setReports(response.data);
          break;
        case 'mentors':
          response = await axios.get(`${API_BASE}/mentors`);
          setMentors(response.data);
          break;
        case 'management':
          response = await axios.get(`${API_BASE}/management`);
          setManagement(response.data);
          break;
        case 'careers':
          response = await axios.get(`${API_BASE}/careers`);
          setCareers(response.data);
          console.log('Fetched careers:', response.data); // Debug log
          break;
        case 'board-trustees': 
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
    setFormFunction(prev => ({ ...prev, image: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };
const handlePdfChange = (e, setFormFunction) => {
  const file = e.target.files[0];
  setFormFunction(prev => ({ ...prev, pdf: file }));
};
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let formData = new FormData();
      let endpoint = '';

      switch (type) {
case 'reports':
  const reportFormData = new FormData();
  
  // Append all form fields
  reportFormData.append('title', reportForm.title);
  reportFormData.append('description', reportForm.description);
  reportFormData.append('content', reportForm.content);
  
  // Append files if they exist
  if (reportForm.image) {
    reportFormData.append('image', reportForm.image);
  }
  if (reportForm.pdf) {
    reportFormData.append('pdf', reportForm.pdf);
  }
  
  endpoint = editingId ? `${API_BASE}/reports/${editingId}` : `${API_BASE}/reports`;
  
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    await (editingId ? axios.put(endpoint, reportFormData, config) : axios.post(endpoint, reportFormData, config));
    
    setReportForm({ title: '', description: '', content: '', image: null, pdf: null });
    setLegalReportAction('view');
    setImagePreview(null);
    
    // Refresh the reports list
    fetchData('reports');
    alert(`Report ${editingId ? 'updated' : 'created'} successfully!`);
  } catch (error) {
    console.error('Error saving report:', error);
    alert(`Error saving report: ${error.response?.data?.error || error.message}`);
  }
  break;
        
        case 'mentors':
          Object.keys(mentorForm).forEach(key => {
            if (key === 'image' && mentorForm.image) {
              formData.append('image', mentorForm.image);
            } else {
              formData.append(key, mentorForm[key]);
            }
          });
          endpoint = editingId ? `${API_BASE}/mentors/${editingId}` : `${API_BASE}/mentors`;
          await (editingId ? axios.put(endpoint, formData) : axios.post(endpoint, formData));
          setMentorForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
          break;
        
        case 'management':
          Object.keys(managementForm).forEach(key => {
            if (key === 'image' && managementForm.image) {
              formData.append('image', managementForm.image);
            } else {
              formData.append(key, managementForm[key]);
            }
          });
          endpoint = editingId ? `${API_BASE}/management/${editingId}` : `${API_BASE}/management`;
          await (editingId ? axios.put(endpoint, formData) : axios.post(endpoint, formData));
          setManagementForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
          break;
        
        case 'careers':
          endpoint = editingId ? `${API_BASE}/careers/${editingId}` : `${API_BASE}/careers`;
          await (editingId ? axios.put(endpoint, careerForm) : axios.post(endpoint, careerForm));
          setCareerForm({ title: '', description: '', requirements: '', location: '', type: 'full-time', status: 'active' });
          setCareerAction('current');
          break;
        
        case 'board-trustees': 
          Object.keys(trusteeForm).forEach(key => {
            if (key === 'image' && trusteeForm.image) {
              formData.append('image', trusteeForm.image);
            } else {
              formData.append(key, trusteeForm[key]);
            }
          });
          endpoint = editingId ? `${API_BASE}/board-trustees/${editingId}` : `${API_BASE}/board-trustees`;
          await (editingId ? axios.put(endpoint, formData) : axios.post(endpoint, formData));
          setTrusteeForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
          break;

        default:
          break;
      }

      setEditingId(null);
      setImagePreview(null);
      setTeamAction('view');
      fetchAllTeamData();
      fetchData(type);
      alert(`${type.slice(0, -1)} ${editingId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      alert(`Error saving ${type}: ${error.message}`);
    }
    setLoading(false);
  };

  const handleEdit = (item, type) => {
    setEditingId(item.id);
    
    if (type === 'reports') {
      setLegalReportAction('update');
    } else if (type === 'careers') {
      setCareerAction('update');
    } else {
      setTeamAction('update');
      setCurrentTeamType(type);
    }
    
    switch (type) {
      case 'reports':
  setLegalReportAction('update');
  setReportForm({
    title: item.title,
    description: item.description,
    content: item.content,
    image: null,
    pdf: null
  });
  if (item.image) setImagePreview(`${API_BASE}/uploads/reports/${item.image}`);
  break;
      case 'careers':
        setCareerForm({
          title: item.title,
          description: item.description,
          requirements: item.requirements,
          location: item.location,
          type: item.type,
          is_active: item.is_active
        });
        break;
      case 'mentors':
        setMentorForm({
          name: item.name,
          position: item.position,
          bio: item.bio,
          image: null,
          social_links: JSON.stringify(item.social_links || {})
        });
        if (item.image) setImagePreview(`${API_BASE}/uploads/mentors/${item.image}`);
        break;
      case 'management':
        setManagementForm({
          name: item.name,
          position: item.position,
          bio: item.bio,
          image: null,
          social_links: JSON.stringify(item.social_links || {})
        });
        if (item.image) setImagePreview(`${API_BASE}/uploads/management/${item.image}`);
        break;
      case 'board-trustees': 
        setTrusteeForm({
          name: item.name,
          position: item.position,
          bio: item.bio,
          image: null,
          social_links: JSON.stringify(item.social_links || {})
        });
        if (item.image) setImagePreview(`${API_BASE}/uploads/board-trustees/${item.image}`);
        break;
      default:
        break;
    }
  };
const handleStatusToggle = async (id, newStatus) => {
  if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this career opening?`)) return;
  
  setLoading(true);
  try {
    await axios.put(`${API_BASE}/careers/${id}`, {
      ...careers.find(c => c.id === id),
      is_active: newStatus
    });
    
    alert(`Career opening ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    fetchData('careers'); // Refresh the careers data
  } catch (error) {
    console.error('Error toggling career status:', error);
    alert(`Error updating career status: ${error.message}`);
  }
  setLoading(false);
};
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
    
    setLoading(true);
    try {
      let endpoint = `${API_BASE}/${type}`;
      
      if (type === 'board-trustees') {
        endpoint = `${API_BASE}/board-trustees`;
      }
      
      const response = await axios.delete(`${endpoint}/${id}`);
      
      if (response.data) {
        console.log('Delete successful:', response.data);
        alert(`${type.slice(0, -1)} deleted successfully!`);
      } else {
        console.log('Delete successful (no content returned)');
        alert(`${type.slice(0, -1)} deleted successfully!`);
      }
      
      fetchAllTeamData();
      fetchData(type);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        alert(`Error deleting ${type}: ${error.response.data?.error || error.message}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert(`Error deleting ${type}: No response from server`);
      } else {
        console.error('Error message:', error.message);
        alert(`Error deleting ${type}: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const cancelEdit = () => {
  setEditingId(null);
  setTeamAction('view');
  setCurrentTeamType(null);
  setCareerAction('all'); // Changed from 'current' to 'all'
  setLegalReportAction('view');
  setReportForm({ title: '', description: '', content: '', image: null, pdf: null });
  setMentorForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  setManagementForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  setCareerForm({ title: '', description: '', requirements: '', location: '', type: 'full-time', is_active: true });
  setTrusteeForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  setImagePreview(null);
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin';
  };

  // Helpers for Media & OurWork cards
  const getMediaTypeIcon = (type) => {
    const icons = { newsletters: '📰', stories: '📖', events: '🎉', blogs: '✍️', documentaries: '🎬' };
    return icons[type] || '📁';
  };

  const getMediaTypeDescription = (type) => {
    const descriptions = {
      newsletters: 'Manage monthly newsletters and publications',
      stories: 'Share inspiring success stories',
      events: 'Manage upcoming events and workshops',
      blogs: 'Create and manage blog posts',
      documentaries: 'Upload and manage video content'
    };
    return descriptions[type] || 'Manage content';
  };

  const getOurWorkCategoryIcon = (category) => {
    const icons = {
      quality_education: '🎓',
      livelihood: '💼',
      healthcare: '🏥',
      environment_sustainability: '🌱',
      integrated_development: '🤝'
    };
    return icons[category] || '📁';
  };

  const getOurWorkCategoryLabel = (category) => {
    const labels = {
      quality_education: 'Quality Education',
      livelihood: 'Livelihood',
      healthcare: 'Healthcare',
      environment_sustainability: 'Environment Sustainability',
      integrated_development: 'Integrated Development (IDP)'
    };
    return labels[category] || category;
  };

  const getOurWorkCategoryDescription = (category) => {
    const descriptions = {
      quality_education: 'Manage quality education programs and initiatives',
      livelihood: 'Manage livelihood and employment programs',
      healthcare: 'Manage healthcare services and initiatives',
      environment_sustainability: 'Manage environmental sustainability programs',
      integrated_development: 'Manage integrated development programs'
    };
    return descriptions[category] || 'Manage content';
  };

  const renderTeamForm = () => {
    if (!currentTeamType) {
      return (
        <div className="team-type-selection">
          <h3>Select Team Type</h3>
          <div className="team-type-options">
            <button 
              className="team-type-btn"
              onClick={() => setCurrentTeamType('mentors')}
            >
              <span>👥</span>
              <div>
                <h4>Mentors</h4>
                <p>Add new mentor to the team</p>
              </div>
            </button>
            <button 
              className="team-type-btn"
              onClick={() => setCurrentTeamType('management')}
            >
              <span>💼</span>
              <div>
                <h4>Management Team</h4>
                <p>Add new management team member</p>
              </div>
            </button>
            <button 
              className="team-type-btn"
              onClick={() => setCurrentTeamType('board-trustees')}
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
      case 'mentors':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'mentors')} className="dashboard-form">
            <h3>{editingId ? 'Edit' : 'Add New'} Mentor</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={mentorForm.name}
                onChange={(e) => setMentorForm({...mentorForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={mentorForm.position}
                onChange={(e) => setMentorForm({...mentorForm, position: e.target.value})}
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
                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Mentor
              </button>
              <button type="button" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        );
      
      case 'management':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'management')} className="dashboard-form">
            <h3>{editingId ? 'Edit' : 'Add New'} Management Member</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={managementForm.name}
                onChange={(e) => setManagementForm({...managementForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={managementForm.position}
                onChange={(e) => setManagementForm({...managementForm, position: e.target.value})}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Member
              </button>
              <button type="button" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        );
      
      case 'board-trustees':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'board-trustees')} className="dashboard-form">
            <h3>{editingId ? 'Edit' : 'Add New'} Board Trustee</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={trusteeForm.name}
                onChange={(e) => setTrusteeForm({...trusteeForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={trusteeForm.position}
                onChange={(e) => setTrusteeForm({...trusteeForm, position: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Trustee
              </button>
              <button type="button" onClick={cancelEdit}>Cancel</button>
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
              setTeamAction('add');
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
                  {mentors.map(mentor => (
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
                            onClick={() => handleEdit(mentor, 'mentors')}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(mentor.id, 'mentors')}
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
                  {management.map(member => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.position}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(member, 'management')}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(member.id, 'management')}
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
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boardTrustees.map(trustee => (
                    <tr key={trustee.id}>
                      <td>{trustee.name}</td>
                      <td>{trustee.position}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(trustee, 'board-trustees')}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(trustee.id, 'board-trustees')}
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

  const renderCareerForm = () => {
  return (
    <div className="content-list">
      <div className="content-header">
        <div className="header-row">
          <button 
            className="btn-back"
            onClick={() => {
              setCareerAction('all');
              setEditingId(null);
              cancelEdit();
            }}
          >
            ← Back to Openings
          </button>
          <h3>{editingId ? 'Edit Career Opening' : 'Add New Career Opening'}</h3>
        </div>
      </div>
      
      <form onSubmit={(e) => handleSubmit(e, 'careers')} className="dashboard-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={careerForm.title}
            onChange={(e) => setCareerForm({...careerForm, title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={careerForm.description}
            onChange={(e) => setCareerForm({...careerForm, description: e.target.value})}
            required
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Requirements:</label>
          <textarea
            value={careerForm.requirements}
            onChange={(e) => setCareerForm({...careerForm, requirements: e.target.value})}
            required
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            value={careerForm.location}
            onChange={(e) => setCareerForm({...careerForm, location: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Type:</label>
          <select
            value={careerForm.type}
            onChange={(e) => setCareerForm({...careerForm, type: e.target.value})}
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
            onChange={(e) => setCareerForm({...careerForm, is_active: e.target.value === 'true'})}
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Opening
          </button>
          <button type="button" onClick={() => {
            setCareerAction('all');
            cancelEdit();
          }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

  const renderLegalReportForm = () => {
  return (
    <div className="content-list">
      <div className="content-header">
        <div className="header-row">
          <button 
            className="btn-back"
            onClick={() => {
              setLegalReportAction('view');
              setEditingId(null);
              cancelEdit();
            }}
          >
            ← Back to Reports
          </button>
          <h3>{editingId ? 'Edit Legal Report' : 'Add New Legal Report'}</h3>
        </div>
      </div>
      
      <form onSubmit={(e) => handleSubmit(e, 'reports')} className="dashboard-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={reportForm.title}
            onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={reportForm.description}
            onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
            required
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Content:</label>
          <textarea
            value={reportForm.content}
            onChange={(e) => setReportForm({...reportForm, content: e.target.value})}
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
            {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Report
          </button>
          <button type="button" onClick={() => {
            setLegalReportAction('view');
            cancelEdit();
          }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

  const renderForm = () => {
    if (activeTab === 'our-team') {
      if (teamAction === 'view') {
        return renderTeamView();
      } else if (teamAction === 'add' || teamAction === 'update') {
        return renderTeamForm();
      }
    }

    if (activeTab === 'careers') {
      return null;
    }

    if (activeTab === 'reports') {
      return null;
    }

    switch (activeTab) {
      case 'media':
        if (!currentMediaType) {
          return (
            <div className="media-dashboard">
              <h3>Media Corner</h3>
              <div className="media-types-grid">
                {['newsletters', 'stories', 'events', 'blogs', 'documentaries'].map(type => (
                  <div key={type} className="media-type-card" onClick={() => setCurrentMediaType(type)}>
                    <h4>{getMediaTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</h4>
                    <p>{getMediaTypeDescription(type)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;

      case 'ourWork':
        if (!currentOurWorkCategory) {
          return (
            <div className="media-dashboard">
              <h3>Our Interventions</h3>
              <div className="media-types-grid">
                {['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development'].map(category => (
                  <div key={category} className="media-type-card" onClick={() => setCurrentOurWorkCategory(category)}>
                    <h4>{getOurWorkCategoryIcon(category)} {getOurWorkCategoryLabel(category)}</h4>
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
    if (activeTab === 'our-team') {
      return null;
    }

    if (loading) return <div className="loading">Loading...</div>;
    
    switch (activeTab) {
      case 'reports':
  return (
    <div className="content-list">
      <div className="content-header">
        <div className="header-row">
          <h3>Legal Reports</h3>
          <button 
            className="btn-primary"
            onClick={() => {
              setLegalReportAction('add');
              setEditingId(null);
              setReportForm({ title: '', description: '', content: '', image: null, pdf: null });
              setImagePreview(null);
            }}
          >
            + Add Report
          </button>
        </div>
      </div>
      
      {legalReportAction === 'add' || legalReportAction === 'update' ? (
        renderLegalReportForm()
      ) : (
        <>
          {reports.length === 0 ? (
            <p>No reports found</p>
          ) : (
            <div className="items-grid">
              {reports.map(report => (
                <div key={report.id} className="item-card">
                  {/* Display Image if exists */}
                  {report.image && (
                    <div className="item-image">
                      <img 
                        src={`${API_BASE}/uploads/reports/${report.image}`} 
                        alt={report.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
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
                          onClick={() => window.open(`${API_BASE}/uploads/reports/${report.pdf}`, '_blank')}
                        >
                          View PDF
                        </button>
                      )}
                      
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          setLegalReportAction('update');
                          handleEdit(report, 'reports');
                        }}
                      >
                        Edit
                      </button>
                      
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(report.id, 'reports')}
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
      
case 'careers':
  // Filter careers based on selected filter
  const getFilteredCareers = () => {
    switch (careerAction) {
      case 'active':
        return careers.filter(career => {
          return career.is_active === true || career.is_active === 1 || career.is_active === 'true' ||
                 career.status === 'active' || career.status === true || career.status === 1;
        });
      case 'inactive':
        return careers.filter(career => {
          return career.is_active === false || career.is_active === 0 || career.is_active === 'false' ||
                 career.status === 'inactive' || career.status === false || career.status === 0 ||
                 career.is_active === null || career.is_active === undefined;
        });
      case 'all':
      default:
        return careers;
    }
  };

  const filteredCareers = getFilteredCareers();
  
  // FIX: Only show form when explicitly in add/update mode
  if (careerAction === 'add' || careerAction === 'update') {
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
              setCareerAction('add');
              setEditingId(null);
              setCareerForm({ title: '', description: '', requirements: '', location: '', type: 'full-time', is_active: true });
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
            <option value="active">Active Openings ({careers.filter(c => {
              return c.is_active === true || c.is_active === 1 || c.is_active === 'true' ||
                     c.status === 'active' || c.status === true || c.status === 1;
            }).length})</option>
            <option value="inactive">Inactive Openings ({careers.filter(c => {
              return c.is_active === false || c.is_active === 0 || c.is_active === 'false' ||
                     c.status === 'inactive' || c.status === false || c.status === 0 ||
                     c.is_active === null || c.is_active === undefined;
            }).length})</option>
          </select>
        </div>
      </div>
      
      {filteredCareers.length === 0 ? (
        <div className="no-data-message">
          <p>No career openings found for "{careerAction}" filter</p>
        </div>
      ) : (
        <div className="items-list">
          {filteredCareers.map(career => {
            const isActive = career.is_active === true || career.is_active === 1 || career.is_active === 'true' ||
                            career.status === 'active' || career.status === true || career.status === 1;
            
            return (
              <div key={career.id} className="item-card" style={{
                borderLeft: `4px solid ${isActive ? '#4CAF50' : '#ff9800'}`
              }}>
                <div className="item-content">
                  <div className="career-header">
                    <h4>{career.title}</h4>
                    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p><strong>Location:</strong> {career.location}</p>
                  <p><strong>Type:</strong> {career.type}</p>
                  <p><strong>Created:</strong> {career.created_at ? new Date(career.created_at).toLocaleDateString() : 'N/A'}</p>
                  
                  <div className="career-description">
                    <strong>Description:</strong>
                    <div dangerouslySetInnerHTML={{ __html: 
                      career.description ? career.description.substring(0, 150) + '...' : 'No description available'
                    }} />
                  </div>
                  
                  <div className="item-actions">
                    {/* Status Toggle Buttons */}
                    <button 
                      className={`status-toggle-btn ${isActive ? 'btn-inactive' : 'btn-active'}`}
                      onClick={() => handleStatusToggle(career.id, !isActive)}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    {/* Edit Button */}
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setCareerAction('update');
                        handleEdit(career, 'careers');
                      }}
                    >
                      Edit
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(career.id, 'careers')}
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
    setTeamAction('view');
    setCareerAction('current');
    setLegalReportAction('view');
  };

  const handleTeamAction = (action) => {
    if (action === 'team') {
      setTeamAction('view');
    } else if (action === 'add') {
      setTeamAction('add');
      setCurrentTeamType(null);
    } else if (action === 'update') {
      setTeamAction('update');
      setCurrentTeamType(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        {currentUser && (
          <div className="user-info">
            <span>Welcome, {currentUser.username} ({currentUser.role})</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        )}
      </header>
      
      <div className="dashboard-container">
        <nav className="dashboard-sidebar">
          <ul>
            {/* 1) Interventions */}
            {canManageContent && (
              <li className={activeTab === 'ourWork' ? 'active' : ''}>
                <button
                  onClick={() => {
                    if (openDropdown === 'ourWork') {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown('ourWork');
                      setActiveTab('ourWork');
                    }
                  }}
                >
                  Interventions {openDropdown === 'ourWork' ? '▴' : '▾'}
                </button>
                {openDropdown === 'ourWork' && (
                  <ul className="submenu">
                    {['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development'].map(category => (
                      <li key={category}>
                        <button
                          className={currentOurWorkCategory === category ? 'active-sub' : ''}
                          onClick={() => {
                            setCurrentOurWorkCategory(category);
                            setOpenDropdown(null);
                          }}
                        >
                          {getOurWorkCategoryLabel(category)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* 2) Media */}
            <li className={activeTab === 'media' ? 'active' : ''}>
              <button
                onClick={() => {
                  if (openDropdown === 'media') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown('media');
                    setActiveTab('media');
                  }
                }}
              >
                Media Corner {openDropdown === 'media' ? '▴' : '▾'}
              </button>
              {openDropdown === 'media' && (
                <ul className="submenu">
                  {['newsletters', 'stories', 'events', 'blogs', 'documentaries'].map(type => (
                    <li key={type}>
                      <button
                        className={currentMediaType === type ? 'active-sub' : ''}
                        onClick={() => {
                          setCurrentMediaType(type);
                          setOpenDropdown(null);
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* 3) Impact Data */}
            {canManageContent && (
              <li className={activeTab === 'impact' ? 'active' : ''}>
                <button onClick={() => selectTopLevelTab('impact')}>
                  Impact Data
                </button>
              </li>
            )}

            {/* 4) Our Team with dropdown in sidebar */}
            <li className={activeTab === 'our-team' ? 'active' : ''}>
              <button
                onClick={() => {
                  if (openDropdown === 'our-team') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown('our-team');
                    setActiveTab('our-team');
                  }
                }}
              >
                Team {openDropdown === 'our-team' ? '▴' : '▾'}
              </button>
              {openDropdown === 'our-team' && (
                <ul className="submenu">
                  <li>
                    <button
                      onClick={() => {
                        handleTeamAction('team');
                        setOpenDropdown(null);
                      }}
                    >
                      Team
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleTeamAction('add');
                        setOpenDropdown(null);
                      }}
                    >
                      Add User
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleTeamAction('update');
                        setOpenDropdown(null);
                      }}
                    >
                      Update User
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 5) Career with dropdown in sidebar */}
            <li className={activeTab === 'careers' ? 'active' : ''}>
              <button
                onClick={() => {
                  if (openDropdown === 'careers') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown('careers');
                    setActiveTab('careers');
                  }
                }}
              >
                Career {openDropdown === 'careers' ? '▴' : '▾'}
              </button>
              {openDropdown === 'careers' && (
                <ul className="submenu">
                  <li>
                    <button
                      onClick={() => {
                        setCareerAction('current');
                        setOpenDropdown(null);
                      }}
                    >
                      Career
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setCareerAction('add');
                        setOpenDropdown(null);
                      }}
                    >
                      Add Opening
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setCareerAction('update');
                        setOpenDropdown(null);
                      }}
                    >
                      Update Opening
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 6) Report with dropdown in sidebar */}
            <li className={activeTab === 'reports' ? 'active' : ''}>
              <button
                onClick={() => {
                  if (openDropdown === 'reports') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown('reports');
                    setActiveTab('reports');
                  }
                }}
              >
                Legal Report {openDropdown === 'reports' ? '▴' : '▾'}
              </button>
              {openDropdown === 'reports' && (
                <ul className="submenu">
                  <li>
                    <button
                      onClick={() => {
                        setLegalReportAction('view');
                        setOpenDropdown(null);
                      }}
                    >
                      Show Legal Reports
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setLegalReportAction('add');
                        setOpenDropdown(null);
                      }}
                    >
                      Add Report
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setLegalReportAction('update');
                        setOpenDropdown(null);
                      }}
                    >
                      Update Report
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 7) User management */}
            {canManageUsers && (
              <li className={(activeTab === 'users' || activeTab === 'registrations') ? 'active' : ''}>
                <button
                  onClick={() => {
                    if (openDropdown === 'users') {
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown('users');
                      setActiveTab('users');
                    }
                  }}
                >
                  User Management {openDropdown === 'users' ? '▴' : '▾'}
                </button>
                {openDropdown === 'users' && (
                  <ul className="submenu">
                    <li>
                      <button
                        className={activeTab === 'users' ? 'active-sub' : ''}
                        onClick={() => {
                          setActiveTab('users');
                          setOpenDropdown(null);
                        }}
                      >
                        Users
                      </button>
                    </li>
                    <li>
                      <button
                        className={activeTab === 'registrations' ? 'active-sub' : ''}
                        onClick={() => {
                          setActiveTab('registrations');
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
    <MediaManager 
      mediaType={currentMediaType} 
      onClose={() => setCurrentMediaType(null)}
    />
  ) : currentOurWorkCategory ? (
    <OurWorkManagement 
      category={currentOurWorkCategory}
      onClose={() => setCurrentOurWorkCategory(null)}
    />
  ) : activeTab === 'users' && canManageUsers ? (
    <UserManagement />
  ) : activeTab === 'registrations' && canManageUsers ? (
    <RegistrationRequests />
  ) : activeTab === 'impact' && canManageContent ? (
    <ImpactDataEditor />
  ) : (
    <>
      {/* FIX: renderForm() now returns null for careers, so no duplicate form */}
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