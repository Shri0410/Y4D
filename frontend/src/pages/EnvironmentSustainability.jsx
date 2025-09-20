import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./EnvironmentSustainability.css";
import bannerImg from "../assets/BannerImages/fo.jpeg";

const API_BASE = "http://localhost:5000/api";
const SERVER_BASE = "http://localhost:5000";

const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const EnvironmentSustainability = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <img src={bannerImg} alt="Environment Sustainability Banner" />
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
              <div className="es-empty">
                <h3>No programs available at the moment</h3>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="es-card">
                  {item.image_url && (
                    <div className="es-card-image">
                      <img src={getFullUrl(item.image_url)} alt={item.title} />
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
