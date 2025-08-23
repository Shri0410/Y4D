// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Counter from '../component/Counter';
import { getMentors, getManagement, getReports } from '../services/api';

const Home = () => {
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [mentorsData, managementData, reportsData] = await Promise.all([
          getMentors(),
          getManagement(),
          getReports()
        ]);
        
        setTeamCount(mentorsData.length + managementData.length);
        setReportsCount(reportsData.length);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="home">
      {/* About Y4D Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">About Y4D</h2>
          <div className="about-content">
            <p>
              Y4D Foundation is a non-profit organization dedicated to creating sustainable change 
              in communities across India through education, healthcare, and livelihood programs. 
              We believe in empowering individuals and communities to build a better future for themselves.
            </p>
            <Link to="/about" className="btn">
              Know More
            </Link>
          </div>
        </div>
      </section>

      {/* Our Reach Section */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Our Reach</h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <Counter end={150000} suffix="+" duration={2} />
              <h3>Beneficiaries</h3>
            </div>
            <div className="card text-center">
              <Counter end={20} suffix="+" duration={2} />
              <h3>States</h3>
            </div>
            <div className="card text-center">
              <Counter end={200} suffix="+" duration={2} />
              <h3>Projects</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Team and Reports Count Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Impact</h2>
          <div className="grid grid-2">
            <div className="card text-center">
              {!loading ? (
                <Counter end={teamCount} suffix="+" duration={2} />
              ) : (
                <div className="loading-counter">...</div>
              )}
              <h3>Dedicated Team Members</h3>
              <Link to="/our-team" className="btn">Meet Our Team</Link>
            </div>
            <div className="card text-center">
              {!loading ? (
                <Counter end={reportsCount} suffix="+" duration={2} />
              ) : (
                <div className="loading-counter">...</div>
              )}
              <h3>Completed Projects</h3>
              <Link to="/our-work" className="btn">View Our Work</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Interventions Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Interventions</h2>
          <div className="grid grid-3">
            {[
              'Quality Education',
              'Livelihood',
              'Healthcare',
              'Environment Sustainability',
              'Integrated Development Program (IDP)'
            ].map((intervention, index) => (
              <div key={index} className="card text-center">
                <h3>{intervention}</h3>
                <Link to="/our-work" className="btn">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Highlights Section */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Latest from Our Media Corner</h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <h3>Newsletters</h3>
              <p>Stay updated with our latest activities and impact stories</p>
              <Link to="/newsletters" className="btn">Read Now</Link>
            </div>
            <div className="card text-center">
              <h3>Success Stories</h3>
              <p>Inspiring stories of transformation from our communities</p>
              <Link to="/stories" className="btn">Read Stories</Link>
            </div>
            <div className="card text-center">
              <h3>Events</h3>
              <p>Join us in our mission through various events and programs</p>
              <Link to="/events" className="btn">View Events</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SDGs Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Towards Achieving SDG's</h2>
          <div className="sdg-grid">
            {[1, 2, 3, 4, 5, 6, 7].map(sdg => (
              <div key={sdg} className="sdg-item">
                <img 
                  src={`/assets/sdg-${sdg}.png`} 
                  alt={`SDG ${sdg}`} 
                  className="sdg-icon"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Partners</h2>
          <div className="partners-grid">
            {[1, 2, 3, 4, 5, 6].map(partner => (
              <div key={partner} className="partner-item">
                <img 
                  src={`/assets/partner-${partner}.png`} 
                  alt={`Partner ${partner}`} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;