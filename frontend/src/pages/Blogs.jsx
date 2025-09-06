import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Blogs.css";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
    setLoading(false);
  };

  const openBlogModal = (blog) => {
    setSelectedBlog(blog);
  };

  const closeBlogModal = () => {
    setSelectedBlog(null);
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
    } catch (error) {
      return null;
    }
  };

  if (loading) return <div className="loading">Loading blogs...</div>;

  return (
    <div className="blogs-page">
      <div className="blog-header">
        <h1>
          Blog Articles <span></span>
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
                    src={`${API_BASE}/uploads/media/blogs/${blog.image}`}
                    alt={blog.title}
                    onError={(e) => {
                      e.target.src = "/placeholder-blog.jpg";
                    }}
                  />
                </div>
              )}
              <div className="blog-content">
                <h3>{blog.title}</h3>
                {renderTags(blog.tags)}
                <p className="blog-excerpt">
                  {blog.content.length > 120
                    ? `${blog.content.substring(0, 120)}...`
                    : blog.content}
                </p>
                <div className="blog-meta">
                  <p className="blog-author">By {blog.author}</p>
                  <p className="blog-date">
                    {new Date(blog.published_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => openBlogModal(blog)}
                  className="btn-read-more"
                >
                  Read Article
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Blog Modal */}
      {selectedBlog && (
        <div className="modal-overlay" onClick={closeBlogModal}>
          <div
            className="modal-content blog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedBlog.title}</h2>
              <button onClick={closeBlogModal} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedBlog.image && (
                <div className="modal-image">
                  <img
                    src={`${API_BASE}/uploads/media/blogs/${selectedBlog.image}`}
                    alt={selectedBlog.title}
                  />
                </div>
              )}
              <div className="blog-meta-modal">
                <span className="author">By {selectedBlog.author}</span>
                <span className="date">
                  {new Date(selectedBlog.published_date).toLocaleDateString()}
                </span>
              </div>
              {renderTags(selectedBlog.tags)}
              <div className="blog-full-content">
                {selectedBlog.content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
