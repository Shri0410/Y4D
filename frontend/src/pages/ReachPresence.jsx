import React from "react";
import "./ReachPresence.css";
import IndiaMapHover from "./IndiaMapHover";
import map from "../assets/map.png";

const ReachPresence = () => {
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

  return (
    <div className="page-container">
      {/* --- Added India Map Section at top --- */}
      <section className="india-map-section">
        <h2 className="section-title">Our Reach Across India</h2>
        <IndiaMapHover mapUrl={map} />
      </section>

      {/* --- Existing Reach & Presence Timeline --- */}
      <section className="rp-section">
        <div className="container_RP">
          <h2 className="section-title">Reach and Presence</h2>
          <p className="timeline-subtitle">A decade of empowerment</p>

          <div className="timeline-wrapper">
            <div className="timeline-items">
              {timelineData.map((item, index) => {
                const isTop = index % 2 === 0; // alternate: even => top, odd => bottom
                return (
                  <div
                    key={index}
                    className={`timeline-item ${isTop ? "top" : "bottom"}`}
                  >
                    {/* For top items: content above the center dot */}
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
                      /* For bottom items: dot first, content below the center dot */
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

            {/* center line (stretches across) */}
            <div className="timeline-line" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReachPresence;
