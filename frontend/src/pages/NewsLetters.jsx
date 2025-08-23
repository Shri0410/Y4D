// src/pages/Newsletters.jsx
import React, { useState, useEffect } from 'react';
import { getNewsletters } from '../services/api';

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        const newslettersData = await getNewsletters();
        setNewsletters(newslettersData);
      } catch (err) {
        setError('Failed to load newsletters. Please try again later.');
        console.error('Error fetching newsletters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  const handleDownload = (filePath, title) => {
    // Simulate download
    window.open(`http://localhost:5000/uploads/media/newsletters/${filePath}`, '_blank');
  };

  if (loading) return <div className="page-container"><div className="loading">Loading newsletters...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Newsletters</h2>
          <p className="section-description">
            Stay updated with our latest activities, impact stories, and organizational news through our quarterly newsletters.
          </p>
          
          {newsletters.length === 0 ? (
            <div className="no-data">
              <p>No newsletters available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="newsletter-grid">
              {newsletters.map(newsletter => (
                <div key={newsletter.id} className="newsletter-card">
                  <div className="newsletter-content">
                    <h3>{newsletter.title}</h3>
                    <p className="publish-date">
                      Published: {new Date(newsletter.published_date).toLocaleDateString()}
                    </p>
                    <div className="newsletter-description">
                      {newsletter.content.length > 150 
                        ? `${newsletter.content.substring(0, 150)}...` 
                        : newsletter.content
                      }
                    </div>
                  </div>
                  <div className="newsletter-actions">
                    {newsletter.file_path && (
                      <button 
                        className="btn"
                        onClick={() => handleDownload(newsletter.file_path, newsletter.title)}
                      >
                        Download Newsletter
                      </button>
                    )}
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

export default Newsletters;