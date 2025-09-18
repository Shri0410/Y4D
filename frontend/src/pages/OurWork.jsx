// src/pages/OurWork.jsx
import React, { useRef, useState, useEffect } from "react";
import { getReports } from "../services/api";
import bannerImg from "../assets/BannerImages/f.jpeg";

import QE from "../assets/Interventions/i/Education.png";
import LS from "../assets/Interventions/i/Livelihood.png";
import HS from "../assets/Interventions/i/Healthcare.png";
import ES from "../assets/Interventions/i/EnvironmentSustainibility.png";
import IDP from "../assets/Interventions/i/IDP.png";

import "./OurWork.css";

const OurWork = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("education");

  // Refs for each section
  const sectionRefs = {
    education: useRef(null),
    livelihood: useRef(null),
    healthcare: useRef(null),
    environment: useRef(null),
    idp: useRef(null),
  };

  // Intervention data with images
  const interventions = [
    {
      id: "education",
      title: "Quality Education",
      description:
        "Y4D Foundation transforms education for underserved communities by providing digital learning labs,skill-based training, scholarships, and teacher capacity building, empowering youth with quality education for a resilient and equitable future. We bridge the education gap through innovative solutions, fostering digital literacy, leadership, and lifelong learning to enable social and economic progress.",
      image: QE,
      color: "#38b6e9",
    },
    {
      id: "livelihood",
      title: "Livelihood",
      description:
        "Y4D Foundation promotes sustainable livelihoods aligned with SDG 8 by empowering marginalized communities through skill development, financial literacy, and digital education, enabling self-reliance and economic stability. Our industry-relevant training bridges the gap between knowledge and practice, fostering employability, entrepreneurship, and long-term socio-economic growth.",
      image: LS,
      color: "#febd2c",
    },
    {
      id: "healthcare",
      title: "Healthcare",
      description:
        "Y4D Foundation advances SDG 3 by enhancing healthcare access for underserved communities through preventive health camps, awareness campaigns on nutrition, fitness, and early detection, empowering individuals for healthier lives. By promoting health education and providing regular medical check-ups, Y4D tackles barriers like financial constraints and lack of awareness, fostering well-being and long-term community health.",
      image: HS,
      color: "#e63a34",
    },
    {
      id: "environment",
      title: "Environment Sustainability",
      description:
        "Y4D Foundation supports SDG 15 by promoting environmental sustainability through tree planting drives, ecological restoration, and awareness programs, fostering conservation and climate resilience. Using innovative methods like Miyawaki Afforestation, Y4D enhances green cover and ecological balance, empowering communities to contribute to a healthier, sustainable planet.",
      image: ES,
      color: "#42b242",
    },
    {
      id: "idp",
      title: "Integrated Development Program (IDP)",
      description:
        "Y4D Foundation’s Integrated Development Program (IDP) drives holistic community development by combining education, healthcare, livelihood, and environmental sustainability, aligned with SDGs 1, 3, 4, 8, and 13. Through supporting FPOs, SHGs, skill training, and financial literacy, Y4D empowers marginalized communities with economic stability, market access, and self-reliance for sustainable growth.",
      image: IDP,
      color: "#803a96",
    },
  ];

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsData = await getReports();
        setReports(reportsData);
      } catch (err) {
        setError("Failed to load our work data. Please try again later.");
        console.error("Error fetching reports:", err);
      }
    };

    fetchReports();
  }, []);

  // Scroll to section
  const handleScroll = (id) => {
    sectionRefs[id].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // IntersectionObserver for active tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="our-work-page">
      {/* Banner */}
      <div className="work-banner">
        <img src={bannerImg} alt="Our Work Banner" />
      </div>

      {/* Loop sections */}
      {interventions.map((intervention) => (
        <div
          key={intervention.id}
          ref={sectionRefs[intervention.id]}
          id={intervention.id}
          className="work-section"
        >
          {/* Tabs at top of each section */}
          <div className="work-tabs">
            {interventions.map((tab) => (
              <button
                key={tab.id}
                className={`work-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => handleScroll(tab.id)}
                style={{
                  backgroundColor:
                    activeTab === tab.id ? tab.color : "transparent",
                  color: activeTab === tab.id ? "#fff" : "#222",
                }}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Content with image + text */}
          <div className="work-content-container">
            <div className="work-image">
              <img src={intervention.image} alt={intervention.title} />
            </div>

            <div className="work-text">
              <h3>{intervention.title}</h3>
              <p>{intervention.description}</p>

              {/* <div className="reports-section">
                <h4>Related Reports and Projects</h4>
                {reports.filter(
                  (report) =>
                    report.title
                      .toLowerCase()
                      .includes(intervention.id.toLowerCase()) ||
                    report.description
                      .toLowerCase()
                      .includes(intervention.id.toLowerCase())
                ).length === 0 ? (
                  <p>No reports available for this intervention yet.</p>
                ) : (
                  <div className="reports-grid">
                    {reports
                      .filter(
                        (report) =>
                          report.title
                            .toLowerCase()
                            .includes(intervention.id.toLowerCase()) ||
                          report.description
                            .toLowerCase()
                            .includes(intervention.id.toLowerCase())
                      )
                      .map((report, index) => (
                        <div key={index} className="report-card">
                          {report.image && (
                            <img
                              src={`http://localhost:5000/uploads/reports/${report.image}`}
                              alt={report.title}
                            />
                          )}
                          <h5>{report.title}</h5>
                          <p>{report.description}</p>
                          <button className="btn">Learn More</button>
                        </div>
                      ))}
                  </div>
                )}
              </div> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OurWork;
