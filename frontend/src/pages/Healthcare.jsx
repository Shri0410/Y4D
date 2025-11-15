// src/pages/Healthcare.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Healthcare.css";
import { getBanners } from "../services/api.jsx";

const Healthcare = () => {
  const [items, setItems] = useState([]);
  const [healthcareBanners, setHealthcareBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "https://y4dorg-backend.onrender.com/api";
  const SERVER_BASE = "https://y4dorg-backend.onrender.com/";

  // Fetch healthcare page banners
  useEffect(() => {
    const fetchHealthcareBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('🔄 Fetching healthcare page banners...');
        const bannersData = await getBanners('our-work', 'healthcare');
        console.log('✅ Healthcare banners received:', bannersData);
        setHealthcareBanners(bannersData);
      } catch (error) {
        console.error('❌ Error fetching healthcare banners:', error);
        setHealthcareBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchHealthcareBanners();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Remove any leading slashes just in case
    const cleanPath = path.replace(/^\/?uploads\/our-work\/healthcare\//, "");
    return `${SERVER_BASE}/api/uploads/our-work/healthcare/${cleanPath}`;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/our-work/published/healthcare`
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching healthcare initiatives:", error);
      setError("Failed to load healthcare initiatives");
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="hc-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (healthcareBanners.length === 0) {
      return (
        <div className="hc-banner">
          <div className="no-banner-message">
            <p>Healthcare banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="hc-banner">
        {healthcareBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === 'image' ? (
              <img
                src={`https://y4dorg-backend.onrender.com/uploads/banners/${banner.media}`}
                alt={`Healthcare Banner - ${banner.page}`}
                className="hc-banner-image"
              />
            ) : (
              <video
                src={`https://y4dorg-backend.onrender.com/uploads/banners/${banner.media}`}
                className="hc-banner-video"
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

  if (loading)
    return (
      <div className="hc-page">
        <div className="hc-loading">Loading Healthcare Initiatives...</div>
      </div>
    );

  if (error)
    return (
      <div className="hc-page">
        <div className="hc-error">{error}</div>
      </div>
    );

  return (
    <div className="hc-page">
      {/* Dynamic Banner */}
      {renderBanner()}

      <section className="hc-section">
        <div className="hc-container">
          <div className="hc-header">
            <h1 className="hc-title">
              Healthcare Initiatives <span></span>
            </h1>
          </div>

          <div className="hc-grid">
            {items.length === 0 ? (
              <div className="hc-empty">
                <h3>No healthcare initiatives available at the moment</h3>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="hc-card">
                  {item.image_url && (
                    <div className="hc-card-image">
                      <img src={getImageUrl(item.image_url)} alt={item.title} />
                      {item.organization && (
                        <div className="hc-org-badge">{item.organization}</div>
                      )}
                    </div>
                  )}

                  <div className="hc-card-body">
                    <h2 className="hc-card-title">{item.title}</h2>
                    <p className="hc-card-desc">{item.description}</p>

                    {item.content && (
                      <div
                        className="hc-card-details"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}

                    <div className="hc-card-footer">
                      <Link
                        to={`/healthcare/${item.id}`}
                        className="hc-read-more"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Healthcare;
