import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Healthcare.css";
import bannerVideo from "../assets/OurWork/Healthcare.mp4";

const Healthcare = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";
  const SERVER_BASE = "http://localhost:5000";

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${SERVER_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
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
      {/* Banner Section */}
      <div className="hc-banner">
        <video
          src={bannerVideo}
          autoPlay
          muted
          loop
          playsInline
          className="hc-banner-video"
        />
      </div>
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
