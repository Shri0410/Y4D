import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';
import "./BoardTrustees.css";
import logger from "../utils/logger";
import confirmDialog from "../utils/confirmDialog";
import toast from "../utils/toast";

const BoardTrustees = () => {
  const [trustees, setTrustees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    social_links: '{}',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTrustees();
  }, []);

  const fetchTrustees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/board-trustees`);
      setTrustees(response.data);
    } catch (error) {
      logger.error('Error fetching trustees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('position', formData.position);
      data.append('bio', formData.bio);
      data.append('social_links', formData.social_links);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingId) {
        await axios.put(`${API_BASE}/board-trustees/${editingId}`, data);
      } else {
        await axios.post(`${API_BASE}/board-trustees`, data);
      }

      setFormData({ name: '', position: '', bio: '', social_links: '{}', image: null });
      setEditingId(null);
      fetchTrustees();
    } catch (error) {
      logger.error('Error saving trustee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (trustee) => {
    setFormData({
      name: trustee.name,
      position: trustee.position || '',
      bio: trustee.bio || '',
      social_links: JSON.stringify(trustee.social_links || {}),
      image: null
    });
    setEditingId(trustee.id);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this trustee?', 'Delete Trustee');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/board-trustees/${id}`);
      fetchTrustees();
      toast.success('Trustee deleted successfully');
    } catch (error) {
      logger.error('Error deleting trustee:', error);
      toast.error('Failed to delete trustee');
    }
  };

  return (
    <div className="board-trustees">
      <h2>Board of Trustees</h2>
      
      {/* Create/Edit Form */}
      <form onSubmit={handleSubmit} className="trustee-form">
        <h3>{editingId ? 'Edit Trustee' : 'Add New Trustee'}</h3>
        
        <input
          type="text"
          placeholder="Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <input
          type="text"
          placeholder="Position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
        
        <textarea
          placeholder="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (editingId ? 'Update Trustee' : 'Add Trustee')}
        </button>
        
        {editingId && (
          <button type="button" onClick={() => setEditingId(null)}>
            Cancel Edit
          </button>
        )}
      </form>

      {/* Trustees List */}
      <div className="trustees-list">
        <h3>Current Trustees</h3>
        {trustees.map(trustee => (
          <div key={trustee.id} className="trustee-card">
            {trustee.image && (
              <img 
                src={`/uploads/board-trustees/${trustee.image}`} 
                alt={trustee.name}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="trustee-info">
              <h4>{trustee.name}</h4>
              <p>{trustee.position}</p>
              <p>{trustee.bio}</p>
            </div>
            <div className="trustee-actions">
              <button onClick={() => handleEdit(trustee)}>Edit</button>
              <button onClick={() => handleDelete(trustee.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardTrustees;