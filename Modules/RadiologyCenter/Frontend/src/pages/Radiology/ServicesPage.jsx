// src/pages/Radiology/ServicesPage.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Import local images
import mriImage from "../../assets/MRI-1-768x576.jpg";
import ctImage from "../../assets/ct scan.webp";
import ultrasoundImage from "../../assets/Ultrasound.jpg";
import contrastImage from "../../assets/Contrast Studies.webp";
import cardiacImage from "../../assets/Cardiac Imaging.jpg";
import brainImage from "../../assets/Brain & Nerve Imaging.jpg";
import cbcImage from "../../assets/CBCtest.avif";
import bloodSugarImage from "../../assets/bloodSuger.jpg";
import xrayImage from "../../assets/X_Ray.jpg";
import octImage from "../../assets/OCTttest.webp";
import visualFieldImage from "../../assets/Visual-field-test.jpg";
import cornealTopographyImage from "../../assets/Corneal Topography.jpg";
import specularMicroscopyImage from "../../assets/Specular Microscopy.jpg";
import tearFilmImage from "../../assets/Tear Film Analysis.webp";
import ergImage from "../../assets/Electroretinography (ERG).webp";
import eogImage from "../../assets/Electrooculography (EOG).webp";
import geneticImage from "../../assets/Genetic Testing.png";

const SERVICES_DATA = {
  en: [
    // Prioritize MRI, X-Ray, Specular Microscopy at the top per request
    {
      id: 4,
      name: "MRI Scan",
      specialty: "Magnetic Resonance Imaging",
      desc: "3 Tesla high-resolution MRI for brain, spine, joints, and soft tissue imaging with exceptional detail. Non-invasive and radiation-free.",
      range: "3500 LE",
      image: mriImage,
      icon: "",
      color: "#1f6bff",
      features: ["No radiation exposure", "High soft tissue contrast", "Brain & spine imaging", "Joint & ligament assessment"],
    },
    {
      id: 5,
      name: "X-Ray",
      specialty: "Digital Radiography",
      desc: "Digital X-ray for bones, chest, and joints with instant results. Low radiation dose with high image quality for accurate diagnosis.",
      range: "350 LE",
      image: xrayImage,
      icon: "",
      color: "#28a745",
      features: ["Instant digital results", "Low radiation dose", "Bone & chest imaging", "Portable options available"],
    },
    {
      id: 10,
      name: "Specular Microscopy",
      specialty: "Endothelial Cell Count",
      desc: "Evaluate corneal endothelial cell health and density. Critical for cataract surgery planning and corneal health assessment.",
      range: "950 LE",
      image: specularMicroscopyImage,
      icon: "",
      color: "#06b6d4",
      features: ["Endothelial count", "Cell density", "Corneal health", "Pre-surgery assessment"],
    },

    // Blood tests
    {
      id: 1,
      name: "CBC",
      specialty: "Complete Blood Count",
      desc: "Full blood count for anemia, infection detection, and blood disorders. Provides comprehensive analysis of red blood cells, white blood cells, and platelets.",
      range: "250 LE",
      image: cbcImage,
      icon: "",
      color: "#ef4444",
      features: ["Anemia detection", "Infection markers", "Platelet count", "Blood cell analysis"],
    },
    {
      id: 2,
      name: "Blood Sugar",
      specialty: "Glucose Testing",
      desc: "Fasting and random blood sugar testing for diabetes screening and monitoring. Essential for diabetes management and diagnosis.",
      range: "120 LE",
      image: bloodSugarImage,
      icon: "",
      color: "#f59e0b",
      features: ["Fasting glucose", "Random glucose", "Diabetes screening", "HbA1c available"],
    },
    {
      id: 16,
      name: "HbA1c",
      specialty: "Glycated Hemoglobin",
      desc: "Average blood glucose over previous 2-3 months — useful for diabetes control and long-term monitoring.",
      range: "450 LE",
      image: bloodSugarImage,
      icon: "",
      color: "#f59e0b",
      features: ["Average glucose (3 months)", "Diabetes control", "Treatment monitoring"],
    },

    // Other imaging/tests
    {
      id: 3,
      name: "CT Scan",
      specialty: "Computed Tomography",
      desc: "128-slice CT scanner for chest, abdomen, head, and neck imaging with 3D reconstruction capabilities. Fast and precise diagnosis.",
      range: "1800 LE",
      image: ctImage,
      icon: "",
      color: "#00b8a8",
      features: ["3D image reconstruction", "Fast scanning time", "Detailed bone imaging", "Contrast-enhanced options"],
    },
    {
      id: 6,
      name: "OCT",
      specialty: "Optical Coherence Tomography",
      desc: "High-resolution cross-section imaging of retina and optic nerve. Essential for glaucoma, macular degeneration, and diabetic retinopathy diagnosis.",
      range: "900 LE",
      image: octImage,
      icon: "",
      color: "#8b5cf6",
      features: ["Retinal layers", "Optic nerve analysis", "Macular mapping", "Glaucoma detection"],
    },
    {
      id: 7,
      name: "Fluorescein Angiography",
      specialty: "Retinal Angiography",
      desc: "Evaluate retinal blood flow and macular conditions using fluorescent dye. Critical for detecting leaks, blockages, and abnormal blood vessels.",
      range: "2200 LE",
      image: contrastImage,
      icon: "",
      color: "#ec4899",
      features: ["Retinal circulation", "Leak detection", "Macular evaluation", "Diabetic retinopathy"],
    },
    {
      id: 8,
      name: "Visual Field Test",
      specialty: "Perimetry",
      desc: "Measure peripheral and central vision to detect blind spots (scotomas). Essential for glaucoma monitoring and neurological assessment.",
      range: "800 LE",
      image: visualFieldImage,
      icon: "",
      color: "#8b5cf6",
      features: ["Peripheral vision", "Central vision", "Glaucoma monitoring", "Neurological assessment"],
    },
    {
      id: 9,
      name: "Ultrasound B-Scan",
      specialty: "Ocular Ultrasound",
      desc: "Evaluate internal eye structures when view is blocked by cataracts or hemorrhage. Essential for retinal detachment and tumor assessment.",
      range: "600 LE",
      image: ultrasoundImage,
      icon: "",
      color: "#14b8a6",
      features: ["Posterior segment", "Retinal detachment", "Tumor assessment", "Foreign body detection"],
    },
    {
      id: 11,
      name: "Corneal Topography",
      specialty: "Corneal Mapping",
      desc: "3D map of corneal surface for diagnosing keratoconus, planning refractive surgery, and fitting contact lenses.",
      range: "1000 LE",
      image: cornealTopographyImage,
      icon: "",
      color: "#06b6d4",
      features: ["Corneal curvature", "Keratoconus detection", "Refractive surgery planning", "Contact lens fitting"],
    },
    {
      id: 12,
      name: "Tear Film Analysis",
      specialty: "Dry Eye Evaluation",
      desc: "Comprehensive dry eye and tear film evaluation including tear breakup time, osmolarity, and meibomian gland assessment.",
      range: "850 LE",
      image: tearFilmImage,
      icon: "",
      color: "#3b82f6",
      features: ["Tear breakup time", "Osmolarity", "Meibomian glands", "Dry eye treatment"],
    },
    {
      id: 13,
      name: "Electroretinography (ERG)",
      specialty: "Retinal Function Test",
      desc: "Measure electrical response of retinal cells to light stimulation. Essential for diagnosing retinal dystrophies and assessing retinal function.",
      range: "3000 LE",
      image: ergImage,
      icon: "",
      color: "#f97316",
      features: ["Retinal response", "Rod/cone function", "Retinal dystrophy", "Macular function"],
    },
    {
      id: 14,
      name: "Electrooculography (EOG)",
      specialty: "Eye Movement Test",
      desc: "Measure resting potential of retinal pigment epithelium. Important for Best disease and retinal toxicity assessment.",
      range: "2500 LE",
      image: eogImage,
      icon: "",
      color: "#f97316",
      features: ["RPE function", "Best disease", "Retinal toxicity", "Eye movement recording"],
    },
    {
      id: 15,
      name: "Genetic Testing",
      specialty: "Ocular Genetics",
      desc: "Identify inherited eye disease genetic markers. Essential for diagnosing hereditary retinal diseases and genetic counseling.",
      range: "7000 LE",
      image: geneticImage,
      icon: "",
      color: "#a855f7",
      features: ["Inherited diseases", "Genetic markers", "Retinal dystrophy", "Family counseling"],
    },
  ],
  ar: [
    // Prioritized services first (MRI, X-Ray, Specular)
    {
      id: 4,
      name: "رنين مغناطيسي MRI",
      specialty: "التصوير بالرنين",
      desc: "جهاز 3 تسلا عالي الدقة لتصوير المخ والعمود الفقري والمفاصل والأنسجة الرخوة.",
      range: "3500 ج.م",
      image: mriImage,
      icon: "",
      color: "#1f6bff",
      features: ["بدون إشعاع", "تصوير دقيق", "المخ والعمود الفقري", "تقييم المفاصل"],
    },
    {
      id: 5,
      name: "أشعة سينية X-Ray",
      specialty: "التصوير الرقمي",
      desc: "أشعة رقمية فورية للعظام والصدر والمفاصل بجرعة إشعاع منخفضة وجودة عالية.",
      range: "350 ج.م",
      image: xrayImage,
      icon: "",
      color: "#28a745",
      features: ["نتائج فورية", "جرعة منخفضة", "العظام والصدر", "أجهزة محمولة"],
    },
    {
      id: 10,
      name: "ميكروسكوب الخلايا",
      specialty: "خلية البطانة",
      desc: "تقييم صحة الخلايا البطانية للقرنية وكثافتها قبل جراحات المياه البيضاء.",
      range: "950 ج.م",
      image: specularMicroscopyImage,
      icon: "",
      color: "#06b6d4",
      features: ["تعداد البطانية", "كثافة الخلايا", "صحة القرنية", "تقييم ما قبل الجراحة"],
    },
    // Blood tests
    {
      id: 1,
      name: "صورة دم كاملة CBC",
      specialty: "تعداد الدم الكامل",
      desc: "فحص شامل للدم للكشف عن الأنيميا والالتهابات وأمراض الدم مع تحليل كامل لخلايا الدم.",
      range: "250 ج.م",
      image: cbcImage,
      icon: "",
      color: "#ef4444",
      features: ["كشف الأنيميا", "علامات الالتهاب", "تعداد الصفائح", "تحليل خلايا الدم"],
    },
    {
      id: 2,
      name: "سكر الدم",
      specialty: "فحص الجلوكوز",
      desc: "فحص سكر الصائم والعشوائي لمرض السكري والمقدمات السكرية.",
      range: "120 ج.م",
      image: bloodSugarImage,
      icon: "",
      color: "#f59e0b",
      features: ["سكر الصائم", "سكر عشوائي", "فحص السكري", "تحليل تراكمي"],
    },
    {
      id: 16,
      name: "تحليل HbA1c",
      specialty: "هيموجلوبين مرتبط بالسكر",
      desc: "متوسط مرضى السكر خلال 2-3 أشهر — مفيد لمتابعة السيطرة على السكري.",
      range: "450 ج.م",
      image: bloodSugarImage,
      icon: "",
      color: "#f59e0b",
      features: ["متوسط الجلوكوز (3 أشهر)", "متابعة علاج السكري", "تقييم الاستجابة العلاجية"],
    },
    {
      id: 3,
      name: "أشعة مقطعية CT",
      specialty: "التصوير المقطعي",
      desc: "جهاز 128 شريحة لتصوير الصدر والبطن والرأس والعنق بصور ثلاثية الأبعاد عالية الدقة.",
      range: "1800 ج.م",
      image: ctImage,
      icon: "",
      color: "#00b8a8",
      features: ["صور ثلاثية الأبعاد", "سرعة فائقة", "تفاصيل العظام", "صبغة متقدمة"],
    },
    {
      id: 6,
      name: "أو سي تي OCT",
      specialty: "التماسك البصري",
      desc: "تصوير مقطعي عالي الدقة للشبكية والعصب البصري لتشخيص الجلوكوما والضمور البقعي.",
      range: "900 ج.م",
      image: octImage,
      icon: "",
      color: "#8b5cf6",
      features: ["طبقات الشبكية", "تحليل العصب البصري", "رسم البقعة", "كشف الجلوكوما"],
    },
    {
      id: 7,
      name: "فلورسين أنجيو",
      specialty: "تصوير الأوعية",
      desc: "تقييم تدفق الدم في الشبكية باستخدام صبغة فلورسين لتشخيص اعتلال الشبكية السكري.",
      range: "2200 ج.م",
      image: contrastImage,
      icon: "",
      color: "#ec4899",
      features: ["دورة الشبكية", "كشف التسرب", "تقييم البقعة", "اعتلال السكري"],
    },
    {
      id: 8,
      name: "فحص مجال الرؤية",
      specialty: "قياس المحيط البصري",
      desc: "قياس الرؤية المركزية والمحيطية للكشف عن البقع العمياء في الجلوكوما والأمراض العصبية.",
      range: "800 ج.م",
      image: visualFieldImage,
      icon: "",
      color: "#8b5cf6",
      features: ["الرؤية المحيطية", "الرؤية المركزية", "متابعة الجلوكوما", "تقييم عصبي"],
    },
    {
      id: 9,
      name: "سونار العين B-Scan",
      specialty: "موجات فوق صوتية",
      desc: "فحص الهياكل الداخلية للعين عندما تكون الرؤية محجوبة بسبب المياه البيضاء أو النزيف.",
      range: "600 ج.م",
      image: ultrasoundImage,
      icon: "",
      color: "#14b8a6",
      features: ["القطاع الخلفي", "انفصال الشبكية", "تقييم الأورام", "كشف الأجسام الغريبة"],
    },
    {
      id: 11,
      name: "تخطيط القرنية",
      specialty: "خريطة القرنية",
      desc: "تخطيط ثلاثي الأبعاد لسطح القرنية لتشخيص القرنية المخروطية والتخطيط لجراحات الليزك.",
      range: "1000 ج.م",
      image: cornealTopographyImage,
      icon: "",
      color: "#06b6d4",
      features: ["انحناء القرنية", "كشف القرنية المخروطية", "تخطيط الليزك", "قياس العدسات اللاصقة"],
    },
    {
      id: 12,
      name: "تحليل طبقة الدموع",
      specialty: "جفاف العين",
      desc: "تقييم شامل لجفاف العين والدموع بما في ذلك تحليل الأسمولية وغدد ميبوميان.",
      range: "850 ج.م",
      image: tearFilmImage,
      icon: "",
      color: "#3b82f6",
      features: ["زمن تكسر الدموع", "الأسمولية", "غدد ميبوميان", "علاج الجفاف"],
    },
    {
      id: 13,
      name: "رسم شبكية ERG",
      specialty: "وظائف الشبكية",
      desc: "قياس الاستجابة الكهربائية لخلايا الشبكية لتشخيص الضمور الشبكي واعتلال الشبكية.",
      range: "3000 ج.م",
      image: ergImage,
      icon: "",
      color: "#f97316",
      features: ["استجابة الشبكية", "وظيفة العصيات والمخاريط", "الضمور الشبكي", "وظيفة البقعة"],
    },
    {
      id: 14,
      name: "رسم حركة العين EOG",
      specialty: "حركة العين",
      desc: "قياس الجهد الكهربائي لظهارة الشبكية لتشخيص مرض بيست وسمية الشبكية.",
      range: "2500 ج.م",
      image: eogImage,
      icon: "",
      color: "#f97316",
      features: ["وظيفة الظهارة", "مرض بيست", "سمية الشبكية", "تسجيل حركة العين"],
    },
    {
      id: 15,
      name: "فحص جيني",
      specialty: "جينات العيون",
      desc: "تحديد العلامات الجينية لأمراض العين الوراثية لتشخيص الضمور الشبكي الوراثي.",
      range: "7000 ج.م",
      image: geneticImage,
      icon: "",
      color: "#a855f7",
      features: ["الأمراض الوراثية", "العلامات الجينية", "الضمور الشبكي", "الاستشارة الوراثية"],
    },
  ],
};

export default function ServicesPage({ setPage, onSelectService }) {
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

  const persistSelectedService = (service) => {
    localStorage.setItem('selectedServiceId', service.id);
    localStorage.setItem('selectedServiceName', service.name);
    localStorage.setItem('selectedServiceNameAr', service.nameAr || service.name);
    localStorage.setItem('selectedServiceSpecialty', service.specialty);
    localStorage.setItem('selectedServiceRange', service.range);
    localStorage.setItem('selectedServiceColor', service.color);
    localStorage.setItem('selectedServiceDuration', service.duration);
    localStorage.setItem('selectedServiceImage', service.image);
    localStorage.setItem('selectedServiceDesc', service.desc);
    localStorage.setItem('selectedServiceFeatures', JSON.stringify(service.features || []));
  };

  const content = {
    en: {
      title: "Our Medical Services",
      subtitle: "All Imaging Types Under One Roof",
      description: "Complete diagnostic solutions including blood tests, radiology, ophthalmology, electrophysiology, and genetic testing",
      bookNow: "Book Appointment",
      features: "Key Features",
    },
    ar: {
      title: "خدماتنا الطبية",
      subtitle: "كل أنواع التصوير تحت سقف واحد",
      description: "حلول تشخيصية كاملة تشمل تحاليل الدم، الأشعة، طب العيون، كهرباء الأعصاب، والفحص الجيني",
      bookNow: "احجز الآن",
      features: "المميزات",
    },
  };

  const t = content[lang];

  const handleBookNow = (service) => {
    console.log('[ServicesPage] Booking service:', service);
    console.log('[ServicesPage] Service image:', service.image);
    console.log('[ServicesPage] Service color:', service.color);
    persistSelectedService(service);
    
    // Call the onSelectService prop if provided
    if (onSelectService) {
      onSelectService(service);
    }
    
    // Also update the page state if setPage is provided
    if (setPage) {
      setPage("patient-book-appointment");
    }
  };

  const getCategoryColor = (service) => {
    if (service.name === "CBC" || service.name === "Blood Sugar" || service.name === "صورة دم كاملة CBC" || service.name === "سكر الدم") return "#ef4444";
    if (service.name === "CT Scan" || service.name === "MRI Scan" || service.name === "X-Ray") return "#1f6bff";
    if (service.name === "OCT" || service.name === "Fluorescein Angiography" || service.name === "Visual Field Test") return "#8b5cf6";
    if (service.name === "Ultrasound B-Scan" || service.name === "سونار العين B-Scan") return "#14b8a6";
    if (service.name === "Corneal Topography" || service.name === "تخطيط القرنية") return "#06b6d4";
    if (service.name === "Specular Microscopy" || service.name === "ميكروسكوب الخلايا") return "#06b6d4";
    if (service.name === "Tear Film Analysis" || service.name === "تحليل طبقة الدموع") return "#3b82f6";
    if (service.name.includes("ERG") || service.name.includes("EOG")) return "#f97316";
    if (service.name === "Genetic Testing" || service.name === "فحص جيني") return "#a855f7";
    return service.color;
  };

  return (
    <div dir={dir} style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: "100px" }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #0b1a34 0%, #1a3a5c 100%)",
        padding: "60px 0 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ width: "100%", margin: 0, padding: "0 80px", position: "relative", zIndex: 2, boxSizing: "border-box" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00b8a8", marginBottom: 16, display: "block" }}>
              {t.title}
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

      {/* Services List */}
      <div style={{ width: "100%", margin: 0, padding: "60px 80px", boxSizing: "border-box" }}>
        {services.map((service, index) => {
          const serviceColor = getCategoryColor(service);
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
              style={{
                display: "flex",
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                alignItems: "center",
                gap: 48,
                marginBottom: index === services.length - 1 ? 0 : 80,
                paddingBottom: index === services.length - 1 ? 0 : 80,
                borderBottom: index === services.length - 1 ? "none" : "1px solid rgba(0,0,0,0.08)",
                flexWrap: "wrap",
              }}
            >
              {/* Image Section */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  flex: "1 1 300px",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <img
                  src={service.image}
                  alt={service.name}
                  style={{
                    width: "100%",
                    height: 350,
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
              </motion.div>

              {/* Content Section */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  flex: "1 1 400px",
                  padding: dir === "rtl" ? "0 0 0 20px" : "0 20px 0 0",
                }}
              >
                <div style={{
                  display: "inline-block",
                  background: `${serviceColor}15`,
                  color: serviceColor,
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
                  fontSize: "clamp(24px, 3vw, 32px)",
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

                {/* Features */}
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
                      background: serviceColor,
                      borderRadius: 2,
                    }} />
                    {t.features}
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                          background: serviceColor,
                          borderRadius: "50%",
                        }} />
                        <span style={{ fontSize: 14, color: "#6f86a3" }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: serviceColor,
                    padding: "10px 20px",
                    borderRadius: 28,
                    background: `${serviceColor}15`,
                    boxShadow: `0 8px 24px ${serviceColor}20`,
                    textAlign: "center",
                  }}>
                    {service.range}
                  </div>
                </div>

                {/* Book Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBookNow(service)}
                  style={{
                    background: `linear-gradient(135deg, ${serviceColor}, ${serviceColor}cc)`,
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
                    boxShadow: `0 4px 15px ${serviceColor}40`,
                  }}
                >
                  {t.bookNow}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
          margin: "40px 0 80px",
          borderRadius: 0,
          padding: "60px 80px",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box",
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
            ? "احجز موعدك اليوم واستمتع بأفضل خدمة تصوير طبي وتشخيص متكامل" 
            : "Book your appointment today and experience complete diagnostic services"}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            [
              'selectedServiceId',
              'selectedServiceName',
              'selectedServiceNameAr',
              'selectedServiceSpecialty',
              'selectedServiceRange',
              'selectedServiceColor',
              'selectedServiceDuration',
              'selectedServiceImage',
              'selectedServiceDesc',
              'selectedServiceFeatures',
            ].forEach((key) => localStorage.removeItem(key));
            if (setPage) setPage("patient-book-appointment");
          }}
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