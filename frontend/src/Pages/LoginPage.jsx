// src/Pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const GLOW_CSS = `
  @keyframes borderPulse {
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
  .glow-card {
    border: 2px solid rgba(160,210,255,0.60) !important;
    animation: borderPulse 3s ease-in-out infinite;
    transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.35s ease;
  }
  .glow-card:hover {
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
  .glow-input:hover, .glow-input:focus {
    border-color: rgba(255,255,255,0.75) !important;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.22),
                0 4px 20px rgba(80,140,255,0.25) !important;
    outline: none;
  }
  .glow-btn { transition: box-shadow 0.25s ease, transform 0.2s ease !important; }
  .glow-btn:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(120,180,255,0.7), 0 0 50px rgba(80,130,255,0.4),
                0 14px 44px rgba(59,95,240,0.85), 0 0 0 2px rgba(255,255,255,0.28) !important;
    transform: translateY(-3px) !important;
  }
  .role-bubble { transition: all 0.22s ease !important; }
  .role-bubble:hover {
    border-color: rgba(255,255,255,0.9) !important;
    background: rgba(255,255,255,0.26) !important;
    box-shadow: 0 0 0 4px rgba(255,255,255,0.18), 0 0 26px rgba(255,255,255,0.50) !important;
    transform: scale(1.10) translateY(-3px) !important;
  }
  .role-bubble.active {
    border-color: #fff !important;
    background: rgba(255,255,255,0.34) !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,0.22), 0 0 32px rgba(255,255,255,0.60),
                0 10px 30px rgba(0,0,0,0.22) !important;
    transform: scale(1.14) translateY(-5px) !important;
  }
`;

function InjectStyle() {
  useEffect(() => {
    const id = "glow-login-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = GLOW_CSS;
      document.head.appendChild(el);
    }
  }, []);
  return null;
}

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!role)               { setError("Please select your role before signing in."); return; }
    if (!email || !password) { setError("Please enter both email and password.");      return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5201/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ message: "Invalid email or password" }));
        setError(d.message || "Invalid email or password");
        setLoading(false); return;
      }
      const data = await res.json();
      if (data.user.role !== role) {
        setError(`This account is registered as ${data.user.role}, not ${role}`);
        setLoading(false); return;
      }
      localStorage.setItem("userRole",          data.user.role);
      localStorage.setItem("isAuthenticated",   "true");
      localStorage.setItem("authToken",         data.token);
      localStorage.setItem("userName",          data.user.username);
      localStorage.setItem("userEmail",         data.user.email);
      if (data.user.role === "Patient" && data.user.patientId) {
        localStorage.setItem("patientId",          data.user.patientId);
        localStorage.setItem("patientName",        data.user.username);
        localStorage.setItem("patientEmail",       data.user.email);
        localStorage.setItem("patientPhone",       data.user.phone || "");
        localStorage.setItem("patientDateOfBirth", data.user.dateOfBirth || "");
      }
      if      (data.user.role === "Doctor")       navigate("/doctor");
      else if (data.user.role === "Receptionist") navigate("/receptionist");
      else if (data.user.role === "Patient")      navigate("/patient");
    } catch (err) {
      setError(err.name === "TypeError" && err.message.includes("fetch")
        ? "Unable to connect to server." : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const roles = [
    { name: "Doctor",       icon: "/assets/doctorrICON.png" },
    { name: "Receptionist", icon: "/assets/receptionistICON.png" },
    { name: "Patient",      icon: "/assets/patientICON.png" },
  ];

  return (
    <div style={s.page}>
      <InjectStyle />
      <video autoPlay muted loop playsInline style={s.video}>
        <source src="/assets/videoBACKGRAOUND.mp4" type="video/mp4" />
      </video>
      <div style={s.vignette} />

      <div className="glow-card" style={s.card}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <img src="/src/images/logo.png" alt="Clinic" style={s.logoImg}
            onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
          <div style={s.logoFallback}><span style={{fontSize:"2.5rem"}}>👁️</span></div>
        </div>

        <h1 style={s.title}>Welcome Back!</h1>
        <p style={s.sub}>
          Don't have an account yet?&nbsp;
          <Link to="/signup" style={s.accentLink}>Sign Up</Link>
        </p>

        {/* Role bubbles */}
        <div style={s.roleRow}>
          {roles.map((r) => (
            <button key={r.name} title={r.name}
              onClick={() => setRole(r.name)}
              className={`role-bubble${role === r.name ? " active" : ""}`}
              style={s.roleBubble}>
              <img src={r.icon} alt={r.name}
                style={{ ...s.roleIcon, ...(role === r.name ? s.roleIconBright : {}) }}
                onError={(e) => { e.target.style.display="none"; }} />
            </button>
          ))}
        </div>
        {role && <p style={s.roleLabel}>{role}</p>}

        <div style={s.sep} />

        <div style={s.fieldWrap}>
          <label style={s.label}>Username</label>
          <input className="glow-input" type="email" placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={s.input} />
        </div>

        <div style={s.fieldWrap}>
          <label style={s.label}>Password</label>
          <input className="glow-input" type="password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={s.input} />
        </div>

        <div style={s.optRow}>
          <label style={s.checkLabel}>
            <input type="checkbox" style={{ marginRight:6 }} />
            Keep me logged in
          </label>
          <Link to="/forgot-password" style={s.accentLink}>Forgot Password?</Link>
        </div>

        {error && <div style={s.errBox}>{error}</div>}

        <button className="glow-btn" onClick={handleLogin} disabled={loading}
          style={{ ...s.loginBtn, opacity:loading?0.7:1, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Signing In…" : "Login"}
        </button>
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
    width:"100%", maxWidth:700,           /* was 560 */
    margin:"24px 16px",
    padding:"64px 80px 60px",             /* was 52px 60px 48px */
    borderRadius:36,
    background:"rgba(255,255,255,0.13)",
    backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
    display:"flex", flexDirection:"column", alignItems:"center",
  },

  /* Logo bigger too */
  logoWrap: {
    width:130, height:130, borderRadius:"50%",     /* was 110 */
    border:"3px solid rgba(255,255,255,0.8)",
    boxShadow:"0 8px 30px rgba(0,0,0,0.3), 0 0 0 8px rgba(255,255,255,0.08)",
    overflow:"hidden", marginBottom:26,
    background:"rgba(255,255,255,0.18)", position:"relative", flexShrink:0,
  },
  logoImg:     { width:"100%", height:"100%", objectFit:"cover", display:"block" },
  logoFallback:{ display:"none", width:"100%", height:"100%", position:"absolute",
    inset:0, alignItems:"center", justifyContent:"center" },

  title: { margin:0, fontSize:"2.6rem", fontWeight:800, color:"#fff",   /* was 2.2rem */
    letterSpacing:"-0.5px", textShadow:"0 2px 16px rgba(0,0,0,0.18)" },
  sub: { margin:"10px 0 26px", fontSize:"0.95rem", color:"rgba(255,255,255,0.82)", textAlign:"center" },
  accentLink: { color:"#fff", fontWeight:700, textDecoration:"underline", textUnderlineOffset:3 },

  roleRow: { display:"flex", gap:28, marginBottom:8 },          /* was gap:24 */
  roleBubble: {
    width:92, height:92, borderRadius:"50%",                    /* was 80 */
    border:"2px solid rgba(255,255,255,0.4)",
    background:"rgba(255,255,255,0.12)",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", padding:0, outline:"none",
  },
  roleIcon: {
    width:58, height:58, objectFit:"contain", pointerEvents:"none",  /* was 50 */
    filter:"brightness(0) invert(1)", opacity:0.75,
    transition:"opacity 0.2s, filter 0.2s",
  },
  roleIconBright: {
    opacity:1,
    filter:"brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,1))",
  },
  roleLabel: { margin:"6px 0 0", fontSize:"0.82rem", fontWeight:700,
    color:"rgba(255,255,255,0.75)", letterSpacing:1.5, textTransform:"uppercase" },

  sep: { width:"100%", height:1, background:"rgba(255,255,255,0.2)", margin:"26px 0 8px" },

  fieldWrap: { width:"100%", marginTop:20 },                    /* was 18 */
  label: { display:"block", fontSize:"0.88rem", fontWeight:700,  /* was 0.82rem */
    color:"rgba(255,255,255,0.85)", marginBottom:9, letterSpacing:0.3 },
  input: {
    width:"100%", padding:"16px 20px", borderRadius:16,          /* was 14px 18px / r14 */
    border:"1.5px solid rgba(255,255,255,0.22)",
    background:"rgba(255,255,255,0.88)",
    fontSize:"1.05rem", color:"#12183a", fontFamily:"inherit",
    boxSizing:"border-box", boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
    transition:"box-shadow 0.25s, border-color 0.25s",
  },

  optRow: { width:"100%", display:"flex", justifyContent:"space-between",
    alignItems:"center", marginTop:18 },
  checkLabel: { display:"flex", alignItems:"center", fontSize:"0.88rem",
    color:"rgba(255,255,255,0.75)", cursor:"pointer", userSelect:"none" },

  errBox: {
    width:"100%", marginTop:16, padding:"13px 18px", borderRadius:12,
    background:"rgba(220,38,38,0.75)", backdropFilter:"blur(8px)",
    color:"#fff", fontSize:"0.88rem", fontWeight:500, textAlign:"center", boxSizing:"border-box",
  },
  loginBtn: {
    width:"100%", marginTop:26, padding:"18px",                  /* was 22 / 16px */
    borderRadius:16, border:"1.5px solid rgba(255,255,255,0.3)",
    background:"linear-gradient(135deg, #5b9bf8 0%, #3a57ef 100%)",
    color:"#fff", fontSize:"1.2rem", fontWeight:700, letterSpacing:0.6,  /* was 1.1rem */
    fontFamily:"inherit", boxShadow:"0 8px 28px rgba(59,95,240,0.5)",
  },
};