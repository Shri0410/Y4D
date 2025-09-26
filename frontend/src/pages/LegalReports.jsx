import React, { useEffect, useState } from "react";
import "./LegalReports.css";
import bannerImg from "../assets/BannerImages/t.jpeg"; // replace with your banner image
import axios from "axios";

const LegalReports = () => {
  const [reports, setReports] = useState([]);

  // your backend URL
  const BACKEND_URL = "http://localhost:5000";

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/reports`);
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  const legalStatusData = [
    { title: "1) Niti Ayog (Darpan)", value: "MH/2015/0093159" },
    { title: "2) Public Trust Act, 1950", value: "E-7269 (24/09/2015)" },
    { title: "3) PAN Card", value: "AAATY4684J" },
    {
      title: "4) Income Tax Exemption",
      value: (
        <>
          12AA 664/242/2015-16 <br />
          80G 6974/228/2016-17
        </>
      ),
    },
    { title: "5) Foreign contribution", value: "FCRA No.- 083930725" },
    { title: "6) Goods and Service Tax (GST)", value: "27AAATY4684J1ZU" },
    { title: "7) TAN", value: "88302012554372" },
    { title: "8) CSR Registration Number", value: "CSR00000374" },
  ];

  return (
    <div className="legal-page">
      {/* Banner Section */}
      <div className="legal-banner">
        <img src={bannerImg} alt="Banner" />
      </div>

      {/* Legal Status Section */}
      <section className="legal-section">
        <div className="ls-header">
          <h2 className="ls-title">
            Legal Status<span></span>
          </h2>
        </div>

        <div className="table-container">
          <table>
            <tbody>
              {legalStatusData.map((item, index) => (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Reports Section */}
      <section className="legal-section">
        <div className="lr-header">
          <h2 className="lr-title">
            All Reports<span></span>
          </h2>
        </div>
        <div className="reports-container">
          {reports.length === 0 ? (
            <p>No reports available</p>
          ) : (
            reports.map((report) => (
              <div className="lr-card" key={report.id}>
                <div className="lr-image">
                  {report.image ? (
                    <img
                      src={`${BACKEND_URL}/api/uploads/reports/${report.image}`}
                      alt={report.title}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="report-content-LR">
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                </div>
                <div className="report-actions">
                  {report.pdf ? (
                    <a
                      href={`${BACKEND_URL}/api/uploads/reports/${report.pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="no-pdf">No PDF</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LegalReports;
