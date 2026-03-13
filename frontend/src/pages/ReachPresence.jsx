import React, { useState, useEffect } from "react";
import "./ReachPresence.css";
import IndiaMapHover from "./IndiaMapHover";
import map from "../assets/map1.png";
import worldMap from "../assets/Global Country Map.png";
import logger from "../utils/logger";
import Counter from "../component/Common/Counter";
import { useRegion } from "../hooks/useRegion";

// ✅ IMPORT SAME API USED IN HOME
import {
  getMentors,
  getManagement,
  getReports,
  getImpactData,
} from "../services/api.jsx";

export default function ReachPresence() {
  const region = useRegion();
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    states: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        setLoading(true);

        const [
          mentorsData,
          managementData,
          reportsData,
          impactData,
        ] = await Promise.all([
          getMentors().catch(() => []),
          getManagement().catch(() => []),
          getReports().catch(() => []),
          getImpactData().catch(() => ({
            beneficiaries: 0,
            states: 0,
            projects: 0,
          })),
        ]);

        setTeamCount(mentorsData.length + managementData.length);
        setReportsCount(reportsData.length);
        setImpact(impactData);
      } catch (err) {
        logger.error("❌ Error fetching ReachPresence impact data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  return (
    <div>
      {/* ================= OUR IMPACT ================= */}
      {region !== "global" && (
        <section className="rp-section">
          <div className="rp-container">
            <h2 className="rp-impact-title">
              Our Impact<span></span>
            </h2>

            <div className="rpi-grid">
              <div className="rpi-item">
                <h3 className="rpi-number">
                  <Counter end={impact.beneficiaries} />L+
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
      )}

      {/* India Map / Global Map Section */}
      <section className="india-map-section">
        <h2 className="rp-title" style={region === "global" ? { marginTop: '100px' } : {}}>
          {region === "global" ? "Our Reach Across Globally" : "Our Reach Across India"}<span></span>
        </h2>

        {region === "global" ? (
          <div className="global-map-container" style={{ display: 'flex', justifyContent: 'center', padding: '0px 20px 40px 20px' }}>
            <div className="global-country-card" style={{ padding: '0px 20px 20px 20px', background: '#ffffff', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px' }}>
              <img src={worldMap} alt="Global Map" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
            </div>
          </div>
        ) : (
          <IndiaMapHover mapUrl={map} />
        )}
      </section>

      {/* Timeline Section */}
      <div className="timeline-container">
        <div className="rpt-heading">
          <h2 className="rpt-title">
            Our Journey<span></span>
          </h2>
          <p className="t-subtitle" style={region === "global" ? { color: "#333" } : {}}>
            {region === "global" ? "3 Countries. 1 Vision. Unlimited Potential" : "A decade of empowerment"}
          </p>
        </div>

        {region === "global" ? (
          <div className="global-journey-content" style={{ maxWidth: '900px', margin: '0px auto', padding: '0px 40px  40px 40px', background: '#f9fafb', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              <div style={{ padding: '20px', borderLeft: '4px solid #f26522', background: '#fff', borderRadius: '0 8px 8px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <h4 style={{ color: '#f26522', marginBottom: '10px', fontSize: '1.1rem' }}>Global Footprint</h4>
                <p style={{ color: '#555', lineHeight: '1.6' }}>From curiosity sparked in the <strong>USA</strong>, to innovation inspired in <strong>Kenya</strong>, and opportunity expanding in <strong>Nigeria</strong>.</p>
              </div>
              <div style={{ padding: '20px', borderLeft: '4px solid #4CAF50', background: '#fff', borderRadius: '0 8px 8px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <h4 style={{ color: '#4CAF50', marginBottom: '10px', fontSize: '1.1rem' }}>Transformative Impact</h4>
                <p style={{ color: '#555', lineHeight: '1.6' }}>Y4D's global journey reflects how education, empathy, and technology can transform lives and communities across borders.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* First Row (REVERSED order) */}
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
            </div>

            {/* mid Row (NORMAL order) */}
            <div className="timeline-row-mid bottom" style={{ marginTop: "65px" }}>
              <div className="timeline-item green">
                <div className="circle">2019</div>
                <p>International Purviz Shroff award for social contribution</p>
              </div>
              <div className="connector-mid">
                <span className="arrow">➤</span>
              </div>
              <div>
                <div className="connector-mid-up">
                  <span className="arrow">➤</span>
                </div>
              </div>
              <div className="timeline-item orange">
                <div className="circle">2020</div>
                <p>Embraced 3E’s – Encourage, Educate and Employ</p>
              </div>
            </div>

            {/* Second Row (NORMAL order) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>
                <div className="connector-up">
                  <span className="arrow">➤</span>
                </div>
              </div>
              <div className="timeline-row bottom">
                <div className="timeline-item orange">
                  <div className="circle">2018</div>
                  <p>
                    New India Conclave in presence of Hon. Prime Minister Narendra
                    Modi
                  </p>
                </div>
                <div className="connector">
                  <span className="arrow reverse">➤</span>
                </div>
                <div className="timeline-item green">
                  <div className="circle">2017</div>
                  <p>First CSR project in skill development</p>
                </div>
                <div className="connector">
                  <span className="arrow reverse">➤</span>
                </div>
                <div className="timeline-item orange">
                  <div className="circle">2015</div>
                  <p>Establishment of Y4D Foundation</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
