// src/pages/GetInvolved.jsx
import React, { useState } from 'react';

const GetInvolved = () => {
  const [activeTab, setActiveTab] = useState('corporate');

  const tabs = [
    { id: 'corporate', label: 'Corporate Partnership' },
    { id: 'volunteer', label: 'Volunteers & Internship' },
    { id: 'careers', label: 'Careers' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'corporate':
        return (
          <div>
            <h3>Corporate Partnership</h3>
            <p>Partner with us to create sustainable impact.</p>
            <form className="partnership-form">
              <input type="text" placeholder="Company Name" />
              <input type="email" placeholder="Email Address" />
              <textarea placeholder="How would you like to partner with us?"></textarea>
              <button type="submit" className="btn">Submit</button>
            </form>
          </div>
        );
      case 'volunteer':
        return (
          <div>
            <h3>Volunteers & Internship</h3>
            <p>Join us as a volunteer or intern.</p>
            <form className="volunteer-form">
              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email Address" />
              <select>
                <option>Select Role</option>
                <option>Volunteer</option>
                <option>Intern</option>
              </select>
              <textarea placeholder="Why do you want to join us?"></textarea>
              <button type="submit" className="btn">Apply</button>
            </form>
          </div>
        );
      case 'careers':
        return (
          <div>
            <h3>Careers</h3>
            <p>Explore career opportunities with Y4D.</p>
            <div className="job-listings">
              <div className="job-card">
                <h4>Job Title 1</h4>
                <p>Location: Mumbai</p>
                <button className="btn">Apply Now</button>
              </div>
              <div className="job-card">
                <h4>Job Title 2</h4>
                <p>Location: Remote</p>
                <button className="btn">Apply Now</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="get-involved-page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Get Involved</h2>
          
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

export default GetInvolved;