import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OurTeam.css";
import bannerImg from "../assets/BannerImages/s.jpeg"; // replace with your banner image path

const OurTeam = () => {
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingManagement, setLoadingManagement] = useState(true);

  // Fetch mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/mentors");
        const data = await response.json();
        setMentors(data);
        setLoadingMentors(false);
      } catch (error) {
        console.error("❌ Error fetching mentors:", error);
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  // Fetch management
  useEffect(() => {
    const fetchManagement = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/management");
        const data = await response.json();
        setManagement(data);
        setLoadingManagement(false);
      } catch (error) {
        console.error("❌ Error fetching management:", error);
        setLoadingManagement(false);
      }
    };
    fetchManagement();
  }, []);

  return (
    <div className="advisory-page">
      {/* Banner */}
      <div className="banner">
        <img src={bannerImg} alt="Banner" />
      </div>

      {/* Board of Trustee */}
      <section className="FOT-section">
        <h2 className="section-title">
          Our Board of Trustee<span></span>
        </h2>
        <div className="empty-box">
          <p>Content will be added soon...</p>
        </div>
      </section>

      {/* Our Mentors */}
      <section className="OT-section">
        <h2 className="section-title">
          Our Mentors<span></span>
        </h2>
        {loadingMentors ? (
          <p>Loading mentors...</p>
        ) : (
          <div className="team-container">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="team-card">
                <img
                  src={`http://localhost:5000/uploads/mentors/${mentor.image}`}
                  alt={mentor.name}
                />
                <h3>{mentor.name}</h3>
                <p className="role">{mentor.position}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Management Team */}
      <section className="OT-section">
        <h2 className="section-title">
          Management Team<span></span>
        </h2>
        {loadingManagement ? (
          <p>Loading management team...</p>
        ) : (
          <div className="team-container">
            {management.map((member) => (
              <div key={member.id} className="team-card">
                <img
                  src={`http://localhost:5000/uploads/management/${member.image}`}
                  alt={member.name}
                />
                <h3>{member.name}</h3>
                <p className="role">{member.position}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* You May Find Useful */}
      <section className="OT-section">
        <h2 className="section-title">
          You May Find Useful<span></span>
        </h2>
        <div className="useful-container">
          <div className="useful-card">
            <h3>About Us</h3>
            <p>Learn about our mission, vision, and core values.</p>
            <Link to="/about" className="use-btn">
              Read More
            </Link>
          </div>
          <div className="useful-card">
            <h3>Career</h3>
            <p>Explore exciting opportunities to grow with us.</p>
            <Link to="/career" className="use-btn">
              Apply Now
            </Link>
          </div>
          <div className="useful-card">
            <h3>Legal Status</h3>
            <p>Know our compliance, certifications, and registrations.</p>
            <Link to="/legalstatus" className="use-btn">
              View Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurTeam;
