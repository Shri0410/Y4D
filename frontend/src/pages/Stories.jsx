import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/stories`);
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
    setLoading(false);
  };

  const openStoryModal = (story) => {
    setSelectedStory(story);
  };

  const closeStoryModal = () => {
    setSelectedStory(null);
  };

  if (loading) return <div className="loading">Loading stories...</div>;

  return (
    <div className="stories-page">
      <div className="page-header">
        <h1>Stories of Empowerment</h1>
        <p>Inspiring success stories from our community</p>
      </div>

      <div className="stories-grid">
        {stories.length === 0 ? (
          <div className="empty-state">
            <p>No stories available at the moment</p>
          </div>
        ) : (
          stories.map(story => (
            <div key={story.id} className="story-card">
              {story.image && (
                <div className="story-image">
                  <img 
                    src={`${API_BASE}/uploads/media/stories/${story.image}`} 
                    alt={story.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg'; // Fallback image
                    }}
                  />
                </div>
              )}
              <div className="story-content">
                <h3>{story.title}</h3>
                <p className="story-excerpt">
                  {story.content.length > 150 ? 
                    `${story.content.substring(0, 150)}...` : 
                    story.content
                  }
                </p>
                <div className="story-meta">
                  <p className="story-author">By {story.author}</p>
                  <p className="story-date">
                    Published: {new Date(story.published_date).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => openStoryModal(story)}
                  className="btn-read-more"
                >
                  Read Full Story
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <div className="modal-overlay" onClick={closeStoryModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedStory.title}</h2>
              <button onClick={closeStoryModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              {selectedStory.image && (
                <div className="modal-image">
                  <img 
                    src={`${API_BASE}/uploads/media/stories/${selectedStory.image}`} 
                    alt={selectedStory.title}
                  />
                </div>
              )}
              <div className="story-author">By {selectedStory.author}</div>
              <div className="story-date">
                Published: {new Date(selectedStory.published_date).toLocaleDateString()}
              </div>
              <div className="story-full-content">
                {selectedStory.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;