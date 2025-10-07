// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Counter from "../component/Counter";
import {
  getMentors,
  getManagement,
  getReports,
  getImpactData,
  getAccreditations,
} from "../services/api.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

import first from "../assets/BannerImages/f.jpeg";
import Second from "../assets/BannerImages/s.jpeg";
import Third from "../assets/BannerImages/t.jpeg";
import Fourth from "../assets/BannerImages/fo.jpeg";

import edu from "../assets/Interventions/Education.png";
import livelihood from "../assets/Interventions/Livelihood.png";
import healthcare from "../assets/Interventions/Healthcare.png";
import environment from "../assets/Interventions/EnvironmentSustainibility.png";
import idp from "../assets/Interventions/IDP.png";

import sdg1 from "../assets/SDG/SDG1.png";
import sdg2 from "../assets/SDG/SDG2.png";
import sdg3 from "../assets/SDG/SDG3.png";
import sdg4 from "../assets/SDG/SDG4.png";
import sdg5 from "../assets/SDG/SDG5.png";
import sdg6 from "../assets/SDG/SDG6.png";
import sdg8 from "../assets/SDG/SDG8.png";
import sdg9 from "../assets/SDG/SDG9.png";
import sdg10 from "../assets/SDG/SDG10.png";
import sdg11 from "../assets/SDG/SDG11.png";

import accr1 from "../assets/Accredations/Purviz Shroff Social.jpg";
import accr2 from "../assets/Accredations/Bhamashah Award RJ.jpg";
import accr3 from "../assets/Accredations/CAF International Certificate.jpg";
import accr4 from "../assets/Accredations/NGO Grading Certificate_Y4D_June23_Design.jpg";

import Partners1 from "./Partners1";
import Partners2 from "./Partners2";

import DonateButton from "../component/DonateButton";

// ✅ Store your array here
const sdgImages = [
  sdg1,
  sdg2,
  sdg3,
  sdg4,
  sdg5,
  sdg6,
  sdg8,
  sdg9,
  sdg10,
  sdg11,
];

const Home = () => {
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    states: 0,
    projects: 0,
  });
  const [accreditations, setAccreditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accreditationsError, setAccreditationsError] = useState(false); // New state to track API errors

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setAccreditationsError(false); // Reset error state
        console.log('🚀 Starting to fetch home data...');
        
        const [mentorsData, managementData, reportsData, impactData, accreditationsData] =
          await Promise.all([
            getMentors().catch(err => {
              console.error('❌ Error fetching mentors:', err);
              return [];
            }),
            getManagement().catch(err => {
              console.error('❌ Error fetching management:', err);
              return [];
            }),
            getReports().catch(err => {
              console.error('❌ Error fetching reports:', err);
              return [];
            }),
            getImpactData().catch(err => {
              console.error('❌ Error fetching impact data:', err);
              return { beneficiaries: 0, states: 0, projects: 0 };
            }),
            getAccreditations().catch(err => {
              console.error('❌ Error fetching accreditations:', err);
              setAccreditationsError(true); // Set error state if API fails
              return []; // Return empty array on error
            }),
          ]);

        console.log('📊 Accreditations data received:', accreditationsData);
        console.log('📊 Is empty array:', accreditationsData.length === 0);
        
        setTeamCount(mentorsData.length + managementData.length);
        setReportsCount(reportsData.length);
        setImpact(impactData);
        setAccreditations(accreditationsData || []);
        
      } catch (err) {
        console.error("💥 Error in fetchHomeData:", err);
        setAccreditationsError(true); // Set error on general failure
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(
      typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
    );

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= breakpoint);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isMobile;
  };

  const useIsTablet = (breakpoint = 1024) => {
    const [isTablet, setIsTablet] = useState(
      typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
    );
    useEffect(() => {
      const handleResize = () => {
        setIsTablet(window.innerWidth <= breakpoint);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isTablet;
  };

  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  
  // Fixed: Removed optional chaining
  const activeAccreditations = accreditations.filter(acc => 
    acc.is_active === true || acc.is_active === 1 || acc.is_active === "true"
  );

  // Fixed: Helper function to handle image errors safely
  const handleImageError = (e) => {
    e.target.style.display = "none";
    const nextSibling = e.target.nextSibling;
    if (nextSibling && nextSibling.style) {
      nextSibling.style.display = 'block';
    }
  };

  return (
    <div className="home">
      {/* ✅ Hero Slider Section */}
      <section className="hero-slider">
        <Slider {...sliderSettings}>
          <div>
            <img src={first} alt="Slide 1" className="slide-img" />
          </div>
          <div>
            <img src={Second} alt="Slide 2" className="slide-img" />
          </div>
          <div className="slide-content">
            <img src={Third} alt="Slide 3" className="slide-img" />
            <div className="overlay1"></div>
          </div>
          <div className="slide-content">
            <img src={Fourth} alt="Slide 4" className="slide-img" />
            <div className="overlay2"></div>
          </div>
        </Slider>
      </section>

      {/* About Y4D Section */}
      <section className="About-section">
        <div className="About-container">
          <h2 className="about-title">
            About Y4D<span></span>
          </h2>
          <div className="about-content">
            <p>
              Y4D Foundation is a youth-led organization in India that focuses
              on empowering underprivileged sections of our society. Its main
              goal is to uplift students through skill-based education, health
              initiatives, employment opportunities, and empowerment programs.
              The foundation aims to improve their livelihoods, health, and
              quality of life. Its holistic approach addresses the diverse needs
              of youth and children, promoting sustainable development and
              social transformation. <br /> <br /> Y4D aligns its work with the
              United Nations' Agenda 2030 Sustainable Development Goals and
              engages in areas like environmental conservation, food safety, and
              security. Over the past decade, Y4D has made significant
              contributions to these key sectors.
            </p>
            <Link to="/our-work" className="about-btn">
              Know More
            </Link>
          </div>
        </div>
      </section>

      {/* Our Reach Section */}
      <section className="our-reach-section">
        <div className="our-reach-container">
          <h2 className="impact-title">
            Our Impact<span></span>
          </h2>
          <div className="reach-grid">
            <div className="reach-item">
              <h3 className="reach-number">
                <Counter end={impact.beneficiaries} />
                L+
              </h3>
              <p className="reach-subtitle">Beneficiaries</p>
              <p className="reach-text">
                Children and their families are impacted every year
              </p>
            </div>

            <div className="reach-item">
              <h3 className="reach-number">
                <Counter end={impact.states} />+
              </h3>
              <p className="reach-subtitle">States</p>
              <p className="reach-text">
                Active presence across more than 20 states and underserved
                communities
              </p>
            </div>

            <div className="reach-item">
              <h3 className="reach-number">
                <Counter end={impact.projects} />+
              </h3>
              <p className="reach-subtitle">Projects</p>
              <p className="reach-text">
                Projects in education, healthcare, and women empowerment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Interventions Section */}
      <section className="Interventions-section">
        <div className="Interventions-container">
          <h2 className="Inter-title">
            Our Interventions<span></span>
          </h2>
          <div className="grid grid-3">
            {[
              {
                title: "Quality Education",
                img: edu,
              },
              {
                title: " Livelihood",
                img: livelihood,
              },
              {
                title: " Healthcare",
                img: healthcare,
              },
              {
                title: " Environment & Sustainability",
                img: environment,
              },
              {
                title: "Integrated Development Program",
                img: idp,
              },
            ].map((item, index) => (
              <div key={index} className="card text-center intervention-card">
                <img
                  src={item.img}
                  alt={item.title}
                  className="intervention-icon"
                />
                <h3>{item.title}</h3>
                <Link to="/our-work" className="inter-btn">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDGs Section */}
      <section className="SDGs-section">
        <div className="SDGs-container">
          <h2 className="sdg-title">
            Towards Achieving SDGs<span></span>
          </h2>
          <Slider
            slidesToShow={5}
            slidesToScroll={1}
            infinite
            autoplay
            autoplaySpeed={0}
            speed={6000}
            cssEase="linear"
            arrows={false}
            dots={false}
            responsive={[
              { breakpoint: 1280, settings: { slidesToShow: 4 } },
              { breakpoint: 1024, settings: { slidesToShow: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2 } },
              { breakpoint: 480, settings: { slidesToShow: 1 } },
            ]}
          >
            {sdgImages.map((img, index) => (
              <div key={index} className="sdg-item">
                <img src={img} alt={`SDG ${index + 1}`} className="sdg-icon" />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Partners Section */}
      <section className="Partners-section">
        <Partners1 />
        <Partners2 />
      </section>

      {/* Accreditations Section - Fixed */}
<div className="accreditations-section">
  <div className="accreditations-container">
    <h2 className="accreditations-title">
      Accreditations<span></span>
    </h2>
    {isMobile ? (
      // MOBILE VIEW
      <div className="accreditations-list" style={{ gap: "10px" }}>
        {activeAccreditations.length > 0 ? (
          activeAccreditations.map((item) => (
            <div key={item.id} className="accreditation-card">
              <img
                src={`http://localhost:5000/uploads/accreditations/${item.image}`}
                alt={item.title}
                className="accreditation-icon"
                onError={handleImageError}
              />
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          ))
        ) : (
          // Show nothing or a message when no data
          <div className="no-accreditations-message">
            <p>No accreditations available at the moment.</p>
          </div>
        )}
      </div>
    ) : isTablet ? (
      // TABLET VIEW
      <div
        className="accreditations-list"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
        }}
      >
        {activeAccreditations.length > 0 ? (
          activeAccreditations.map((item) => (
            <div key={item.id} className="accreditation-card">
              <img
                src={`http://localhost:5000/uploads/accreditations/${item.image}`}
                alt={item.title}
                className="accreditation-icon"
                onError={handleImageError}
              />
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          ))
        ) : (
          // Show nothing or a message when no data
          <div className="no-accreditations-message">
            <p>No accreditations available at the moment.</p>
          </div>
        )}
      </div>
    ) : (
      // DESKTOP VIEW - Slider
      activeAccreditations.length > 0 ? (
        <Slider
          slidesToShow={Math.min(4, activeAccreditations.length)}
          slidesToScroll={1}
          infinite={activeAccreditations.length > 1}
          autoplay={activeAccreditations.length > 1}
          autoplaySpeed={2000}
          speed={800}
          arrows={false}
          dots={false}
          responsive={[
            { 
              breakpoint: 1024, 
              settings: { 
                slidesToShow: Math.min(3, activeAccreditations.length) 
              } 
            },
            { 
              breakpoint: 768, 
              settings: { 
                slidesToShow: Math.min(2, activeAccreditations.length) 
              } 
            },
            { 
              breakpoint: 480, 
              settings: { 
                slidesToShow: 1 
              } 
            },
          ]}
        >
          {activeAccreditations.map((item) => (
            <div key={item.id} className="accreditation-card">
              <img
                src={`http://localhost:5000/uploads/accreditations/${item.image}`}
                alt={item.title}
                className="accreditation-icon"
                onError={handleImageError}
              />
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </Slider>
      ) : (
        // Show nothing or a message when no data
        <div className="no-accreditations-message">
          <p>No accreditations available at the moment.</p>
        </div>
      )
    )}
  </div>
</div>

      {/* Media Highlights Section */}
      <section className="Media-section bg-light">
        <div className="Media-container">
          <h2 className="media-title">
            Latest from Our Media Corner<span></span>
          </h2>
          <div className="grid grid-3">
            <div className="Media-card text-center">
              <h3>Newsletters</h3>
              <p>Stay updated with our latest activities and impact stories </p>
              <Link to="/newsletters" className="MC-btn">
                Read Now
              </Link>
            </div>
            <div className="Media-card text-center">
              <h3>Stories of Empowerment</h3>
              <p>Inspiring stories of transformation from our communities</p>
              <Link to="/stories" className="MC-btn">
                Read Stories
              </Link>
            </div>
            <div className="Media-card text-center">
              <h3>Blogs</h3>
              <p>
                Read stories, insights, and updates from our inspiring journey.
              </p>
              <Link to="/blogs" className="MC-btn">
                View Blogs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DonateButton />
    </div>
  );
};

export default Home;