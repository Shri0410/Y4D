import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EnvironmentSustainability.css";
import bannerImg from "../assets/BannerImages/fo.jpeg";

const EnvironmentSustainability = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/our-work/published/environment_sustainability`
      );
      setItems(response.data);
    } catch (error) {
      console.error(
        "Error fetching environment sustainability programs:",
        error
      );
      setError("Failed to load environment sustainability programs");
    } finally {
      setLoading(false);
    }
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
      {/* Banner Section */}
      <div className="es-banner">
        <img src={bannerImg} alt="Quality Education Banner" />
      </div>
      <section className="es-section">
        <div className="es-container">
          <div className="es-header">
            <h1 className="es-title">
              Environment Sustainability <span></span>
            </h1>
          </div>

          <div className="es-grid">
            {items.length === 0 ? (
              <div className="es-empty"></div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="es-card">
                  {item.image_url && (
                    <div className="es-card-image">
                      <img src={item.image_url} alt={item.title} />
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

                    {item.video_url && (
                      <div className="es-card-video">
                        <h4>Watch Video</h4>
                        <div className="es-video-wrapper">
                          <iframe
                            src={item.video_url}
                            title={item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    <div className="es-card-meta">
                      <span>
                        Last updated:{" "}
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="es-card-footer">
                      <a className="es-read-more">Read More</a>
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
