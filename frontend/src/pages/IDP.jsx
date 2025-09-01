import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OurWorkPages.css';

const IDP = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/our-work/published/integrated_development`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching IDP programs:', error);
      setError('Failed to load integrated development programs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container"><div className="loading">Loading Integrated Development Programs...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Integrated Development Program (IDP)</h1>
            <p className="section-subtitle">Holistic community development for sustainable change</p>
          </div>
          
          <div className="content">
            {items.length === 0 ? (
              <div className="empty-state">
                <h3>No integrated development programs available at the moment</h3>
                <p>We are working on comprehensive community development initiatives</p>
              </div>
            ) : (
              <div className="programs-grid">
                {items.map(item => (
                  <div key={item.id} className="program-card">
                    {item.image_url && (
                      <div className="program-image">
                        <img src={item.image_url} alt={item.title} />
                        <div className="image-overlay"></div>
                      </div>
                    )}
                    
                    <div className="program-content">
                      <h2>{item.title}</h2>
                      <p className="program-description">{item.description}</p>
                      
                      {item.content && (
                        <div 
                          className="program-details"
                          dangerouslySetInnerHTML={{ __html: item.content }} 
                        />
                      )}
                      
                      {item.video_url && (
                        <div className="program-video">
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
                      
                      <div className="program-meta">
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

export default IDP;