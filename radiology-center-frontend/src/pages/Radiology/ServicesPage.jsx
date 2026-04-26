import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// Import local images
import mriImage from "../../assets/MRI-1-768x576.jpg";
import ctImage from "../../assets/ct scan.webp";
import ultrasoundImage from "../../assets/Ultrasound.jpg";
import contrastImage from "../../assets/Contrast Studies.webp";
import cardiacImage from "../../assets/Cardiac Imaging.jpg";
import brainImage from "../../assets/Brain & Nerve Imaging.jpg";

const SERVICES_DATA = {
  en: [
    {
      id: 1,
      name: "MRI Scan",
      specialty: "Magnetic Resonance Imaging",
      desc: "3 Tesla high-resolution MRI for brain, spine, joints, and soft tissue imaging with exceptional detail. Non-invasive and radiation-free.",
      range: "$150 – $350",
      image: mriImage,
      icon: "🧲",
      color: "#1f6bff",
      features: ["No radiation exposure", "High soft tissue contrast", "Brain & spine imaging", "Joint & ligament assessment"]
    },
    {
      id: 2,
      name: "CT Scan",
      specialty: "Computed Tomography",
      desc: "128-slice CT scanner for chest, abdomen, head, and neck imaging with 3D reconstruction capabilities. Fast and precise.",
      range: "$100 – $250",
      image: ctImage,
      icon: "🔬",
      color: "#00b8a8",
      features: ["3D image reconstruction", "Fast scanning time", "Detailed bone imaging", "Contrast-enhanced options"]
    },
    {
      id: 3,
      name: "X-Ray",
      specialty: "Digital Radiography",
      desc: "Digital X-ray for bones, chest, and joints with instant results. Low radiation dose with high image quality.",
      range: "$25 – $70",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
      icon: "🦴",
      color: "#28a745",
      features: ["Instant digital results", "Low radiation dose", "Bone & chest imaging", "Portable options available"]
    },
    {
      id: 4,
      name: "Ultrasound",
      specialty: "Sonography",
      desc: "Advanced 4D ultrasound for abdomen, pelvis, heart, blood vessels, and pregnancy monitoring. Safe for all ages.",
      range: "$50 – $120",
      image: ultrasoundImage,
      icon: "❤️",
      color: "#fd7e14",
      features: ["No radiation", "Real-time imaging", "Pregnancy monitoring", "Doppler vascular studies"]
    },
    {
      id: 5,
      name: "Brain & Nerve Imaging",
      specialty: "Neuroradiology",
      desc: "Specialized MRI and CT for detecting brain tumors, strokes, and neurological disorders with advanced protocols.",
      range: "$200 – $450",
      image: brainImage,
      icon: "🧠",
      color: "#6f42c1",
      features: ["Stroke detection", "Tumor mapping", "Neurological assessment", "Functional MRI options"]
    },
    {
      id: 6,
      name: "Cardiac Imaging",
      specialty: "Cardiovascular Radiology",
      desc: "Contrast-enhanced cardiac CT and MRI for early detection of coronary artery disease and vascular blockages.",
      range: "$150 – $380",
      image: cardiacImage,
      icon: "🫀",
      color: "#dc3545",
      features: ["Coronary assessment", "Vascular mapping", "Heart function analysis", "Non-invasive screening"]
    },
    {
      id: 7,
      name: "Contrast Studies",
      specialty: "Contrast-Enhanced Imaging",
      desc: "Specialized imaging of kidneys, urinary tract, and digestive system using contrast agents for functional assessment.",
      range: "$85 – $200",
      image: contrastImage,
      icon: "💉",
      color: "#1f6bff",
      features: ["Functional assessment", "Detailed anatomy", "Kidney function study", "GI tract evaluation"]
    },
    {
      id: 8,
      name: "PET Scan",
      specialty: "Nuclear Medicine",
      desc: "Advanced PET/CT for cancer staging, treatment response monitoring, and metabolic activity assessment.",
      range: "$650 – $1,200",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      icon: "🔴",
      color: "#e83e8c",
      features: ["Cancer staging", "Metabolic imaging", "Treatment monitoring", "Whole-body assessment"]
    },
    {
      id: 9,
      name: "Dental CBCT",
      specialty: "Dental Imaging",
      desc: "Cone Beam CT for 3D imaging of jaws, teeth, and facial structures for surgical planning and implant placement.",
      range: "$85 – $150",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b1a?w=800&q=80",
      icon: "🦷",
      color: "#20c997",
      features: ["3D dental imaging", "Implant planning", "Surgical guidance", "Low radiation dose"]
    },
  ],
  ar: [
    {
      id: 1,
      name: "رنين مغناطيسي MRI",
      specialty: "التصوير بالرنين المغناطيسي",
      desc: "جهاز 3 تسلا عالي الدقة لتصوير المخ والعمود الفقري والمفاصل والأنسجة الرخوة بتفاصيل فائقة.",
      range: "800 – 2000 جنيه",
      image: mriImage,
      icon: "🧲",
      color: "#1f6bff",
      features: ["بدون إشعاع", "تصوير دقيق للأنسجة", "فحص المخ والعمود الفقري", "تقييم المفاصل والأربطة"]
    },
    {
      id: 2,
      name: "أشعة مقطعية CT",
      specialty: "التصوير المقطعي المحوسب",
      desc: "جهاز 128 شريحة لتصوير الصدر والبطن والرأس والعنق بصور ثلاثية الأبعاد.",
      range: "600 – 1500 جنيه",
      image: ctImage,
      icon: "🔬",
      color: "#00b8a8",
      features: ["صور ثلاثية الأبعاد", "سرعة فائقة", "تفاصيل دقيقة للعظام", "خيارات صبغة متقدمة"]
    },
    {
      id: 3,
      name: "أشعة سينية X-Ray",
      specialty: "التصوير الرقمي بالأشعة السينية",
      desc: "أشعة رقمية فورية لفحص العظام والكسور والصدر والمفاصل مع تقرير فوري من الطبيب.",
      range: "150 – 400 جنيه",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
      icon: "🦴",
      color: "#28a745",
      features: ["نتائج فورية", "جرعة إشعاع منخفضة", "تصوير العظام والصدر", "أجهزة محمولة متاحة"]
    },
    {
      id: 4,
      name: "سونار / موجات صوتية",
      specialty: "التصوير بالموجات فوق الصوتية",
      desc: "فحص بطن - حوض - قلب - أوعية دموية - متابعة حمل بأجهزة 4D حديثة.",
      range: "300 – 700 جنيه",
      image: ultrasoundImage,
      icon: "❤️",
      color: "#fd7e14",
      features: ["بدون إشعاع", "تصوير فوري", "متابعة الحمل", "دراسات الأوعية الدموية"]
    },
    {
      id: 5,
      name: "تصوير المخ والأعصاب",
      specialty: "أشعة المخ والأعصاب",
      desc: "MRI وCT متخصص لكشف الأورام والجلطات الدماغية والضغط على الأعصاب.",
      range: "1200 – 2500 جنيه",
      image: brainImage,
      icon: "🧠",
      color: "#6f42c1",
      features: ["كشف الجلطات", "تحديد الأورام", "تقييم الأعصاب", "رنين وظيفي متقدم"]
    },
    {
      id: 6,
      name: "تصوير قلب وأوعية دموية",
      specialty: "أشعة القلب والأوعية الدموية",
      desc: "فحص شرايين القلب والأوعية الدموية بالصبغة للكشف المبكر عن الانسدادات.",
      range: "900 – 2200 جنيه",
      image: cardiacImage,
      icon: "🫀",
      color: "#dc3545",
      features: ["تقييم الشرايين", "تصوير الأوعية", "تحليل وظائف القلب", "فحص غير جراحي"]
    },
    {
      id: 7,
      name: "أشعة بالصبغة",
      specialty: "التصوير بالصبغة",
      desc: "تصوير الكلى والمسالك البولية والجهاز الهضمي بالصبغة لدراسة الوظيفة والتشريح.",
      range: "500 – 1200 جنيه",
      image: contrastImage,
      icon: "💉",
      color: "#1f6bff",
      features: ["تقييم وظيفي", "تشريح دقيق", "دراسة الكلى", "تقييم الجهاز الهضمي"]
    },
    {
      id: 8,
      name: "طب نووي PET",
      specialty: "الطب النووي",
      desc: "تحديد مرحلة السرطان وتقييم الاستجابة للعلاج باستخدام إشعاع نووي آمن.",
      range: "4000 – 8000 جنيه",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      icon: "🔴",
      color: "#e83e8c",
      features: ["تحديد مراحل السرطان", "تصوير استقلابي", "متابعة العلاج", "تقييم كامل للجسم"]
    },
    {
      id: 9,
      name: "أشعة الأسنان CBCT",
      specialty: "تصوير الأسنان ثلاثي الأبعاد",
      desc: "أشعة مقطعية مخروطية لتصوير الفكين والأسنان ثلاثي الأبعاد للتخطيط الجراحي.",
      range: "500 – 900 جنيه",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b1a?w=800&q=80",
      icon: "🦷",
      color: "#20c997",
      features: ["تصوير ثلاثي الأبعاد", "تخطيط الزراعات", "توجيه جراحي", "جرعة إشعاع منخفضة"]
    },
  ],
};

export default function ServicesPage({ setPage }) {
  const [lang, setLang] = useState(() => {
    return document.documentElement.lang === "en" ? "en" : "ar";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang === "en" ? "en" : "ar");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const services = SERVICES_DATA[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const content = {
    en: {
      title: "Our Medical Services",
      subtitle: "All Imaging Types Under One Roof",
      description: "Using the latest imported medical equipment with a highly specialized medical team",
      bookNow: "Book Appointment",
      features: "Key Features",
    },
    ar: {
      title: "خدماتنا الطبية",
      subtitle: "كل أنواع التصوير تحت سقف واحد",
      description: "نستخدم أحدث الأجهزة الطبية المستوردة مع طاقم طبي متخصص على أعلى مستوى",
      bookNow: "احجز الآن",
      features: "المميزات",
    },
  };

  const t = content[lang];

  return (
    <div dir={dir} style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{
        background: "linear-gradient(135deg, #0b1a34 0%, #1a3a5c 100%)",
        padding: "60px 0 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00b8a8", marginBottom: 16, display: "block" }}>
              ✦ {lang === "ar" ? "خدماتنا الطبية" : "Our Medical Services"}
            </span>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "white", marginBottom: 16, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
              {t.subtitle}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 600, lineHeight: 1.6 }}>
              {t.description}
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 40px" }}>
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              display: "flex",
              flexDirection: index % 2 === 0 ? "row" : "row-reverse",
              alignItems: "center",
              gap: 48,
              marginBottom: index === services.length - 1 ? 0 : 80,
              paddingBottom: index === services.length - 1 ? 0 : 80,
              borderBottom: index === services.length - 1 ? "none" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                flex: 1,
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute",
                top: 20,
                left: 20,
                width: 60,
                height: 60,
                background: service.color,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                zIndex: 2,
              }}>
                {service.icon}
              </div>
              <img
                src={service.image}
                alt={service.name}
                style={{
                  width: "100%",
                  height: 400,
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                }}
              />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "30px 20px 20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              }}>
                <span style={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  background: "rgba(255,255,255,0.95)",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: service.color,
                }}>
                  {service.range}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                flex: 1,
                padding: dir === "rtl" ? "0 0 0 20px" : "0 20px 0 0",
              }}
            >
              <div style={{
                display: "inline-block",
                background: `${service.color}15`,
                color: service.color,
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 16,
              }}>
                {service.specialty}
              </div>
              
              <h2 style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#0b1a34",
                marginBottom: 16,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.02em",
              }}>
                {service.name}
              </h2>
              
              <p style={{
                fontSize: 16,
                color: "#30445f",
                lineHeight: 1.7,
                marginBottom: 24,
              }}>
                {service.desc}
              </p>

              <div style={{ marginBottom: 28 }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0b1a34",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{
                    width: 4,
                    height: 20,
                    background: service.color,
                    borderRadius: 2,
                  }} />
                  {t.features}
                </h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 12,
                }}>
                  {service.features.map((feature, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        background: service.color,
                        borderRadius: "50%",
                      }} />
                      <span style={{ fontSize: 14, color: "#6f86a3" }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage("booking")}
                style={{
                  background: `linear-gradient(135deg, ${service.color}, ${service.color}cc)`,
                  color: "white",
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: 40,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.3s ease",
                  boxShadow: `0 4px 15px ${service.color}40`,
                }}
              >
                {t.bookNow}
                <span style={{ fontSize: 18 }}>{dir === "rtl" ? "←" : "→"}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
          margin: "40px 40px 80px",
          borderRadius: 32,
          padding: "60px 48px",
          textAlign: "center",
        }}
      >
        <h2 style={{
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: 800,
          color: "white",
          marginBottom: 16,
          fontFamily: "'Outfit', sans-serif",
        }}>
          {lang === "ar" ? "جاهز لبدء رحلتك التشخيصية؟" : "Ready to Start Your Diagnostic Journey?"}
        </h2>
        <p style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.9)",
          marginBottom: 32,
          maxWidth: 500,
          margin: "0 auto 32px",
        }}>
          {lang === "ar" 
            ? "احجز موعدك اليوم واستمتع بأفضل خدمة تصوير طبي" 
            : "Book your appointment today and experience the best medical imaging service"}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPage("booking")}
          style={{
            background: "white",
            color: "#1f6bff",
            border: "none",
            padding: "14px 36px",
            borderRadius: 40,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "احجز موعدك الآن" : "Book Your Appointment Now"}
        </motion.button>
      </motion.div>
    </div>
  );
}