import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OurWorkManagement.css';

const OurWorkManagement = ({ category, action, onClose, onActionChange }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image_url: '',
    video_url: '',
    additional_images: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_active: true,
    display_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  const categoryLabels = {
    quality_education: 'Quality Education',
    livelihood: 'Livelihood',
    healthcare: 'Healthcare',
    environment_sustainability: 'Environment Sustainability',
    integrated_development: 'Integrated Development Program (IDP)'
  };

  // Function to properly construct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    console.log('Original image URL:', imageUrl);
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path starting with /uploads, construct full URL
    if (imageUrl.startsWith('/uploads/')) {
      return `${API_BASE}${imageUrl}`;
    }
    
    // If it's just a filename, construct the full path
    if (imageUrl && !imageUrl.startsWith('/')) {
      return `${API_BASE}/uploads/our-work/${category}/${imageUrl}`;
    }
    
    return null;
  };

  useEffect(() => {
    if (category && (action === 'view' || action === 'update')) {
      fetchItems();
    }
  }, [category, action]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE}/api/our-work/admin/${category}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Log the items to see what we're getting from the API
      console.log('Fetched items:', response.data);
      
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items. Please check console for details.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'additional_images') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'is_active') {
          formDataToSend.append(key, formData[key] ? '1' : '0');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingItem) {
        response = await axios.put(`${API_BASE}/api/our-work/admin/${category}/${editingItem.id}`, 
                                    formDataToSend, 
                                    config);
      } else {
        response = await axios.post(`${API_BASE}/api/our-work/admin/${category}`, 
                                    formDataToSend, 
                                    config);
      }

      // Reset form and switch to view mode after successful submission
      resetForm();
      onActionChange('view');
      fetchItems();
      
      alert(`Item ${editingItem ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to save. Please check console for details.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
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
      display_order: item.display_order
    });
    if (item.image_url) {
      setImagePreview(getImageUrl(item.image_url));
    }
    onActionChange('update');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE}/api/our-work/admin/${category}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchItems();
        alert('Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert(`Error: ${error.response?.data?.error || 'Failed to delete'}`);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/our-work/admin/${category}/${id}/status`, {
        is_active: !currentStatus
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchItems();
      alert(`Item ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(`Error: ${error.response?.data?.error || 'Failed to update status'}`);
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

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      additional_images: [...prev.additional_images, '']
    }));
  };

  const removeImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
  };

  const updateImageUrl = (index, value) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.map((url, i) => 
        i === index ? value : url
      )
    }));
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      image_url: '',
      video_url: '',
      additional_images: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_active: true,
      display_order: 0
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  const cancelAction = () => {
    resetForm();
    onActionChange('view');
  };

  // Render View Mode - Only shows current items (no form)
  const renderViewMode = () => {
    if (loading) return <div className="loading">Loading...</div>;

    return (
      <div className="our-work-manager">
        <div className="our-work-header">
          <button onClick={onClose} className="close-btn">← Back to Interventions</button>
          <h2>View {categoryLabels[category]}</h2>
          <button 
            onClick={() => onActionChange('add')}
            className="btn-primary"
          >
            + Add New Item
          </button>
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
              {items.map(item => {
                const imageUrl = getImageUrl(item.image_url);
                console.log('Item debug:', {
                  title: item.title,
                  originalImageUrl: item.image_url,
                  constructedImageUrl: imageUrl,
                  category: category
                });

                return (
                  <div key={item.id} className="item-card">
                    {imageUrl ? (
                      <div className="item-image">
                        <img
                          src={imageUrl}
                          alt={item.title || 'No title'}
                          onError={(e) => {
                            console.error('Image failed to load:', imageUrl);
                            e.target.style.display = 'none';
                            // Show a placeholder if image fails to load
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-placeholder';
                            placeholder.innerHTML = '📷 Image not available';
                            e.target.parentNode.appendChild(placeholder);
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', imageUrl);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="image-placeholder">
                        📷 No image
                      </div>
                    )}
                    <div className="item-content">
                      <h4>{item.title || 'Untitled'}</h4>
                      <p className="item-description">{item.description || 'No description'}</p>
                      <div className="item-meta">
                        <span className={`status ${item.is_active ? 'active' : 'inactive'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="order">Order: {item.display_order || 0}</span>
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`btn-status ${item.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => toggleStatus(item.id, item.is_active)}
                        >
                          {item.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(item.id)}
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
      </div>
    );
  };

  // Render Add/Update Mode - Only shows the form (no items list)
  const renderFormMode = () => {
    return (
      <div className="our-work-manager">
        <div className="our-work-header">
          <button onClick={cancelAction} className="close-btn">
            ← Back to View {categoryLabels[category]}
          </button>
          <h2>{editingItem ? 'Edit' : 'Add New'} {categoryLabels[category]}</h2>
        </div>

        <form onSubmit={handleSubmit} className="our-work-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="6"
              placeholder="Detailed content (HTML supported)"
            />
          </div>

          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Or Upload Image:</label>
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

          <div className="form-group">
            <label>Video URL:</label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({...formData, video_url: e.target.value})}
              placeholder="https://youtube.com/embed/video-id"
            />
          </div>

          <div className="form-group">
            <label>Additional Images:</label>
            <div className="additional-images">
              {formData.additional_images.map((url, index) => (
                <div key={index} className="image-url-input">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImageUrl(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addImageUrl}
                className="add-btn"
              >
                + Add Image URL
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Display Order:</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
            />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')} Item
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
  if (action === 'view') {
    return renderViewMode();
  } else if (action === 'add' || action === 'update') {
    return renderFormMode();
  }

  return null;
};

export default OurWorkManagement;