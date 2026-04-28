import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  FaCalendarAlt, FaClock, FaUserMd, FaArrowRight, FaCheckCircle,
  FaHospitalUser, FaChevronRight, FaChevronLeft
} from "react-icons/fa";

// Import local images
import mriImage from "../../assets/MRI-1-768x576.jpg";
import ctImage from "../../assets/ct scan.webp";
import ultrasoundImage from "../../assets/Ultrasound.jpg";
import contrastImage from "../../assets/Contrast Studies.webp";
import cardiacImage from "../../assets/Cardiac Imaging.jpg";
import brainImage from "../../assets/Brain & Nerve Imaging.jpg";

const SCAN_TYPES = {
  en: [
    {
      id: 1,
      name: "MRI Scan",
      type: "Magnetic Resonance Imaging",
      price: "$150 - $350",
      duration: "30-45 min",
      image: mriImage,
      description: "High-resolution imaging of soft tissues, brain, spine, and joints",
      prep: "No food 6 hours before scan. Remove metal objects.",
      color: "#1f6bff"
    },
    {
      id: 2,
      name: "CT Scan",
      type: "Computed Tomography",
      price: "$100 - $250",
      duration: "15-20 min",
      image: ctImage,
      description: "Detailed cross-sectional imaging of bones, chest, abdomen",
      prep: "May require contrast injection. Fast for 4 hours.",
      color: "#00b8a8"
    },
    {
      id: 3,
      name: "X-Ray",
      type: "Digital Radiography",
      price: "$25 - $70",
      duration: "5-10 min",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80",
      description: "Quick imaging for bones, chest, and joints",
      prep: "No special preparation needed.",
      color: "#28a745"
    },
    {
      id: 4,
      name: "Ultrasound",
      type: "Sonography",
      price: "$50 - $120",
      duration: "20-30 min",
      image: ultrasoundImage,
      description: "Real-time imaging of organs, blood flow, pregnancy",
      prep: "Drink water 1 hour before for pelvic scans.",
      color: "#fd7e14"
    },
    {
      id: 5,
      name: "Brain & Nerve Imaging",
      type: "Neuroradiology",
      price: "$200 - $450",
      duration: "30-45 min",
      image: brainImage,
      description: "Specialized imaging for brain tumors, strokes, and neurological disorders",
      prep: "No food 6 hours before. Remove metal objects.",
      color: "#6f42c1"
    },
    {
      id: 6,
      name: "Cardiac Imaging",
      type: "Cardiovascular Radiology",
      price: "$150 - $380",
      duration: "20-30 min",
      image: cardiacImage,
      description: "Contrast-enhanced cardiac CT for coronary artery disease detection",
      prep: "Fast for 4 hours. Avoid caffeine.",
      color: "#dc3545"
    },
    {
      id: 7,
      name: "Contrast Studies",
      type: "Contrast-Enhanced Imaging",
      price: "$85 - $200",
      duration: "15-20 min",
      image: contrastImage,
      description: "Specialized imaging of kidneys, urinary tract, and digestive system",
      prep: "May require contrast injection. Fast for 4 hours.",
      color: "#1f6bff"
    },
    {
      id: 8,
      name: "PET Scan",
      type: "Nuclear Medicine",
      price: "$650 - $1,200",
      duration: "60-90 min",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
      description: "Metabolic imaging for cancer detection and staging",
      prep: "Fast for 6 hours. Low sugar diet day before.",
      color: "#e83e8c"
    },
    {
      id: 9,
      name: "Dental CBCT",
      type: "Dental Imaging",
      price: "$85 - $150",
      duration: "10-15 min",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b1a?w=600&q=80",
      description: "3D imaging of teeth, jaws for implant planning",
      prep: "Remove dental appliances if possible.",
      color: "#20c997"
    }
  ],
  ar: [
    {
      id: 1,
      name: "رنين مغناطيسي",
      type: "التصوير بالرنين المغناطيسي",
      price: "800 - 2000 جنيه",
      duration: "30-45 دقيقة",
      image: mriImage,
      description: "تصوير عالي الدقة للأنسجة الرخوة والمخ والعمود الفقري والمفاصل",
      prep: "يمنع الطعام 6 ساعات قبل الفحص. إزالة المعادن.",
      color: "#1f6bff"
    },
    {
      id: 2,
      name: "أشعة مقطعية",
      type: "التصوير المقطعي المحوسب",
      price: "600 - 1500 جنيه",
      duration: "15-20 دقيقة",
      image: ctImage,
      description: "تصوير مقطعي مفصل للعظام والصدر والبطن",
      prep: "قد يتطلب صبغة. صيام 4 ساعات.",
      color: "#00b8a8"
    },
    {
      id: 3,
      name: "أشعة سينية",
      type: "التصوير الرقمي",
      price: "150 - 400 جنيه",
      duration: "5-10 دقائق",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80",
      description: "تصوير سريع للعظام والصدر والمفاصل",
      prep: "لا يحتاج تحضيرات خاصة.",
      color: "#28a745"
    },
    {
      id: 4,
      name: "سونار",
      type: "الموجات فوق الصوتية",
      price: "300 - 700 جنيه",
      duration: "20-30 دقيقة",
      image: ultrasoundImage,
      description: "تصوير فوري للأعضاء وتدفق الدم ومتابعة الحمل",
      prep: "شرب الماء قبل الفحص بساعة لفحص الحوض.",
      color: "#fd7e14"
    },
    {
      id: 5,
      name: "تصوير المخ والأعصاب",
      type: "أشعة المخ والأعصاب",
      price: "1200 - 2500 جنيه",
      duration: "30-45 دقيقة",
      image: brainImage,
      description: "تصوير متخصص لأورام المخ والجلطات والاضطرابات العصبية",
      prep: "يمنع الطعام 6 ساعات قبل الفحص.",
      color: "#6f42c1"
    },
    {
      id: 6,
      name: "تصوير القلب",
      type: "أشعة القلب والأوعية الدموية",
      price: "900 - 2200 جنيه",
      duration: "20-30 دقيقة",
      image: cardiacImage,
      description: "تصوير محسن بالصبغة لشرايين القلب",
      prep: "صيام 4 ساعات. تجنب الكافيين.",
      color: "#dc3545"
    },
    {
      id: 7,
      name: "أشعة بالصبغة",
      type: "التصوير بالصبغة",
      price: "500 - 1200 جنيه",
      duration: "15-20 دقيقة",
      image: contrastImage,
      description: "تصوير متخصص للكلى والمسالك البولية والجهاز الهضمي",
      prep: "قد يتطلب صبغة. صيام 4 ساعات.",
      color: "#1f6bff"
    },
    {
      id: 8,
      name: "طب نووي PET",
      type: "الطب النووي",
      price: "4000 - 8000 جنيه",
      duration: "60-90 دقيقة",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
      description: "تصوير استقلابي للكشف عن السرطان وتحديد المراحل",
      prep: "صيام 6 ساعات. نظام غذائي قليل السكر.",
      color: "#e83e8c"
    },
    {
      id: 9,
      name: "أشعة أسنان ثلاثية",
      type: "تصوير الأسنان",
      price: "500 - 900 جنيه",
      duration: "10-15 دقيقة",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b1a?w=600&q=80",
      description: "تصوير ثلاثي الأبعاد للأسنان والفكين لتخطيط الزراعات",
      prep: "إزالة أجهزة الأسنان إن أمكن.",
      color: "#20c997"
    }
  ]
};

const DOCTORS = {
  en: [
    { id: 1, name: "Dr. Sarah Mahmoud", specialty: "Diagnostic Radiology", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80", available: true },
    { id: 2, name: "Dr. Ahmed Jundi", specialty: "Interventional Radiology", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80", available: true },
    { id: 3, name: "Dr. Nadia Roshdy", specialty: "Pediatric Radiology", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80", available: false },
  ],
  ar: [
    { id: 1, name: "د. سارة محمود", specialty: "أشعة تشخيصية", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80", available: true },
    { id: 2, name: "د. أحمد الجندي", specialty: "أشعة تداخلية", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80", available: true },
    { id: 3, name: "د. نادية رشدي", specialty: "أشعة الأطفال", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80", available: false },
  ]
};

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

export default function BookingPage({ setPage }) {
  const [lang, setLang] = useState(() => {
    return document.documentElement.lang === "en" ? "en" : "ar";
  });
  const [step, setStep] = useState(1);
  const [selectedScan, setSelectedScan] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang === "en" ? "en" : "ar");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const scans = SCAN_TYPES[lang];
  const doctors = DOCTORS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const content = {
    en: {
      title: "Book Your Scan",
      subtitle: "Schedule your medical imaging appointment in minutes",
      step1: "Select Scan",
      step2: "Choose Doctor",
      step3: "Pick Date & Time",
      step4: "Confirm Details",
      next: "Next",
      back: "Back",
      confirm: "Confirm Booking",
      bookingSuccess: "Booking Confirmed!",
      bookingRef: "Booking Reference",
      patientName: "Patient Name",
      phone: "Phone Number",
      email: "Email Address",
      scanType: "Scan Type",
      doctor: "Radiologist",
      date: "Date",
      time: "Time",
      totalPrice: "Total Price",
      prepInstructions: "Preparation Instructions",
      viewMyBookings: "View My Bookings",
      home: "Back to Home"
    },
    ar: {
      title: "احجز فحصك",
      subtitle: "احجز موعد التصوير الطبي في دقائق",
      step1: "اختر الفحص",
      step2: "اختر الطبيب",
      step3: "اختر التاريخ والوقت",
      step4: "تأكيد التفاصيل",
      next: "التالي",
      back: "السابق",
      confirm: "تأكيد الحجز",
      bookingSuccess: "تم تأكيد الحجز!",
      bookingRef: "رقم الحجز",
      patientName: "اسم المريض",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      scanType: "نوع الفحص",
      doctor: "الطبيب",
      date: "التاريخ",
      time: "الوقت",
      totalPrice: "السعر الإجمالي",
      prepInstructions: "تعليمات التحضير",
      viewMyBookings: "عرض حجوزاتي",
      home: "العودة للرئيسية"
    }
  };

  const t = content[lang];

  const generateBookingRef = () => {
    return `RAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleBooking = () => {
    const bookingRef = generateBookingRef();
    localStorage.setItem("lastBooking", JSON.stringify({
      ref: bookingRef,
      scan: selectedScan,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      patient: patientInfo
    }));
    setBookingComplete(true);
  };

  const nextStep = () => {
    if (step === 1 && !selectedScan) return;
    if (step === 2 && !selectedDoctor) return;
    if (step === 3 && (!selectedDate || !selectedTime)) return;
    if (step === 4) {
      handleBooking();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (bookingComplete) {
    return (
      <div dir={dir} style={{ minHeight: "100vh", paddingTop: "100px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px" }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: "white",
              borderRadius: 32,
              padding: "48px",
              textAlign: "center"
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              style={{
                width: 80,
                height: 80,
                background: "#28a745",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px"
              }}
            >
              <FaCheckCircle size={48} color="white" />
            </motion.div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0b1a34", marginBottom: 8 }}>
              {t.bookingSuccess}
            </h2>
            <p style={{ color: "#6f86a3", marginBottom: 24 }}>
              {t.bookingRef}: <strong style={{ color: "#1f6bff" }}>{generateBookingRef()}</strong>
            </p>
            <div style={{
              background: "#f8fafc",
              borderRadius: 16,
              padding: "20px",
              textAlign: "left",
              marginBottom: 24
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#6f86a3" }}>{t.scanType}</span>
                <strong>{selectedScan?.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#6f86a3" }}>{t.doctor}</span>
                <strong>{selectedDoctor?.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#6f86a3" }}>{t.date}</span>
                <strong>{selectedDate}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6f86a3" }}>{t.time}</span>
                <strong>{selectedTime}</strong>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage("results")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#1f6bff",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {t.viewMyBookings}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage("home")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "white",
                  color: "#1f6bff",
                  border: "2px solid #1f6bff",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {t.home}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: "100px" }}>
      <div style={{
        background: "linear-gradient(135deg, #0b1a34 0%, #1a3a5c 100%)",
        padding: "60px 0",
        marginBottom: 40
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00b8a8" }}>
              BOOK APPOINTMENT
            </span>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, color: "white", marginTop: 16, fontFamily: "'Outfit', sans-serif" }}>
              {t.title}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 12 }}>
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 60px" }}>
        {/* Steps Progress */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48, gap: 8 }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ flex: 1, maxWidth: 200, textAlign: "center" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: step >= s ? "linear-gradient(135deg, #1f6bff, #00b8a8)" : "#e0e0e0",
                color: step >= s ? "white" : "#999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
                fontWeight: 700
              }}>
                {s}
              </div>
              <span style={{ fontSize: 12, color: step >= s ? "#1f6bff" : "#999" }}>
                {s === 1 ? t.step1 : s === 2 ? t.step2 : s === 3 ? t.step3 : t.step4}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir === "rtl" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === "rtl" ? -50 : 50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Select Scan */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.step1}</h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 24
                }}>
                  {scans.map((scan) => (
                    <motion.div
                      key={scan.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedScan(scan)}
                      style={{
                        background: "white",
                        borderRadius: 20,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: selectedScan?.id === scan.id ? `3px solid ${scan.color}` : "1px solid #e0e0e0",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                        <img src={scan.image} alt={scan.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: scan.color,
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {scan.price}
                        </div>
                      </div>
                      <div style={{ padding: "20px" }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{scan.name}</h3>
                        <p style={{ fontSize: 13, color: "#6f86a3", marginBottom: 8 }}>{scan.type}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <FaClock size={12} color="#6f86a3" />
                          <span style={{ fontSize: 12, color: "#6f86a3" }}>{scan.duration}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#30445f", lineHeight: 1.5 }}>{scan.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Doctor */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.step2}</h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 24
                }}>
                  {doctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      whileHover={{ y: -4 }}
                      onClick={() => doctor.available && setSelectedDoctor(doctor)}
                      style={{
                        background: "white",
                        borderRadius: 20,
                        padding: "20px",
                        cursor: doctor.available ? "pointer" : "not-allowed",
                        opacity: doctor.available ? 1 : 0.6,
                        border: selectedDoctor?.id === doctor.id ? "3px solid #1f6bff" : "1px solid #e0e0e0",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{
                          width: 70,
                          height: 70,
                          borderRadius: "50%",
                          overflow: "hidden"
                        }}>
                          <img src={doctor.image} alt={doctor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 800 }}>{doctor.name}</h3>
                          <p style={{ fontSize: 13, color: "#6f86a3" }}>{doctor.specialty}</p>
                          {!doctor.available && (
                            <span style={{ fontSize: 11, color: "#dc3545" }}>Not Available</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.step3}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  {/* Date Selection */}
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t.date}</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: "100%",
                        padding: "14px",
                        border: "2px solid #e0e0e0",
                        borderRadius: 12,
                        fontSize: 14,
                        outline: "none"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                      onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t.time}</label>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 10,
                      maxHeight: 200,
                      overflowY: "auto"
                    }}>
                      {TIME_SLOTS.map((slot) => (
                        <motion.button
                          key={slot}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTime(slot)}
                          style={{
                            padding: "10px",
                            background: selectedTime === slot ? "linear-gradient(135deg, #1f6bff, #00b8a8)" : "#f8fafc",
                            color: selectedTime === slot ? "white" : "#30445f",
                            border: selectedTime === slot ? "none" : "1px solid #e0e0e0",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {slot}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Patient Info & Confirmation */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.step4}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  {/* Patient Form */}
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.patientName} *</label>
                      <input
                        type="text"
                        value={patientInfo.name}
                        onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e0e0e0",
                          borderRadius: 10,
                          fontSize: 14,
                          outline: "none"
                        }}
                        placeholder="Enter your full name"
                        onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                      />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.phone} *</label>
                      <input
                        type="tel"
                        value={patientInfo.phone}
                        onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e0e0e0",
                          borderRadius: 10,
                          fontSize: 14,
                          outline: "none"
                        }}
                        placeholder="+20 123 456 7890"
                        onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                      />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.email} *</label>
                      <input
                        type="email"
                        value={patientInfo.email}
                        onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e0e0e0",
                          borderRadius: 10,
                          fontSize: 14,
                          outline: "none"
                        }}
                        placeholder="your@email.com"
                        onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                      />
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div style={{
                    background: "#f8fafc",
                    borderRadius: 20,
                    padding: "24px"
                  }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Booking Summary</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: "#6f86a3" }}>{t.scanType}</span>
                      <strong>{selectedScan?.name}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: "#6f86a3" }}>{t.doctor}</span>
                      <strong>{selectedDoctor?.name}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: "#6f86a3" }}>{t.date}</span>
                      <strong>{selectedDate}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ color: "#6f86a3" }}>{t.time}</span>
                      <strong>{selectedTime}</strong>
                    </div>
                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 12, marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600 }}>{t.totalPrice}</span>
                        <strong style={{ color: "#1f6bff", fontSize: 18 }}>{selectedScan?.price}</strong>
                      </div>
                    </div>
                    {selectedScan?.prep && (
                      <div style={{
                        background: "rgba(31,107,255,0.08)",
                        borderRadius: 12,
                        padding: "12px",
                        marginTop: 16
                      }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#1f6bff", marginBottom: 4 }}>{t.prepInstructions}</p>
                        <p style={{ fontSize: 12, color: "#6f86a3" }}>{selectedScan.prep}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48 }}>
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                background: "white",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {dir === "rtl" ? <FaChevronRight /> : <FaChevronLeft />}
              {t.back}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: step === 1 ? "auto" : 0
            }}
          >
            {step === 4 ? t.confirm : t.next}
            {dir === "rtl" ? <FaChevronLeft /> : <FaChevronRight />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}