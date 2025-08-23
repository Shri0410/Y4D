// src/pages/OurTeam.jsx
import React, { useState, useEffect } from 'react';
import { getMentors, getManagement } from '../services/api';

const OurTeam = () => {
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [mentorsData, managementData] = await Promise.all([
          getMentors(),
          getManagement()
        ]);
        setMentors(mentorsData);
        setManagement(managementData);
      } catch (err) {
        setError('Failed to load team data. Please try again later.');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  if (loading) return <div className="page-container"><div className="loading">Loading team information...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          
          {/* Mentors Section */}
          <div className="team-section">
            <h3 className="subsection-title">Our Mentors</h3>
            {mentors.length === 0 ? (
              <p className="no-data">No mentors information available at the moment.</p>
            ) : (
              <div className="team-grid">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="team-card">
                    {mentor.image && (
                      <img 
                        src={`http://localhost:5000/uploads/mentors/${mentor.image}`} 
                        alt={mentor.name}
                        className="team-image"
                      />
                    )}
                    <div className="team-info">
                      <h4>{mentor.name}</h4>
                      <p className="position">{mentor.position}</p>
                      <p className="bio">{mentor.bio}</p>
                      {mentor.social_links && (
                        <div className="social-links">
                          {mentor.social_links.twitter && (
                            <a href={mentor.social_links.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                          )}
                          {mentor.social_links.linkedin && (
                            <a href={mentor.social_links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Management Team Section */}
          <div className="team-section">
            <h3 className="subsection-title">Management Team</h3>
            {management.length === 0 ? (
              <p className="no-data">No management team information available at the moment.</p>
            ) : (
              <div className="team-grid">
                {management.map(member => (
                  <div key={member.id} className="team-card">
                    {member.image && (
                      <img 
                        src={`http://localhost:5000/uploads/management/${member.image}`} 
                        alt={member.name}
                        className="team-image"
                      />
                    )}
                    <div className="team-info">
                      <h4>{member.name}</h4>
                      <p className="position">{member.position}</p>
                      <p className="bio">{member.bio}</p>
                      {member.social_links && (
                        <div className="social-links">
                          {member.social_links.twitter && (
                            <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                          )}
                          {member.social_links.linkedin && (
                            <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurTeam;