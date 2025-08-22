// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import Footer from './component/Footer';
import Banner from './component/Banner';
import Home from './pages/Home';
import About from './pages/About';
import OurTeam from './pages/OurTeam';
import ReachPresence from './pages/ReachPresence';
import LegalStatus from './pages/LegalStatus';
import OurWork from './pages/OurWork';
import QualityEducation from './pages/QualityEducation';
import Livelihood from './pages/Livelihood';
import Healthcare from './pages/Healthcare';
import EnvironmentSustainability from './pages/EnvironmentSustainability';
import IDP from './pages/IDP';
import GetInvolved from './pages/GetInvolved';
import CorporatePartnership from './pages/CorporatePartnership';
import Careers from './pages/Careers';
import MediaCorner from './pages/MediaCorner';
import Newsletters from './pages/Newsletters';
import Stories from './pages/Stories';
import Events from './pages/Events';
import Blogs from './pages/Blogs';
import Documentaries from './pages/Documentaries';
import Contact from './pages/Contact';
import ScrollToTop from './ScrollToTop';
import DonateButton from './component/DonateButton';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Navbar />
        <Banner />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-team" element={<OurTeam />} />
            <Route path="/reach-presence" element={<ReachPresence />} />
            <Route path="/legal-status" element={<LegalStatus />} />
            <Route path="/our-work" element={<OurWork />} />
            <Route path="/quality-education" element={<QualityEducation />} />
            <Route path="/livelihood" element={<Livelihood />} />
            <Route path="/healthcare" element={<Healthcare />} />
            <Route path="/environment-sustainability" element={<EnvironmentSustainability />} />
            <Route path="/idp" element={<IDP />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/corporate-partnership" element={<CorporatePartnership />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/media-corner" element={<MediaCorner />} />
            <Route path="/newsletters" element={<Newsletters />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/events" element={<Events />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/documentaries" element={<Documentaries />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <DonateButton />
        <Footer />
      </div>
    </Router>
  );
}

export default App;