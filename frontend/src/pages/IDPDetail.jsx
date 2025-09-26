// src/pages/IDPDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./IDPDetail.css";

const API_BASE = "http://localhost:5000/api";
const SERVER_BASE = "http://localhost:5000";

const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  // Remove any leading slashes just in case
  const cleanPath = path.replace(
    /^\/?uploads\/our-work\/integrated_development\//,
    ""
  );
  return `${SERVER_BASE}/api/uploads/our-work/integrated_development/${cleanPath}`;
};

// Convert YouTube / Vimeo watch URLs to embeddable URLs
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

// Detect if URL is a direct video file
const isDirectVideoFile = (url) => {
  return url?.match(/\.(mp4|webm|ogg)$/i);
};

const IDPDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/integrated-development/${id}`
      );
      setItem(response.data);
    } catch (err) {
      console.error("Error fetching IDP details:", err);
      setError("Failed to load Integrated Development Initiative details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="idp-detail-page">
        <div className="idp-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="idp-detail-page">
        <div className="idp-error">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="idp-detail-page">
        <div className="idp-empty">Initiative not found</div>
      </div>
    );
  }

  const videoUrl = item.video_url ? getFullUrl(item.video_url) : "";
  const embedUrl = getEmbedUrl(videoUrl);
  const directVideo = isDirectVideoFile(videoUrl);

  return (
    <div className="idp-detail-page">
      {/* Back link */}
      <div className="idp-detail-back">
        <Link to="/idp">← Back to Integrated Development Programs</Link>
      </div>

      {/* Content row */}
      <div className="idp-detail-content">
        <div className="idp-detail-row">
          {item.image_url && (
            <div className="idp-detail-image">
              <img src={getFullUrl(item.image_url)} alt={item.title} />
            </div>
          )}

          <div className="idp-detail-text">
            <h1 className="idp-detail-title">{item.title}</h1>
            <p className="idp-detail-description">{item.description}</p>
          </div>
        </div>

        {/* HTML content */}
        {item.content && (
          <div
            className="idp-detail-html"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {/* Video section */}
        {videoUrl && (
          <div className="idp-detail-video">
            <h3>Watch Video</h3>
            <div className="idp-video-wrapper">
              {directVideo ? (
                <video controls width="100%">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={embedUrl}
                  title={item.title}
                  width="100%"
                  height="500"
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

export default IDPDetail;
