// src/pages/Documentaries.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Documentaries.css";
import { getBanners } from "../services/api.jsx";
import { API_BASE, UPLOADS_BASE } from "../config/api";

const Documentaries = () => {
  const [documentaries, setDocumentaries] = useState([]);
  const [docsBanners, setDocsBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Fetch documentaries page banners
  useEffect(() => {
    const fetchDocsBanners = async () => {
      try {
        setBannersLoading(true);
        console.log("🔄 Fetching documentaries page banners...");
        const bannersData = await getBanners("media-corner", "documentaries");
        console.log("✅ Documentaries banners received:", bannersData);
        setDocsBanners(bannersData);
      } catch (error) {
        console.error("❌ Error fetching documentaries banners:", error);
        setDocsBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchDocsBanners();
  }, []);

  useEffect(() => {
    fetchDocumentaries();
  }, []);

  const fetchDocumentaries = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/media/published/documentaries`
      );
      setDocumentaries(response.data);
    } catch (error) {
      console.error("Error fetching documentaries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="documentaries-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (docsBanners.length === 0) {
      return (
        <div className="documentaries-banner">
          <div className="no-banner-message">
            <p>
              Documentaries banner will appear here once added from dashboard
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="documentaries-banner">
        {docsBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === "image" ? (
              <img
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                alt={`Documentaries Banner - ${banner.page}`}
                className="documentaries-banner-image"
              />
            ) : (
              <video
                src={`${UPLOADS_BASE}/banners/${banner.media}`}
                className="documentaries-banner-video"
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

  const openDocModal = (doc) => setSelectedDoc(doc);
  const closeDocModal = () => setSelectedDoc(null);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match && match[1]
      ? `https://www.youtube.com/embed/${match[1]}`
      : url;
  };

  if (loading) return <div className="loading">Loading documentaries...</div>;

  return (
    <div className="documentaries-container">
      {/* Dynamic Banner */}
      {renderBanner()}
      <div className="documentaries-page">
        <div className="page-header">
          <h1>
            Documentaries<span></span>
          </h1>
          <p>Watch our inspiring video content and stories</p>
        </div>

        <div className="documentaries-grid">
          {documentaries.length === 0 ? (
            <div className="empty-state">
              <p>No documentaries available at the moment</p>
            </div>
          ) : (
            documentaries.map((doc) => (
              <div key={doc.id} className="documentary-card">
                {doc.thumbnail && (
                  <div className="doc-thumbnail">
                    <img
                      src={`${UPLOADS_BASE}/media/documentaries/${doc.thumbnail}`}
                      alt={doc.title}
                      onError={(e) => (e.target.src = "/placeholder-video.jpg")}
                    />
                    <div
                      className="play-overlay"
                      onClick={() => openDocModal(doc)}
                    >
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                )}
                <div className="doc-content">
                  <h3>{doc.title}</h3>
                  <p className="doc-description">
                    {doc.description.length > 100
                      ? doc.description.substring(0, 35) + "..."
                      : doc.description}
                  </p>
                  <div className="doc-meta">
                    {doc.duration && (
                      <span className="doc-duration">
                        Duration: {doc.duration}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openDocModal(doc)}
                    className="btn-watch"
                  >
                    Watch Documentary
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Documentary Modal */}
        {selectedDoc && (
          <div className="modal-overlay" onClick={closeDocModal}>
            <div
              className="modal-content doc-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedDoc.title}</h2>
                <button onClick={closeDocModal} className="close-btn">
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {/* FIXED: Handle both YouTube URLs and uploaded videos */}
                {selectedDoc.video_url || selectedDoc.video_filename ? (
                  <div className="video-container">
                    {selectedDoc.video_url ? (
                      // YouTube/Vimeo embed
                      <iframe
                        src={getYouTubeEmbedUrl(selectedDoc.video_url)}
                        title={selectedDoc.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      // Uploaded video file
                      <video controls autoPlay className="uploaded-video">
                        <source
                          src={`${UPLOADS_BASE}/media/documentaries/${selectedDoc.video_filename}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="no-video-message">
                    <p>Video content not available</p>
                  </div>
                )}

                <div className="doc-details">
                  <h3>Description</h3>
                  <p>{selectedDoc.description}</p>
                  <div className="doc-meta-full">
                    {selectedDoc.duration && (
                      <p>
                        <strong>Duration:</strong> {selectedDoc.duration}
                      </p>
                    )}
                    <p>
                      <strong>Published:</strong>{" "}
                      {new Date(selectedDoc.published_date).toLocaleDateString(
                        "en-US"
                      )}
                    </p>
                    {selectedDoc.video_filename && (
                      <p>
                        <strong>Video Type:</strong> Uploaded File
                      </p>
                    )}
                    {selectedDoc.video_url && (
                      <p>
                        <strong>Video Type:</strong> External URL
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentaries;
