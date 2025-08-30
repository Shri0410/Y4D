import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OurWorkManagement.css';

const OurWorkManagement = ({ category, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const categoryLabels = {
    quality_education: 'Quality Education',
    livelihood: 'Livelihood',
    healthcare: 'Healthcare',
    environment_sustainability: 'Environment Sustainability',
    integrated_development: 'Integrated Development Program (IDP)'
  };

  useEffect(() => {
    if (category) {
      fetchItems();
    }
  }, [category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE}/our-work/admin/${category}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
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
      display_order: items.length
    });
    setShowForm(true);
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
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`${API_BASE}/our-work/admin/item/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccess('Item deleted successfully');
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        await axios.put(`${API_BASE}/our-work/admin/item/${editingItem.id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuccess('Item updated successfully');
      } else {
        await axios.post(`${API_BASE}/our-work/admin/${category}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuccess('Item created successfully');
      }

      setShowForm(false);
      setEditingItem(null);
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving item:', error);
      setError('Failed to save item');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="our-work-manager">
        <div className="our-work-header">
          <button onClick={onClose} className="our-work-close-btn">← Back to Our Work</button>
          <h2>{categoryLabels[category]} Management</h2>
        </div>
        <div className="our-work-loading">Loading items...</div>
      </div>
    );
  }

  return (
    <div className="our-work-manager">
      <div className="our-work-header">
        <button onClick={onClose} className="our-work-close-btn">← Back to Our Work</button>
        <h2>{categoryLabels[category]} Management</h2>
        <button onClick={handleCreate} className="our-work-btn-primary">
          + Add New Item
        </button>
      </div>

      {error && <div className="our-work-error-message">{error}</div>}
      {success && <div className="our-work-success-message">{success}</div>}

      {showForm ? (
        <form onSubmit={handleSubmit} className="our-work-form">
          <div className="our-work-form-section">
            <h3>{editingItem ? 'Edit' : 'Add New'} Item</h3>
            
            <div className="our-work-form-row">
              <div className="our-work-form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="our-work-form-group">
                <label>Display Order:</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="our-work-form-group">
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                required
              />
            </div>

            <div className="our-work-form-group">
              <label>Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows="6"
                placeholder="Detailed content (HTML supported)"
              />
            </div>

            <div className="our-work-form-row">
              <div className="our-work-form-group">
                <label>Image URL:</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="our-work-form-group">
                <label>Video URL:</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://youtube.com/embed/video-id"
                />
              </div>
            </div>

            <div className="our-work-form-group">
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

            <div className="our-work-form-group">
              <label>Status:</label>
              <select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="our-work-form-actions">
              <button type="submit" disabled={loading} className="our-work-btn-primary">
                {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')} Item
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="our-work-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="our-work-items-list">
          <h3>Current Items ({items.length})</h3>
          {items.length === 0 ? (
            <div className="no-items">
              <p>No items found for this section.</p>
              <button onClick={handleCreate} className="our-work-btn-primary">
                Create First Item
              </button>
            </div>
          ) : (
            <div className="items-grid">
              {items.map(item => (
                <div key={item.id} className="item-card">
                  {item.image_url && (
                    <div className="item-image">
                      <img src={item.image_url} alt={item.title} />
                    </div>
                  )}
                  <div className="item-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <div className="item-meta">
                      <span className={`status ${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="order">Order: {item.display_order}</span>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OurWorkManagement;