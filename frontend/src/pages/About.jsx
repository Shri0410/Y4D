// src/pages/About.jsx
import React, { useState } from 'react';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  const tabs = [
    { id: 'mission', label: 'Mission, Vision, Value' },
    { id: 'philosophy', label: 'Philosophy of Change' },
    { id: 'pyramid', label: 'Pyramid of Empowerment' },
    { id: 'how-we-work', label: 'How We Work' },
    { id: 'why-trust', label: 'Why Trust Us?' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mission':
        return (
          <div>
            <h3>Our Mission</h3>
            <p>To empower communities through sustainable development initiatives.</p>
            <h3>Our Vision</h3>
            <p>A world where every individual has the opportunity to thrive.</p>
            <h3>Our Values</h3>
            <ul>
              <li>Integrity</li>
              <li>Transparency</li>
              <li>Innovation</li>
              <li>Collaboration</li>
            </ul>
          </div>
        );
      case 'philosophy':
        return <p>Our philosophy centers on community-led development and sustainable change.</p>;
      case 'pyramid':
        return <p>The Pyramid of Empowerment represents our approach to development.</p>;
      case 'how-we-work':
        return <p>We work through partnerships, community engagement, and evidence-based programs.</p>;
      case 'why-trust':
        return <p>We maintain the highest standards of transparency and accountability.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="about-page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          
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

          <div className="useful-links">
            <h3>You May Find Useful</h3>
            <div className="link-buttons">
              <button className="btn">Legal Status</button>
              <button className="btn">Career</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Reach and Presence</h2>
          {/* Impact counters and map would go here */}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          {/* Team members would be listed here */}
        </div>
      </section>
    </div>
  );
};

export default About;