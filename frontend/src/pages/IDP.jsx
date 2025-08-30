import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IDP = () => {
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
      const response = await axios.get(`${API_BASE}/integrated_development`);
      setItems(response.data);
    } catch (err) {
      setError('Failed to load IDP programs');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/integrated_development`, formData);
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
        await axios.delete(`${API_BASE}/integrated_development/${id}`);
        fetchItems();
        alert('Item deleted successfully!');
      } catch (err) {
        setError('Failed to delete item');
        console.error('Error deleting item:', err);
      }
    }
  };

  if (loading) return <div className="page-container"><div className="loading">Loading IDP programs...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">IDP Programs</h2>
          
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
              <h3>Add New IDP Program</h3>
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
                {/* ... same form fields as QualityEducation ... */}
              </form>
            </div>
          )}

          {/* ... same item display logic as QualityEducation ... */}
        </div>
      </section>
    </div>
  );
};

export default IDP;