// src/pages/OurTeam.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OurTeam.css";
import { getBanners } from "../services/api.jsx";

const OurTeam = () => {
  const [mentors, setMentors] = useState([]);
  const [management, setManagement] = useState([]);
  const [trustees, setTrustees] = useState([]);
  const [teamBanners, setTeamBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingManagement, setLoadingManagement] = useState(true);
  const [loadingTrustees, setLoadingTrustees] = useState(true);

  // Fetch team page banners
  useEffect(() => {
    const fetchTeamBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('🔄 Fetching team page banners...');
        const bannersData = await getBanners('our-team', 'hero');
        console.log('✅ Team banners received:', bannersData);
        setTeamBanners(bannersData);
      } catch (error) {
        console.error('❌ Error fetching team banners:', error);
        setTeamBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchTeamBanners();
  }, []);

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

  // Render dynamic banner
  const renderBanner = () => {
    if (bannersLoading) {
      return (
        <div className="banner">
          <div className="loading-banner">Loading banner...</div>
        </div>
      );
    }

    if (teamBanners.length === 0) {
      return (
        <div className="banner">
          <div className="no-banner-message">
            <p>Team page banner will appear here once added from dashboard</p>
          </div>
        </div>
      );
    }

    return (
      <div className="banner">
        {teamBanners.map((banner) => (
          <div key={banner.id} className="banner-container">
            {banner.media_type === 'image' ? (
              <img
                src={`http://localhost:5000/uploads/banners/${banner.media}`}
                alt={`Our Team Banner - ${banner.page}`}
                className="banner-image"
              />
            ) : (
              <video
                src={`http://localhost:5000/uploads/banners/${banner.media}`}
                className="banner-video"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="advisory-page">
      {/* Dynamic Banner */}
      {renderBanner()}

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
                {trustee.image ? (
                  <img
                    src={`http://localhost:5000/api/uploads/board-trustees/${trustee.image}`}
                    alt={trustee.name}
                  />
                ) : null}

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