// src/pages/EnvironmentSustainability.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EnvironmentSustainability.css";
import { getBanners } from "../services/api.jsx";

const API_BASE = "https://y4dorg-backend.onrender.com/api";
const SERVER_BASE = "https://y4dorg-backend.onrender.com/";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  // Remove any leading slashes just in case
  const cleanPath = path.replace(
    /^\/?uploads\/our-work\/environment_sustainability\//,
    ""
  );
  return `${SERVER_BASE}/api/uploads/our-work/environment_sustainability/${cleanPath}`;
};

const EnvironmentSustainability = () => {
  const [items, setItems] = useState([]);
  const [environmentBanners, setEnvironmentBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch environment sustainability page banners
  useEffect(() => {
    const fetchEnvironmentBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('🔄 Fetching environment sustainability page banners...');
        const bannersData = await getBanners('our-work', 'environmental-sustainability');
        console.log('✅ Environment sustainability banners received:', bannersData);
        setEnvironmentBanners(bannersData);
      } catch (error) {
        console.error('❌ Error fetching environment sustainability banners:', error);
        setEnvironmentBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchEnvironmentBanners();
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/our-work/published/environment_sustainability`
      );
      setItems(response.data);
    } catch (err) {
      console.error("Error fetching environment sustainability programs:", err);
      setError("Failed to load environment sustainability programs");
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="es-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (environmentBanners.length === 0) {
      return (
        <div className="es-banner">
          <div className="no-banner-message">
            <p>Environment sustainability banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="es-banner">
        {environmentBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === 'image' ? (
              <img
                src={`https://y4dorg-backend.onrender.com/uploads/banners/${banner.media}`}
                alt={`Environment Sustainability Banner - ${banner.page}`}
                className="es-banner-image"
              />
            ) : (
              <video
                src={`https://y4dorg-backend.onrender.com/uploads/banners/${banner.media}`}
                className="es-banner-video"
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
      <div className="es-page">
        <div className="es-loading">
          Loading Environment Sustainability Programs...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="es-page">
        <div className="es-error">{error}</div>
      </div>
    );

  return (
    <div className="es-page">
      {/* Dynamic Banner */}
      {renderBanner()}

      <section className="es-section">
        <div className="es-container">
          <div className="es-header">
            <h1 className="es-title">
              Environment Sustainability <span></span>
            </h1>
          </div>

          <div className="es-grid">
            {items.length === 0 ? (
              <div className="es-empty">
                <h3>No programs available at the moment</h3>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="es-card">
                  {item.image_url && (
                    <div className="es-card-image">
                      <img src={getImageUrl(item.image_url)} alt={item.title} />
                      {item.organization && (
                        <div className="es-org-badge">{item.organization}</div>
                      )}
                    </div>
                  )}

                  <div className="es-card-body">
                    <h2 className="es-card-title">{item.title}</h2>
                    <p className="es-card-desc">{item.description}</p>

                    {item.content && (
                      <div
                        className="es-card-details"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}

                    <div className="es-card-footer">
                      <Link
                        to={`/environment-sustainability/${item.id}`}
                        className="es-read-more"
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

export default EnvironmentSustainability;
