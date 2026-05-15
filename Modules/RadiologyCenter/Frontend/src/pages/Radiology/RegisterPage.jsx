// src/pages/Radiology/RegisterPage.jsx
// No Firebase — stores patient account locally + backend API

import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaArrowRight } from "react-icons/fa";
import loginBg from "../../assets/register.png";

const RADIOLOGY_BASE = import.meta.env.VITE_RADIOLOGY_BASE_URL || "http://localhost:5301";
const API_URL = RADIOLOGY_BASE.endsWith("/api") ? RADIOLOGY_BASE : `${RADIOLOGY_BASE}/api`;

function getOrCreateRadId() {
  const stored = localStorage.getItem("radiologyPatientId");
  if (stored && stored.startsWith("RAD-")) return stored;
  const id = `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem("radiologyPatientId", id);
  return id;
}

export default function RegisterPage({ setPage, onLogin, showSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirm:"" });
  const [errors, setErrors] = useState({});

  const change = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]:"" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name  || form.name.trim().length < 2)  e.name    = "Name must be at least 2 characters";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password || form.password.length < 6)  e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm)              e.confirm  = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const radId = getOrCreateRadId();

    // Try backend registration
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name:form.name, email:form.email, phone:form.phone, password:form.password, radiologyPatientId:radId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) localStorage.setItem("authToken", data.token);
      }
    } catch { /* backend down — save locally */ }

    // Always save locally so login works even without backend
    const accounts = JSON.parse(localStorage.getItem("localPatientAccounts") || "[]");
    const exists = accounts.find(a => a.email === form.email);
    if (exists) {
      setErrors({ email: "An account with this email already exists." });
      setLoading(false);
      return;
    }
    accounts.push({ name:form.name, email:form.email, phone:form.phone, password:form.password, radId });
    localStorage.setItem("localPatientAccounts", JSON.stringify(accounts));

    // Persist session
    localStorage.setItem("radiologyPatientName",  form.name);
    localStorage.setItem("radiologyPatientEmail", form.email);
    localStorage.setItem("userEmail",             form.email);
    localStorage.setItem("radiologyPatientId",    radId);
    if (form.phone) localStorage.setItem("radiologyPatientPhone", form.phone);
    window.dispatchEvent(new Event("userDataUpdated"));

    onLogin?.({ name:form.name, email:form.email });
    showSuccess?.("Account created! Welcome.", "home");
    setLoading(false);
  };

  const inputStyle = (err) => ({
    width:"100%", padding:"12px 16px 12px 42px",
    border:`2px solid ${err?"#dc3545":"#e0e0e0"}`,
    borderRadius:12, fontSize:14, outline:"none", boxSizing:"border-box",
  });

  const fields = [
    { name:"name",     label:"Full Name",        type:"text",     Icon:FaUser,     ph:"Your full name" },
    { name:"email",    label:"Email Address",     type:"email",    Icon:FaEnvelope, ph:"you@email.com" },
    { name:"phone",    label:"Phone (optional)",  type:"tel",      Icon:FaPhone,    ph:"+20 1XX XXXX XXX", required:false },
    { name:"password", label:"Password",          type: showPassword?"text":"password", Icon:FaLock, ph:"At least 6 characters" },
    { name:"confirm",  label:"Confirm Password",  type:"password", Icon:FaLock,     ph:"Repeat password" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      backgroundImage:`url(${loginBg})`, backgroundSize:"cover", backgroundPosition:"center", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(11,26,52,0.7),rgba(31,107,255,0.5))" }}/>

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
        style={{ width:"100%", maxWidth:500, background:"white", borderRadius:24,
          boxShadow:"0 20px 60px rgba(0,0,0,0.3)", overflow:"hidden",
          position:"relative", zIndex:2, margin:"20px" }}>
        <div style={{ padding:"40px" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <h2 style={{ fontSize:26, fontWeight:800, color:"#0b1a34", marginBottom:6 }}>Create Account</h2>
            <p style={{ fontSize:13, color:"#6f86a3" }}>Join Nile Radiology Center</p>
          </div>

          <form onSubmit={handleSubmit}>
            {fields.map(({ name, label, type, Icon, ph, required=true }) => (
              <div key={name} style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#0b1a34", marginBottom:6 }}>
                  {label}{required && <span style={{ color:"#dc3545" }}> *</span>}
                </label>
                <div style={{ position:"relative" }}>
                  <Icon style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#adb5bd" }} size={15}/>
                  <input type={type} name={name} value={form[name]} onChange={change}
                    placeholder={ph} style={inputStyle(errors[name])}
                    onFocus={e=>e.target.style.borderColor="#1f6bff"}
                    onBlur={e=>{ if(!errors[name]) e.target.style.borderColor="#e0e0e0"; }}/>
                  {name==="password" && (
                    <button type="button" onClick={()=>setShowPassword(!showPassword)}
                      style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                        background:"none", border:"none", cursor:"pointer", color:"#adb5bd" }}>
                      {showPassword?<FaEyeSlash size={15}/>:<FaEye size={15}/>}
                    </button>
                  )}
                </div>
                {errors[name] && <span style={{ fontSize:11, color:"#dc3545", marginTop:3, display:"block" }}>{errors[name]}</span>}
              </div>
            ))}

            <motion.button type="submit" disabled={loading}
              whileHover={!loading?{scale:1.02}:{}} whileTap={!loading?{scale:0.98}:{}}
              style={{ width:"100%", padding:"14px",
                background:loading?"#a0b4d6":"linear-gradient(135deg,#1f6bff,#00b8a8)",
                color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                cursor:loading?"not-allowed":"pointer", marginTop:8,
                display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              {loading ? "Creating account…" : <><span>Create Account</span><FaArrowRight size={14}/></>}
            </motion.button>
          </form>

          <div style={{ textAlign:"center", marginTop:20 }}>
            <span style={{ fontSize:13, color:"#6f86a3" }}>Already have an account? </span>
            <span onClick={()=>setPage("login")} style={{ color:"#1f6bff", fontWeight:600, fontSize:13, cursor:"pointer" }}>Sign In</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}