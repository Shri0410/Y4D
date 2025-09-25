import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Livelihood.css";
import bannerVideo from "../assets/OurWork/Livelihood.mp4";

const Livelihood = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";
  const SERVER_BASE = "http://localhost:5000";

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Remove any leading slashes just in case
    const cleanPath = path.replace(/^\/?uploads\/our-work\/livelihood\//, "");
    return `${SERVER_BASE}/api/uploads/our-work/livelihood/${cleanPath}`;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/our-work/published/livelihood`
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching livelihood programs:", error);
      setError("Failed to load livelihood programs");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="lv-page">
        <div className="lv-loading">Loading Livelihood Programs...</div>
      </div>
    );

  if (error)
    return (
      <div className="lv-page">
        <div className="lv-error">{error}</div>
      </div>
    );

  return (
    <div className="lv-page">
      {/* Banner Section */}
      <div className="lv-banner">
        <video
          src={bannerVideo}
          autoPlay
          muted
          loop
          playsInline
          className="lv-banner-video"
        />
      </div>
      <section className="lv-section">
        <div className="lv-container">
          <div className="lv-header">
            <h1 className="lv-title">
              Livelihood Programs <span></span>
            </h1>
          </div>

          <div className="lv-grid">
            {items.length === 0 ? (
              <div className="lv-empty">
                <h3>No livelihood programs available at the moment</h3>
                <p>
                  We are working on creating sustainable livelihood
                  opportunities
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="lv-card">
                  {item.image_url && (
                    <div className="lv-card-image">
                      <img src={getImageUrl(item.image_url)} alt={item.title} />
                      {item.organization && (
                        <div className="lv-org-badge">{item.organization}</div>
                      )}
                    </div>
                  )}

                  <div className="lv-card-body">
                    <h2 className="lv-card-title">{item.title}</h2>
                    <p className="lv-card-desc">{item.description}</p>

                    {item.content && (
                      <div
                        className="lv-card-details"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}

                    {/* ✅ Read More button */}
                    <div className="lv-card-footer">
                      <Link
                        to={`/livelihood/${item.id}`}
                        className="lv-readmore-btn"
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

export default Livelihood;
