// src/pages/Radiology/LoginPage.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaArrowRight, FaHospitalUser, FaMobileAlt, FaIdCard
} from "react-icons/fa";
import loginBg from "../../assets/register.png";
import { loginUser } from "../../firebase/auth";

export default function LoginPage({ setPage, onLogin, showSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", patientId: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (loginMethod === "email" && !formData.email) newErrors.email = "Email is required";
    else if (loginMethod === "phone" && !formData.phone) newErrors.phone = "Phone number is required";
    else if (loginMethod === "patientId" && !formData.patientId) newErrors.patientId = "Patient ID is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (loginMethod !== "email") {
      setErrors({ [loginMethod]: "Only email login is supported currently" });
      return;
    }

    setLoading(true);
    const result = await loginUser(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      const firstName = result.userData?.firstName || "";
      const lastName  = result.userData?.lastName  || "";
      const fullName  = firstName && lastName
        ? `${firstName} ${lastName}`
        : result.user.displayName || result.user.email.split("@")[0];
      const uid = result.user.uid;

      localStorage.setItem("firebaseToken", result.token);
      localStorage.setItem("userRole", result.userData?.role || "patient");
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", result.user.email);
      localStorage.setItem("userId", uid);
      localStorage.setItem("radiologyPatientName", fullName);
      localStorage.setItem("radiologyPatientFirstName", firstName);
      localStorage.setItem("radiologyPatientLastName", lastName);
      localStorage.setItem("radiologyPatientId", uid);
      localStorage.setItem("radiologyPatientEmail", result.user.email);

      window.dispatchEvent(new Event("userDataUpdated"));
      onLogin({ name: fullName, firstName: firstName, lastName: lastName, id: uid, email: result.user.email });
      showSuccess("Welcome Back!", "home");
    } else {
      if (result.code === "auth/user-not-found" || result.code === "auth/invalid-credential") {
        setErrors({ email: result.error });
      } else if (result.code === "auth/wrong-password") {
        setErrors({ password: result.error });
      } else if (result.code === "auth/too-many-requests") {
        setErrors({ password: result.error });
      } else {
        setErrors({ password: result.error });
      }
    }
  };

  const fadeRight = { 
    hidden: { opacity: 0, x: 50 }, 
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } } 
  };

  const loginMethods = [
    { id: "email",     label: "Email",      icon: <FaEnvelope />,  placeholder: "your@email.com"    },
    { id: "phone",     label: "Phone",      icon: <FaMobileAlt />, placeholder: "+20 123 456 7890"  },
    { id: "patientId", label: "Patient ID", icon: <FaIdCard />,    placeholder: "PAT-2024-XXXX"     },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundImage: `url(${loginBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative",
    }}>
      {/* Dark overlay */}
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(135deg, rgba(11,26,52,0.7), rgba(31,107,255,0.5))" 
      }} />

      {/* Form Card - Centered on top of image */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={fadeRight} 
        style={{
          width: "100%",
          maxWidth: 480,
          background: "white",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          margin: "20px",
        }}
      >
        <div style={{ padding: "48px 40px" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0b1a34", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: 14, color: "#6f86a3" }}>
              Sign in to access your medical records and results
            </p>
          </div>

          {/* Login method tabs */}
          <div style={{ display: "flex", gap: 10, background: "#f8fafc", padding: 6, borderRadius: 60, marginBottom: 28 }}>
            {loginMethods.map((method) => (
              <motion.button 
                key={method.id} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setLoginMethod(method.id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 12px",
                  background: loginMethod === method.id ? "linear-gradient(135deg, #1f6bff, #00b8a8)" : "transparent",
                  color: loginMethod === method.id ? "white" : "#6f86a3",
                  border: "none", borderRadius: 50, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s ease",
                }}>
                {method.icon}{method.label}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Identifier field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0b1a34", marginBottom: 8 }}>
                {loginMethod === "email" ? "Email Address" : loginMethod === "phone" ? "Phone Number" : "Patient ID"}
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#adb5bd" }}>
                  {loginMethod === "email" ? <FaEnvelope size={16} /> : loginMethod === "phone" ? <FaMobileAlt size={16} /> : <FaIdCard size={16} />}
                </div>
                <input 
                  type={loginMethod === "email" ? "email" : "text"}
                  name={loginMethod} 
                  value={formData[loginMethod]} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", padding: "12px 16px 12px 42px", 
                    border: `2px solid ${errors[loginMethod] ? "#dc3545" : "#e0e0e0"}`, 
                    borderRadius: 12, fontSize: 14, outline: "none", 
                    transition: "all 0.2s ease", boxSizing: "border-box" 
                  }}
                  placeholder={loginMethods.find(m => m.id === loginMethod).placeholder}
                  onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                  onBlur={(e) => { if (!errors[loginMethod]) e.target.style.borderColor = "#e0e0e0"; }}
                />
              </div>
              {errors[loginMethod] && <span style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors[loginMethod]}</span>}
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0b1a34", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#adb5bd" }}>
                  <FaLock size={16} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  style={{ 
                    width: "100%", padding: "12px 45px 12px 42px", 
                    border: `2px solid ${errors.password ? "#dc3545" : "#e0e0e0"}`, 
                    borderRadius: 12, fontSize: 14, outline: "none", 
                    transition: "all 0.2s ease", boxSizing: "border-box" 
                  }}
                  placeholder="Enter your password"
                  onFocus={(e) => e.target.style.borderColor = "#1f6bff"}
                  onBlur={(e) => { if (!errors.password) e.target.style.borderColor = "#e0e0e0"; }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", 
                    background: "none", border: "none", cursor: "pointer", color: "#adb5bd" 
                  }}>
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.password}</span>}
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginBottom: 28 }}>
              <motion.a 
                whileHover={{ color: "#1f6bff" }}
                onClick={() => alert("Password reset link sent to your email")}
                style={{ fontSize: 12, color: "#6f86a3", cursor: "pointer", textDecoration: "none" }}>
                Forgot Password?
              </motion.a>
            </div>

            {/* Sign In button */}
            <motion.button 
              type="submit"
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "#a0b4d6" : "linear-gradient(135deg, #1f6bff, #00b8a8)",
                color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, marginBottom: 20, transition: "all 0.3s ease",
              }}>
              {loading ? (
                <>
                  <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Signing In...
                </>
              ) : (<>Sign In <FaArrowRight size={14} /></>)}
            </motion.button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* OR divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              <span style={{ fontSize: 12, color: "#adb5bd" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
            </div>

            {/* Guest button */}
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              type="button"
              onClick={() => {
                localStorage.setItem("radiologyPatientName", "Guest User");
                localStorage.setItem("radiologyPatientId", "guest");
                window.dispatchEvent(new Event("userDataUpdated"));
                onLogin({ name: "Guest User", id: "guest", email: "" });
                setPage("results");
              }}
              style={{
                width: "100%", padding: "14px", background: "white", color: "#1f6bff",
                border: "2px solid #1f6bff", borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, marginBottom: 20, transition: "all 0.3s ease",
              }}>
              <FaHospitalUser size={16} />
              Continue as Guest
            </motion.button>

            {/* Register link */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#6f86a3" }}>Don't have an account? </span>
              <motion.a 
                whileHover={{ color: "#1f6bff" }} 
                onClick={() => setPage("register")}
                style={{ color: "#1f6bff", fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
                Create Account
              </motion.a>
            </div>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #e0e0e0", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#adb5bd" }}>Secured by Nile Radiology Center • HIPAA Compliant</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}