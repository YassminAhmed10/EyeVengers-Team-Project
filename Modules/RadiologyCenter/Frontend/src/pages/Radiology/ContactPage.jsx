import { motion } from "framer-motion";
import { useState } from "react";
import { 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, 
  FaPaperPlane, FaWhatsapp, FaFacebook, FaTwitter, 
  FaLinkedin, FaInstagram, FaUser, FaMobileAlt,
  FaComment
} from "react-icons/fa";
import contactBg from "../../assets/register.png";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt size={24} />,
      title: "Address",
      details: ["12 El Tahrir Street", "Dokki, Giza", "Beside Dokki Specialized Hospital"],
      color: "#1f6bff"
    },
    {
      icon: <FaPhone size={24} />,
      title: "Phone",
      details: ["02-37600000", "01000000000 (WhatsApp)"],
      color: "#00b8a8"
    },
    {
      icon: <FaEnvelope size={24} />,
      title: "Email",
      details: ["info@radiology.eg", "results@radiology.eg"],
      color: "#fd7e14"
    },
    {
      icon: <FaClock size={24} />,
      title: "Working Hours",
      details: ["Saturday – Thursday: 8 AM – 10 PM", "Friday: 10 AM – 6 PM"],
      color: "#6f42c1"
    }
  ];

  const socialLinks = [
    { icon: <FaWhatsapp size={22} />, url: "https://wa.me/201000000000", color: "#25D366", label: "WhatsApp" },
    { icon: <FaFacebook size={22} />, url: "https://facebook.com", color: "#1877f2", label: "Facebook" },
    { icon: <FaTwitter size={22} />, url: "https://twitter.com", color: "#1da1f2", label: "Twitter" },
    { icon: <FaLinkedin size={22} />, url: "https://linkedin.com", color: "#0077b5", label: "LinkedIn" },
    { icon: <FaInstagram size={22} />, url: "https://instagram.com", color: "#e4405f", label: "Instagram" },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div dir="ltr" style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{
        position: "relative",
        backgroundImage: `linear-gradient(135deg, rgba(11,26,52,0.92), rgba(26,58,92,0.88)), url(${contactBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        padding: "80px 0",
        marginBottom: 60,
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#00b8a8",
              marginBottom: 16,
              display: "block"
            }}>
              GET IN TOUCH
            </span>
            <h1 style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 900,
              color: "white",
              marginBottom: 16,
              fontFamily: "'Outfit', sans-serif"
            }}>
              We're Here to Help You
            </h1>
            <p style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.8)",
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 1.6
            }}>
              Our customer service team is available 7 days a week to assist you with any questions or concerns
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 60px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
        }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerChildren}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 24,
              marginBottom: 40,
            }}>
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  variants={fadeUp}
                  whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: "24px",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    background: `${info.color}15`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: info.color,
                    transition: "all 0.3s ease",
                  }}>
                    {info.icon}
                  </div>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0b1a34",
                    marginBottom: 12,
                  }}>
                    {info.title}
                  </h3>
                  {info.details.map((detail, i) => (
                    <p key={i} style={{
                      fontSize: 13,
                      color: "#6f86a3",
                      marginBottom: i === info.details.length - 1 ? 0 : 4,
                      lineHeight: 1.5
                    }}>
                      {detail}
                    </p>
                  ))}
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              style={{
                background: "white",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                marginBottom: 32,
              }}
            >
              <div style={{
                height: 280,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.3,
                }} />
                <div style={{
                  position: "relative",
                  textAlign: "center",
                  color: "white",
                  zIndex: 1,
                }}>
                  <FaMapMarkerAlt size={48} style={{ marginBottom: 12, opacity: 0.9 }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Dokki, Giza, Egypt</p>
                  <p style={{ fontSize: 12, opacity: 0.8 }}>View on Google Maps →</p>
                </div>
              </div>
              <div style={{ padding: "20px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#6f86a3" }}>
                  Located in the heart of Dokki, easily accessible by public transportation
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                background: "white",
                borderRadius: 20,
                padding: "24px",
                textAlign: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#0b1a34",
                marginBottom: 20,
              }}>
                Connect With Us
              </h3>
              <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: `${social.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: social.color,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <div style={{
              background: "white",
              borderRadius: 24,
              padding: "40px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            }}>
              <h2 style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0b1a34",
                marginBottom: 8,
                fontFamily: "'Outfit', sans-serif",
              }}>
                Send Us a Message
              </h2>
              <p style={{
                fontSize: 14,
                color: "#6f86a3",
                marginBottom: 32,
              }}>
                Our team will get back to you within 2 hours
              </p>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "#d4edda",
                    color: "#28a745",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 24,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Message sent successfully! We'll contact you soon.
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 20,
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0b1a34",
                      marginBottom: 8,
                    }}>
                      Full Name *
                    </label>
                    <div style={{ position: "relative" }}>
                      <FaUser size={16} style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#adb5bd",
                      }} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 16px 12px 42px",
                          border: "1px solid #e0e0e0",
                          borderRadius: 12,
                          fontSize: 14,
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                        placeholder="John Doe"
                        onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0b1a34",
                      marginBottom: 8,
                    }}>
                      Phone Number *
                    </label>
                    <div style={{ position: "relative" }}>
                      <FaMobileAlt size={16} style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#adb5bd",
                      }} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 16px 12px 42px",
                          border: "1px solid #e0e0e0",
                          borderRadius: 12,
                          fontSize: 14,
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                        placeholder="+20 123 456 7890"
                        onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0b1a34",
                    marginBottom: 8,
                  }}>
                    Email Address *
                  </label>
                  <div style={{ position: "relative" }}>
                    <FaEnvelope size={16} style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#adb5bd",
                    }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 42px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 12,
                        fontSize: 14,
                        outline: "none",
                        transition: "all 0.2s ease",
                      }}
                      placeholder="john@example.com"
                      onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                      onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0b1a34",
                    marginBottom: 8,
                  }}>
                    Subject *
                  </label>
                  <div style={{ position: "relative" }}>
                    <FaComment size={16} style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#adb5bd",
                    }} />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 42px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 12,
                        fontSize: 14,
                        outline: "none",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                      onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                    >
                      <option value="">Select a subject</option>
                      <option>General Inquiry</option>
                      <option>Result Question</option>
                      <option>Appointment Reschedule</option>
                      <option>Complaint</option>
                      <option>Suggestion</option>
                      <option>Technical Support</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0b1a34",
                    marginBottom: 8,
                  }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 12,
                      fontSize: 14,
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      transition: "all 0.2s ease",
                    }}
                    placeholder="Please describe your inquiry in detail..."
                    onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "all 0.3s ease",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <FaPaperPlane size={16} />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}