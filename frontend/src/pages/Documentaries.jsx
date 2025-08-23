// src/pages/Documentaries.jsx
import React, { useState, useEffect } from 'react';
import { getDocumentaries } from '../services/api';

const Documentaries = () => {
  const [documentaries, setDocumentaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchDocumentaries = async () => {
      try {
        setLoading(true);
        const docsData = await getDocumentaries();
        // Sort documentaries by published date (newest first)
        const sortedDocs = docsData.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
        setDocumentaries(sortedDocs);
      } catch (err) {
        setError('Failed to load documentaries. Please try again later.');
        console.error('Error fetching documentaries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentaries();
  }, []);

  if (loading) return <div className="page-container"><div className="loading">Loading documentaries...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Documentaries</h2>
          <p className="section-description">
            Watch our documentaries to see the real impact of our work in communities.
          </p>
          
          {documentaries.length === 0 ? (
            <div className="no-data">
              <p>No documentaries available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="documentaries-grid">
              {documentaries.map(doc => (
                <div key={doc.id} className="documentary-card">
                  {doc.thumbnail && (
                    <div className="doc-thumbnail">
                      <img 
                        src={`http://localhost:5000/uploads/media/documentaries/${doc.thumbnail}`} 
                        alt={doc.title}
                        onClick={() => setSelectedDoc(doc)}
                      />
                      <div className="play-button" onClick={() => setSelectedDoc(doc)}>
                        ▶
                      </div>
                    </div>
                  )}
                  <div className="doc-content">
                    <h3>{doc.title}</h3>
                    <p className="doc-meta">
                      Published: {new Date(doc.published_date).toLocaleDateString()}
                      {doc.duration && ` • Duration: ${doc.duration} mins`}
                    </p>
                    <div className="doc-description">
                      {doc.description}
                    </div>
                    <button 
                      className="btn"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      Watch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Documentary Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDoc(null)}>×</button>
            <h2>{selectedDoc.title}</h2>
            {selectedDoc.video_url ? (
              <div className="video-container">
                <iframe
                  src={selectedDoc.video_url}
                  title={selectedDoc.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p>Video content not available.</p>
            )}
            <div className="doc-details">
              <p><strong>Published:</strong> {new Date(selectedDoc.published_date).toLocaleDateString()}</p>
              {selectedDoc.duration && <p><strong>Duration:</strong> {selectedDoc.duration} minutes</p>}
              <p>{selectedDoc.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentaries;