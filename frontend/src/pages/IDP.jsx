import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./IDP.css";
import bannerImg from "../assets/BannerImages/fo.jpeg";

const IDP = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";
  const SERVER_BASE = "http://localhost:5000";

  const getFullUrl = (path) => {
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
      {/* Banner Section */}
      <div className="hc-banner">
        <img src={bannerImg} alt="Quality Education Banner" />
      </div>
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
                          src={getFullUrl(item.image_url)}
                          alt={item.title}
                        />

                        <div className="idp-image-overlay"></div>
                      </div>
                    )}

                    <div className="idp-card-content">
                      <h2 className="idp-card-title">{item.title}</h2>
                      <p className="idp-card-description">{item.description}</p>

                      {item.content && (
                        <div
                          className="idp-card-details"
                          dangerouslySetInnerHTML={{ __html: item.content }}
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
    </div>
  );
};

export default IDP;
