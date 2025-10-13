// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Counter from "../component/Counter";
import {
  getMentors,
  getManagement,
  getReports,
  getImpactData,
  getAccreditations,
  getBanners,
} from "../services/api.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

// Remove static banner imports since we'll use dynamic ones
// import first from "../assets/BannerImages/f.jpeg";
// import Second from "../assets/BannerImages/s.jpeg";
// import Third from "../assets/BannerImages/t.jpeg";
// import Fourth from "../assets/BannerImages/fo.jpeg";

import edu from "../assets/Interventions/Education.png";
import livelihood from "../assets/Interventions/Livelihood.png";
import healthcare from "../assets/Interventions/Healthcare.png";
import environment from "../assets/Interventions/EnvironmentSustainibility.png";
import idp from "../assets/Interventions/IDP.png";

import accr1 from "../assets/Accredations/Purviz Shroff Social.jpg";
import accr2 from "../assets/Accredations/Bhamashah Award RJ.jpg";
import accr3 from "../assets/Accredations/CAF International Certificate.jpg";
import accr4 from "../assets/Accredations/NGO Grading Certificate_Y4D_June23_Design.jpg";

import Partners1 from "./Partners1";
import Partners2 from "./Partners2";

import DonateButton from "../component/DonateButton";
import fallbackBanner from "../assets/BannerImages/f.jpeg";

import LogoSlider from "./LogoSlider.jsx";

// ✅ Store your array here

const Home = () => {
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [impact, setImpact] = useState({
    beneficiaries: 0,
    states: 0,
    projects: 0,
  });
  const [accreditations, setAccreditations] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [campaignBanners, setCampaignBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accreditationsError, setAccreditationsError] = useState(false);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setBannersLoading(true);
        setAccreditationsError(false);
        console.log("🚀 Starting to fetch home data...");

        const [
          mentorsData,
          managementData,
          reportsData,
          impactData,
          accreditationsData,
          heroBannersData,
          campaignBannersData,
        ] = await Promise.all([
          getMentors().catch((err) => {
            console.error("❌ Error fetching mentors:", err);
            return [];
          }),
          getManagement().catch((err) => {
            console.error("❌ Error fetching management:", err);
            return [];
          }),
          getReports().catch((err) => {
            console.error("❌ Error fetching reports:", err);
            return [];
          }),
          getImpactData().catch((err) => {
            console.error("❌ Error fetching impact data:", err);
            return { beneficiaries: 0, states: 0, projects: 0 };
          }),
          getAccreditations().catch((err) => {
            console.error("❌ Error fetching accreditations:", err);
            setAccreditationsError(true);
            return [];
          }),
          getBanners("home", "hero").catch((err) => {
            console.error("❌ Error fetching hero banners:", err);
            return [];
          }),
          getBanners("home", "campaigns").catch((err) => {
            console.error("❌ Error fetching campaign banners:", err);
            return [];
          }),
        ]);

        console.log("📊 Hero banners received:", heroBannersData);
        console.log("📊 Campaign banners received:", campaignBannersData);

        setTeamCount(mentorsData.length + managementData.length);
        setReportsCount(reportsData.length);
        setImpact(impactData);
        setAccreditations(accreditationsData || []);
        setHeroBanners(heroBannersData);
        setCampaignBanners(campaignBannersData);
      } catch (err) {
        console.error("💥 Error in fetchHomeData:", err);
        setAccreditationsError(true);
      } finally {
        setLoading(false);
        setBannersLoading(false);
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

  const activeAccreditations = accreditations.filter(
    (acc) =>
      acc.is_active === true || acc.is_active === 1 || acc.is_active === "true"
  );

  const handleImageError = (e) => {
    e.target.style.display = "none";
    const nextSibling = e.target.nextSibling;
    if (nextSibling && nextSibling.style) {
      nextSibling.style.display = "block";
    }
  };

  // Render dynamic hero slider
  const renderHeroSlider = () => {
    if (bannersLoading) {
      return (
        <section className="hero-slider">
          <div className="loading-slider">Loading banners...</div>
        </section>
      );
    }

    if (heroBanners.length === 0) {
      // Fallback static banner when backend sends no banners
      return (
        <section className="hero-slider">
          <div className="slide-content">
            <img
              src={fallbackBanner}
              alt="Y4D Foundation"
              className="slide-img"
            />
            {/* <div className="slide-overlay">
              <div className="slide-text">
                <h2>Empowering Communities for a Better Tomorrow</h2>
                <p>Together, we can create sustainable and inclusive growth.</p>
                <Link to="/our-work" className="slide-btn">
                  Explore Our Work
                </Link>
              </div>
            </div> */}
          </div>
        </section>
      );
    }

    return (
      <section className="hero-slider">
        <Slider {...sliderSettings}>
          {heroBanners.map((banner) => (
            <div key={banner.id} className="slide-content">
              {banner.media_type === "image" ? (
                <img
                  src={`http://localhost:5000/uploads/banners/${banner.media}`}
                  alt={banner.title}
                  className="slide-img"
                  onError={handleImageError}
                />
              ) : (
                <video
                  src={`http://localhost:5000/uploads/banners/${banner.media}`}
                  className="slide-img"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              )}
              {(banner.title || banner.description || banner.button_text) && (
                <div className="slide-overlay">
                  <div className="slide-text">
                    {banner.title && <h2>{banner.title}</h2>}
                    {banner.description && <p>{banner.description}</p>}
                    {banner.button_text && banner.button_link && (
                      <Link to={banner.button_link} className="slide-btn">
                        {banner.button_text}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </Slider>
      </section>
    );
  };

  // Render campaign banners grid
  const renderCampaignBanners = () => {
    if (campaignBanners.length === 0) return null;

    return (
      <section className="campaign-banners-section">
        <div className="campaign-banners-container">
          <h2 className="section-title">Featured Campaigns</h2>
          <div className="campaign-banners-grid">
            {campaignBanners.map((banner) => (
              <div key={banner.id} className="campaign-banner-card">
                <div className="campaign-banner-media">
                  {banner.media_type === "image" ? (
                    <img
                      src={`http://localhost:5000/uploads/banners/${banner.media}`}
                      alt={banner.title}
                      className="campaign-banner-img"
                      onError={handleImageError}
                    />
                  ) : (
                    <video
                      src={`http://localhost:5000/uploads/banners/${banner.media}`}
                      className="campaign-banner-video"
                      muted
                      loop
                      playsInline
                    />
                  )}
                </div>
                <div className="campaign-banner-content">
                  <h3>{banner.title}</h3>
                  {banner.description && <p>{banner.description}</p>}
                  {banner.button_text && banner.button_link && (
                    <Link
                      to={banner.button_link}
                      className="campaign-banner-btn"
                    >
                      {banner.button_text}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="home">
      {/* ✅ Dynamic Hero Slider Section */}
      {renderHeroSlider()}

      {/* Campaign Banners Section */}
      {renderCampaignBanners()}

      {/* Our Reach Section */}
      <section className="our-reach-section" data-aos="fade-up">
        <div className="our-reach-container">
          <h2 className="impact-title" data-aos="fade-up" data-aos-delay="100">
            Our Impact<span></span>
          </h2>
          <div className="reach-grid">
            <div className="reach-item" data-aos="zoom-in" data-aos-delay="200">
              <h3 className="reach-number">
                <Counter end={impact.beneficiaries} />
                L+
              </h3>
              <p className="reach-subtitle">Beneficiaries</p>
              <p className="reach-text">
                Children and their families are impacted every year
              </p>
            </div>

            <div className="reach-item" data-aos="zoom-in" data-aos-delay="300">
              <h3 className="reach-number">
                <Counter end={impact.states} />+
              </h3>
              <p className="reach-subtitle">States</p>
              <p className="reach-text">
                Active presence across more than 20 states and underserved
                communities
              </p>
            </div>

            <div className="reach-item" data-aos="zoom-in" data-aos-delay="400">
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
      <section className="Interventions-section" data-aos="fade-up">
        <div className="Interventions-container">
          <h2 className="Inter-title" data-aos="fade-up" data-aos-delay="100">
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
              <div
                key={index}
                className="card text-center intervention-card"
                data-aos="zoom-in"
                data-aos-delay={200 + index * 100}
              >
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
        <LogoSlider />
      </section>

      {/* Partners Section */}
      <section className="Partners-section">
        <Partners1 />
        <Partners2 />
      </section>

      {/* Accreditations Section */}
      <div className="accreditations-section" data-aos="fade-up">
        <div className="accreditations-container">
          <h2
            className="accreditations-title"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Accreditations<span></span>
          </h2>
          {isMobile ? (
            <div
              className="accreditations-list"
              style={{ gap: "10px" }}
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              {activeAccreditations.length > 0 ? (
                activeAccreditations.map((item, index) => (
                  <div
                    key={item.id}
                    className="accreditation-card"
                    data-aos="zoom-in"
                    data-aos-delay={300 + index * 100}
                  >
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
                <div className="no-accreditations-message">
                  <p>No accreditations available at the moment.</p>
                </div>
              )}
            </div>
          ) : isTablet ? (
            <div
              className="accreditations-list"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "80px",
              }}
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              {activeAccreditations.length > 0 ? (
                activeAccreditations.map((item, index) => (
                  <div
                    key={item.id}
                    className="accreditation-card"
                    data-aos="zoom-in"
                    data-aos-delay={300 + index * 100}
                  >
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
                <div className="no-accreditations-message">
                  <p>No accreditations available at the moment.</p>
                </div>
              )}
            </div>
          ) : activeAccreditations.length > 0 ? (
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
                    slidesToShow: Math.min(3, activeAccreditations.length),
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: Math.min(2, activeAccreditations.length),
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ]}
            >
              {activeAccreditations.map((item, index) => (
                <div
                  key={item.id}
                  className="accreditation-card"
                  data-aos="zoom-in"
                  data-aos-delay={300 + index * 100}
                >
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
            <div className="no-accreditations-message">
              <p>No accreditations available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Highlights Section */}
      <section className="Media-section bg-light" data-aos="fade-up">
        <div className="Media-container">
          <h2 className="media-title" data-aos="fade-up" data-aos-delay="100">
            Latest from Our Media Corner<span></span>
          </h2>
          <div className="grid grid-3">
            {[
              {
                title: "Newsletters",
                description:
                  "Stay updated with our latest activities and impact stories",
                link: "/newsletters",
                buttonText: "Read Now",
              },
              {
                title: "Stories of Empowerment",
                description:
                  "Inspiring stories of transformation from our communities",
                link: "/stories",
                buttonText: "Read Stories",
              },
              {
                title: "Blogs",
                description:
                  "Read stories, insights, and updates from our inspiring journey.",
                link: "/blogs",
                buttonText: "View Blogs",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="Media-card text-center"
                data-aos="zoom-in"
                data-aos-delay={200 + index * 100}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={item.link} className="MC-btn">
                  {item.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* About Y4D Section */}
      <section className="About-section">
        <div className="About-container">
          <h2 className="about-title">
            Who We Are<span></span>
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

      <DonateButton />
    </div>
  );
};

export default Home;
