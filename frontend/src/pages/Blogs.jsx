// src/pages/Blogs.jsx
import React, { useState, useEffect } from 'react';
import { getBlogs } from '../services/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const blogsData = await getBlogs();
        // Sort blogs by published date (newest first)
        const sortedBlogs = blogsData.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
        setBlogs(sortedBlogs);
      } catch (err) {
        setError('Failed to load blogs. Please try again later.');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div className="page-container"><div className="loading">Loading blogs...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Blogs</h2>
          <p className="section-description">
            Insights, updates, and perspectives from our team and partners.
          </p>
          
          {blogs.length === 0 ? (
            <div className="no-data">
              <p>No blogs available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map(blog => (
                <div key={blog.id} className="blog-card">
                  {blog.image && (
                    <div className="blog-image">
                      <img 
                        src={`http://localhost:5000/uploads/media/blogs/${blog.image}`} 
                        alt={blog.title}
                      />
                    </div>
                  )}
                  <div className="blog-content">
                    <h3>{blog.title}</h3>
                    <p className="blog-meta">
                      By {blog.author} • {new Date(blog.published_date).toLocaleDateString()}
                    </p>
                    {blog.tags && (
                      <div className="blog-tags">
                        {blog.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="blog-excerpt">
                      {blog.content.length > 200 
                        ? `${blog.content.substring(0, 200)}...` 
                        : blog.content
                      }
                    </div>
                    <button 
                      className="btn"
                      onClick={() => setSelectedBlog(blog)}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Modal */}
      {selectedBlog && (
        <div className="modal-overlay" onClick={() => setSelectedBlog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBlog(null)}>×</button>
            <h2>{selectedBlog.title}</h2>
            <p className="blog-meta">
              By {selectedBlog.author} • {new Date(selectedBlog.published_date).toLocaleDateString()}
            </p>
            {selectedBlog.tags && (
              <div className="blog-tags">
                {selectedBlog.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
            {selectedBlog.image && (
              <img 
                src={`http://localhost:5000/uploads/media/blogs/${selectedBlog.image}`} 
                alt={selectedBlog.title}
                className="modal-image"
              />
            )}
            <div className="blog-full-content">
              {selectedBlog.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;