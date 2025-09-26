// src/pages/EnvironmentSustainabilityDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./EnvironmentSustainabilityDetail.css";

const API_BASE = "http://localhost:5000/api";
const SERVER_BASE = "http://localhost:5000";

// --- Helpers ---
const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  // Remove any leading slashes just in case
  const cleanPath = path.replace(
    /^\/?uploads\/our-work\/environment_sustainability\//,
    ""
  );
  return `${SERVER_BASE}/api/uploads/our-work/environment_sustainability/${cleanPath}`;
};
const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;

  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
};

const isDirectVideoFile = (url) => {
  return url?.match(/\.(mp4|webm|ogg)$/i);
};

const EnvironmentSustainabilityDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    try {
      const url = `${API_BASE}/environment-sustainability/${id}`;
      const response = await axios.get(url);
      setItem(response.data);
    } catch (err) {
      console.error("Error fetching environment sustainability details:", err);
      setError("Failed to load initiative details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="es-detail-page">
        <div className="es-loading">
          Loading Environment Sustainability Initiative...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="es-detail-page">
        <div className="es-error">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="es-detail-page">
        <div className="es-empty">Initiative not found</div>
      </div>
    );
  }

  const videoUrl = item.video_url ? getFullUrl(item.video_url) : "";
  const embedUrl = getEmbedUrl(videoUrl);
  const directVideo = isDirectVideoFile(videoUrl);

  return (
    <div className="es-detail-page">
      {/* Back link */}
      <div className="es-detail-back">
        <Link to="/environment-sustainability">
          ← Back to Environment Sustainability Programs
        </Link>
      </div>

      {/* Content container */}
      <div className="es-detail-content">
        {/* Row: image + title/description */}
        <div className="es-detail-row">
          {item.image_url && (
            <div className="es-detail-image">
              <img src={getFullUrl(item.image_url)} alt={item.title} />
            </div>
          )}

          <div className="es-detail-text">
            <h1 className="es-detail-title">{item.title}</h1>
            <p className="es-detail-description">{item.description}</p>
          </div>
        </div>

        {/* HTML content below row */}
        {item.content && (
          <div
            className="es-detail-html"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {/* Video section */}
        {videoUrl && (
          <div className="es-detail-video">
            <div className="es-video-wrapper">
              {directVideo ? (
                <video controls>
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={embedUrl}
                  title={item.title}
                  width="100%"
                  height="350"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentSustainabilityDetail;
