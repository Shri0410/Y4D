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
        "Our education programs focus on improving access to quality education for underprivileged children.",
      image: QE,
      color: "#38b6e9",
    },
    {
      id: "livelihood",
      title: "Livelihood",
      description:
        "We provide skill development and employment opportunities to empower communities economically.",
      image: LS,
      color: "#febd2c",
    },
    {
      id: "healthcare",
      title: "Healthcare",
      description:
        "Our healthcare initiatives aim to improve health outcomes in underserved communities.",
      image: HS,
      color: "#e63a34",
    },
    {
      id: "environment",
      title: "Environment Sustainability",
      description:
        "We work towards environmental conservation and sustainable development practices.",
      image: ES,
      color: "#42b242",
    },
    {
      id: "idp",
      title: "Integrated Development Program (IDP)",
      description:
        "Our comprehensive approach to community development addressing multiple needs simultaneously.",
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

              <div className="reports-section">
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
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OurWork;
