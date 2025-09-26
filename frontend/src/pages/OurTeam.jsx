import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OurTeam.css";
import bannerImg from "../assets/BannerImages/s.jpeg";

const OurTeam = () => {
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [trustees, setTrustees] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingManagement, setLoadingManagement] = useState(true);
  const [loadingTrustees, setLoadingTrustees] = useState(true);

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

  useEffect(() => {
    const fetchTrustees = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/board-trustees"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTrustees(data);
        setLoadingTrustees(false);
      } catch (error) {
        console.error("❌ Error fetching board trustees:", error);
        setLoadingTrustees(false);
      }
    };
    fetchTrustees();
  }, []);

  return (
    <div className="advisory-page">
      {/* Banner */}
      <div className="banner">
        <img src={bannerImg} alt="Banner" />
      </div>

      {/* Board of Trustee */}
      <section className="FOT-section">
        <h2 className="trustee-title">
          Our Board of Trustees<span></span>
        </h2>
        {loadingTrustees ? (
          <p>Loading board trustees...</p>
        ) : trustees.length === 0 ? (
          <div className="empty-box">
            <p>Content will be added soon...</p>
          </div>
        ) : (
          <div className="team-container">
            {trustees.map((trustee) => (
              <div key={trustee.id} className="team-card">
                <h3>{trustee.name}</h3>
                <p className="role">{trustee.position}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Our Mentors */}
      <section className="OT-section">
        <h2 className="mentors-title">
          Our Mentors <span></span>
        </h2>
        {loadingMentors ? (
          <p>Loading mentors...</p>
        ) : (
          <div className="team-container">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="team-card">
                <img
                  src={`http://localhost:5000/api/uploads/mentors/${mentor.image}`}
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
      {/* <section className="OT-section">
        <h2 className="management-title">
          Management Team<span></span>
        </h2>
        {loadingManagement ? (
          <p>Loading management team...</p>
        ) : (
          <div className="team-container">
            {management.map((member) => (
              <div key={member.id} className="team-card">
                <h3>{member.name}</h3>
                <p className="role">{member.position}</p>
              </div>
            ))}
          </div>
        )}
      </section> */}

      {/* You May Find Useful */}
      <section className="OT-section">
        <h2 className="useful-title">
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
            <h3>Legal Status</h3>
            <p>Know our compliance, certifications, and registrations.</p>
            <Link to="/legalreports" className="use-btn">
              View Details
            </Link>
          </div>
          <div className="useful-card">
            <h3>Career</h3>
            <p>Explore exciting opportunities to grow with us.</p>
            <Link to="/careers" className="use-btn">
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurTeam;
