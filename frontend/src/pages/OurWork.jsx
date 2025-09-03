// src/pages/OurWork.jsx
import React, { useState, useEffect } from "react";
import { getReports } from "../services/api";

const OurWork = () => {
  const [activeIntervention, setActiveIntervention] = useState("education");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const reportsData = await getReports();
        setReports(reportsData);
      } catch (err) {
        setError("Failed to load our work data. Please try again later.");
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const interventions = [
    {
      id: "education",
      title: "Quality Education",
      description:
        "Our education programs focus on improving access to quality education for underprivileged children.",
    },
    {
      id: "livelihood",
      title: "Livelihood",
      description:
        "We provide skill development and employment opportunities to empower communities economically.",
    },
    {
      id: "healthcare",
      title: "Healthcare",
      description:
        "Our healthcare initiatives aim to improve health outcomes in underserved communities.",
    },
    {
      id: "environment",
      title: "Environment Sustainability",
      description:
        "We work towards environmental conservation and sustainable development practices.",
    },
    {
      id: "idp",
      title: "Integrated Development Program (IDP)",
      description:
        "Our comprehensive approach to community development addressing multiple needs simultaneously.",
    },
  ];

  if (loading)
    return (
      <div className="page-container">
        <div className="loading">Loading our work...</div>
      </div>
    );
  if (error)
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );

  return (
    <div className="our-work-page">
      <section className="section">
        <div className="container">
          <h2 className="work-title">Our Work</h2>
          <p className="section-description">
            Explore our various interventions and programs that are creating
            sustainable impact across communities.
          </p>

          <div className="intervention-tabs">
            <div className="tab-headers">
              {interventions.map((intervention) => (
                <button
                  key={intervention.id}
                  className={
                    activeIntervention === intervention.id ? "active" : ""
                  }
                  onClick={() => setActiveIntervention(intervention.id)}
                >
                  {intervention.title}
                </button>
              ))}
            </div>

            <div className="tab-content">
              <h3>
                {interventions.find((i) => i.id === activeIntervention).title}
              </h3>
              <p>
                {
                  interventions.find((i) => i.id === activeIntervention)
                    .description
                }
              </p>

              {/* Show related reports for this intervention */}
              <div className="reports-section">
                <h4>Related Reports and Projects</h4>
                {reports.filter(
                  (report) =>
                    report.title.toLowerCase().includes(activeIntervention) ||
                    report.description
                      .toLowerCase()
                      .includes(activeIntervention)
                ).length === 0 ? (
                  <p>No reports available for this intervention yet.</p>
                ) : (
                  <div className="reports-grid">
                    {reports
                      .filter(
                        (report) =>
                          report.title
                            .toLowerCase()
                            .includes(activeIntervention) ||
                          report.description
                            .toLowerCase()
                            .includes(activeIntervention)
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
      </section>
    </div>
  );
};

export default OurWork;
