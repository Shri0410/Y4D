import React from "react";
import "./LegalReports.css";
import bannerImg from "../assets/BannerImages/t.jpeg"; // replace with your banner image

const LegalReports = () => {
  return (
    <div className="legal-page">
      {/* Banner Section */}
      <div className="legal-banner">
        <img src={bannerImg} alt="Banner" />
      </div>

      {/* Legal Status Section */}
      <section className="legal-section">
        <h2>Legal Status</h2>
        <div className="table-container">
          <table>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td>Row {i + 1} Col 1</td>
                  <td>Row {i + 1} Col 2</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Reports Section */}
      <section className="legal-section">
        <h2>All Reports</h2>
        <div className="table-container">
          <table>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td>Row {i + 1} Col 1</td>
                  <td>Row {i + 1} Col 2</td>
                  <td>Row {i + 1} Col 3</td>
                  <td>Row {i + 1} Col 4</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LegalReports;
