// src/pages/MediaCorner.jsx
import React, { useState } from 'react';

const MediaCorner = () => {
  const [activeTab, setActiveTab] = useState('newsletters');

  const tabs = [
    { id: 'newsletters', label: 'Newsletters' },
    { id: 'stories', label: 'Stories of Empowerment' },
    { id: 'events', label: 'Events' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'documentaries', label: 'Documentaries' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'newsletters':
        return (
          <div>
            <h3>Newsletters</h3>
            <div className="newsletter-grid">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="newsletter-card">
                  <h4>Newsletter {item}</h4>
                  <p>Quarterly updates and impact stories</p>
                  <button className="btn">Download</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'stories':
        return (
          <div>
            <h3>Stories of Empowerment</h3>
            <div className="stories-grid">
              {[1, 2, 3].map(item => (
                <div key={item} className="story-card">
                  <h4>Success Story {item}</h4>
                  <p>Inspiring stories of change</p>
                  <button className="btn">Read More</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'events':
        return (
          <div>
            <h3>Events</h3>
            <div className="events-grid">
              {[1, 2, 3].map(item => (
                <div key={item} className="event-card">
                  <h4>Event {item}</h4>
                  <p>Date: DD/MM/YYYY</p>
                  <button className="btn">Learn More</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'blogs':
        return (
          <div>
            <h3>Blogs</h3>
            <div className="blogs-grid">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="blog-card">
                  <h4>Blog Post {item}</h4>
                  <p>Insights and updates from our work</p>
                  <button className="btn">Read More</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'documentaries':
        return (
          <div>
            <h3>Documentaries</h3>
            <div className="documentaries-grid">
              {[1, 2, 3].map(item => (
                <div key={item} className="documentary-card">
                  <img src={`/assets/doc-${item}.jpg`} alt={`Documentary ${item}`} />
                  <h4>Documentary {item}</h4>
                  <button className="btn">Watch Now</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="media-corner-page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Media Corner</h2>
          
          <div className="tabs">
            <div className="tab-headers">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediaCorner;