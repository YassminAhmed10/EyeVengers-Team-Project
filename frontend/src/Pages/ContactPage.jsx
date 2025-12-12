import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ContactPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank You!");
    setFormData({ name: "", email: "", message: "" });
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div className="contact-container">
      <button className="back-button" onClick={handleBack}>
        <span className="back-arrow">←</span>
        Back
      </button>

      <div className="logo-center">
        <img src="src/images/logo.png" alt="Clinic Logo" className="logoo-img" />
      </div>

      <h1>Contact Dr. Mohab Khairy</h1>
      <p className="contact-subtitle">
        Feel free to reach out with any questions or concerns
      </p>

      <div className="contact-info">
        <div className="info-card">
          <strong>Phone:</strong> +20 101 056 9908
        </div>
        <div className="info-card">
          <strong>Email:</strong> mohabkhairy7@gmail.com
        </div>
        <div className="info-card">
          <strong>Address:</strong> 123 Vision Avenue, Suite 101, Cairo, Egypt
        </div>
      </div>

      <h2>Send a Message / Complaint</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Send Message</button>
      </form>

      <div className="contact-map">
        <iframe
          title="Cairo map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d221164.79332418578!2d31.22424075199695!3d30.016110291993215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458403481e1d3a9%3A0x1b79d85459344422!2sCairo!5e0!3m2!1sen!2sus!4v1701382436798!5m2!1sen!2sus"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactPage;