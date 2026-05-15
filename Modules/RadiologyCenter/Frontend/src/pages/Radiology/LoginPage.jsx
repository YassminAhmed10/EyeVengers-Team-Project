// src/pages/Radiology/LoginPage.jsx
// No Firebase — simple local auth with backend API fallback

import { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaHospitalUser } from "react-icons/fa";
import loginBg from "../../assets/register.png";

const RADIOLOGY_BASE = import.meta.env.VITE_RADIOLOGY_BASE_URL || "http://localhost:5301";
const API_URL = RADIOLOGY_BASE.endsWith("/api") ? RADIOLOGY_BASE : `${RADIOLOGY_BASE}/api`;

// Generate RAD- patient ID and persist it
function getOrCreateRadId() {
  const stored = localStorage.getItem("radiologyPatientId");
  if (stored && stored.startsWith("RAD-")) return stored;
  const id = `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem("radiologyPatientId", id);
  return id;
}

export default function LoginPage({ setPage, onLogin, showSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const change = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // ── 1. Try admin login ─────────────────────────────────────────────────
    try {
      const res = await fetch(`${API_URL}/adminauth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          localStorage.setItem("radiologyAdminLoggedIn", "true");
          localStorage.setItem("radiologyAdminEmail", data.email || form.email);
          setLoading(false);
          setPage("admin-dashboard");
          return;
        }
      }
    } catch { /* backend down */ }

    // Hardcoded admin fallback (dev only)
    const ADMIN_ACCOUNTS = [
      { email: "yassmin@admin.com", password: "2392005" },
      { email: "admin@radiology.com", password: "admin123" },
    ];
    if (ADMIN_ACCOUNTS.some(a => a.email === form.email && a.password === form.password)) {
      localStorage.setItem("radiologyAdminLoggedIn", "true");
      localStorage.setItem("radiologyAdminEmail", form.email);
      setLoading(false);
      setPage("admin-dashboard");
      return;
    }

    // ── 2. Try patient login from backend ─────────────────────────────────
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token || data?.success) {
          const radId = data.radiologyPatientId || getOrCreateRadId();
          const name  = data.name || data.displayName || form.email.split("@")[0];
          persistPatient({ name, email: form.email, radId, token: data.token || "" });
          onLogin({ name, email: form.email });
          showSuccess?.("Welcome back!", "home");
          setLoading(false);
          return;
        }
      }
    } catch { /* backend down */ }

    // ── 3. Local patient account (stored on register) ─────────────────────
    const localAccounts = JSON.parse(localStorage.getItem("localPatientAccounts") || "[]");
    const match = localAccounts.find(a => a.email === form.email && a.password === form.password);
    if (match) {
      persistPatient({ name: match.name, email: match.email, radId: match.radId, token: "" });
      onLogin({ name: match.name, email: match.email });
      showSuccess?.("Welcome back!", "home");
      setLoading(false);
      return;
    }

    // ── 4. Fail ───────────────────────────────────────────────────────────
    setErrors({ password: "Invalid email or password. Please try again." });
    setLoading(false);
  };

  const persistPatient = ({ name, email, radId, token }) => {
    localStorage.setItem("radiologyPatientName", name);
    localStorage.setItem("radiologyPatientEmail", email);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("radiologyPatientId", radId);
    if (token) localStorage.setItem("authToken", token);
    window.dispatchEvent(new Event("userDataUpdated"));
  };

  const handleGuest = () => {
    const radId = getOrCreateRadId();
    persistPatient({ name: "Guest User", email: "", radId, token: "" });
    onLogin({ name: "Guest User", email: "" });
    setPage("home");
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      backgroundImage:`url(${loginBg})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(11,26,52,0.7),rgba(31,107,255,0.5))" }}/>

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
        style={{ width:"100%", maxWidth:480, background:"white", borderRadius:24,
          boxShadow:"0 20px 60px rgba(0,0,0,0.3)", overflow:"hidden",
          position:"relative", zIndex:2, margin:"20px" }}>
        <div style={{ padding:"48px 40px" }}>

          <div style={{ marginBottom:32, textAlign:"center" }}>
            <h2 style={{ fontSize:28, fontWeight:800, color:"#0b1a34", marginBottom:8 }}>Welcome Back</h2>
            <p style={{ fontSize:14, color:"#6f86a3" }}>Sign in to access your radiology records</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#0b1a34", marginBottom:8 }}>Email Address</label>
              <div style={{ position:"relative" }}>
                <FaEnvelope style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#adb5bd" }} size={16}/>
                <input type="email" name="email" value={form.email} onChange={change}
                  placeholder="you@email.com"
                  style={{ width:"100%", padding:"12px 16px 12px 42px",
                    border:`2px solid ${errors.email?"#dc3545":"#e0e0e0"}`,
                    borderRadius:12, fontSize:14, outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#1f6bff"}
                  onBlur={e=>{ if(!errors.email) e.target.style.borderColor="#e0e0e0"; }}/>
              </div>
              {errors.email && <span style={{ fontSize:11, color:"#dc3545", marginTop:4, display:"block" }}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#0b1a34", marginBottom:8 }}>Password</label>
              <div style={{ position:"relative" }}>
                <FaLock style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#adb5bd" }} size={16}/>
                <input type={showPassword?"text":"password"} name="password" value={form.password} onChange={change}
                  placeholder="Enter your password"
                  style={{ width:"100%", padding:"12px 45px 12px 42px",
                    border:`2px solid ${errors.password?"#dc3545":"#e0e0e0"}`,
                    borderRadius:12, fontSize:14, outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#1f6bff"}
                  onBlur={e=>{ if(!errors.password) e.target.style.borderColor="#e0e0e0"; }}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", color:"#adb5bd" }}>
                  {showPassword ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
                </button>
              </div>
              {errors.password && <span style={{ fontSize:11, color:"#dc3545", marginTop:4, display:"block" }}>{errors.password}</span>}
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={!loading?{scale:1.02,y:-2}:{}} whileTap={!loading?{scale:0.98}:{}}
              style={{ width:"100%", padding:"14px",
                background:loading?"#a0b4d6":"linear-gradient(135deg,#1f6bff,#00b8a8)",
                color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", gap:10, marginBottom:16 }}>
              {loading ? "Signing in…" : <><span>Sign In</span><FaArrowRight size={14}/></>}
            </motion.button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
              <div style={{ flex:1, height:1, background:"#e0e0e0" }}/>
              <span style={{ fontSize:12, color:"#adb5bd" }}>OR</span>
              <div style={{ flex:1, height:1, background:"#e0e0e0" }}/>
            </div>

            {/* Guest */}
            <motion.button type="button" onClick={handleGuest}
              whileHover={{scale:1.02}} whileTap={{scale:0.98}}
              style={{ width:"100%", padding:"14px", background:"white", color:"#1f6bff",
                border:"2px solid #1f6bff", borderRadius:12, fontSize:15, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                gap:10, marginBottom:20 }}>
              <FaHospitalUser size={16}/> Continue as Guest
            </motion.button>

            {/* Register link */}
            <div style={{ textAlign:"center" }}>
              <span style={{ fontSize:13, color:"#6f86a3" }}>Don't have an account? </span>
              <span onClick={()=>setPage("register")}
                style={{ color:"#1f6bff", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                Create Account
              </span>
            </div>
          </form>

          <div style={{ marginTop:28, paddingTop:20, borderTop:"1px solid #e0e0e0", textAlign:"center" }}>
            <p style={{ fontSize:11, color:"#adb5bd" }}>Nile Radiology Center • Secured</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}