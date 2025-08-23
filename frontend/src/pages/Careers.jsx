// src/pages/Careers.jsx
import React, { useState, useEffect } from 'react';
import { getCareers } from '../services/api';

const Careers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    const fetchCareersData = async () => {
      try {
        setLoading(true);
        const careersData = await getCareers();
        setCareers(careersData);
      } catch (err) {
        setError('Failed to load career opportunities. Please try again later.');
        console.error('Error fetching careers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareersData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    alert('Thank you for your interest! We will contact you when opportunities become available.');
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="page-container"><div className="loading">Loading career opportunities...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Career Opportunities</h2>
          
          {careers.length === 0 ? (
            <div className="no-openings">
              <p>Currently, we don't have any open positions.</p>
              <p>Please fill out the contact form below for future opportunities.</p>
              
              <div className="contact-form">
                <h3>Express Interest</h3>
                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your Phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      name="message"
                      placeholder="Your Message and Areas of Interest"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    />
                  </div>
                  <button type="submit" className="btn">Submit</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="careers-list">
              <h3>Current Openings</h3>
              {careers.map(career => (
                <div key={career.id} className="career-card">
                  <h4>{career.title}</h4>
                  <div className="career-details">
                    <p><strong>Location:</strong> {career.location}</p>
                    <p><strong>Type:</strong> {career.type}</p>
                    <p><strong>Requirements:</strong> {career.requirements}</p>
                  </div>
                  <div className="career-description" dangerouslySetInnerHTML={{ __html: career.description }} />
                  <button className="btn">Apply Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Careers;