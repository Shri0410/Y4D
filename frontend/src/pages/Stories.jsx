import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Stories.css"; // new CSS for Stories page

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/stories`);
      setStories(response.data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const openStoryModal = (story) => {
    setSelectedStory(story);
  };

  const closeStoryModal = () => {
    setSelectedStory(null);
  };

  if (loading)
    return (
      <div className="st-page">
        <div className="st-loading">Loading stories...</div>
      </div>
    );

  return (
    <div className="st-page">
      <section className="st-section">
        <div className="st-container">
          <div className="st-header">
            <h1 className="st-title">
              Stories of Empowerment <span></span>
            </h1>
            <p className="st-subtitle">
              Inspiring success stories from our community
            </p>
          </div>

          <div className="st-grid">
            {stories.length === 0 ? (
              <div className="st-empty">
                <h3>No stories available at the moment</h3>
              </div>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="st-card">
                  {story.image && (
                    <div className="st-card-image">
                      <img
                        src={`${API_BASE}/uploads/media/stories/${story.image}`}
                        alt={story.title}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg"; // fallback
                        }}
                      />
                    </div>
                  )}

                  <div className="st-card-body">
                    <h2 className="st-card-title">{story.title}</h2>
                    <p className="st-card-desc">
                      {story.content.length > 150
                        ? `${story.content.substring(0, 150)}...`
                        : story.content}
                    </p>

                    <div className="st-card-meta">
                      <span>By {story.author}</span> |{" "}
                      <span>
                        Published:{" "}
                        {new Date(story.published_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="st-card-footer">
                      <button
                        onClick={() => openStoryModal(story)}
                        className="st-read-more"
                      >
                        Read Full Story
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedStory && (
        <div className="st-modal-overlay" onClick={closeStoryModal}>
          <div
            className="st-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="st-modal-header">
              <h2>{selectedStory.title}</h2>
              <button onClick={closeStoryModal} className="st-close-btn">
                &times;
              </button>
            </div>
            <div className="st-modal-body">
              {selectedStory.image && (
                <div className="st-modal-image">
                  <img
                    src={`${API_BASE}/uploads/media/stories/${selectedStory.image}`}
                    alt={selectedStory.title}
                  />
                </div>
              )}
              <div className="st-modal-meta">
                <span>By {selectedStory.author}</span> |{" "}
                <span>
                  Published:{" "}
                  {new Date(selectedStory.published_date).toLocaleDateString()}
                </span>
              </div>
              <div className="st-full-content">
                {selectedStory.content.split("\n").map((paragraph, index) => (
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
