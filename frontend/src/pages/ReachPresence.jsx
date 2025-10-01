import React, { useState, useEffect } from "react";
import "./ReachPresence.css";
import IndiaMapHover from "./IndiaMapHover";
import map from "../assets/Imap.png";

export default function ReachPresence() {
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    states: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

  const getMentors = async () => [];
  const getManagement = async () => [];
  const getReports = async () => [];
  const getImpactData = async () => ({
    beneficiaries: 15,
    states: 20,
    projects: 50,
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [mentorsData, managementData, reportsData, impactData] =
          await Promise.all([
            getMentors(),
            getManagement(),
            getReports(),
            getImpactData(),
          ]);

        setTeamCount(mentorsData.length + managementData.length);
        setReportsCount(reportsData.length);
        setImpact(impactData);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* Our Impact Section */}
      <section className="rp-section">
        <div className="rp-container">
          <h2 className="rp-impact-title">
            Our Impact<span></span>
          </h2>
          <div className="rpi-grid">
            <div className="rpi-item">
              <h3 className="rpi-number">
                <Counter end={impact.beneficiaries} />
                L+
              </h3>
              <p className="rpi-subtitle">Beneficiaries</p>
              <p className="rpi-text">
                Children and their families are impacted every year
              </p>
            </div>
            <div className="rpi-item">
              <h3 className="rpi-number">
                <Counter end={impact.states} />+
              </h3>
              <p className="rpi-subtitle">States</p>
              <p className="rpi-text">
                Active presence across more than 20 states and underserved
                communities
              </p>
            </div>
            <div className="rpi-item">
              <h3 className="rpi-number">
                <Counter end={impact.projects} />+
              </h3>
              <p className="rpi-subtitle">Projects</p>
              <p className="rpi-text">
                Projects in education, healthcare, and women empowerment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* India Map Section */}
      <section className="india-map-section">
        <h2 className="rp-title">
          Our Reach Across India<span></span>
        </h2>
        <IndiaMapHover mapUrl={map} />
      </section>

      {/* Timeline Section */}
      <div className="timeline-container">
        <div className="rpt-heading">
          <h2 className="rpt-title">
            Our Journey<span></span>
          </h2>
          <p className="t-subtitle">A decade of empowerment</p>
        </div>
        {/* First Row (REVERSED order) */}
        {/* First Row (arrows right-to-left) */}
        <div className="timeline-row">
          <div className="timeline-item green">
            <div className="circle">2024</div>
            <p>A decade of our journey towards transformative change</p>
          </div>

          <div className="connector">
            <span className="arrow reverse">➤</span>
          </div>

          <div className="timeline-item orange">
            <div className="circle">2023</div>
            <p>Marking the journey of empowering 1.5 million lives</p>
          </div>

          <div className="connector">
            <span className="arrow reverse">➤</span>
          </div>

          <div className="timeline-item green">
            <div className="circle">2021</div>
            <p>Empowered communities on-field even in 2021 pandemic.</p>
          </div>

          <div className="connector">
            <span className="arrow reverse">➤</span>
          </div>

          <div className="timeline-item orange">
            <div className="circle">2020</div>
            <p>Embraced 3E’s – Encourage, Educate and Employ</p>
          </div>
        </div>

        {/* Second Row (NORMAL order) */}

        <div className="timeline-row bottom">
          <div className="timeline-item orange">
            <div className="circle">2015</div>
            <p>Establishment of Y4D Foundation</p>
          </div>

          <div className="connector">
            <span className="arrow">➤</span>
          </div>

          <div className="timeline-item green">
            <div className="circle">2017</div>
            <p>First CSR project in skill development</p>
          </div>

          <div className="connector">
            <span className="arrow">➤</span>
          </div>

          <div className="timeline-item orange">
            <div className="circle">2018</div>
            <p>
              New India Conclave in presence of Hon. Prime Minister Narendra
              Modi
            </p>
          </div>

          <div className="connector">
            <span className="arrow">➤</span>
          </div>

          <div className="timeline-item green">
            <div className="circle">2019</div>
            <p>International Purviz Shroff award for social contribution</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy Counter component (replace with your actual one)
function Counter({ end }) {
  return <span>{end}</span>;
}
