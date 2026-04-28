import ScrollCards from './ScrollCards';
import { CirclePlus, FileText, Calendar, Eye, Activity, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';

const BLUE    = '#2563eb';
const BLUE_DK = '#1d4ed8';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';
const BORDER  = 'rgba(255,255,255,0.16)';

const SCAN_TYPES = [
  { id: 1, label: 'OCT Retina',             category: 'RETINAL IMAGING',  img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', desc: 'High-resolution cross-section of retinal layers' },
  { id: 2, label: 'OCT Optic Nerve',         category: 'NERVE ANALYSIS',   img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80', desc: 'Structural assessment of the optic nerve head' },
  { id: 3, label: 'Fundus Photography',       category: 'FUNDOSCOPY',       img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80', desc: 'Wide-field digital retinal photography' },
  { id: 4, label: 'Corneal Topography',       category: 'TOPOGRAPHY',       img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=400&q=80', desc: 'Detailed curvature mapping of the corneal surface' },
  { id: 5, label: 'B-Scan Ocular Ultrasound', category: 'ULTRASONOGRAPHY', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80', desc: '2D cross-sectional imaging of the posterior segment' },
  { id: 6, label: 'Fluorescein Angiography',  category: 'ANGIOGRAPHY',      img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80', desc: 'Dynamic blood-flow assessment of retinal vessels' },
];

function useCountUp(target, duration = 1100, active = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return v;
}

function StatPill({ value, label, icon: Icon, delay }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const count = useCountUp(value, 1000, vis);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 0.74, 0.2, 1] }}
      whileHover={{ scale: 1.06, transition: { duration: 0.18 } }}
      style={{
        flex: '1 1 110px',
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: '16px 18px',
      }}
    >
      <Icon size={15} color="rgba(255,255,255,0.45)" style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 28, fontWeight: 900, color: WHITE, lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{count}</div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 4, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
    </motion.div>
  );
}

function ScanRow({ scan, index, isActive, onEnter, onLeave, onBook }) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <motion.div
      onMouseEnter={() => onEnter(scan.id)}
      onMouseLeave={onLeave}
      onClick={() => onBook(scan)}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        borderTop: `1px solid ${BORDER}`,
        padding: '0 40px',
        cursor: 'pointer',
        overflow: 'hidden',
        minHeight: 96,
        transition: 'background 0.28s ease',
        background: isActive ? 'rgba(255,255,255,0.055)' : 'transparent',
      }}
    >
      <motion.div
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.74, 0.2, 1] }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(37,99,235,0.18)', transformOrigin: 'left', zIndex: 0 }}
      />

      {/* Big outlined number */}
      <div style={{
        position: 'relative', zIndex: 1,
        fontSize: 'clamp(50px, 7vw, 78px)',
        fontWeight: 900,
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1,
        width: 116,
        flexShrink: 0,
        color: 'transparent',
        WebkitTextStroke: isActive ? `2px ${WHITE}` : `2px rgba(255,255,255,0.28)`,
        transition: 'WebkitTextStroke 0.28s ease',
        userSelect: 'none',
        letterSpacing: '-0.02em',
      }}>
        {num}
      </div>

      {/* Thumbnail */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="thumb"
            initial={{ opacity: 0, width: 0, marginRight: 0 }}
            animate={{ opacity: 1, width: 116, marginRight: 28 }}
            exit={{ opacity: 0, width: 0, marginRight: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 0.74, 0.2, 1] }}
            style={{ position: 'relative', zIndex: 1, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}
          >
            <img src={scan.img} alt={scan.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: 5, transition: 'color 0.25s' }}>
          {scan.category}
        </p>
        <h3 style={{
          fontSize: 'clamp(22px, 3.5vw, 40px)',
          fontWeight: 900,
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: isActive ? WHITE : 'transparent',
          WebkitTextStroke: isActive ? '0px' : `1.5px rgba(255,255,255,0.55)`,
          transition: 'all 0.28s ease',
        }}>
          {scan.label}
        </h3>
      </div>

      {/* Arrow */}
      <motion.div
        animate={{ x: isActive ? 0 : 14, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
      >
        <div style={{ width: 42, height: 42, background: WHITE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={17} color={BLUE} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function AppointmentRow({ appt, index, isActive, onEnter, onLeave }) {
  const num = String(index + 1).padStart(2, '0');
  const statusMap = { Confirmed: '#22d3ee', Pending: '#fbbf24', Completed: '#34d399', Cancelled: '#f87171' };
  const status = appt.status || 'Confirmed';
  const color  = statusMap[status] || '#22d3ee';
  return (
    <motion.div
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center',
        borderTop: `1px solid ${BORDER}`,
        padding: '0 40px',
        overflow: 'hidden',
        minHeight: 86,
        background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.28s ease',
      }}
    >
      <motion.div
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.38, ease: [0.22, 0.74, 0.2, 1] }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(37,99,235,0.14)', transformOrigin: 'left', zIndex: 0 }}
      />
      <div style={{
        position: 'relative', zIndex: 1,
        fontSize: 'clamp(42px, 6vw, 66px)',
        fontWeight: 900, fontFamily: "'Outfit', sans-serif",
        color: 'transparent',
        WebkitTextStroke: isActive ? `1.5px ${WHITE}` : `1.5px rgba(255,255,255,0.22)`,
        width: 116, flexShrink: 0, lineHeight: 1,
        transition: 'all 0.28s ease', userSelect: 'none',
      }}>{num}</div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', marginBottom: 4 }}>
          {appt.doctorName || 'Eye Clinic'}
        </p>
        <h3 style={{
          fontSize: 'clamp(18px, 2.8vw, 30px)',
          fontWeight: 900, fontFamily: "'Outfit', sans-serif",
          color: isActive ? WHITE : 'transparent',
          WebkitTextStroke: isActive ? '0px' : `1.2px rgba(255,255,255,0.5)`,
          transition: 'all 0.28s ease',
          lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          {appt.scanType || appt.procedureName || 'Eye Examination'}
        </h3>
      </div>
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 50, color, marginBottom: 4 }}>
          {status}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          {appt.appointmentDate
            ? new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Upcoming'}
        </div>
      </div>
    </motion.div>
  );
}

export function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState('scans');
  const [hoveredScan,  setHoveredScan]  = useState(null);
  const [hoveredAppt,  setHoveredAppt]  = useState(null);
  const [bookedScan,   setBookedScan]   = useState(null);

  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: wrapRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const patientId    = localStorage.getItem('patientId')   || 'PT-00412';
  const fallbackName = localStorage.getItem('patientName') || localStorage.getItem('userName') || 'Alex Rivera';

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res  = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${encodeURIComponent(patientId)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (ok) setAppointments(Array.isArray(data) ? data : []);
      } catch {
        if (ok) setError('Unable to sync with Eye Clinic data right now.');
      } finally {
        if (ok) setIsLoading(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  const patientName = appointments[0]?.patientName || fallbackName;
  const initials    = patientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const TABS = [{ id: 'scans', label: 'Scan Types' }, { id: 'appointments', label: 'Appointments' }];

  if (isLoading) return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUE }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.18)', borderTopColor: WHITE }} />
    </div>
  );

  return (
    <div ref={wrapRef} style={{ background: BLUE, minHeight: '100vh', fontFamily: "'Cairo','Outfit',sans-serif", position: 'relative', overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Scroll progress */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: WHITE, scaleX, transformOrigin: '0%', opacity: 0.65 }} />

      {/* Diagonal geometric bg */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '18%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg viewBox="0 0 200 800" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <polygon points="200,0 200,800 40,800 120,0" fill="rgba(255,255,255,0.032)" />
          <polygon points="200,0 200,800 90,800 170,0" fill="rgba(255,255,255,0.022)" />
        </svg>
      </div>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '52px 40px 44px' }}>

        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.13)', border: `1.5px solid rgba(255,255,255,0.32)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: WHITE }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 2 }}>Patient Portal</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>{patientName} <span style={{ fontSize: 11, color: MUTED, fontWeight: 400 }}>· {patientId}</span></p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(255,255,255,0.10)', border: `1px solid rgba(255,255,255,0.32)`, borderRadius: 50, fontSize: 12, fontWeight: 800, color: WHITE, cursor: 'pointer' }}>
            <CirclePlus size={14} /> Book Scan
          </motion.button>
        </motion.div>

        {/* Display heading */}
        <motion.div initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 0.74, 0.2, 1] }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', marginBottom: 10 }}>✦ Eye Radiology Center</p>
          <h1 style={{ fontSize: 'clamp(42px, 8vw, 86px)', fontWeight: 900, lineHeight: 0.97, letterSpacing: '-0.03em', fontFamily: "'Outfit',sans-serif", marginBottom: 16 }}>
            <span style={{ color: WHITE }}>Your Eye</span><br />
            <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.52)' }}>Dashboard</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)', maxWidth: 420, lineHeight: 1.65 }}>
            Book scans, track appointments, and access radiology reports — all in one place.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32 }}>
          <StatPill icon={Calendar} value={appointments.length || 8} label="Appointments" delay={0.28} />
          <StatPill icon={Activity} value={5}  label="Scans done"    delay={0.36} />
          <StatPill icon={FileText} value={3}  label="Reports"       delay={0.44} />
          <StatPill icon={Eye}      value={6}  label="Scan types"    delay={0.52} />
        </motion.div>
      </div>

      {/* ── TABS ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 40px', display: 'flex', gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '9px 22px',
            border: `1px solid`,
            borderColor: activeTab === t.id ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)',
            borderBottom: 'none',
            borderRadius: '10px 10px 0 0',
            background: activeTab === t.id ? 'rgba(255,255,255,0.09)' : 'transparent',
            color: activeTab === t.id ? WHITE : MUTED,
            fontSize: 11, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.22s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── LIST ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.38, ease: [0.22, 0.74, 0.2, 1] }}
          style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: '0 12px 12px 12px', backdropFilter: 'blur(8px)', marginBottom: 48 }}
        >
          <div style={{ padding: '26px 40px 22px', borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 5 }}>
              — {activeTab === 'scans' ? 'Available Procedures' : 'Your Schedule'}
            </p>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 30px)', fontWeight: 900, color: WHITE, fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.02em' }}>
              {activeTab === 'scans' ? 'Eye Scan Types' : 'Appointments'}
            </h2>
          </div>

          {activeTab === 'scans' && SCAN_TYPES.map((scan, i) => (
            <ScanRow key={scan.id} scan={scan} index={i}
              isActive={hoveredScan === scan.id}
              onEnter={setHoveredScan}
              onLeave={() => setHoveredScan(null)}
              onBook={setBookedScan}
            />
          ))}

          {activeTab === 'appointments' && (
            appointments.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '60px 40px', textAlign: 'center' }}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: 44, marginBottom: 16 }}>📅</motion.div>
                <p style={{ fontSize: 17, fontWeight: 700, color: WHITE, marginBottom: 8 }}>No appointments yet</p>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 22 }}>Book a scan to get started</p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab('scans')}
                  style={{ padding: '11px 26px', background: WHITE, border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 800, color: BLUE, cursor: 'pointer' }}>
                  Browse Scan Types
                </motion.button>
              </motion.div>
            ) : appointments.map((a, i) => (
              <AppointmentRow key={i} appt={a} index={i}
                isActive={hoveredAppt === i}
                onEnter={setHoveredAppt}
                onLeave={() => setHoveredAppt(null)}
              />
            ))
          )}

          <div style={{ borderTop: `1px solid ${BORDER}`, height: 0 }} />
        </motion.div>
      </AnimatePresence>

      {/* ── BOOKING MODAL ── */}
      <AnimatePresence>
        {bookedScan && (
          <motion.div key="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBookedScan(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div key="modal"
              initial={{ scale: 0.88, opacity: 0, y: 36 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={e => e.stopPropagation()}
              style={{ background: BLUE_DK, border: `1px solid rgba(255,255,255,0.22)`, borderRadius: 24, padding: '36px 32px', maxWidth: 400, width: '100%', position: 'relative' }}>
              <button onClick={() => setBookedScan(null)}
                style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: WHITE, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 8 }}>{bookedScan.category}</p>
              <h3 style={{ fontSize: 26, fontWeight: 900, color: WHITE, fontFamily: "'Outfit',sans-serif", marginBottom: 8, letterSpacing: '-0.02em' }}>{bookedScan.label}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', marginBottom: 24, lineHeight: 1.65 }}>{bookedScan.desc}</p>
              <img src={bookedScan.img} alt={bookedScan.label} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }} />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: '13px', background: WHITE, border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, color: BLUE, cursor: 'pointer' }}>
                Confirm Booking
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 48 }} />

      {/* ── SCROLL STACKING CARDS ── */}
      <ScrollCards
        eyebrow="Our Services"
        title="Why Choose Nile Radiology?"
        subtitle="A unique blend of advanced technology and human care"
      />
    </div>
  );
}