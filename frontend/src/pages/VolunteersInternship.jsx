import React from "react";
import "./VolunteersInternship.css";

const VolunteersInternship = () => {
  return (
    <div className="vol-internship-page">
      <h1 className="page-title">
        Volunteers & Internship <span></span>
      </h1>

      <div className="form-container">
        {/* Volunteer Form */}
        <div className="form-card">
          <p className="form-intro">
            Join as a volunteer and contribute your time and skills to support
            our mission.
          </p>
          <h2>Volunteer Form</h2>
          <form>
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />

            <label>Email</label>
            <input type="email" placeholder="Enter your email" />

            <label>Phone</label>
            <input type="text" placeholder="Enter your phone number" />

            <label>Why do you want to volunteer?</label>
            <textarea placeholder="Write here..."></textarea>

            <button className="VN-btn" type="submit">
              Submit
            </button>
          </form>
        </div>

        {/* Internship Form */}
        <div className="form-card">
          <p className="form-intro">
            Apply for an internship and gain valuable hands-on experience with
            our team.
          </p>
          <h2>Internship Form</h2>
          <form>
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />

            <label>Email</label>
            <input type="email" placeholder="Enter your email" />

            <label>Phone</label>
            <input type="text" placeholder="Enter your phone number" />

            <label>Area of Interest</label>
            <input type="text" placeholder="e.g. Web Development, Marketing" />

            <label>Upload Resume</label>
            <input type="file" />

            <button className="VN-btn" type="submit">
              Apply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteersInternship;
