// src/pages/IDP.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./IDP.css";
import { getBanners } from "../services/api.jsx";
import { API_BASE, UPLOADS_BASE } from "../config/api";
import DonateButton from "../component/DonateButton";
import SanitizedHTML from "../components/SanitizedHTML";

const IDP = () => {
  const [items, setItems] = useState([]);
  const [idpBanners, setIdpBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch IDP page banners
  useEffect(() => {
    const fetchIdpBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('🔄 Fetching IDP page banners...');
        const bannersData = await getBanners('our-work', 'idp');
        console.log('✅ IDP banners received:', bannersData);
        setIdpBanners(bannersData);
      } catch (error) {
        console.error('❌ Error fetching IDP banners:', error);
        setIdpBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchIdpBanners();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Remove any leading slashes just in case
    const cleanPath = path.replace(
      /^\/?uploads\/our-work\/integrated_development\//,
      ""
    );
    return `${UPLOADS_BASE}/our-work/integrated_development/${cleanPath}`;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/our-work/published/integrated_development`
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching IDP programs:", error);
      setError("Failed to load integrated development programs");
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="idp-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (idpBanners.length === 0) {
      return (
        <div className="idp-banner">
          <div className="no-banner-message">
            <p>IDP banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="idp-banner">
        {idpBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === 'image' ? (
              <img
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                alt={`IDP Banner - ${banner.page}`}
                className="idp-banner-image"
              />
            ) : (
              <video
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                className="idp-banner-video"
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
      <div className="idp-page-container">
        <div className="idp-loading">
          Loading Integrated Development Programs...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="idp-page-container">
        <div className="idp-error-message">{error}</div>
      </div>
    );

  return (
    <div className="idp-page-container">
      {/* Dynamic Banner */}
      {renderBanner()}

      <section className="idp-section">
        <div className="idp-container">
          <div className="idp-section-header">
            <h1 className="idp-section-title">
              Integrated Development Program (IDP)<span></span>
            </h1>
          </div>

          <div className="idp-content">
            {items.length === 0 ? (
              <div className="idp-empty-state"></div>
            ) : (
              <div className="idp-grid">
                {items.map((item) => (
                  <div key={item.id} className="idp-card">
                    {item.image_url && (
                      <div className="idp-card-image">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.title}
                        />

                        <div className="idp-image-overlay"></div>
                      </div>
                    )}

                    <div className="idp-card-content">
                      <h2 className="idp-card-title">{item.title}</h2>
                      <p className="idp-card-description">{item.description}</p>

                      {item.content && (
                        <SanitizedHTML
                          content={item.content}
                          className="idp-card-details"
                        />
                      )}

                      <div className="idp-card-footer">
                        <Link to={`/idp/${item.id}`} className="idp-read-more">
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <DonateButton />
    </div>
  );
};

export default IDP;
