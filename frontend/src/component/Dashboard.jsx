import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserManagement from './UserManagement';
import RegistrationRequests from './RegistrationRequests';
import MediaManager from './MediaManager';
import OurWorkManagement from './OurWorkManagement'; 
import ImpactDataEditor from './ImpactDataEditor';
import './Dashboard.css';

const Dashboard = ({ currentUser: propCurrentUser }) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);

  // Sub-selections
  const [currentMediaType, setCurrentMediaType] = useState(null);
  const [currentOurWorkCategory, setCurrentOurWorkCategory] = useState(null); 

  // NEW: sidebar dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Form states
  const [reportForm, setReportForm] = useState({ title: '', description: '', content: '', image: null });
  const [mentorForm, setMentorForm] = useState({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  const [managementForm, setManagementForm] = useState({ name: '', position: '', bio: '', image: null, social_links: '{}' });
  const [careerForm, setCareerForm] = useState({ title: '', description: '', requirements: '', location: '', type: 'full-time' });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const canManageContent = currentUser && ['super_admin', 'admin', 'editor'].includes(currentUser.role);
  const canManageUsers = currentUser && ['super_admin', 'admin'].includes(currentUser.role);
  const API_BASE = 'http://localhost:5000/api';

  // Clear sub-sections when switching tabs
  useEffect(() => {
    setCurrentMediaType(null);
    setCurrentOurWorkCategory(null);
  }, [activeTab]);

  useEffect(() => {
    if (!currentUser) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
    if (activeTab !== 'media' && !currentMediaType && activeTab !== 'ourWork' && !currentOurWorkCategory && activeTab !== 'impact') {
      fetchData(activeTab);
    }
  }, [activeTab, currentUser, currentMediaType, currentOurWorkCategory]);

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

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let formData = new FormData();
      let endpoint = '';

      switch (type) {
        case 'reports':
          Object.keys(reportForm).forEach(key => {
            if (key === 'image' && reportForm.image) {
              formData.append('image', reportForm.image);
            } else {
              formData.append(key, reportForm[key]);
            }
          });
          endpoint = editingId ? `${API_BASE}/reports/${editingId}` : `${API_BASE}/reports`;
          await (editingId ? axios.put(endpoint, formData) : axios.post(endpoint, formData));
          setReportForm({ title: '', description: '', content: '', image: null });
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
          setCareerForm({ title: '', description: '', requirements: '', location: '', type: 'full-time' });
          break;
        
        default:
          break;
      }

      setEditingId(null);
      setImagePreview(null);
      fetchData(activeTab);
      alert(`${type.slice(0, -1)} ${editingId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      alert(`Error saving ${type}: ${error.message}`);
    }
    setLoading(false);
  };

  const handleEdit = (item, type) => {
    setEditingId(item.id);
    switch (type) {
      case 'reports':
        setReportForm({
          title: item.title,
          description: item.description,
          content: item.content,
          image: null
        });
        if (item.image) setImagePreview(`${API_BASE}/uploads/reports/${item.image}`);
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
      case 'careers':
        setCareerForm({
          title: item.title,
          description: item.description,
          requirements: item.requirements,
          location: item.location,
          type: item.type
        });
        break;
      default:
        break;
    }
  };

// In your Dashboard.jsx, update the handleDelete function:
const handleDelete = async (id, type) => {
  if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
  
  setLoading(true);
  try {
    // Fix the endpoint - ensure it matches your API routes
    let endpoint = `${API_BASE}/${type}`;
    
    // Handle special cases where the type doesn't match the API endpoint
    if (type === 'management') {
      // management is already correct
    } else if (type === 'mentors' || type === 'reports' || type === 'careers') {
      // These are already correct (plural)
    } else {
      // For other types, make sure they're plural
      endpoint = `${API_BASE}/${type}s`;
    }
    
    const response = await axios.delete(`${endpoint}/${id}`);
    
    // Check if response has data (status 200) or is empty (status 204)
    if (response.data) {
      console.log('Delete successful:', response.data);
      alert(`${type.slice(0, -1)} deleted successfully!`);
    } else {
      // Handle 204 No Content responses
      console.log('Delete successful (no content returned)');
      alert(`${type.slice(0, -1)} deleted successfully!`);
    }
    
    fetchData(activeTab);
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    
    // More detailed error handling
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
    setReportForm({ title: '', description: '', content: '', image: null });
    setMentorForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
    setManagementForm({ name: '', position: '', bio: '', image: null, social_links: '{}' });
    setCareerForm({ title: '', description: '', requirements: '', location: '', type: 'full-time' });
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

  // ORIGINAL renderForm (preserved)
  const renderForm = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'reports')} className="dashboard-form">
            <h3>{editingId ? 'Edit' : 'Add New'} Report</h3>
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
              <label>Image:</label>
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
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Report
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        );
      
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
              <label>Position:</label>
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
              {editingId && (
                <button type="button" onClick={cancelEdit}>Cancel</button>
              )}
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
              <label>Position:</label>
              <input
                type="text"
                value={managementForm.position}
                onChange={(e) => setManagementForm({...managementForm, position: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setManagementForm)}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Member
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        );
      
      case 'careers':
        return (
          <form onSubmit={(e) => handleSubmit(e, 'careers')} className="dashboard-form">
            <h3>{editingId ? 'Edit' : 'Add New'} Career Opening</h3>
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
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')} Opening
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        );

      case 'media':
        // If no sub-type selected, show your original media type cards
        if (!currentMediaType) {
          return (
            <div className="media-dashboard">
              <h3>Media</h3>
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
        return null; // Managed by <MediaManager /> below

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
        return null; // Managed by <OurWorkManagement /> below
      
      default:
        return null;
    }
  };

  // ORIGINAL renderContent (preserved)
  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;
    
    switch (activeTab) {
      case 'reports':
        return (
          <div className="content-list">
            <h3>Reports</h3>
            {reports.length === 0 ? (
              <p>No reports found</p>
            ) : (
              <div className="items-grid">
                {reports.map(report => (
                  <div key={report.id} className="item-card">
                    {report.image && (
                      <div className="item-image">
                        <img 
                          src={`${API_BASE}/uploads/reports/${report.image}`} 
                          alt={report.title} 
                        />
                      </div>
                    )}
                    <div className="item-content">
                      <h4>{report.title}</h4>
                      <p>{report.description}</p>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(report, 'reports')}>Edit</button>
                        <button onClick={() => handleDelete(report.id, 'reports')}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'mentors':
        return (
          <div className="content-list">
            <h3>Mentors</h3>
            {mentors.length === 0 ? (
              <p>No mentors found</p>
            ) : (
              <div className="items-grid">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="item-card">
                    {mentor.image && (
                      <div className="item-image">
                        <img 
                          src={`${API_BASE}/uploads/mentors/${mentor.image}`} 
                          alt={mentor.name} 
                        />
                      </div>
                    )}
                    <div className="item-content">
                      <h4>{mentor.name}</h4>
                      <p>{mentor.position}</p>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(mentor, 'mentors')}>Edit</button>
                        <button onClick={() => handleDelete(mentor.id, 'mentors')}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'management':
        return (
          <div className="content-list">
            <h3>Management Team</h3>
            {management.length === 0 ? (
              <p>No management members found</p>
            ) : (
              <div className="items-grid">
                {management.map(member => (
                  <div key={member.id} className="item-card">
                    {member.image && (
                      <div className="item-image">
                        <img 
                          src={`${API_BASE}/uploads/management/${member.image}`} 
                          alt={member.name} 
                        />
                      </div>
                    )}
                    <div className="item-content">
                      <h4>{member.name}</h4>
                      <p>{member.position}</p>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(member, 'management')}>Edit</button>
                        <button onClick={() => handleDelete(member.id, 'management')}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'careers':
        return (
          <div className="content-list">
            <h3>Career Openings</h3>
            {careers.length === 0 ? (
              <p>No career openings found</p>
            ) : (
              <div className="items-list">
                {careers.map(career => (
                  <div key={career.id} className="item-card">
                    <div className="item-content">
                      <h4>{career.title}</h4>
                      <p><strong>Location:</strong> {career.location}</p>
                      <p><strong>Type:</strong> {career.type}</p>
                      <p><strong>Status:</strong> {career.is_active ? 'Active' : 'Inactive'}</p>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(career, 'careers')}>Edit</button>
                        <button onClick={() => handleDelete(career.id, 'careers')}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // media & ourWork content handled by dedicated components below
      default:
        return null;
    }
  };

  // Toggle a dropdown (media / ourWork / users). Clicking other top-level tabs closes any open dropdown.
  const selectTopLevelTab = (tab) => {
    setActiveTab(tab);
    if (tab !== 'media' && openDropdown === 'media') setOpenDropdown(null);
    if (tab !== 'ourWork' && openDropdown === 'ourWork') setOpenDropdown(null);
    if (tab !== 'users' && openDropdown === 'users') setOpenDropdown(null);
    if (tab !== 'impact' && openDropdown === 'impact') setOpenDropdown(null);
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
            <li className={activeTab === 'reports' ? 'active' : ''}>
              <button onClick={() => selectTopLevelTab('reports')}>All Reports</button>
            </li>
            <li className={activeTab === 'mentors' ? 'active' : ''}>
              <button onClick={() => selectTopLevelTab('mentors')}>Mentors</button>
            </li>
            <li className={activeTab === 'management' ? 'active' : ''}>
              <button onClick={() => selectTopLevelTab('management')}>Management Team</button>
            </li>
            <li className={activeTab === 'careers' ? 'active' : ''}>
              <button onClick={() => selectTopLevelTab('careers')}>Career Page</button>
            </li>

            {/* Media dropdown */}
            <li className={activeTab === 'media' ? 'active' : ''}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'media' ? null : 'media')}
              >
                Media ▾
              </button>
              {openDropdown === 'media' && (
                <ul className="submenu">
                  {['newsletters', 'stories', 'events', 'blogs', 'documentaries'].map(type => (
                    <li key={type}>
                      <button
                        className={currentMediaType === type ? 'active-sub' : ''}
                        onClick={() => {
                          setCurrentMediaType(type);
                          setActiveTab('media');
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Interventions dropdown */}
            {canManageContent && (
              <li className={activeTab === 'ourWork' ? 'active' : ''}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'ourWork' ? null : 'ourWork')}
                >
                  Our Interventions ▾
                </button>
                {openDropdown === 'ourWork' && (
                  <ul className="submenu">
                    {['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development'].map(category => (
                      <li key={category}>
                        <button
                          className={currentOurWorkCategory === category ? 'active-sub' : ''}
                          onClick={() => {
                            setCurrentOurWorkCategory(category);
                            setActiveTab('ourWork');
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

            {/* Impact Data Section */}
            {canManageContent && (
              <li className={activeTab === 'impact' ? 'active' : ''}>
                <button onClick={() => selectTopLevelTab('impact')}>
                  Impact Data
                </button>
              </li>
            )}

            {/* User management dropdown */}
            {canManageUsers && (
              <li className={(activeTab === 'users' || activeTab === 'registrations') ? 'active' : ''}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'users' ? null : 'users')}
                >
                  User Management ▾
                </button>
                {openDropdown === 'users' && (
                  <ul className="submenu">
                    <li>
                      <button
                        className={activeTab === 'users' ? 'active-sub' : ''}
                        onClick={() => setActiveTab('users')}
                      >
                        Users
                      </button>
                    </li>
                    <li>
                      <button
                        className={activeTab === 'registrations' ? 'active-sub' : ''}
                        onClick={() => setActiveTab('registrations')}
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