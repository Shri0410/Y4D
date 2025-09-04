// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Counter from "../component/Counter";
import { getMentors, getManagement, getReports } from "../services/api";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

import first from "../assets/BannerImages/f.jpeg";
import Second from "../assets/BannerImages/s.jpeg";
import Third from "../assets/BannerImages/t.jpeg";
import Fourth from "../assets/BannerImages/fo.jpeg";

const Home = () => {
  const [teamCount, setTeamCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [mentorsData, managementData, reportsData] = await Promise.all([
          getMentors(),
          getManagement(),
          getReports(),
        ]);

        setTeamCount(mentorsData.length + managementData.length);
        setReportsCount(reportsData.length);
      } catch (err) {
        console.error("Error fetching home data:", err);
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

  return (
    <div className="home">
      {/* ✅ Hero Slider Section */}
      <section className="hero-slider">
        <Slider {...sliderSettings}>
          {/* First Image */}
          <div>
            <img src={first} alt="Slide 1" className="slide-img" />
          </div>

          {/* Second Image */}
          <div>
            <img src={Second} alt="Slide 2" className="slide-img" />
          </div>

          {/* Third Image with Title & Button */}
          <div className="slide-content">
            <img src={Third} alt="Slide 3" className="slide-img" />
            <div className="overlay1">
              <Link to="/about" className="img1-btn">
                Know More
              </Link>
            </div>
          </div>

          {/* Fourth Image with Title & Button */}
          <div className="slide-content">
            <img src={Fourth} alt="Slide 4" className="slide-img" />
            <div className="overlay2">
              <Link to="/our-work" className="img2-btn">
                Know More
              </Link>
            </div>
          </div>
        </Slider>
      </section>
      {/* About Y4D Section */}
      <section className="About-section">
        <div className="About-container">
          <h2 className="section-title">
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
          <h2 className="section-title">
            Our Impact<span></span>
          </h2>
          <div className="reach-grid">
            {/* Item 1 */}
            <div className="reach-item">
              <h3 className="reach-number">
                <Counter end={15} />
                L+
              </h3>
              <p className="reach-subtitle">Beneficiaries</p>
              <p className="reach-text">
                Children and their families are impacted every year
              </p>
            </div>

            {/* Item 2 */}
            <div className="reach-item">
              <h3 className="reach-number">
                <Counter end={20} />+
              </h3>
              <p className="reach-subtitle">States</p>
              <p className="reach-text">
                Active presence across more than 20 states and underserved
                communities
              </p>
            </div>

            {/* Item 3 */}
            <div className="reach-item">
              <h3 className="reach-number">
                <Counter end={200} />+
              </h3>
              <p className="reach-subtitle">PROJECTS</p>
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
          <h2 className="section-title">
            Our Interventions<span></span>
          </h2>
          <div className="grid grid-3">
            {[
              {
                title: "Quality Education",
                img: "/assets/interventions/education.png",
              },
              {
                title: "Livelihood",
                img: "/assets/interventions/livelihood.png",
              },
              {
                title: "Healthcare",
                img: "/assets/interventions/healthcare.png",
              },
              {
                title: "Environment Sustainability",
                img: "/assets/interventions/environment.png",
              },
              {
                title: "Integrated Development Program (IDP)",
                img: "/assets/interventions/idp.png",
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
          <h2 className="section-title">
            Towards Achieving SDG's<span></span>
          </h2>
          <Slider
            slidesToShow={5}
            slidesToScroll={1}
            infinite={true}
            autoplay={true}
            autoplaySpeed={0}
            speed={4000}
            cssEase="linear"
            arrows={false}
            dots={false}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((sdg) => (
              <div key={sdg} className="sdg-item">
                <img
                  src={`/assets/sdg-${sdg}.png`}
                  alt={`SDG ${sdg}`}
                  className="sdg-icon"
                />
              </div>
            ))}
          </Slider>
        </div>
      </section>
      {/* Partners Section */}
      <section className="Partners-section">
        <div className="Partners-container">
          <h2 className="section-title">
            Our Partners<span></span>
          </h2>
          <Slider
            slidesToShow={5}
            slidesToScroll={1}
            infinite={true}
            autoplay={true}
            autoplaySpeed={0}
            speed={4000}
            cssEase="linear"
            arrows={false}
            dots={false}
          >
            {[1, 2, 3, 4, 5, 6].map((partner) => (
              <div key={partner} className="partner-item">
                <img
                  src={`/assets/partner-${partner}.png`}
                  alt={`Partner ${partner}`}
                />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Accreditations Section */}
      <section className=" accreditations-section">
        <h2 className="section-title">
          Accreditations<span></span>
        </h2>
        <div className="accreditations-container">
          <Slider
            slidesToShow={4}
            slidesToScroll={1}
            infinite={true}
            autoplay={true}
            autoplaySpeed={2000}
            speed={800}
            arrows={false}
            dots={false}
            responsive={[
              {
                breakpoint: 1024, // tablets
                settings: {
                  slidesToShow: 3,
                },
              },
              {
                breakpoint: 768, // large mobiles
                settings: {
                  slidesToShow: 2, // show 2 cards instead of 1
                },
              },
              {
                breakpoint: 480, // very small screens
                settings: {
                  slidesToShow: 1, // fallback to 1 card
                },
              },
            ]}
          >
            {[
              { img: "/assets/accreditation-1.png", title: "ISO Certified" },
              { img: "/assets/accreditation-2.png", title: "Govt. of India" },
              { img: "/assets/accreditation-3.png", title: "UN Partnership" },
              { img: "/assets/accreditation-4.png", title: "CSR Registered" },
              { img: "/assets/accreditation-5.png", title: "NITI Aayog" },
              { img: "/assets/accreditation-6.png", title: "Skill India" },
            ].map((item, index) => (
              <div key={index} className="accreditation-card">
                <img
                  src={item.img}
                  alt={item.title}
                  className="accreditation-icon"
                />
                <h3>{item.title}</h3>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Media Highlights Section */}
      <section className="Media-section bg-light">
        <div className="Media-container">
          <h2 className="section-title">
            Latest from Our Media Corner<span></span>
          </h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <h3>Newsletters</h3>
              <p>Stay updated with our latest activities and impact stories </p>
              <Link to="/newsletters" className="MC-btn">
                Read Now
              </Link>
            </div>
            <div className="card text-center">
              <h3>Stories of Empowerment</h3>
              <p>Inspiring stories of transformation from our communities</p>
              <Link to="/stories" className="MC-btn">
                Read Stories
              </Link>
            </div>
            <div className="card text-center">
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
    </div>
  );
};

export default Home;
