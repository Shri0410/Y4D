// src/pages/MediaCorner.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MediaCorner = () => {
  const [activeTab, setActiveTab] = useState('newsletters');

  const tabs = [
    { id: 'newsletters', label: 'Newsletters', path: '/newsletters' },
    { id: 'stories', label: 'Stories of Empowerment', path: '/stories' },
    { id: 'events', label: 'Events', path: '/events' },
    { id: 'blogs', label: 'Blogs', path: '/blogs' },
    { id: 'documentaries', label: 'Documentaries', path: '/documentaries' }
  ];

  return (
    <div className="media-corner-page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Media Corner</h2>
          <p className="section-description">
            Explore our latest publications, stories, events, and media content.
          </p>
          
          <div className="tabs">
            <div className="tab-headers">
              {tabs.map(tab => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={activeTab === tab.id ? 'tab-button active' : 'tab-button'}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            
            <div className="tab-content">
              <div className="media-overview">
                <h3>Welcome to our Media Center</h3>
                <p>
                  Discover the latest updates, success stories, and insights from our work 
                  across various communities. Click on any tab above to explore specific media types.
                </p>
                
                <div className="media-highlights">
                  <div className="highlight-card">
                    <h4>Latest Newsletters</h4>
                    <p>Stay updated with our quarterly reports and impact stories</p>
                    <Link to="/newsletters" className="btn">View All</Link>
                  </div>
                  
                  <div className="highlight-card">
                    <h4>Inspiring Stories</h4>
                    <p>Read about the lives we've transformed through our programs</p>
                    <Link to="/stories" className="btn">Read Stories</Link>
                  </div>
                  
                  <div className="highlight-card">
                    <h4>Upcoming Events</h4>
                    <p>Join us in our mission and participate in our events</p>
                    <Link to="/events" className="btn">View Events</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediaCorner;