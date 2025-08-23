// src/pages/Stories.jsx
import React, { useState, useEffect } from 'react';
import { getStories } from '../services/api';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const storiesData = await getStories();
        setStories(storiesData);
      } catch (err) {
        setError('Failed to load stories. Please try again later.');
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) return <div className="page-container"><div className="loading">Loading stories...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Stories of Empowerment</h2>
          <p className="section-description">
            Read inspiring stories of transformation and empowerment from the communities we serve.
          </p>
          
          {stories.length === 0 ? (
            <div className="no-data">
              <p>No stories available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="stories-grid">
              {stories.map(story => (
                <div key={story.id} className="story-card">
                  {story.image && (
                    <div className="story-image">
                      <img 
                        src={`http://localhost:5000/uploads/media/stories/${story.image}`} 
                        alt={story.title}
                      />
                    </div>
                  )}
                  <div className="story-content">
                    <h3>{story.title}</h3>
                    <p className="story-meta">
                      By {story.author} • {new Date(story.published_date).toLocaleDateString()}
                    </p>
                    <div className="story-excerpt">
                      {story.content.length > 200 
                        ? `${story.content.substring(0, 200)}...` 
                        : story.content
                      }
                    </div>
                    <button 
                      className="btn"
                      onClick={() => setSelectedStory(story)}
                    >
                      Read Full Story
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story Modal */}
      {selectedStory && (
        <div className="modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedStory(null)}>×</button>
            <h2>{selectedStory.title}</h2>
            <p className="story-meta">
              By {selectedStory.author} • {new Date(selectedStory.published_date).toLocaleDateString()}
            </p>
            {selectedStory.image && (
              <img 
                src={`http://localhost:5000/uploads/media/stories/${selectedStory.image}`} 
                alt={selectedStory.title}
                className="modal-image"
              />
            )}
            <div className="story-full-content">
              {selectedStory.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;