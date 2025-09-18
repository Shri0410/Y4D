// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import Banner from "./component/Banner";
import Home from "./pages/Home";
import About from "./pages/About";
import OurTeam from "./pages/OurTeam";
import ReachPresence from "./pages/ReachPresence";
import LegalStatus from "./pages/LegalStatus";
import OurWork from "./pages/OurWork";
import QualityEducation from "./pages/QualityEducation";
import Livelihood from "./pages/Livelihood";
import Healthcare from "./pages/Healthcare";
import EnvironmentSustainability from "./pages/EnvironmentSustainability";
import IDP from "./pages/IDP";
import GetInvolved from "./pages/GetInvolved";
import CorporatePartnership from "./pages/Corporatepartnership";
import Careers from "./pages/Careers";
import MediaCorner from "./pages/MediaCorner";
import Newsletters from "./pages/NewsLetters";
import Stories from "./pages/Stories";
import Events from "./pages/Events";
import Blogs from "./pages/Blogs";
import BlogDetails from "./pages/BlogDetails";
import Documentaries from "./pages/Documentaries";
import Contact from "./pages/Contact";
import ScrollToTop from "./ScrollToTop";
import Dashboard from "./component/Dashboard";
import LoginPage from "./component/LoginPage";
import PageTransition from "./component/PageTransition";
import LegalReports from "./pages/LegalReports";
import VolunteersInternship from "./pages/VolunteersInternship";
import IndiaMapHover from "./pages/IndiaMapHover";

import "./App.css";

function AppContent({
  isAuthenticated,
  setIsAuthenticated,
  currentUser,
  setCurrentUser,
}) {
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);

  // Trigger transition on every route change
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 1700);
    return () => clearTimeout(timer);
  }, [location]);

  if (pageLoading) {
    return <PageTransition />;
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/our-team" element={<OurTeam />} />
                  <Route path="/reach-presence" element={<ReachPresence />} />
                  <Route path="/legal-status" element={<LegalStatus />} />
                  <Route path="/our-work" element={<OurWork />} />
                  <Route
                    path="/quality-education"
                    element={<QualityEducation />}
                  />
                  <Route path="/livelihood" element={<Livelihood />} />
                  <Route path="/healthcare" element={<Healthcare />} />
                  <Route
                    path="/environment-sustainability"
                    element={<EnvironmentSustainability />}
                  />
                  <Route path="/idp" element={<IDP />} />
                  <Route path="/get-involved" element={<GetInvolved />} />
                  <Route
                    path="/corporate-partnership"
                    element={<CorporatePartnership />}
                  />
                  <Route
                    path="/volunteers-internship"
                    element={<VolunteersInternship />}
                  />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/media-corner" element={<MediaCorner />} />
                  <Route path="/newsletters" element={<Newsletters />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:id" element={<BlogDetails />} />
                  <Route path="/documentaries" element={<Documentaries />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/legalreports" element={<LegalReports />} />
                  <Route path="/india-map" element={<IndiaMapHover />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated && currentUser ? (
              <Dashboard currentUser={currentUser} />
            ) : (
              <LoginPage
                onLogin={(user) => {
                  setCurrentUser(user);
                  setIsAuthenticated(true);
                }}
                onAdminLogin={() => {
                  setCurrentUser({ role: "admin" });
                  setIsAuthenticated(true);
                }}
              />
            )
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </Router>
  );
}

export default App;
