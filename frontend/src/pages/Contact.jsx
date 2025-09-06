import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [faqs, setFaqs] = useState([
    {
      question: "How can I volunteer with Y4D Foundation?",
      answer:
        "You can fill the Volunteers & Partnership form and our team will get in touch with you.",
      open: false,
    },
    {
      question: "How can I support through partnership?",
      answer:
        "Click on the Partnership Support button to connect with our partnership team.",
      open: false,
    },
    {
      question: "Where is your office located?",
      answer:
        "Our office is in Wakad, Pune. You can find the exact location on Google Maps by clicking the address below.",
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
        <h2>Enquiry Form</h2>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>
          <button type="submit">Submit</button>
        </form>
      </section>

      {/* Help Desk */}
      <section className="contactus-section contactus-help">
        <h2>Help Desk</h2>
        <div className="contactus-help-buttons">
          <button className="primary-btn">Partnership Support</button>
          <button className="secondary-btn">Volunteers & Partnership</button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contactus-section contactus-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="contactus-faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`contactus-faq-item ${faq.open ? "open" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <h3>{faq.question}</h3>
              <div className="faq-answer">
                {faq.open && <p>{faq.answer}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Office Address */}
      <section className="contactus-section contactus-office">
        <h2>Office Address</h2>
        <a
          href="https://www.google.com/maps/place/Y4D+Foundation,+402,+The+Onyx,+Near+Euro+School,+Wakad,+Pune,+Maharashtra,+India+-+411057"
          target="_blank"
          rel="noopener noreferrer"
        >
          Y4D Foundation, 402, The Onyx, Near Euro School, Wakad, Pune,
          Maharashtra, India - 411057
        </a>
      </section>
    </div>
  );
};

export default Contact;
