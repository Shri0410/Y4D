// src/pages/Stories.jsx
import React, { useState, useEffect } from "react";
import "./Stories.css";
import { bannerService } from "../api/services/banners.service";
import { mediaService } from "../api/services/media.service";
import { UPLOADS_BASE } from "../config/api";
import logger from "../utils/logger";


const Stories = () => {
  const [stories, setStories] = useState([]);
  const [storiesBanners, setStoriesBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  // Fetch stories page banners
  useEffect(() => {
    const fetchStoriesBanners = async () => {
      try {
        setBannersLoading(true);
        logger.log("🔄 Fetching stories page banners...");
        const bannersData = await bannerService.getBanners("media-corner", "stories");
        logger.log("✅ Stories banners received:", bannersData);
        setStoriesBanners(bannersData);
      } catch (error) {
        logger.error("❌ Error fetching stories banners:", error);
        setStoriesBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchStoriesBanners();
  }, []);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const storiesData = await mediaService.getPublishedMedia("stories");
      setStories(storiesData);
    } catch (error) {
      logger.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="stories-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (storiesBanners.length === 0) {
      return (
        <div className="stories-banner">
          <div className="no-banner-message">
            <p>Stories banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="stories-banner">
        {storiesBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === "image" ? (
              <img
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                alt={`Stories Banner - ${banner.page}`}
                className="stories-banner-image"
              />
            ) : (
              <video
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                className="stories-banner-video"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const openStoryModal = (story) => setSelectedStory(story);
  const closeStoryModal = () => setSelectedStory(null);

  if (loading) {
    return (
      <div className="st-page">
        <div className="st-loading">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="stories-container">
      {/* Dynamic Banner */}
      {renderBanner()}
      <div className="st-page">
        <section className="st-section">
          <div className="st-container">
            <div className="st-header">
              <h1 className="st-title">
                Stories of Empowerment<span></span>
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
                          src={`${UPLOADS_BASE}/media/stories/${story.image}`}
                          alt={story.title}
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
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
                      src={`${UPLOADS_BASE}/media/stories/${selectedStory.image}`}
                      alt={selectedStory.title}
                    />
                  </div>
                )}

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
    </div>
  );
};

export default Stories;
