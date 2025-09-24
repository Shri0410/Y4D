import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./QualityEducation.css";
import bannerVideo from "../assets/OurWork/Education.mp4";

const QualityEducation = () => {
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
        `${API_BASE}/our-work/published/quality_education`
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching quality education programs:", error);
      setError("Failed to load quality education programs");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="qe-page">
        <div className="qe-loading">Loading Quality Education Programs...</div>
      </div>
    );
  if (error)
    return (
      <div className="qe-page">
        <div className="qe-error">{error}</div>
      </div>
    );

  return (
    <div className="qe-page">
      {/* Banner Section */}
      <div className="qe-banner">
        <video
          src={bannerVideo}
          autoPlay
          muted
          loop
          playsInline
          className="qe-banner-video"
        />
      </div>
      <section className="qe-section">
        <div className="qe-container">
          <div className="qe-header">
            <h1 className="qe-title">
              Quality Education Programs <span></span>
            </h1>
          </div>

          <div className="qe-grid">
            {items.length === 0 ? (
              <div className="qe-empty">
                <h3>No quality education programs available at the moment</h3>
                <p>
                  We are working on bringing educational programs to communities
                  in need
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="qe-card">
                  {item.image_url && (
                    <div className="qe-card-image">
                      <img src={getImageUrl(item.image_url)} alt={item.title} />

                      {item.organization && (
                        <div className="qe-org-badge">{item.organization}</div>
                      )}
                    </div>
                  )}

                  <div className="qe-card-body">
                    <h2 className="qe-card-title">{item.title}</h2>
                    <p className="qe-card-desc">{item.description}</p>

                    {item.content && (
                      <div
                        className="qe-card-details"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}

                    {/* Read More button */}
                    <div className="qe-card-footer">
                      <Link
                        to={`/quality-education/${item.id}`}
                        className="qe-read-more"
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

export default QualityEducation;
