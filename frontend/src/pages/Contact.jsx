import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [faqs, setFaqs] = useState([
    {
      question: "How can my company partner with Y4D Foundation?",
      answer:
        "Y4D collaborates with corporates through CSR initiatives, skill development programs, education projects, women empowerment, and sustainability interventions. To partner with us, you can reach out via our Partnership Inquiry Form or write to us at csr@y4d.ngo",
      open: false,
    },
    {
      question: "Does Y4D offer customized CSR solutions?",
      answer:
        "Yes, we design and implement tailor-made CSR projects aligned with your company’s sustainability goals, compliance requirements, and community needs.",
      open: false,
    },
    {
      question: "Can Y4D provide impact reporting for CSR initiatives?",
      answer:
        "Absolutely. We provide detailed reports, case studies, and impact stories with measurable outcomes to ensure transparency and accountability.",
      open: false,
    },
    {
      question: "How can I volunteer with Y4D Foundation?",
      answer:
        "You can register through our Volunteer Portal and choose from opportunities such as teaching, community outreach, awareness campaigns, and event support.",
      open: false,
    },
    {
      question: "Do I need specific skills to volunteer?",
      answer:
        "Not necessarily. While some roles require specialized skills, most opportunities simply need dedication and a willingness to make a difference.",
      open: false,
    },
    {
      question: "Can corporate employees volunteer through Y4D?",
      answer:
        "Yes, we facilitate employee engagement programs for corporates looking to involve their teams in meaningful volunteering activities.",
      open: false,
    },
    {
      question: "Does Y4D offer internships for students?",
      answer:
        "Yes, Y4D offers structured internships for students and young professionals in areas like social research, content creation, project management, and community engagement.",
      open: false,
    },
    {
      question: "How can I apply for an internship?",
      answer:
        "Interested candidates can apply via our Careers/Internship section.",
      open: false,
    },
    {
      question: "Are Y4D internships paid?",
      answer:
        "Some internships are paid, while others are volunteer-based. Details are shared at the time of application.",
      open: false,
    },
    {
      question: "How can I donate to Y4D Foundation?",
      answer:
        "Donations can be made easily through our Donate Now page via online payment, bank transfer, or UPI.",
      open: false,
    },
    {
      question: "Are donations tax-exempt?",
      answer:
        "Yes, Y4D Foundation is registered under relevant sections of the Income Tax Act, and donations are eligible for tax exemption under 80G.",
      open: false,
    },
    {
      question: "Can I donate in-kind (books, clothes, equipment)?",
      answer:
        "Yes, we welcome in-kind contributions. Please contact us in advance so we can guide you on current community requirements.",
      open: false,
    },
    {
      question: "What kind of career opportunities does Y4D Foundation offer?",
      answer:
        "Y4D offers diverse career opportunities in project management, communications, community outreach, research, training, and CSR program implementation.",
      open: false,
    },
    {
      question: "How can I apply for a job at Y4D Foundation?",
      answer:
        "You can explore current openings in the Careers Section of our website and apply online.",
      open: false,
    },
    {
      question:
        "Does Y4D provide growth and training opportunities for employees?",
      answer:
        "Yes, Y4D strongly believes in continuous learning. We provide capacity-building workshops, exposure visits, and skill development programs to support personal and professional growth.",
      open: false,
    },
    {
      question: "What qualities does Y4D look for in candidates?",
      answer:
        "We value passion for social change, problem-solving ability, teamwork, creativity, and a strong commitment to community development.",
      open: false,
    },
    {
      question: "Can freshers apply for roles at Y4D?",
      answer:
        "Yes, freshers who are motivated and willing to learn are welcome to apply. We often have entry-level positions and training-based roles.",
      open: false,
    },
    {
      question: "Are there remote or hybrid working opportunities at Y4D?",
      answer:
        "Depending on the project requirements, certain roles may allow remote or hybrid work. However, many positions involve field engagement and community interaction.",
      open: false,
    },
    {
      question: "Where does Y4D operate?",
      answer:
        "Y4D Foundation operates across multiple states in India, implementing projects in Education, Skilling, Women Empowerment, Environment, and SDGs.",
      open: false,
    },
    {
      question: "How can I stay updated on Y4D’s initiatives?",
      answer:
        "You can follow us on our social media channels, subscribe to our newsletter, or check our News & Updates section on the website.",
      open: false,
    },
    {
      question: "Who can I contact for general queries?",
      answer:
        "Please reach out to us at info@y4d.ngo for any general inquiries.",
      open: false,
    },
  ]);

  const toggleFAQ = (index) => {
    setFaqs(
      faqs.map((faq, i) => {
        if (i === index) {
          faq.open = !faq.open;
        } else {
          faq.open = false;
        }
        return faq;
      })
    );
  };

  return (
    <div className="contactus-page">
      {/* Enquiry Form */}
      <section className="contactus-section contactus-enquiry">
        <div className="f-title">
          <h2>
            Enquiry Form<span></span>
          </h2>
        </div>
        <form>
          {/* Row 1: First + Last Name */}
          <div className="form-row">
            <input type="text" placeholder="First Name" required />
            <input type="text" placeholder="Last Name" required />
          </div>

          {/* Row 2: Email + Mobile */}
          <div className="form-row">
            <input type="email" placeholder="Your Email" required />
            <input type="text" placeholder="Mobile Number" required />
          </div>

          {/* Message */}
          <textarea placeholder="Your Message" rows="5" required></textarea>

          <button className="sbmt-btn" type="submit">
            Submit
          </button>
        </form>
      </section>

      {/* Help Desk */}
      <section className="contactus-section contactus-help">
        <div className="b-title">
          <h2>
            Help Desk<span></span>
          </h2>
        </div>
        <div className="contactus-help-buttons">
          <button className="p-btn">Partnership Support</button>
          <button className="vi-btn">Volunteers & Partnership</button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contactus-section contactus-faq">
        <div className="faq-title">
          <h2>
            Frequently Asked Questions<span></span>
          </h2>
        </div>

        <div className="contactus-faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`contactus-faq-item ${faq.open ? "open" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <span className="faq-icon">•</span>
                <h3>{faq.question}</h3>
                <span className={`arrow ${faq.open ? "up" : "down"}`}>⌄</span>
              </div>
              <div className="faq-answer">
                {faq.open && (
                  <p>
                    <span className="faq-icon">{">"}</span> {faq.answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Office Address */}
      <section className="contactus-section contactus-office">
        <div className="office-title">
          <h2>
            Office Addresses<span></span>
          </h2>
        </div>

        <div className="office-list">
          <a
            href="https://www.google.com/maps/search/3rd+Floor,+The+Onyx,+Near+Euro+School,+Wakad,+Pune+411057/@18.5966469,73.7434204,14z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDkxNS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="office-item"
          >
            {/* <span className="office-icon">📍</span> */}
            <div>
              <h4>Pune Office</h4>
              <p>3rd Floor, The Onyx, Near Euro School, Wakad, Pune 411057</p>
            </div>
          </a>

          <a
            href="https://www.google.com/maps/place/Janmabhoomi+Chambers,+Ballard+Estate,+Mumbai+400038"
            target="_blank"
            rel="noopener noreferrer"
            className="office-item"
          >
            {/* <span className="office-icon">🏢</span> */}
            <div>
              <h4>Mumbai Office</h4>
              <p>305 A, Janmabhoomi Chambers, Ballard Estate, Mumbai-38</p>
            </div>
          </a>

          <a
            href="https://www.google.com/maps/place/100+Bellis+Ct,+Bridgewater,+New+Jersey+08807,+USA"
            target="_blank"
            rel="noopener noreferrer"
            className="office-item"
          >
            {/* <span className="office-icon">🌎</span> */}
            <div>
              <h4>USA Office</h4>
              <p>100 Bellis Ct., Bridgewater, New Jersey, 08807</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
