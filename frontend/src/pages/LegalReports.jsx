import React from "react";
import "./LegalReports.css";
import bannerImg from "../assets/BannerImages/t.jpeg"; // replace with your banner image

const LegalReports = () => {
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
        <h2>Legal Status</h2>
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
