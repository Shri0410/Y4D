import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MediaManager = ({ mediaType, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    publish_type: 'immediate',
    is_published: true,
    tags: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [publishOptions, setPublishOptions] = useState('immediate');
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchItems();
  }, [mediaType]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/${mediaType}`);
      setItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${mediaType}:`, error);
      setError('Failed to fetch items. Please check console for details.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData.image) {
          // For image uploads (stories, events, blogs, documentaries)
          formDataToSend.append('image', formData.image);
        } else if (key === 'file' && formData.file) {
          // For file uploads (newsletters)
          formDataToSend.append('file', formData.file);
        } else if (key === 'tags') {
          // Handle tags specifically
          if (Array.isArray(formData.tags) && formData.tags.length > 0) {
            formDataToSend.append(key, JSON.stringify(formData.tags));
          } else {
            formDataToSend.append(key, '[]');
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Handle publish options
      formDataToSend.append('publish_type', publishOptions);
      
      if (publishOptions === 'schedule') {
        formDataToSend.append('scheduled_date', formData.scheduled_date || '');
        formDataToSend.append('is_published', 'false');
      } else {
        formDataToSend.append('is_published', 'true');
      }

      let response;
      if (editingItem) {
        response = await axios.put(`${API_BASE}/media/${mediaType}/${editingItem.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post(`${API_BASE}/media/${mediaType}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setEditingItem(null);
      setFormData({ publish_type: 'immediate', is_published: true, tags: [] });
      setImagePreview(null);
      setPublishOptions('immediate');
      fetchItems();
      
      const message = publishOptions === 'immediate' 
        ? `${mediaType.slice(0, -1)} published successfully!` 
        : `${mediaType.slice(0, -1)} scheduled for publication!`;
      
      alert(message);
    } catch (error) {
      console.error(`Error saving ${mediaType}:`, error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to save. Please check console for details.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    // Parse tags safely
    let parsedTags = [];
    if (item.tags) {
      try {
        parsedTags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
        if (!Array.isArray(parsedTags)) {
          parsedTags = [parsedTags];
        }
      } catch (error) {
        console.warn('Error parsing tags:', error);
        parsedTags = [];
      }
    }

    setEditingItem(item);
    setFormData({
      ...item,
      tags: parsedTags,
      publish_type: item.is_published ? 'immediate' : 'schedule'
    });
    setPublishOptions(item.is_published ? 'immediate' : 'schedule');
    if (item.image) {
      setImagePreview(`${API_BASE}/uploads/media/${mediaType}/${item.image}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${mediaType.slice(0, -1)}?`)) {
      try {
        await axios.delete(`${API_BASE}/media/${mediaType}/${id}`);
        fetchItems();
        alert(`${mediaType.slice(0, -1)} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${mediaType}:`, error);
        alert(`Error: ${error.response?.data?.error || 'Failed to delete'}`);
      }
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_BASE}/media/${mediaType}/${id}/publish`, {
        is_published: !currentStatus
      });
      fetchItems();
      alert(`${mediaType.slice(0, -1)} ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error(`Error toggling publish status:`, error);
      alert(`Error: ${error.response?.data?.error || 'Failed to update status'}`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (mediaType === 'newsletters') {
      setFormData({ ...formData, file: file });
    } else {
      setFormData({ ...formData, image: file });
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file: file });
  };

  const renderPublishOptions = () => (
    <div className="publish-options">
      <h4>Publish Options</h4>
      <div className="publish-radio-group">
        <label>
          <input
            type="radio"
            value="immediate"
            checked={publishOptions === 'immediate'}
            onChange={(e) => setPublishOptions(e.target.value)}
          />
          Immediate Publish
        </label>
        <label>
          <input
            type="radio"
            value="schedule"
            checked={publishOptions === 'schedule'}
            onChange={(e) => setPublishOptions(e.target.value)}
          />
          Schedule Publish
        </label>
      </div>

      {publishOptions === 'schedule' && (
        <div className="form-group">
          <label>Schedule Date & Time:</label>
          <input
            type="datetime-local"
            value={formData.scheduled_date || ''}
            onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
            required={publishOptions === 'schedule'}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}
    </div>
  );

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="media-form">
        <h3>{editingItem ? 'Edit' : 'Add New'} {mediaType.slice(0, -1)}</h3>
        
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="3"
          />
        </div>

        {(mediaType === 'stories' || mediaType === 'blogs') && (
          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
              rows="6"
            />
          </div>
        )}

        {mediaType === 'newsletters' ? (
          <div className="form-group">
            <label>PDF File:</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required={!editingItem}
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        )}

        {(mediaType === 'stories' || mediaType === 'blogs') && (
          <div className="form-group">
            <label>Author:</label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              required
            />
          </div>
        )}

        {mediaType === 'events' && (
          <>
            <div className="form-group">
              <label>Event Date:</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Event Time:</label>
              <input
                type="time"
                value={formData.time || ''}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </>
        )}

        {mediaType === 'blogs' && (
          <div className="form-group">
            <label>Tags (comma-separated):</label>
            <input
              type="text"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag !== '');
                setFormData({...formData, tags: tagsArray});
              }}
              placeholder="technology, education, development"
            />
            <small>Separate tags with commas</small>
          </div>
        )}

        {mediaType === 'documentaries' && (
          <>
            <div className="form-group">
              <label>Video URL:</label>
              <input
                type="url"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                required
                placeholder="https://youtube.com/embed/..."
              />
            </div>
            <div className="form-group">
              <label>Duration:</label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="e.g., 1h 30m"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Published Date:</label>
          <input
            type="date"
            value={formData.published_date || ''}
            onChange={(e) => setFormData({...formData, published_date: e.target.value})}
            required
          />
        </div>

        {renderPublishOptions()}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={() => {
            setEditingItem(null);
            setFormData({ publish_type: 'immediate', is_published: true, tags: [] });
            setImagePreview(null);
            setPublishOptions('immediate');
          }}>
            Cancel
          </button>
        </div>
      </form>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="media-manager">
      <div className="media-header">
        <h2>{mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Management</h2>
        <button onClick={onClose} className="close-btn">← Back</button>
      </div>

      {renderForm()}

      <div className="media-list">
        <h3>Existing {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}</h3>
        {items.length === 0 ? (
          <p>No {mediaType} found</p>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="media-item">
                {item.image && (
                  <div className="item-image">
                    <img 
                      src={`${API_BASE}/uploads/media/${mediaType}/${item.image}`} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                )}
                <div className="item-content">
                  <h4>{item.title}</h4>
                  <p className="item-date">
                    {new Date(item.published_date).toLocaleDateString()}
                  </p>
                  <p className={`status ${item.is_published ? 'published' : 'draft'}`}>
                    {item.is_published ? 'Published' : 'Draft'}
                    {!item.is_published && new Date(item.published_date) > new Date() && ' (Scheduled)'}
                  </p>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => togglePublish(item.id, item.is_published)}>
                      {item.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;