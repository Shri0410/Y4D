// src/pages/Newsletters.jsx
import React, { useState, useEffect } from "react";
import "./NewsLetters.css";
import { bannerService } from "../api/services/banners.service";
import { mediaService } from "../api/services/media.service";
import { API_BASE, UPLOADS_BASE } from "../config/api";
import logger from "../utils/logger";
import toast from "../utils/toast";

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

  // Handle download with error checking
  const handleDownload = async (newsletter) => {
    // Check if file_path exists
    if (!newsletter.file_path || newsletter.file_path.trim() === "") {
      toast.error("Download file is not available for this newsletter. Please contact support.");
      return;
    }

    const fileUrl = `${API_BASE}/uploads/media/newsletters/${newsletter.file_path}`;
    
    try {
      // Try to fetch the file to check if it exists (with CORS handling)
      const response = await fetch(fileUrl, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("The newsletter file was not found on the server. Please contact support.");
        } else if (response.status === 403) {
          toast.error("Access denied. You don't have permission to download this file.");
        } else {
          toast.error(`Unable to download newsletter. Server returned error ${response.status}. Please try again later.`);
        }
        return;
      }

      // If file exists, create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = newsletter.title || 'newsletter.pdf';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Set a timeout to check if download actually started
      // If the file doesn't exist, browser will show error in console but we can't catch it
      // So we rely on the HEAD request above
      
    } catch (error) {
      logger.error("Error downloading newsletter:", error);
      
      // Check for specific error types
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // CORS error or network error - try direct download anyway
        // Sometimes HEAD requests fail due to CORS but GET works
        try {
          window.open(fileUrl, '_blank', 'noopener,noreferrer');
        } catch (openError) {
          toast.error("Network error: Unable to connect to the server. Please check your internet connection and try again.");
        }
      } else if (error.message) {
        toast.error(`Download failed: ${error.message}. Please try again later.`);
      } else {
        toast.error("An unexpected error occurred while downloading. Please try again later or contact support.");
      }
    }
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
                    <button
                      onClick={() => handleDownload(newsletter)}
                      className="download-btn"
                      type="button"
                    >
                      <i className="fas fa-download"></i> Download
                    </button>
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
