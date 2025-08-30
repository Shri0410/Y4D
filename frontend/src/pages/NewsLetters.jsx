import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/newsletters`);
      setNewsletters(response.data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    }
    setLoading(false);
  };

  const handleDownload = async (newsletter) => {
    try {
      // Create a direct download link
      const fileUrl = `${API_BASE}/uploads/media/newsletters/${newsletter.file_path}`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = newsletter.file_path;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Optional: Open in new tab instead of downloading
      // window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading newsletter:', error);
      alert('Failed to download newsletter. Please try again.');
    }
  };

  const handleView = (newsletter) => {
    // Open PDF in new tab
    window.open(`${API_BASE}/uploads/media/newsletters/${newsletter.file_path}`, '_blank');
  };

  if (loading) return <div className="loading">Loading newsletters...</div>;

  return (
    <div className="newsletters-page">
      <div className="page-header">
        <h1>Newsletters</h1>
        <p>Stay updated with our latest publications and monthly updates</p>
      </div>

      <div className="newsletters-grid">
        {newsletters.length === 0 ? (
          <div className="empty-state">
            <p>No newsletters available at the moment</p>
          </div>
        ) : (
          newsletters.map(newsletter => (
            <div key={newsletter.id} className="newsletter-card">
              <div className="newsletter-content">
                <h3>{newsletter.title}</h3>
                <p className="newsletter-description">{newsletter.description}</p>
                <div className="newsletter-meta">
                  <p className="newsletter-date">
                    Published: {new Date(newsletter.published_date).toLocaleDateString()}
                  </p>
                  <p className="newsletter-status">
                    Status: {newsletter.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="newsletter-actions">
                  <button 
                    onClick={() => handleView(newsletter)}
                    className="btn-view"
                  >
                    View Online
                  </button>
                  <button 
                    onClick={() => handleDownload(newsletter)}
                    className="btn-download"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Newsletters;