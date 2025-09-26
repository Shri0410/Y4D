// src/pages/BlogDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./BlogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
  const UPLOADS_BASE =
    import.meta.env.VITE_UPLOADS_BASE || "http://localhost:5000/api/uploads";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${API_BASE}/media/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, API_BASE]);

  const renderTags = (tags) => {
    if (!tags) return null;
    try {
      const tagArray = typeof tags === "string" ? JSON.parse(tags) : tags;
      return (
        <div className="blog-tags">
          {tagArray.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      );
    } catch {
      return null;
    }
  };

  if (loading) return <div className="loading">Loading article...</div>;
  if (!blog) return <div className="loading">Article not found.</div>;

  return (
    <div className="blog-details-page">
      <div className="blog-details-container">
        <Link to="/blogs" className="back-link">
          ← Back to Blogs
        </Link>

        <h1 className="blog-title">{blog.title}</h1>

        <div className="blog-meta">
          {blog.author && <span className="author">By {blog.author}</span>}
          {blog.published_date && (
            <span className="date">
              {new Date(blog.published_date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {renderTags(blog.tags)}

        {blog.image && (
          <div className="blog-image-full">
            <img
              src={`${UPLOADS_BASE}/media/blogs/${blog.image}`}
              alt={blog.title}
              onError={(e) => (e.target.src = "/placeholder-blog.jpg")}
            />
          </div>
        )}

        <div className="blog-full-content">
          {blog.description && (
            <p className="description">{blog.description}</p>
          )}

          {blog.content &&
            blog.content
              .split("\n")
              .map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
