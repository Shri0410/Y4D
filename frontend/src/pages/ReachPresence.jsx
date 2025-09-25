// src/pages/ReachPresence.jsx
import React, { useState, useEffect } from "react";
import "./ReachPresence.css";
import IndiaMapHover from "./IndiaMapHover";
import map from "../assets/map.png";

import Counter from "../component/Counter";
import {
  getMentors,
  getManagement,
  getReports,
  getImpactData,
} from "../services/api";

const ReachPresence = () => {
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    states: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

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

  const timelineData = [
    {
      year: "2015",
      title: "Establishment of Y4D Foundation",
      icon: "🏛️",
      description: "Founded with a vision to empower communities across India",
    },
    {
      year: "2017",
      title: "First CSR project in skill development",
      icon: "👨‍🎓",
      description:
        "Launched our first corporate social responsibility initiative",
    },
    {
      year: "2018",
      title:
        "New India Conclave in presence of Hon. Prime Minister Narendra Modi",
      icon: "🎤",
      description: "Hosted a national-level event with esteemed guests",
    },
    {
      year: "2019",
      title: "International Purviz Shroff award for social contribution",
      icon: "🏆",
      description: "Recognized internationally for our social impact work",
    },
    {
      year: "2020",
      title: "Embraced 3E's - Encourage, Educate and Employ",
      icon: "🎯",
      description: "Adopted our core principles to guide all initiatives",
    },
    {
      year: "2021",
      title: "Empowered communities on-field even in 2021 pandemic",
      icon: "♡",
      description: "Continued our work despite global challenges",
    },
    {
      year: "2023",
      title: "Marking the journey of empowering 1.5 million lives",
      icon: "👥",
      description: "Reached a significant milestone in our impact journey",
    },
    {
      year: "2024",
      title: "A decade of our journey towards transformative change",
      icon: "➉",
      description: "Celebrating 10 years of service and impact",
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-container">
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

      {/* Reach & Presence Timeline */}
      <section className="rp-section">
        <div className="container_RP">
          <h2 className="rpt-title">
            Reach and Presence<span></span>
          </h2>
          <p className="timeline-subtitle">A decade of empowerment</p>

          <div className="timeline-wrapper">
            <div className="timeline-items">
              {timelineData.map((item, index) => {
                const isTop = index % 2 === 0;
                return (
                  <div
                    key={index}
                    className={`timeline-item ${isTop ? "top" : "bottom"}`}
                  >
                    {isTop ? (
                      <>
                        <div className="timeline-content">
                          <div className="timeline-icon">{item.icon}</div>
                          <div className="timeline-year">{item.year}</div>
                          <div className="timeline-title">{item.title}</div>
                          <div className="timeline-description">
                            {item.description}
                          </div>
                        </div>
                        <div className="timeline-dot" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <div className="timeline-dot" aria-hidden="true" />
                        <div className="timeline-content">
                          <div className="timeline-icon">{item.icon}</div>
                          <div className="timeline-year">{item.year}</div>
                          <div className="timeline-title">{item.title}</div>
                          <div className="timeline-description">
                            {item.description}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="timeline-line" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReachPresence;
