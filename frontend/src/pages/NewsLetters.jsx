// src/pages/Newsletters.jsx
import React, { useState, useEffect } from "react";
import "./NewsLetters.css";
import { bannerService } from "../api/services/banners.service";
import { mediaService } from "../api/services/media.service";
import { UPLOADS_BASE } from "../config/api";
import logger from "../utils/logger";

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [newsletterBanners, setNewsletterBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch newsletter page banners
  useEffect(() => {
    const fetchNewsletterBanners = async () => {
      try {
        setBannersLoading(true);
        logger.log("🔄 Fetching newsletter page banners...");
        const bannersData = await bannerService.getBanners("media-corner", "newsletters");
        logger.log("✅ Newsletter banners received:", bannersData);
        setNewsletterBanners(bannersData);
      } catch (error) {
        logger.error("❌ Error fetching newsletter banners:", error);
        setNewsletterBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchNewsletterBanners();
  }, []);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const newslettersData = await mediaService.getPublishedMedia("newsletters");
      setNewsletters(newslettersData);
    } catch (error) {
      logger.error("Error fetching newsletters:", error);
    }
    setLoading(false);
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="newsletter-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (newsletterBanners.length === 0) {
      return (
        <div className="newsletter-banner">
          <div className="no-banner-message">
            <p>Newsletter banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="newsletter-banner">
        {newsletterBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === "image" ? (
              <img
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                alt={`Newsletters Banner - ${banner.page}`}
                className="newsletter-banner-image"
              />
            ) : (
              <video
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                className="newsletter-banner-video"
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

  if (loading) return <div className="loading">Loading newsletters...</div>;

  return (
    <div className="newsletters-container">
      {/* Dynamic Banner */}
      {renderBanner()}
      <div className="newsletters-page">
        <div className="page-header">
          <h1>
            Newsletters<span></span>
          </h1>
          <p>Stay updated with our latest publications and monthly updates</p>
        </div>

        <div className="newsletters-grid">
          {newsletters.length === 0 ? (
            <div className="empty-state">
              <p>No newsletters available at the moment</p>
            </div>
          ) : (
            newsletters.map((newsletter) => (
              <div key={newsletter.id} className="newsletter-card">
                <div className="newsletter-content">
                  <h3>{newsletter.title}</h3>
                  <p className="newsletter-description">
                    {newsletter.description}
                  </p>
                  <div className="newsletter-actions">
                    <a
                      href={`${API_BASE}/uploads/media/newsletters/${newsletter.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      <i className="fas fa-download"></i> Download
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletters;
