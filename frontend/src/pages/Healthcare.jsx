// src/pages/Healthcare.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OurWorkPages.css';

const Healthcare = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/our-work/public/healthcare');
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching healthcare items:', error);
      setError('Failed to load healthcare initiatives');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Healthcare Initiatives...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Healthcare Initiatives</h1>
            <p className="section-subtitle">Improving health and wellbeing in communities we serve</p>
          </div>
          
          <div className="content">
            {items.length === 0 ? (
              <div className="empty-state">
                <h3>No healthcare initiatives available at the moment</h3>
                <p>We are working on bringing healthcare programs to communities in need</p>
              </div>
            ) : (
              <div className="initiatives-grid">
                {items.map(item => (
                  <div key={item.id} className="initiative-card">
                    {item.image_url && (
                      <div className="initiative-image">
                        <img src={item.image_url} alt={item.title} />
                        <div className="image-overlay"></div>
                      </div>
                    )}
                    
                    <div className="initiative-content">
                      <h2>{item.title}</h2>
                      <p className="initiative-description">{item.description}</p>
                      
                      {item.content && (
                        <div 
                          className="initiative-details"
                          dangerouslySetInnerHTML={{ __html: item.content }} 
                        />
                      )}
                      
                      {item.video_url && (
                        <div className="healthcare-video">
                          <h4>Watch Video</h4>
                          <div className="video-wrapper">
                            <iframe
                              src={item.video_url}
                              title={item.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="initiative-meta">
                        <span className="date">
                          Last updated: {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Healthcare;