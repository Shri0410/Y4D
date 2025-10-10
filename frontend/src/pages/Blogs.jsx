// src/pages/Blogs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Blogs.css";
import { getBanners } from "../services/api.jsx";

const API_BASE = "http://localhost:5000/api";
const UPLOADS_BASE = "http://localhost:5000/api/uploads";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [blogsBanners, setBlogsBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch blogs page banners
  useEffect(() => {
    const fetchBlogsBanners = async () => {
      try {
        setBannersLoading(true);
        console.log("🔄 Fetching blogs page banners...");
        const bannersData = await getBanners("media-corner", "blogs");
        console.log("✅ Blogs banners received:", bannersData);
        setBlogsBanners(bannersData);
      } catch (error) {
        console.error("❌ Error fetching blogs banners:", error);
        setBlogsBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBlogsBanners();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="blogs-banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (blogsBanners.length === 0) {
      return (
        <div className="blogs-banner">
          <div className="no-banner-message">
            <p>Blogs banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="blogs-banner">
        {blogsBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === "image" ? (
              <img
                src={`http://localhost:5000/uploads/banners/${banner.media}`}
                alt={`Blogs Banner - ${banner.page}`}
                className="blogs-banner-image"
              />
            ) : (
              <video
                src={`http://localhost:5000/uploads/banners/${banner.media}`}
                className="blogs-banner-video"
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

  const renderTags = (tags) => {
    if (!tags) return null;
    try {
      const tagArray = typeof tags === "string" ? JSON.parse(tags) : tags;
      return (
        <div className="blog-tags">
          {tagArray.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      );
    } catch {
      return null;
    }
  };

  if (loading)
    return (
      <div className="blogs-page">
        <p className="loading">Loading blogs...</p>
      </div>
    );

  return (
    <div className="blogs-container">
      {/* Dynamic Banner */}
      {renderBanner()}

      <div className="blogs-page">
        <div className="blog-header">
          <h1>
            Blog Articles<span></span>
          </h1>
          <p>Insights, stories, and updates from our team and community</p>
        </div>

        <div className="blogs-grid">
          {blogs.length === 0 ? (
            <div className="empty-state">
              <p>No blog articles available at the moment</p>
            </div>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                {blog.image && (
                  <div className="blog-image">
                    <img
                      src={`${UPLOADS_BASE}/media/blogs/${blog.image}`}
                      alt={blog.title}
                      onError={(e) => {
                        e.target.src = "/placeholder-blog.jpg";
                      }}
                    />
                  </div>
                )}
                <div className="blog-content">
                  <h3 className="blog-title">{blog.title}</h3>
                  {renderTags(blog.tags)}
                  <p className="blog-excerpt">
                    {blog.content.length > 120
                      ? `${blog.content.substring(0, 120)}...`
                      : blog.content}
                  </p>
                  <div className="blog-meta">
                    <p className="blog-author">By {blog.author}</p>
                    <p className="blog-date">
                      {new Date(blog.published_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <Link to={`/blogs/${blog.id}`} className="btn-read-more">
                    Read Article
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
