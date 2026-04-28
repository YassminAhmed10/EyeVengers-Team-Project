import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DoctorsGrid from "../../components/Radiology/DoctorsGrid";
import ScrollZoomSection from "../../components/Radiology/ScrollZoomSection";
import radiologyBg  from "../../assets/radiologyhome.png";
import radiologyBg1 from "../../assets/radiologyhome1.png";
import radiologyBg3 from "../../assets/radiologyhome3.png";

/* ══════════════════════════════════════════
   TOKENS
══════════════════════════════════════════ */
const C = {
  primary:   "#1f6bff",
  primaryDk: "#0f4fd0",
  primaryLt: "#e9f0ff",
  teal:      "#00b8a8",
  dark:      "#0b1a34",
  body:      "#30445f",
  muted:     "#6f86a3",
  border:    "#dce6f5",
  bg:        "#f4f8ff",
  white:     "#ffffff",
};

/* ══════════════════════════════════════════
   i18n CONTENT
══════════════════════════════════════════ */
const LANG = {
  ar: {
    dir: "rtl",
    hero: {
      eyebrow: "مركز الأشعة الأول في مصر",
      h1a: "أفضل جودة",
      h1b: "تصوير طبي",
      h1c: "لصحتك",
      desc: "مركز Nile Radiology يقدم أحدث تقنيات التصوير الطبي بأيدي نخبة من أفضل الأطباء. نتائجك في 24 ساعة، وخدمتك أولويتنا.",
      cta1: "احجز موعدك الآن",
      cta2: "خدماتنا",
    },
    services: {
      eyebrow: "خدماتنا الطبية",
      title: "كل أنواع التصوير تحت سقف واحد",
      all: "عرض الكل ←",
      book: "🗓 احجز الآن",
      items: [
        { cat: "RESONANCE",  name: "رنين مغناطيسي MRI",    desc: "صور عالية الدقة للأنسجة الرخوة والأعضاء الداخلية.",  img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80" },
        { cat: "TOMOGRAPHY", name: "أشعة مقطعية CT",        desc: "تصوير مقطعي ثلاثي الأبعاد لتشخيص دقيق وشامل.",     img: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&q=80" },
        { cat: "RADIOLOGY",  name: "أشعة سينية X-Ray",      desc: "نتائج فورية لفحص العظام والصدر والمفاصل.",           img: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80" },
        { cat: "ULTRASOUND", name: "الموجات فوق الصوتية",   desc: "فحص آمن وفوري للأجنة والأعضاء الداخلية.",           img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" },
        { cat: "NEUROLOGY",  name: "تصوير المخ والأعصاب",   desc: "كشف الأورام والجلطات والاضطرابات العصبية.",          img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" },
        { cat: "CARDIOLOGY", name: "تصوير القلب والأوعية",  desc: "تصوير دقيق للقلب والشرايين والأوردة.",               img: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80" },
      ],
    },
    steps: {
      eyebrow: "كيف يعمل المركز",
      title: "أربع خطوات بسيطة",
      subtitle: "من التسجيل حتى استلام نتائجك بأسهل طريقة وأسرع وقت",
      cta: "ابدأ الآن مجاناً ←",
      items: [
        { num: "01", cat: "REGISTRATION", title: "سجّل بياناتك",  desc: "أنشئ حسابك في دقيقة وأدخل بياناتك الطبية." },
        { num: "02", cat: "BOOKING",      title: "احجز موعدك",    desc: "اختر نوع الفحص والطبيب والوقت المناسب." },
        { num: "03", cat: "EXAMINATION",  title: "أجرِ الفحص",    desc: "تعال في موعدك واستمتع بخدمة راقية." },
        { num: "04", cat: "RESULTS",      title: "استلم نتائجك",  desc: "نتائجك إلكترونياً خلال 24 ساعة." },
      ],
    },
    doctors: { eyebrow: "فريقنا الطبي", title: "نخبة من أفضل الأطباء", all: "عرض الكل ←" },
    imaging: {
      eyebrow: "من داخل مراكزنا",
      title: "صور حقيقية وتجربة تفاعلية",
      subtitle: "أحدث أجهزة التصوير الطبي في بيئة مريحة وآمنة تمامًا",
      items: [
        { title: "تصوير MRI عالي الدقة",  desc: "تقنية متقدمة تبرز تفاصيل الأنسجة والأعصاب.", tag: "Magnetic Resonance",   img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80" },
        { title: "غرفة فحص CT متطورة",    desc: "سرعة فحص أعلى مع بروتوكولات أمان دقيقة.",    tag: "Computed Tomography",  img: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=900&q=80" },
        { title: "تحليل رقمي للنتائج",    desc: "عرض بصري تفاعلي للصور والتقارير الطبية.",     tag: "AI-Enhanced Workflow", img: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=80" },
      ],
      bookBtn: "احجز بنفس التقنية ←",
    },
    testimonials: {
      eyebrow: "آراء المرضى", title: "تجارب حقيقية تثق بها",
      items: [
        { name: "أ. ريم خالد",    role: "مريضة متابعة",    quote: "النظام سريع جدًا من الحجز للنتيجة، والدكتور شرح التقرير بشكل واضح ومطمئن." },
        { name: "د. أحمد الجندي", role: "طبيب عيون محوّل", quote: "أفضل نقطة كانت جودة الصور وسهولة استلام التقارير الرقمية بشكل منظم وفوري." },
        { name: "م. سارة لطفي",   role: "مرافقة مريض",     quote: "التجربة كلها احترافية، الاستقبال منظم والمواعيد دقيقة جدًا بدون انتظار طويل." },
      ],
    },
    faq: {
      eyebrow: "الأسئلة الشائعة",
      title: "كل اللي محتاج تعرفه قبل الزيارة",
      desc: "جاوبنا على أكثر الأسئلة تكرارًا لتسهيل تجربة الحجز والفحص من البداية للنهاية.",
      cta: "تواصلي معنا مباشرة",
      items: [
        ["هل أحتاج صيام قبل الفحص؟",             "بعض الفحوصات تتطلب صيام 6 ساعات، وسيتم تنبيهك أثناء الحجز تلقائيًا."],
        ["متى أستلم النتيجة؟",                    "معظم النتائج خلال 24 ساعة، وبعض الفحوصات المعقدة خلال 48 ساعة."],
        ["هل يمكن إرسال التقرير للطبيب مباشرة؟", "نعم، من داخل حسابك يمكنك مشاركة التقرير PDF أو رابط آمن."],
        ["هل يوجد حجز أونلاين كامل؟",            "نعم، الحجز واختيار الموعد والدفع عند الحضور متاح بالكامل."],
      ],
    },
    cta: { label: "Ready For Better Diagnostics?", title: "احجزي الآن واحصلي على متابعة دقيقة من فريق الأشعة", btn1: "احجزي موعد", btn2: "استكشفي الخدمات" },
    trust: [["50K+","مريض تم خدمتهم"],["98%","دقة التشخيص"],["24h","تسليم النتائج"],["15+","طبيب متخصص"]],
    stats:  [["24/7","خدمة عملاء"],["1.5T","MRI متطور"],["45m","متوسط وقت التقرير"],["4.9/5","تقييم المرضى"]],
    scrollCards: {
      eyebrow: "خدماتنا المتميزة", title: "لماذا تختار Nile Radiology؟", subtitle: "مزيج فريد من التقنية المتقدمة والرعاية الإنسانية",
    },
  },
  en: {
    dir: "ltr",
    hero: {
      eyebrow: "Egypt's #1 Radiology Center",
      h1a: "Best Quality",
      h1b: "Medical Imaging",
      h1c: "For You",
      desc: "Nile Radiology Center provides the latest medical imaging technology in the hands of Egypt's finest specialists. Results in 24 hours, your care is our priority.",
      cta1: "Book an Appointment",
      cta2: "Our Services",
    },
    services: {
      eyebrow: "Our Medical Services",
      title: "All Imaging Types Under One Roof",
      all: "View All →",
      book: "🗓 Book Now",
      items: [
        { cat: "RESONANCE",  name: "MRI Scan",             desc: "High-resolution imaging of soft tissues and internal organs.",  img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80" },
        { cat: "TOMOGRAPHY", name: "CT Scan",              desc: "3D cross-sectional imaging for precise and comprehensive diagnosis.", img: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&q=80" },
        { cat: "RADIOLOGY",  name: "X-Ray",                desc: "Instant results for bone, chest, and joint examinations.",           img: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80" },
        { cat: "ULTRASOUND", name: "Ultrasound",           desc: "Safe and immediate imaging for fetuses and internal organs.",        img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" },
        { cat: "NEUROLOGY",  name: "Brain & Nerve Imaging",desc: "Detecting tumors, strokes, and neurological disorders.",            img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" },
        { cat: "CARDIOLOGY", name: "Cardiac Imaging",      desc: "Precise imaging of the heart, arteries, and veins.",               img: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80" },
      ],
    },
    steps: {
      eyebrow: "How It Works",
      title: "Four Simple Steps",
      subtitle: "From registration to receiving your results — the easiest and fastest way",
      cta: "Get Started Free →",
      items: [
        { num: "01", cat: "REGISTRATION", title: "Register",      desc: "Create your account in one minute and enter your medical data." },
        { num: "02", cat: "BOOKING",      title: "Book",          desc: "Choose your scan type, doctor, and preferred time." },
        { num: "03", cat: "EXAMINATION",  title: "Get Scanned",   desc: "Come to your appointment and enjoy a premium service." },
        { num: "04", cat: "RESULTS",      title: "Receive Results",desc: "Your results delivered digitally within 24 hours." },
      ],
    },
    doctors: { eyebrow: "Our Medical Team", title: "Egypt's Finest Specialists", all: "View All →" },
    imaging: {
      eyebrow: "Inside Our Centers",
      title: "Real Images & Interactive Experience",
      subtitle: "The latest medical imaging equipment in a comfortable and fully safe environment",
      items: [
        { title: "High-Resolution MRI",     desc: "Advanced technology highlighting tissue and nerve details.", tag: "Magnetic Resonance",   img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80" },
        { title: "Advanced CT Suite",       desc: "Faster scanning with precise safety protocols.",             tag: "Computed Tomography",  img: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=900&q=80" },
        { title: "Digital Results Analysis",desc: "Interactive visual display of images and medical reports.",  tag: "AI-Enhanced Workflow", img: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=80" },
      ],
      bookBtn: "Book This Technology →",
    },
    testimonials: {
      eyebrow: "Patient Reviews", title: "Real Experiences You Can Trust",
      items: [
        { name: "Reem Khaled",    role: "Follow-up Patient",   quote: "The system was incredibly fast from booking to results. The doctor explained the report clearly and reassuringly." },
        { name: "Dr. Ahmed Jundi",role: "Referring Ophthalmologist", quote: "The best part was the image quality and the ease of receiving digital reports in an organized, instant manner." },
        { name: "Sara Lotfy",     role: "Patient Companion",   quote: "The entire experience was professional. The reception was organized and appointments were always on time." },
      ],
    },
    faq: {
      eyebrow: "Frequently Asked Questions",
      title: "Everything You Need to Know Before Your Visit",
      desc: "We've answered the most common questions to make your booking and examination experience seamless from start to finish.",
      cta: "Contact Us Directly",
      items: [
        ["Do I need to fast before the scan?",        "Some scans require 6 hours of fasting. You will be notified automatically during booking."],
        ["When will I receive my results?",           "Most results are ready within 24 hours. Complex scans may take up to 48 hours."],
        ["Can reports be sent directly to my doctor?","Yes, from your account you can share the PDF report or a secure link."],
        ["Is full online booking available?",         "Yes, booking, choosing your appointment, and payment on arrival are all fully available online."],
      ],
    },
    cta: { label: "Ready For Better Diagnostics?", title: "Book Now and Get Precise Follow-up from Our Radiology Team", btn1: "Book Appointment", btn2: "Explore Services" },
    trust: [["50K+","Patients Served"],["98%","Diagnostic Accuracy"],["24h","Report Delivery"],["15+","Specialist Doctors"]],
    stats:  [["24/7","Customer Service"],["1.5T","Advanced MRI"],["45m","Avg. Report Time"],["4.9/5","Patient Rating"]],
    scrollCards: {
      eyebrow: "Our Services", title: "Why Choose Nile Radiology?", subtitle: "A unique blend of advanced technology and human care",
    },
  },
};

/* ══════════════════════════════════════════
   SCROLL CARDS DATA (same for both langs)
══════════════════════════════════════════ */
const SCROLL_CARDS_DATA = [
  { tag: "Advance Technology",   title: "Advance Technology",          desc: "Vestibulum morbi blandit cursus risus. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Massa massa ultricies mi quis hendrerit.", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80", accent: "#1f6bff", features: [{ group: "Breast Ultrasound", items: ["A wide array of benefits","Certified Radiologists"] },{ group: "Advancing Medical", items: ["Personalized Patient Care","Cutting-edge Technology"] }] },
  { tag: "Accurate Radiology",   title: "Accurate Radiology Reporting",desc: "Vestibulum morbi blandit cursus risus. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Massa massa ultricies mi quis hendrerit.", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80", accent: "#00b8a8", features: [{ group: "Breast Ultrasound", items: ["A wide array of benefits","Certified Radiologists"] },{ group: "Advancing Medical", items: ["Personalized Patient Care","Cutting-edge Technology"] }] },
  { tag: "Clinical Imaging",     title: "Imaging in Clinical Trial",   desc: "Vestibulum morbi blandit cursus risus. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Massa massa ultricies mi quis hendrerit.", img: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80", accent: "#7c3aed", features: [{ group: "Breast Ultrasound", items: ["A wide array of benefits","Certified Radiologists"] },{ group: "Advancing Medical", items: ["Personalized Patient Care","Cutting-edge Technology"] }] },
];

/* ══════════════════════════════════════════
   MOTION VARIANTS
══════════════════════════════════════════ */
const fadeUp = {
  hidden:  { opacity: 0, y: 40, filter: "blur(5px)" },
  visible: (i = 0) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 0.74, 0.2, 1] } }),
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.86, filter: "blur(8px)" },
  visible: (i = 0) => ({ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, delay: i * 0.09, ease: [0.34, 1.26, 0.64, 1] } }),
};

/* ── Parallax image block (image scrolls slower than page) ── */
function ParallaxImage({ src, alt, height = "70vh", speed = 0.3, overlay = "rgba(11,26,52,0.45)" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  return (
    <div ref={ref} style={{ position: "relative", height, overflow: "hidden" }}>
      <motion.img src={src} alt={alt} style={{ y, width: "100%", height: "130%", objectFit: "cover", objectPosition: "center", display: "block", position: "absolute", top: 0, left: 0 }} />
      {overlay && <div style={{ position: "absolute", inset: 0, background: overlay }} />}
    </div>
  );
}

/* ── Horizontal scroll strip ── */
function HorizontalScrollStrip({ images, speed = 40 }) {
  const trackRef = useRef(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x = 0;
    let raf;
    const tick = () => {
      x -= speed / 60;
      if (Math.abs(x) >= el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const doubled = [...images, ...images];
  return (
    <div style={{ overflow: "hidden", width: "100%", background: C.dark, padding: "20px 0" }}>
      <div ref={trackRef} style={{ display: "flex", gap: 20, width: "max-content" }}>
        {doubled.map((img, i) => (
          <div key={i} style={{ width: 280, height: 180, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reveal on scroll (clip-path wipe) ── */
function ClipReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 0.74, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   STAT COUNTER
══════════════════════════════════════════ */
function StatCounter({ value, label, light }) {
  const ref = useRef(null);
  const [vis, setVis]     = useState(false);
  const [count, setCount] = useState(0);
  const numericVal = parseInt(value.replace(/\D/g, ""), 10) || 0;
  const suffix     = value.replace(/[\d]/g, "");
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!vis || !numericVal) return;
    let t0 = null;
    const tick = (ts) => { if (!t0) t0=ts; const p=Math.min((ts-t0)/1200,1); setCount(Math.round((1-Math.pow(1-p,3))*numericVal)); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [vis, numericVal]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: light ? "#fff" : C.dark, lineHeight: 1 }}>
        {numericVal ? count + suffix : value}
      </div>
      <div style={{ fontSize: 12, color: light ? "rgba(255,255,255,0.55)" : C.muted, marginTop: 5 }}>{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════ */
function SectionHeader({ eyebrow, title, subtitle, center = false, light = false }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
      style={{ textAlign: center ? "center" : "inherit", marginBottom: 48 }}>
      <span style={{ display:"inline-block", fontSize:11, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color: light?"rgba(255,255,255,0.55)":C.primary, marginBottom:12 }}>✦ {eyebrow}</span>
      <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, fontFamily:"'Outfit',sans-serif", color: light?C.white:C.dark, lineHeight:1.1, letterSpacing:"-0.02em", marginBottom: subtitle?12:0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize:15, color: light?"rgba(255,255,255,0.5)":C.muted, maxWidth:520, margin: center?"0 auto":"0", lineHeight:1.7 }}>{subtitle}</p>}
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   ACCORDION ROW
══════════════════════════════════════════ */
function AccordionRow({ num, category, title, img, desc, onHover, isActive, onClick, light=false, dir="rtl" }) {
  return (
    <motion.div onMouseEnter={onHover} onClick={onClick}
      style={{ position:"relative", display:"flex", alignItems:"center", borderTop:`1px solid ${light?"rgba(255,255,255,0.14)":C.border}`, minHeight:96, cursor:"pointer", overflow:"hidden", direction:dir, transition:"background 0.3s ease", background: isActive?(light?"rgba(255,255,255,0.06)":"rgba(31,107,255,0.05)"):"transparent" }}>
      <motion.div initial={false} animate={{ scaleX: isActive?1:0 }} transition={{ duration:0.4, ease:[0.22,0.74,0.2,1] }}
        style={{ position:"absolute", inset:0, background: light?"rgba(255,255,255,0.07)":"rgba(31,107,255,0.06)", transformOrigin: dir==="rtl"?"right":"left", zIndex:0 }} />
      <div style={{ position:"relative", zIndex:1, fontSize:"clamp(52px,7vw,78px)", fontWeight:900, fontFamily:"'Outfit',sans-serif", lineHeight:1, width:120, flexShrink:0, color:"transparent",
        WebkitTextStroke: isActive?`2px ${light?C.white:C.primary}`:`2px ${light?"rgba(255,255,255,0.22)":"rgba(31,107,255,0.25)"}`, transition:"all 0.3s ease", userSelect:"none", letterSpacing:"-0.02em", textAlign:"center" }}>{num}</div>
      <AnimatePresence>
        {isActive && img && (
          <motion.div key="thumb" initial={{ opacity:0, width:0, marginLeft:0 }} animate={{ opacity:1, width:110, marginLeft:20 }} exit={{ opacity:0, width:0, marginLeft:0 }} transition={{ duration:0.34, ease:[0.22,0.74,0.2,1] }}
            style={{ height:70, borderRadius:10, overflow:"hidden", flexShrink:0, zIndex:1 }}>
            <img src={img} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ flex:1, position:"relative", zIndex:1, padding:"0 0 0 8px" }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", color: isActive?(light?"rgba(255,255,255,0.6)":C.primary):(light?"rgba(255,255,255,0.35)":C.muted), marginBottom:5, transition:"color 0.25s" }}>{category}</p>
        <h3 style={{ fontSize:"clamp(20px,3vw,38px)", fontWeight:900, fontFamily:"'Outfit',sans-serif", lineHeight:1.05, letterSpacing:"-0.02em", color: isActive?(light?C.white:C.dark):"transparent", WebkitTextStroke: isActive?"0px":`1.5px ${light?"rgba(255,255,255,0.5)":"rgba(11,26,52,0.4)"}`, transition:"all 0.3s ease" }}>{title}</h3>
        <AnimatePresence>{isActive && desc && <motion.p initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.22 }} style={{ fontSize:13, color: light?"rgba(255,255,255,0.5)":C.muted, marginTop:5, maxWidth:480 }}>{desc}</motion.p>}</AnimatePresence>
      </div>
      <motion.div animate={{ x: isActive?0:14, opacity: isActive?1:0 }} transition={{ duration:0.2 }} style={{ position:"relative", zIndex:1, flexShrink:0, margin: dir==="rtl"?"0 0 0 4px":"0 4px 0 0" }}>
        <div style={{ width:42, height:42, borderRadius:"50%", background: light?C.white:C.primary, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color: light?C.primary:C.white, fontSize:16 }}>{dir==="rtl"?"←":"→"}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   GEO BG
══════════════════════════════════════════ */
function GeoBg({ flip=false }) {
  return (
    <div style={{ position:"absolute", top:0, bottom:0, [flip?"left":"right"]:0, width:"16%", zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <svg viewBox="0 0 200 800" preserveAspectRatio="none" style={{ width:"100%", height:"100%" }}>
        <polygon points={flip?"0,0 0,800 160,800 80,0":"200,0 200,800 40,800 120,0"} fill="rgba(255,255,255,0.04)" />
        <polygon points={flip?"0,0 0,800 120,800 40,0":"200,0 200,800 80,800 160,0"} fill="rgba(255,255,255,0.025)" />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════
   SCROLL STACKING CARDS
══════════════════════════════════════════ */
const SC_CARD_H   = 600;
const SC_CARD_GAP = 20;

function ScCheck({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ScCardLayer({ card, index, total, sectionProgress }) {
  const segSize  = 1 / total;
  const segStart = index * segSize;
  const scaleRaw = index < total - 1
    ? useTransform(sectionProgress, [segStart + segSize*0.55, segStart + segSize], [1, 0.92])
    : useTransform(sectionProgress, [0,1], [1,1]);
  const scale   = useSpring(scaleRaw, { stiffness:90, damping:22 });
  const opacRaw = index < total - 1
    ? useTransform(sectionProgress, [segStart + segSize*0.65, segStart + segSize], [1, 0.55])
    : useTransform(sectionProgress, [0,1], [1,1]);
  const opacity = useSpring(opacRaw, { stiffness:90, damping:22 });

  return (
    <div style={{ position:"sticky", top:0, height:"100vh", display:"flex", alignItems:"center", zIndex: index+1 }}>
      <motion.div style={{ scale, opacity, transformOrigin:"center center", width:"100%", padding:"0 40px" }}>
        <div style={{ background:"#fff", borderRadius:24, minHeight:SC_CARD_H, display:"flex", alignItems:"center", overflow:"visible", boxShadow:"0 8px 48px rgba(11,26,52,0.10)", border:"1px solid rgba(0,0,0,0.07)", direction:"ltr", position:"relative" }}>
          <div style={{ flex:1, padding:"80px 88px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <h2 style={{ fontSize:"clamp(28px,3.5vw,48px)", fontWeight:800, fontFamily:"'Outfit',sans-serif", color:"#0b1a34", lineHeight:1.12, letterSpacing:"-0.025em", marginBottom:24 }}>{card.title}</h2>
            <p style={{ fontSize:17, color:"#6f86a3", lineHeight:1.8, marginBottom:48, maxWidth:520 }}>{card.desc}</p>
            <div style={{ display:"flex", gap:72 }}>
              {card.features.map((f) => (
                <div key={f.group}>
                  <p style={{ fontSize:15, fontWeight:700, color:"#0b1a34", marginBottom:16, paddingBottom:10, borderBottom:"1px solid #dce6f5" }}>{f.group}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {f.items.map((item) => (
                      <div key={item} style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <ScCheck color={card.accent} />
                        <span style={{ fontSize:15, color:"#30445f", lineHeight:1.4 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width:440, flexShrink:0, position:"relative", height:SC_CARD_H, display:"flex", alignItems:"center", justifyContent:"center", overflow:"visible" }}>
            <div style={{ width:380, height:380, borderRadius:"50%", overflow:"hidden", border:"10px solid #fff", boxShadow:"0 16px 56px rgba(11,26,52,0.14)", position:"absolute", top:"50%", transform:"translateY(-54%)" }}>
              <img src={card.img} alt={card.title} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StackingCardsSection({ t }) {
  const n        = SCROLL_CARDS_DATA.length;
  const outerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target:outerRef, offset:["start start","end end"] });
  return (
    <div ref={outerRef} style={{ background:"#f0f4f8", height:`${n*100}vh`, position:"relative" }}>
      <div style={{ textAlign:"center", padding:"80px 40px 0", direction:"ltr", position:"relative", zIndex:0 }}>
        <span style={{ display:"inline-block", fontSize:11, fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase", color:"#1f6bff", marginBottom:14 }}>✦ {t.scrollCards.eyebrow}</span>
        <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, fontFamily:"'Outfit',sans-serif", color:"#0b1a34", lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:14 }}>{t.scrollCards.title}</h2>
        <p style={{ fontSize:16, color:"#6f86a3", lineHeight:1.7 }}>{t.scrollCards.subtitle}</p>
      </div>
      {SCROLL_CARDS_DATA.map((card, i) => (
        <ScCardLayer key={card.title} card={card} index={i} total={n} sectionProgress={scrollYProgress} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function HomePage({ setPage }) {
  /* lang comes from html dir attribute set by Navbar */
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

  const t   = LANG[lang];
  const dir = t.dir;

  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredStep,    setHoveredStep]    = useState(null);
  const [hoveredFaq,     setHoveredFaq]     = useState(null);

  return (
    <div dir={dir} style={{ fontFamily:"'Cairo','Outfit',sans-serif" }}>

      {/* ══════════════════════════════════
          1. HERO — split layout
      ══════════════════════════════════ */}
      <section style={{ display:"flex", minHeight:"100vh", overflow:"hidden", direction:"ltr" }}>

        {/* LEFT half — photo */}
        <div style={{ flex:"0 0 52%", position:"relative", overflow:"hidden" }}>
          <img src={radiologyBg} alt="Radiology" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }} />
          {/* subtle right-edge fade */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, transparent 60%, #ecf4ff 100%)" }} />
        </div>

        {/* RIGHT half — content */}
        <div style={{
          flex:"0 0 48%",
          background: "linear-gradient(160deg, #eef4ff 0%, #f7fbff 60%, #fff 100%)",
          display:"flex", alignItems:"center",
          padding:"120px 64px 80px",
        }}>
          <div style={{ maxWidth:520, width:"100%", direction:dir }}>

            {/* Eyebrow */}
            <motion.p variants={fadeUp} custom={0} initial="hidden" animate="visible"
              style={{ fontSize:12, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:C.teal, marginBottom:20 }}>
              {t.hero.eyebrow}
            </motion.p>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
              style={{ fontSize:"clamp(32px,4.5vw,60px)", fontWeight:900, fontFamily:"'Outfit',sans-serif", color:C.dark, lineHeight:1.08, letterSpacing:"-0.03em", marginBottom:22 }}>
              <span style={{ color:C.dark }}>{t.hero.h1a} </span>
              <span style={{ color:C.primary }}>{t.hero.h1b} </span>
              <span style={{ color:C.dark }}>{t.hero.h1c}</span>
            </motion.h1>

            {/* Desc */}
            <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
              style={{ fontSize:16, color:C.body, lineHeight:1.8, marginBottom:36 }}>
              {t.hero.desc}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible"
              style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:48 }}>
              <motion.button className="btn btn-primary" whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
                onClick={() => setPage("booking")} style={{ fontSize:15, padding:"14px 30px" }}>
                {t.hero.cta1}
              </motion.button>
              <motion.button className="btn btn-outline" whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
                onClick={() => setPage("services")} style={{ fontSize:15, padding:"14px 30px" }}>
                {t.hero.cta2}
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
              style={{ display:"flex", borderTop:`1px solid ${C.border}`, paddingTop:28 }}>
              {t.trust.map(([n, l], i) => (
                <div key={l} style={{ flex:1, textAlign:"center", borderRight: i < t.trust.length-1 ? `1px solid ${C.border}` : "none", padding:"0 12px" }}>
                  <StatCounter value={n} label={l} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. SERVICES
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.92} midScale={1.02} endScale={0.98}>
        <section style={{ background:"linear-gradient(145deg,#0b1a34 0%,#0d2145 50%,#091525 100%)", position:"relative", overflow:"hidden", padding:"96px 0" }}>
          <GeoBg />
          <div className="container" style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
              <SectionHeader eyebrow={t.services.eyebrow} title={t.services.title} light />
              <motion.button className="btn" whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }} onClick={() => setPage("services")}
                style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.25)", color:C.white, marginBottom:48 }}>
                {t.services.all}
              </motion.button>
            </div>
            <div onMouseLeave={() => setHoveredService(null)}>
              {t.services.items.map((s, i) => (
                <motion.div key={s.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-40px" }}>
                  <AccordionRow num={String(i+1).padStart(2,"0")} category={s.cat} title={s.name} img={s.img} desc={s.desc}
                    isActive={hoveredService===i} onHover={() => setHoveredService(i)} onClick={() => setPage("booking")} light dir={dir} />
                </motion.div>
              ))}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.14)" }} />
            </div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }} style={{ marginTop:36, display:"flex", justifyContent:"center" }}>
              <motion.button className="btn" whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }} onClick={() => setPage("booking")}
                style={{ background:C.primary, color:C.white, border:"none", boxShadow:"0 12px 28px rgba(31,107,255,0.4)" }}>
                {t.services.book}
              </motion.button>
            </motion.div>
          </div>
        </section>
      </ScrollZoomSection>

      {/* ══════════════════════════════════
          3. HOW IT WORKS
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.9} midScale={1.01} endScale={0.98}>
        <section style={{ background:C.bg, padding:"96px 0", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${C.primary},${C.teal})` }} />
          <div className="container">
            <SectionHeader eyebrow={t.steps.eyebrow} title={t.steps.title} subtitle={t.steps.subtitle} center />
            <div onMouseLeave={() => setHoveredStep(null)}>
              {t.steps.items.map((s, i) => (
                <motion.div key={s.num} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-30px" }}>
                  <AccordionRow num={s.num} category={s.cat} title={s.title} desc={s.desc}
                    isActive={hoveredStep===i} onHover={() => setHoveredStep(i)} onClick={() => setPage("register")} dir={dir} />
                </motion.div>
              ))}
              <div style={{ borderTop:`1px solid ${C.border}` }} />
            </div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }} style={{ textAlign:"center", marginTop:40 }}>
              <motion.button className="btn btn-primary" whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }} onClick={() => setPage("register")}>
                {t.steps.cta}
              </motion.button>
            </motion.div>
          </div>
        </section>
      </ScrollZoomSection>

      {/* ══════════════════════════════════
          4. DOCTORS — animated image cards
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.9} midScale={1.02} endScale={0.98}>
        <section style={{ background: C.white, padding: "96px 0", overflow: "hidden" }}>
          <div className="container">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20, marginBottom:64 }}>
              <SectionHeader eyebrow={t.doctors.eyebrow} title={t.doctors.title} />
              <motion.button className="btn btn-outline" whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={() => setPage("doctors")}>
                {t.doctors.all}
              </motion.button>
            </div>

            {/* Doctor cards row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
              {[
                { img: "/src/assets/radiologyhomedoctor3.png", name: lang==="ar"?"د. سارة محمود":"Dr. Sarah Mahmoud",   spec: lang==="ar"?"أشعة تشخيصية":"Diagnostic Radiology", exp: lang==="ar"?"12 سنة خبرة":"12 Years Experience", tags: lang==="ar"?["MRI","CT","عصبي"]:["MRI","CT","Neuro"], accent: C.primary },
                { img: "/src/assets/radiologyhomedoctor1.png", name: lang==="ar"?"د. أحمد الجندي":"Dr. Ahmed Jundi",    spec: lang==="ar"?"أشعة تداخلية":"Interventional Radiology", exp: lang==="ar"?"9 سنوات خبرة":"9 Years Experience",  tags: lang==="ar"?["تداخلي","أوعية","قلب"]:["Interventional","Vascular","Cardiac"], accent: C.teal },
                { img: "/src/assets/radiologyhomedoctor2.png", name: lang==="ar"?"علي خالد":"Dr. Ali Khaled",       spec: lang==="ar"?"أشعة الثدي":"Breast Imaging",           exp: lang==="ar"?"15 سنة خبرة":"15 Years Experience", tags: lang==="ar"?["ثدي","موجات صوتية","AI"]:["Breast","Ultrasound","AI"], accent: "#7c3aed" },
              ].map((doc, i) => (
                <motion.div
                  key={doc.name}
                  custom={i}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  whileHover="hovered"
                  style={{ position: "relative", borderRadius: 24, overflow: "hidden", cursor: "pointer", boxShadow: "0 8px 40px rgba(11,26,52,0.12)", background: C.dark }}
                  onClick={() => setPage("doctors")}
                >
                  {/* Photo — fills card, zooms on hover */}
                  <motion.div
                    variants={{ hovered: { scale: 1.07 } }}
                    transition={{ duration: 0.5, ease: [0.22, 0.74, 0.2, 1] }}
                    style={{ height: 400, overflow: "hidden" }}
                  >
                    <img
                      src={doc.img}
                      alt={doc.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                      onError={(e) => { e.target.style.display="none"; }}
                    />
                  </motion.div>

                  {/* Gradient overlay bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
                    background: "linear-gradient(to top, rgba(11,26,52,0.97) 0%, rgba(11,26,52,0.7) 50%, transparent 100%)",
                  }} />

                  {/* Accent top bar — slides in */}
                  <motion.div
                    variants={{ hovered: { scaleX: 1 } }}
                    initial={{ scaleX: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 0.74, 0.2, 1] }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: doc.accent, transformOrigin: "left" }}
                  />

                  {/* Content */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 28px 32px" }}>
                    {/* Specialty pill */}
                    <motion.span
                      variants={{ hovered: { y: 0, opacity: 1 } }}
                      initial={{ y: 10, opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      style={{
                        display: "inline-block",
                        background: doc.accent + "28",
                        border: `1px solid ${doc.accent}50`,
                        color: doc.accent,
                        fontSize: 11, fontWeight: 800,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "4px 14px", borderRadius: 50,
                        marginBottom: 12,
                      }}
                    >{doc.spec}</motion.span>

                    {/* Name */}
                    <h3 style={{ fontSize: "clamp(18px,2vw,22px)", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>
                      {doc.name}
                    </h3>

                    {/* Experience */}
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>{doc.exp}</p>

                    {/* Tags — slide up on hover */}
                    <motion.div
                      variants={{ hovered: { y: 0, opacity: 1 } }}
                      initial={{ y: 14, opacity: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}
                    >
                      {doc.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: 11, fontWeight: 600,
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          color: "#fff",
                          padding: "3px 12px", borderRadius: 50,
                        }}>{tag}</span>
                      ))}
                    </motion.div>

                    {/* Book button — slides up on hover */}
                    <motion.div
                      variants={{ hovered: { y: 0, opacity: 1 } }}
                      initial={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.38, delay: 0.14 }}
                    >
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: doc.accent,
                        color: "#fff",
                        fontSize: 13, fontWeight: 800,
                        padding: "10px 22px", borderRadius: 50,
                        boxShadow: `0 8px 24px ${doc.accent}50`,
                      }}>
                        {lang === "ar" ? "احجز موعد" : "Book Appointment"}
                        <span style={{ fontSize: 16 }}>{dir === "rtl" ? "←" : "→"}</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom animated line */}
            <motion.div
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22,0.74,0.2,1], delay: 0.2 }}
              style={{ height: 2, background: `linear-gradient(90deg,${C.primary},${C.teal})`, marginTop: 64, transformOrigin: "left", borderRadius: 2 }}
            />
          </div>
        </section>
      </ScrollZoomSection>

      {/* ══════════════════════════════════
          5. TRUST STATS
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.92} midScale={1.02} endScale={0.99}>
        <section style={{ background:"linear-gradient(120deg,#0d2b5e 0%,#1f4d91 55%,#1b76b0 100%)", padding:"48px 0", position:"relative", overflow:"hidden" }}>
          <GeoBg flip />
          <div className="container" style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:20 }}>
              {t.stats.map(([v,l]) => (
                <motion.div key={l} whileHover={{ y:-6, scale:1.05 }} transition={{ type:"spring", stiffness:260, damping:18 }}
                  style={{ border:"1px solid rgba(255,255,255,0.18)", background:"rgba(255,255,255,0.07)", borderRadius:16, padding:"20px 16px", textAlign:"center" }}>
                  <StatCounter value={v} label={l} light />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollZoomSection>

      {/* ══════════════════════════════════
          6A. PARALLAX FULL-WIDTH IMAGE — radiologyhome1
      ══════════════════════════════════ */}
      <div style={{ position: "relative" }}>
        <ParallaxImage
          src={radiologyBg1}
          alt="Radiology Center"
          height="75vh"
          overlay="rgba(11,26,52,0.52)"
        />
        {/* Text overlay on parallax */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", textAlign: "center",
          padding: "0 40px", zIndex: 2,
        }}>
          <ClipReveal delay={0}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: C.teal, marginBottom: 16 }}>
              ✦ {t.imaging.eyebrow}
            </p>
          </ClipReveal>
          <ClipReveal delay={0.15}>
            <h2 style={{ fontSize: "clamp(32px,5vw,64px)", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#fff", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 20, maxWidth: 700 }}>
              {t.imaging.title}
            </h2>
          </ClipReveal>
          <ClipReveal delay={0.25}>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", maxWidth: 520, lineHeight: 1.7, marginBottom: 32 }}>
              {t.imaging.subtitle}
            </p>
          </ClipReveal>
          <motion.button
            className="btn"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={() => setPage("booking")}
            style={{ background: C.primary, color: "#fff", border: "none", fontSize: 16, padding: "14px 36px", boxShadow: "0 12px 28px rgba(31,107,255,0.4)" }}
          >
            {t.hero.cta1}
          </motion.button>
        </div>
      </div>

      {/* ══════════════════════════════════
          6B. HORIZONTAL AUTO-SCROLL STRIP
      ══════════════════════════════════ */}
      <HorizontalScrollStrip
        images={[
          radiologyBg, radiologyBg1, radiologyBg3,
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
          "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&q=80",
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
        ]}
        speed={35}
      />

      {/* ══════════════════════════════════
          6C. CINEMATIC CARDS — split image reveal
      ══════════════════════════════════ */}
      <section style={{ background: "linear-gradient(160deg,#0b1a34,#112654)", padding: "96px 0", position: "relative", overflow: "hidden" }}>
        <GeoBg />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <SectionHeader eyebrow={t.imaging.eyebrow} title={t.imaging.title} subtitle={t.imaging.subtitle} center light />
          <div className="cinematic-grid">
            {t.imaging.items.map((item, idx) => (
              <motion.article key={item.title} className="cinematic-card" custom={idx} variants={scaleIn} initial="hidden"
                whileInView="visible" viewport={{ once: true, margin: "-40px" }} whileHover={{ y: -12, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 210, damping: 18 }}>
                <div className="cinematic-media">
                  <img src={item.img} alt={item.title} loading="lazy" />
                  <div className="cinematic-vignette" />
                  <span className="cinematic-tag">{item.tag}</span>
                </div>
                <div className="cinematic-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <button className="cinematic-link" onClick={() => setPage("booking")}>{t.imaging.bookBtn}</button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6D. PARALLAX SECOND IMAGE — radiologyhome3
      ══════════════════════════════════ */}
      <div style={{ position: "relative" }}>
        <ParallaxImage
          src={radiologyBg3}
          alt="Medical Technology"
          height="55vh"
          overlay="rgba(11,26,52,0.38)"
        />
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", alignItems: "center",
          padding: "0 10%",
          direction: dir,
        }}>
          <div style={{ maxWidth: 480 }}>
            <ClipReveal>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.teal, marginBottom: 14 }}>
                {t.imaging.eyebrow}
              </p>
            </ClipReveal>
            <ClipReveal delay={0.12}>
              <h2 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 20 }}>
                {t.imaging.title}
              </h2>
            </ClipReveal>
            <motion.button className="btn btn-white"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setPage("booking")}
              style={{ fontSize: 15, padding: "13px 30px" }}
            >{t.hero.cta1}</motion.button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          7. SCROLL STACKING CARDS
      ══════════════════════════════════ */}
      <StackingCardsSection t={t} />


      {/* ══════════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.9} midScale={1.02} endScale={0.97}>
        <section style={{ background:C.bg, padding:"96px 0" }}>
          <div className="container">
            <SectionHeader eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} center />
            <div className="testimonial-grid">
              {t.testimonials.items.map((item, i) => (
                <motion.article key={item.name} custom={i} variants={scaleIn} initial="hidden" whileInView="visible"
                  viewport={{ once:true, margin:"-30px" }} whileHover={{ y:-8, scale:1.02 }}
                  transition={{ type:"spring", stiffness:280, damping:22 }} className="card testimonial-card">
                  <div style={{ fontSize:44, color:C.primaryLt, lineHeight:1, marginBottom:8, fontFamily:"serif" }}>"</div>
                  <p className="testimonial-quote">{item.quote}</p>
                  <div className="testimonial-meta">
                    <div className="testimonial-avatar">{item.name.slice(0,1)}</div>
                    <div><div className="testimonial-name">{item.name}</div><div className="testimonial-role">{item.role}</div></div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </ScrollZoomSection>

      {/* ══════════════════════════════════
          9. FAQ
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.9} midScale={1.02} endScale={0.98}>
        <section style={{ background:C.white, padding:"96px 0" }}>
          <div className="container">
            <div className="faq-layout">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
                <span style={{ display:"inline-block", fontSize:11, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:C.primary, marginBottom:12 }}>✦ {t.faq.eyebrow}</span>
                <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:900, fontFamily:"'Outfit',sans-serif", color:C.dark, lineHeight:1.1, marginBottom:14 }}>{t.faq.title}</h2>
                <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:28 }}>{t.faq.desc}</p>
                <motion.button className="btn btn-primary" whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }} onClick={() => setPage("contact")}>{t.faq.cta}</motion.button>
              </motion.div>
              <div onMouseLeave={() => setHoveredFaq(null)}>
                {t.faq.items.map(([q, a], i) => (
                  <motion.div key={q} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-20px" }}
                    onMouseEnter={() => setHoveredFaq(i)} style={{ borderTop:`1px solid ${C.border}`, padding:"20px 0" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                      <motion.div animate={{ color: hoveredFaq===i?C.primary:"rgba(31,107,255,0.28)" }}
                        style={{ fontSize:20, fontWeight:900, fontFamily:"'Outfit',sans-serif", lineHeight:1, flexShrink:0, minWidth:34 }}>
                        {String(i+1).padStart(2,"0")}
                      </motion.div>
                      <div>
                        <motion.h3 animate={{ color: hoveredFaq===i?C.dark:C.body }}
                          style={{ fontSize:16, fontWeight:700, marginBottom:8, transition:"color 0.25s" }}>{q}</motion.h3>
                        <p style={{ fontSize:14, color:C.muted, lineHeight:1.8 }}>{a}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div style={{ borderTop:`1px solid ${C.border}` }} />
              </div>
            </div>
          </div>
        </section>
      </ScrollZoomSection>

      {/* ══════════════════════════════════
          10. CTA RIBBON
      ══════════════════════════════════ */}
      <ScrollZoomSection startScale={0.94} midScale={1.02} endScale={0.99}>
        <div className="container cta-ribbon" style={{ paddingBottom:80 }}>
          <motion.div className="cta-ribbon-inner" initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7, ease:[0.22,0.74,0.2,1] }}>
            <div>
              <span>{t.cta.label}</span>
              <h3>{t.cta.title}</h3>
            </div>
            <div className="cta-ribbon-actions">
              <motion.button className="btn btn-white" whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }} onClick={() => setPage("booking")}>{t.cta.btn1}</motion.button>
              <motion.button className="btn" whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.97 }} onClick={() => setPage("services")}
                style={{ borderColor:"#fff", color:"#fff", border:"1.5px solid rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.08)" }}>{t.cta.btn2}</motion.button>
            </div>
          </motion.div>
        </div>
      </ScrollZoomSection>

    </div>
  );
}