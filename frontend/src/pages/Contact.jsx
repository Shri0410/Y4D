// src/pages/Contact.jsx
import React, { useState } from 'react';

const Contact = () => {
  const [activeTab, setActiveTab] = useState('corporate');

  const tabs = [
    { id: 'corporate', label: 'Corporate Partnership' },
    { id: 'donation', label: 'Donation' },
    { id: 'helpdesk', label: 'Helpdesk' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'corporate':
        return (
          <div>
            <h3>Corporate Partnership</h3>
            <form className="contact-form">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <input type="text" placeholder="Company" />
              <textarea placeholder="Message"></textarea>
              <button type="submit" className="btn">Submit</button>
            </form>
          </div>
        );
      case 'donation':
        return (
          <div>
            <h3>Make a Donation</h3>
            <form className="donation-form">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <input type="number" placeholder="Amount" />
              <button type="submit" className="btn">Donate Now</button>
            </form>
          </div>
        );
      case 'helpdesk':
        return (
          <div>
            <h3>Helpdesk</h3>
            <p>For any grievances, suggestions, and queries kindly write to us</p>
            <form className="helpdesk-form">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <select>
                <option>Select Category</option>
                <option>Grievance</option>
                <option>Suggestion</option>
                <option>Query</option>
              </select>
              <textarea placeholder="Message"></textarea>
              <button type="submit" className="btn">Submit</button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="contact-page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          
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

          <div className="office-addresses">
            <div className="office-card">
              <h3>Head Office</h3>
              <p>Address line 1</p>
              <p>Address line 2</p>
              <p>City, State - PIN</p>
              <button className="btn">View on Map</button>
            </div>
            <div className="office-card">
              <h3>Mumbai Office</h3>
              <p>Address line 1</p>
              <p>Address line 2</p>
              <p>Mumbai, Maharashtra - PIN</p>
              <button className="btn">View on Map</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;