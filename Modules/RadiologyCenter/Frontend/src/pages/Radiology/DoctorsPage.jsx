import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FaStar, FaCalendarCheck, FaUserMd, FaMicroscope, FaHeartbeat, FaAward, FaQuoteRight } from "react-icons/fa";

const DOCTORS_DATA = {
  en: [
    {
      id: 1,
      name: "Dr. Sarah Mahmoud",
      specialty: "Diagnostic Radiology",
      subspecialty: "MRI & CT Imaging",
      experience: "15 Years Experience",
      education: "PhD in Diagnostic Radiology - Cairo University",
      achievements: ["Best Radiologist 2023", "Medical Excellence Award", "International Publications"],
      rating: 4.9,
      patients: 12500,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
      languages: ["Arabic", "English", "French"],
      availability: "Sat - Wed 10AM - 6PM",
    },
    {
      id: 2,
      name: "Dr. Ahmed Jundi",
      specialty: "Interventional Radiology",
      subspecialty: "Vascular Interventions",
      experience: "12 Years Experience",
      education: "Interventional Radiology Fellowship - London University",
      achievements: ["Pioneer in Interventional Radiology", "Innovative Techniques", "International Lecturer"],
      rating: 4.8,
      patients: 8900,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80",
      languages: ["Arabic", "English"],
      availability: "Sun - Thu 9AM - 5PM",
    },
    {
      id: 3,
      name: "Dr. Ali Khaled",
      specialty: "Breast Imaging",
      subspecialty: "Early Cancer Detection",
      experience: "18 Years Experience",
      education: "Radiology PhD - Ain Shams University",
      achievements: ["Breast Imaging Center of Excellence", "Research Awards", "ESR Member"],
      rating: 5.0,
      patients: 15600,
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
      languages: ["Arabic", "English", "German"],
      availability: "Sat - Tue 8AM - 4PM",
    },
    {
      id: 4,
      name: "Dr. Nadia Roshdy",
      specialty: "Pediatric Radiology",
      subspecialty: "Children & Neonatal Imaging",
      experience: "10 Years Experience",
      education: "MSc Pediatric Radiology - Harvard University",
      achievements: ["Board Certified", "Distinguished Service Award", "Research Publications"],
      rating: 4.7,
      patients: 6700,
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
      languages: ["Arabic", "English"],
      availability: "Sun - Wed 10AM - 7PM",
    },
    {
      id: 5,
      name: "Dr. Mohamed Ibrahim",
      specialty: "Cardiac Radiology",
      subspecialty: "Cardiovascular Imaging",
      experience: "20 Years Experience",
      education: "Cardiac Imaging Consultant - Cleveland Clinic",
      achievements: ["Cardiac Imaging Excellence Award", "Certified Expert", "International Trainer"],
      rating: 4.9,
      patients: 19800,
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80",
      languages: ["Arabic", "English", "Spanish"],
      availability: "Sat - Thu 9AM - 8PM",
    },
    {
      id: 6,
      name: "Dr. Fatima Al-Zahra",
      specialty: "Neuroradiology",
      subspecialty: "Advanced Neuro Imaging",
      experience: "14 Years Experience",
      education: "PhD in Neuroradiology - Munich University",
      achievements: ["Neuroimaging Expert", "Global Research Awards", "ASNR Member"],
      rating: 4.8,
      patients: 10400,
      image: "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
      languages: ["Arabic", "English", "French"],
      availability: "Sun - Thu 10AM - 6PM",
    },
  ],
  ar: [
    {
      id: 1,
      name: "د. سارة محمود",
      specialty: "أشعة تشخيصية",
      subspecialty: "الرنين المغناطيسي والأشعة المقطعية",
      experience: "15 سنة خبرة",
      education: "دكتوراه الأشعة التشخيصية - جامعة القاهرة",
      achievements: ["أفضل طبيب أشعة 2023", "جائزة التميز الطبي", "منشورات علمية دولية"],
      rating: 4.9,
      patients: 12500,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
      languages: ["العربية", "الإنجليزية", "الفرنسية"],
      availability: "السبت - الأربعاء 10ص - 6م",
    },
    {
      id: 2,
      name: "د. أحمد الجندي",
      specialty: "أشعة تداخلية",
      subspecialty: "قسطرة وتدخلات الأوعية الدموية",
      experience: "12 سنة خبرة",
      education: "زمالة الأشعة التداخلية - جامعة لندن",
      achievements: ["رائد في الأشعة التداخلية", "ابتكار تقنيات جديدة", "محاضر دولي"],
      rating: 4.8,
      patients: 8900,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80",
      languages: ["العربية", "الإنجليزية"],
      availability: "الأحد - الخميس 9ص - 5م",
    },
    {
      id: 3,
      name: "د. علي خالد",
      specialty: "أشعة الثدي",
      subspecialty: "تشخيص مبكر لأورام الثدي",
      experience: "18 سنة خبرة",
      education: "دكتوراه الأشعة - جامعة عين شمس",
      achievements: ["مركز تميز في أشعة الثدي", "جوائز بحثية", "عضوية الجمعية الأوروبية"],
      rating: 5.0,
      patients: 15600,
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
      languages: ["العربية", "الإنجليزية", "الألمانية"],
      availability: "السبت - الثلاثاء 8ص - 4م",
    },
    {
      id: 4,
      name: "د. نادية رشدي",
      specialty: "أشعة الأطفال",
      subspecialty: "تصوير الأطفال والمواليد",
      experience: "10 سنوات خبرة",
      education: "ماجستير أشعة الأطفال - جامعة هارفارد",
      achievements: ["أخصائي معتمد", "جائزة الخدمة المتميزة", "نشر أبحاث في تصوير الأطفال"],
      rating: 4.7,
      patients: 6700,
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
      languages: ["العربية", "الإنجليزية"],
      availability: "الأحد - الأربعاء 10ص - 7م",
    },
    {
      id: 5,
      name: "د. محمد إبراهيم",
      specialty: "أشعة القلب والأوعية",
      subspecialty: "تصوير القلب والأوعية الدموية",
      experience: "20 سنة خبرة",
      education: "استشاري أشعة القلب - كليفلاند كلينك",
      achievements: ["جائزة التميز في تصوير القلب", "خبير معتمد", "مدرب دولي"],
      rating: 4.9,
      patients: 19800,
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80",
      languages: ["العربية", "الإنجليزية", "الإسبانية"],
      availability: "السبت - الخميس 9ص - 8م",
    },
    {
      id: 6,
      name: "د. فاطمة الزهراء",
      specialty: "أشعة المخ والأعصاب",
      subspecialty: "تصوير الأعصاب المتقدم",
      experience: "14 سنة خبرة",
      education: "دكتوراه أمراض المخ والأعصاب - جامعة ميونخ",
      achievements: ["خبيرة في تصوير الأعصاب", "جوائز بحثية عالمية", "عضوية الجمعية الأمريكية"],
      rating: 4.8,
      patients: 10400,
      image: "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=800&q=80",
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
      languages: ["العربية", "الإنجليزية", "الفرنسية"],
      availability: "الأحد - الخميس 10ص - 6م",
    },
  ],
};

export default function DoctorsPage({ setPage }) {
  const [lang, setLang] = useState(() => {
    return document.documentElement.lang === "en" ? "en" : "ar";
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang === "en" ? "en" : "ar");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const doctors = DOCTORS_DATA[lang];
  const t = {
    ar: {
      title: "نخبة من أفضل الأطباء",
      subtitle: "استشاريون وأساتذة بخبرات واسعة في جميع تخصصات الأشعة التشخيصية",
      experience: "الخبرة",
      education: "المؤهل العلمي",
      achievements: "الإنجازات",
      rating: "تقييم المرضى",
      patients: "مريض",
      book: "احجز موعد",
      languages: "اللغات",
      availability: "مواعيد العمل",
    },
    en: {
      title: "Our Elite Medical Team",
      subtitle: "Consultants and professors with extensive experience in all diagnostic radiology specialties",
      experience: "Experience",
      education: "Education",
      achievements: "Achievements",
      rating: "Patient Rating",
      patients: "Patients",
      book: "Book Appointment",
      languages: "Languages",
      availability: "Availability",
    },
  };

  const currentT = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{
        background: "linear-gradient(135deg, #0b1a34 0%, #1a3a5c 100%)",
        padding: "60px 0 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00b8a8", marginBottom: 16, display: "block" }}>
              ✦ {lang === "ar" ? "فريقنا الطبي" : "Our Medical Team"}
            </span>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "white", marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
              {currentT.title}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 600, lineHeight: 1.6 }}>
              {currentT.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 32,
        }}>
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              style={{
                background: "white",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                <img
                  src={doctor.coverImage}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
                <div style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 12px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <FaStar style={{ color: "#ffc107", fontSize: 12 }} />
                  <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{doctor.rating}</span>
                </div>
              </div>

              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    flexShrink: 0,
                  }}>
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0b1a34", marginBottom: 4, lineHeight: 1.2 }}>
                      {doctor.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "#1f6bff", fontWeight: 600, marginBottom: 4 }}>
                      {doctor.specialty}
                    </p>
                    <p style={{ fontSize: 12, color: "#6f86a3" }}>
                      {doctor.subspecialty}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  gap: 12,
                  padding: "16px 0",
                  borderTop: "1px solid #e0e0e0",
                  borderBottom: "1px solid #e0e0e0",
                  marginBottom: 16,
                }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <FaUserMd style={{ color: "#1f6bff", fontSize: 16, marginBottom: 4 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0b1a34" }}>{doctor.experience.split(" ")[0]}+</div>
                    <div style={{ fontSize: 10, color: "#6f86a3" }}>{currentT.experience}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <FaHeartbeat style={{ color: "#00b8a8", fontSize: 16, marginBottom: 4 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0b1a34" }}>{(doctor.patients / 1000).toFixed(1)}k+</div>
                    <div style={{ fontSize: 10, color: "#6f86a3" }}>{currentT.patients}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <FaMicroscope style={{ color: "#7c3aed", fontSize: 16, marginBottom: 4 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0b1a34" }}>{doctor.rating}</div>
                    <div style={{ fontSize: 10, color: "#6f86a3" }}>{currentT.rating}</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {doctor.achievements.slice(0, 2).map((achievement, i) => (
                    <span key={i} style={{
                      fontSize: 10,
                      background: "rgba(31,107,255,0.08)",
                      color: "#1f6bff",
                      padding: "4px 10px",
                      borderRadius: 20,
                    }}>
                      {achievement.length > 25 ? achievement.substring(0, 22) + "..." : achievement}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage("booking");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.3s ease",
                  }}
                >
                  <FaCalendarCheck />
                  {currentT.book}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              overflow: "auto",
            }}
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                maxWidth: 1000,
                width: "100%",
                background: "white",
                borderRadius: 32,
                overflow: "hidden",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: "relative", height: 250 }}>
                <img
                  src={selectedDoctor.coverImage}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "40px 40px 20px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "4px solid white",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                    }}>
                      <img
                        src={selectedDoctor.image}
                        alt={selectedDoctor.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ color: "white" }}>
                      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{selectedDoctor.name}</h2>
                      <p style={{ fontSize: 16, opacity: 0.9 }}>{selectedDoctor.specialty}</p>
                      <p style={{ fontSize: 14, opacity: 0.7 }}>{selectedDoctor.subspecialty}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "40px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaUserMd style={{ color: "#1f6bff" }} /> {currentT.experience}
                    </h3>
                    <p style={{ color: "#30445f", marginBottom: 24 }}>{selectedDoctor.experience}</p>

                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaAward style={{ color: "#00b8a8" }} /> {currentT.education}
                    </h3>
                    <p style={{ color: "#30445f", marginBottom: 24 }}>{selectedDoctor.education}</p>

                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaQuoteRight style={{ color: "#7c3aed" }} /> {currentT.achievements}
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {selectedDoctor.achievements.map((achievement, i) => (
                        <li key={i} style={{ color: "#30445f", marginBottom: 8, paddingLeft: 20, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: "#1f6bff" }}>•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaHeartbeat style={{ color: "#1f6bff" }} /> {currentT.languages}
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                      {selectedDoctor.languages.map((lang, i) => (
                        <span key={i} style={{
                          background: "rgba(31,107,255,0.1)",
                          color: "#1f6bff",
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 600,
                        }}>
                          {lang}
                        </span>
                      ))}
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b1a34", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaCalendarCheck style={{ color: "#00b8a8" }} /> {currentT.availability}
                    </h3>
                    <p style={{ color: "#30445f", marginBottom: 24 }}>{selectedDoctor.availability}</p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDoctor(null);
                        setPage("booking");
                      }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginTop: 20,
                      }}
                    >
                      {currentT.book}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}