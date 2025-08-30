import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QualityEducation = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/quality-education`);
      setItems(response.data);
    } catch (err) {
      setError('Failed to load quality education programs');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/quality-education`, formData);
      setShowForm(false);
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
      fetchItems();
      alert('Item created successfully!');
    } catch (err) {
      setError('Failed to create item');
      console.error('Error creating item:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE}/quality-education/${id}`);
        fetchItems();
        alert('Item deleted successfully!');
      } catch (err) {
        setError('Failed to delete item');
        console.error('Error deleting item:', err);
      }
    }
  };

  if (loading) return <div className="page-container"><div className="loading">Loading quality education programs...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Quality Education Programs</h2>
          
          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary"
              style={{marginBottom: '20px'}}
            >
              + Add New Program
            </button>
          ) : (
            <div className="career-form">
              <h3>Add New Quality Education Program</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="title"
                    placeholder="Program Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="description"
                    placeholder="Short Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="content"
                    placeholder="Detailed Content (HTML supported)"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="6"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="url"
                    name="image_url"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="url"
                    name="video_url"
                    placeholder="Video URL"
                    value={formData.video_url}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    name="display_order"
                    placeholder="Display Order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn">Create Program</button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {items.length === 0 ? (
            <div className="no-items">
              <p>No quality education programs available.</p>
            </div>
          ) : (
            <div className="items-list">
              {items.map(item => (
                <div key={item.id} className="item-card">
                  <h4>{item.title}</h4>
                  <div className="item-details">
                    <p><strong>Description:</strong> {item.description}</p>
                    {item.image_url && (
                      <p><strong>Image:</strong> {item.image_url}</p>
                    )}
                    {item.video_url && (
                      <p><strong>Video:</strong> {item.video_url}</p>
                    )}
                    <p><strong>Status:</strong> {item.is_active ? 'Active' : 'Inactive'}</p>
                    <p><strong>Order:</strong> {item.display_order}</p>
                  </div>
                  {item.content && (
                    <div className="item-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                  )}
                  <div className="item-actions">
                    <button className="btn">Edit</button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QualityEducation;