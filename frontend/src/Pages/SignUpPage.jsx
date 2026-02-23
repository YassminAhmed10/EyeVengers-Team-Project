// src/Pages/SignUpPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const GLOW_CSS = `
  @keyframes borderPulseSU {
    0%   { box-shadow: 0 0 10px 2px rgba(120,180,255,0.45),
                       0 0 30px 6px rgba(80,140,255,0.25),
                       0 40px 80px rgba(0,0,0,0.30),
                       inset 0 1px 0 rgba(255,255,255,0.30); }
    50%  { box-shadow: 0 0 22px 6px rgba(160,210,255,0.70),
                       0 0 55px 14px rgba(100,160,255,0.40),
                       0 40px 80px rgba(0,0,0,0.30),
                       inset 0 1px 0 rgba(255,255,255,0.35); }
    100% { box-shadow: 0 0 10px 2px rgba(120,180,255,0.45),
                       0 0 30px 6px rgba(80,140,255,0.25),
                       0 40px 80px rgba(0,0,0,0.30),
                       inset 0 1px 0 rgba(255,255,255,0.30); }
  }
  .glow-card-su {
    border: 2px solid rgba(160,210,255,0.60) !important;
    animation: borderPulseSU 3s ease-in-out infinite;
    transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.35s ease;
  }
  .glow-card-su:hover {
    border-color: rgba(220,240,255,0.95) !important;
    box-shadow:
      0 0 18px 5px  rgba(180,220,255,0.85),
      0 0 60px 18px rgba(100,170,255,0.55),
      0 0 110px 30px rgba(60,120,255,0.28),
      0 40px 80px rgba(0,0,0,0.32),
      inset 0 1px 0 rgba(255,255,255,0.40) !important;
    transform: translateY(-5px);
    animation-play-state: paused;
  }
  .glow-input-su:hover, .glow-input-su:focus {
    border-color: rgba(255,255,255,0.75) !important;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.22),
                0 4px 20px rgba(80,140,255,0.25) !important;
    outline: none;
  }
  .glow-btn-su { transition: box-shadow 0.25s ease, transform 0.2s ease !important; }
  .glow-btn-su:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(120,180,255,0.7), 0 0 50px rgba(80,130,255,0.4),
                0 14px 44px rgba(59,95,240,0.85), 0 0 0 2px rgba(255,255,255,0.28) !important;
    transform: translateY(-3px) !important;
  }
  .patient-badge-su { transition: all 0.25s ease; }
  .patient-badge-su:hover {
    background: rgba(255,255,255,0.25) !important;
    border-color: rgba(255,255,255,0.75) !important;
    box-shadow: 0 0 18px rgba(255,255,255,0.30);
    transform: scale(1.04);
  }
`;

function InjectStyle() {
  useEffect(() => {
    const id = "glow-signup-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = GLOW_CSS;
      document.head.appendChild(el);
    }
  }, []);
  return null;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName:"", email:"", password:"", confirmPassword:"", phone:"", dateOfBirth:"",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (!formData.fullName || !formData.email || !formData.password) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:5201/api/Auth/register", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username:formData.fullName, email:formData.email, passwordHash:formData.password, role:"Patient" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); setLoading(false); return; }
      localStorage.setItem("userRole","Patient");
      localStorage.setItem("userName",formData.fullName);
      localStorage.setItem("userEmail",formData.email);
      localStorage.setItem("patientName",formData.fullName);
      localStorage.setItem("patientEmail",formData.email);
      localStorage.setItem("patientPhone",formData.phone);
      localStorage.setItem("patientDateOfBirth",formData.dateOfBirth);
      if (data.patientId) localStorage.setItem("patientId",data.patientId);
      alert("Account created successfully! Please login with your credentials.");
      navigate("/login");
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <InjectStyle />
      <video autoPlay muted loop playsInline style={s.video}>
        <source src="/assets/videoBACKGRAOUND.mp4" type="video/mp4" />
      </video>
      <div style={s.vignette} />

      <div className="glow-card-su" style={s.card}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <img src="/src/images/logo.png" alt="Clinic" style={s.logoImg}
            onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
          <div style={s.logoFallback}><span style={{fontSize:"2.5rem"}}>👁️</span></div>
        </div>

        <h1 style={s.title}>Create Account</h1>
        <p style={s.sub}>
          Already have an account?&nbsp;
          <Link to="/login" style={s.accentLink}>Sign In</Link>
        </p>

        <div className="patient-badge-su" style={s.roleBadge}>
          <img src="/assets/patientICON.png" alt="Patient" style={s.badgeIcon}
            onError={(e) => { e.target.style.display="none"; }} />
          Registering as a&nbsp;<strong style={{color:"#fff"}}>Patient</strong>
        </div>

        <div style={s.sep} />

        <form onSubmit={handleSignUp} style={{ width:"100%" }}>

          <div style={s.fieldWrap}>
            <label style={s.label}>Full Name *</label>
            <input className="glow-input-su" type="text" name="fullName"
              placeholder="Enter your full name" value={formData.fullName}
              onChange={handleChange} required style={s.input} />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Email Address *</label>
            <input className="glow-input-su" type="email" name="email"
              placeholder="Enter your email" value={formData.email}
              onChange={handleChange} required style={s.input} />
          </div>

          <div style={s.row}>
            <div style={{ ...s.fieldWrap, flex:1 }}>
              <label style={s.label}>Phone Number</label>
              <input className="glow-input-su" type="tel" name="phone"
                placeholder="Enter your phone" value={formData.phone}
                onChange={handleChange} style={s.input} />
            </div>
            <div style={{ ...s.fieldWrap, flex:1 }}>
              <label style={s.label}>Date of Birth</label>
              <input className="glow-input-su" type="date" name="dateOfBirth"
                value={formData.dateOfBirth} onChange={handleChange} style={s.input} />
            </div>
          </div>

          <div style={s.row}>
            <div style={{ ...s.fieldWrap, flex:1 }}>
              <label style={s.label}>Password *</label>
              <input className="glow-input-su" type="password" name="password"
                placeholder="Create password" value={formData.password}
                onChange={handleChange} required style={s.input} />
            </div>
            <div style={{ ...s.fieldWrap, flex:1 }}>
              <label style={s.label}>Confirm Password *</label>
              <input className="glow-input-su" type="password" name="confirmPassword"
                placeholder="Confirm password" value={formData.confirmPassword}
                onChange={handleChange} required style={s.input} />
            </div>
          </div>

          {error && <div style={s.errBox}>{error}</div>}

          <button className="glow-btn-su" type="submit" disabled={loading}
            style={{ ...s.submitBtn, opacity:loading?0.7:1, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "Creating Account…" : "Create Account  →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'Segoe UI', system-ui, sans-serif", position:"relative", overflow:"hidden",
  },
  video: { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 },
  vignette: {
    position:"absolute", inset:0,
    background:"radial-gradient(ellipse at 60% 40%, rgba(30,80,200,0.22) 0%, rgba(8,20,80,0.52) 100%)",
    zIndex:1,
  },

  /* ── Card: much bigger ── */
  card: {
    position:"relative", zIndex:2,
    width:"100%", maxWidth:780,           /* was 640 */
    margin:"24px 16px",
    padding:"64px 90px 60px",            /* was 52px 64px 48px */
    borderRadius:36,
    background:"rgba(255,255,255,0.13)",
    backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
    display:"flex", flexDirection:"column", alignItems:"center",
  },

  logoWrap: {
    width:130, height:130, borderRadius:"50%",
    border:"3px solid rgba(255,255,255,0.8)",
    boxShadow:"0 8px 30px rgba(0,0,0,0.3), 0 0 0 8px rgba(255,255,255,0.08)",
    overflow:"hidden", marginBottom:24,
    background:"rgba(255,255,255,0.18)", position:"relative", flexShrink:0,
  },
  logoImg:     { width:"100%", height:"100%", objectFit:"cover", display:"block" },
  logoFallback:{ display:"none", width:"100%", height:"100%", position:"absolute",
    inset:0, alignItems:"center", justifyContent:"center" },

  title: { margin:0, fontSize:"2.6rem", fontWeight:800, color:"#fff",
    letterSpacing:"-0.5px", textShadow:"0 2px 16px rgba(0,0,0,0.18)" },
  sub: { margin:"10px 0 16px", fontSize:"0.95rem", color:"rgba(255,255,255,0.82)", textAlign:"center" },
  accentLink: { color:"#fff", fontWeight:700, textDecoration:"underline", textUnderlineOffset:3 },

  roleBadge: {
    display:"flex", alignItems:"center", gap:12,
    padding:"12px 28px", borderRadius:50,
    background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.35)",
    color:"rgba(255,255,255,0.85)", fontSize:"1rem", fontWeight:500,
    marginBottom:4, cursor:"default",
  },
  badgeIcon: { width:32, height:32, objectFit:"contain", filter:"brightness(0) invert(1)", opacity:0.9 },

  sep: { width:"100%", height:1, background:"rgba(255,255,255,0.2)", margin:"20px 0 6px" },

  fieldWrap: { width:"100%", marginTop:18, boxSizing:"border-box" },
  row: { display:"flex", gap:20, width:"100%" },
  label: { display:"block", fontSize:"0.88rem", fontWeight:700,
    color:"rgba(255,255,255,0.85)", marginBottom:9, letterSpacing:0.3 },
  input: {
    width:"100%", padding:"16px 20px", borderRadius:16,
    border:"1.5px solid rgba(255,255,255,0.22)",
    background:"rgba(255,255,255,0.88)",
    fontSize:"1.05rem", color:"#12183a", fontFamily:"inherit",
    boxSizing:"border-box", boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
    transition:"box-shadow 0.25s, border-color 0.25s",
  },
  errBox: {
    width:"100%", marginTop:16, padding:"13px 18px", borderRadius:12,
    background:"rgba(220,38,38,0.75)", backdropFilter:"blur(8px)",
    color:"#fff", fontSize:"0.88rem", fontWeight:500, textAlign:"center", boxSizing:"border-box",
  },
  submitBtn: {
    width:"100%", marginTop:26, padding:"18px", borderRadius:16,
    border:"1.5px solid rgba(255,255,255,0.3)",
    background:"linear-gradient(135deg, #5b9bf8 0%, #3a57ef 100%)",
    color:"#fff", fontSize:"1.2rem", fontWeight:700, letterSpacing:0.6,
    fontFamily:"inherit", boxShadow:"0 8px 28px rgba(59,95,240,0.5)",
  },
};