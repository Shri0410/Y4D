import React, { useRef, useState, useEffect } from "react";
import "../pages/About.css";
import bannerImg from "../assets/BannerImages/f.jpeg";

const About = () => {
  // Refs for each section
  const sectionRefs = {
    mission: useRef(null),
    vision: useRef(null),
    value: useRef(null),
    philosophy: useRef(null),
    Pyramid: useRef(null),
    work: useRef(null),
    trust: useRef(null),
  };

  const tabs = [
    { id: "mission", label: "MISSION" },
    { id: "vision", label: "VISION" },
    { id: "value", label: "value" },
    { id: "philosophy", label: "PHILOSOPHY OF CHANGE" },
    { id: "Pyramid", label: "Pyramid of empowerment" },
    { id: "work", label: "HOW WE WORK" },
    { id: "trust", label: "WHY TRUST US?" },
  ];

  const [activeTab, setActiveTab] = useState("story");

  // Scroll to section on tab click
  const handleScroll = (id) => {
    sectionRefs[id].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Observe section visibility to update active tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.6 } // 60% of section in view
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="our-story-page">
      {/* Banner */}
      <div className="story-banner">
        <img src={bannerImg} alt="Our Story Banner" />
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={sectionRefs.mission} id="mission" className="story-section">
        <div className="story-content-container">
          <p>
            Y4D is a youth-led, futuristic organization committed to empowering
            the underserved sections of society by empowering them through 3E
            formulae of Encouragement, Education, and Employment. Y4D envisions
            shaping up a sustainable society for future generations.
          </p>
        </div>
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={sectionRefs.vision} id="vision" className="story-section">
        <div className="story-content-container">
          <p>
            Y4D envisions fostering the development of a happy, healthy, and
            sustainable society in which every individual has an equal
            opportunity for growth and a life of dignity.
          </p>
        </div>
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={sectionRefs.value} id="value" className="story-section">
        <div className="story-content-container">
          <p>
            To empower underprivileged children, youth and women through
            relevant education, innovative healthcare and livelihood programmes.
          </p>
        </div>
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={sectionRefs.philosophy}
        id="philosophy"
        className="story-section"
      >
        <div className="story-content-container">
          <p>
            At Y4D Foundation, we believe that sustainable transformation begins
            with empowering individuals to become agents of their own change.
            Our philosophy is rooted in three core principles:
          </p>
          <h4>Grassroots Empowerment:</h4>
          <p>
            Real change happens at the community level. We work directly with
            individuals, understanding their unique challenges and building
            solutions that emerge from within their communities.
          </p>
          <h4>Collaborative Growth:</h4>
          <p>
            We don't work for communities, we work with them. Every program is
            designed through active participation, ensuring that beneficiaries
            become partners in their own development journey.
          </p>
          <h4>Sustainable Impact:</h4>
          <p>
            Our interventions are designed to create ripple effects. When we
            empower one individual, they become catalysts for change in their
            families, communities, and beyond.
          </p>
          <h4>The Y4D Approach:</h4>
          <p>
            We don't just provide solutions, we build capacity, transfer
            ownership, and create systems that continue to generate positive
            impact long after our direct intervention ends.
          </p>
        </div>
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={sectionRefs.Pyramid} id="Pyramid" className="story-section">
        <div className="story-content-container">
          <p>
            We work on the overall development of children, their families and
            communities...
          </p>
        </div>
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={sectionRefs.work} id="work" className="story-section">
        <div className="story-content-container">
          <p>
            Our Methodology: The 3E Framework in Action: ENCOURAGEMENT -
            Building confidence and hope EDUCATION - Providing knowledge and
            skills EMPLOYMENT - Creating sustainable opportunities
          </p>
        </div>
      </div>

      <div className="story-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`story-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleScroll(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={sectionRefs.trust} id="trust" className="story-section">
        <div className="story-content-container">
          <p>
            Transparency, accountability and impact measurement are the
            cornerstones of our work...
          </p>
          <div className="read-more-container">
            <button className="read-more-btn">Read more &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
