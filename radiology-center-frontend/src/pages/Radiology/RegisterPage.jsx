// src/pages/Radiology/RegisterPage.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUserPlus, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft, FaUser } from "react-icons/fa";
import ScanIcon from "../../components/Radiology/ScanIcon";
import registerBg from "../../assets/register.png";
import { registerUser } from "../../firebase/auth";

export default function RegisterPage({ setPage, onLogin, showSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    return () => { document.body.style.margin = ""; document.body.style.padding = ""; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.phone))
      newErrors.phone = "Phone number is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const result = await registerUser(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role: "patient",
    });

    setLoading(false);

    if (result.success) {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const uid = result.user.uid;

      localStorage.setItem("firebaseToken", result.token);
      localStorage.setItem("userRole", "patient");
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userId", uid);
      localStorage.setItem("radiologyPatientName", fullName);
      localStorage.setItem("radiologyPatientFirstName", formData.firstName);
      localStorage.setItem("radiologyPatientLastName", formData.lastName);
      localStorage.setItem("radiologyPatientId", uid);
      localStorage.setItem("radiologyPatientEmail", formData.email);

      window.dispatchEvent(new Event("userDataUpdated"));
      onLogin({ name: fullName, firstName: formData.firstName, lastName: formData.lastName, id: uid, email: formData.email });
      showSuccess("Registration Successful!", "home");
    } else {
      if (result.code === "auth/email-already-in-use") setErrors({ email: result.error });
      else if (result.code === "auth/weak-password") setErrors({ password: result.error });
      else if (result.code === "auth/invalid-email") setErrors({ email: result.error });
      else setErrors({ email: result.error });
    }
  };

  const inputVariants = { focus: { scale: 1.01, transition: { duration: 0.2 } } };
  const buttonVariants = {
    hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };
  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      width: "100%", height: "100vh",
      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
      backgroundImage: `url(${registerBg})`,
      backgroundSize: "cover", backgroundPosition: "center",
      backgroundRepeat: "no-repeat", zIndex: 1, paddingTop: "80px",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)" }} />

      <motion.div initial="hidden" animate="visible" variants={cardVariants} style={{
        width: "100%", maxWidth: 850, background: "white", borderRadius: 0,
        boxShadow: "-20px 0 40px rgba(0,0,0,0.15)", overflow: "auto",
        position: "relative", zIndex: 2, display: "flex", flexDirection: "column",
        maxHeight: "calc(100vh - 80px)",
      }}>
        <div style={{ padding: "50px 60px 30px 60px", textAlign: "center" }}>
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 70, height: 70, background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
              borderRadius: 20, marginBottom: 24, boxShadow: "0 10px 25px rgba(31,107,255,0.2)",
            }}>
            <div style={{ color: "white", transform: "scale(1.2)" }}><ScanIcon /></div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: "#1a1a2e", fontSize: 38, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.5px" }}>
            Create Account
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: "#666", fontSize: 15, lineHeight: 1.5 }}>
            Join our radiology center for better healthcare
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "30px 60px 50px 60px", flex: 1, overflow: "auto" }}>
          <div style={{ marginBottom: 35, display: "flex", justifyContent: "center" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "rgba(31,107,255,0.08)", padding: "10px 26px", borderRadius: 60,
              }}>
              <FaUser style={{ color: "#1f6bff", fontSize: 14 }} />
              <span style={{ fontWeight: 600, color: "#1f6bff", fontSize: 13 }}>Patient Registration</span>
            </motion.div>
          </div>

          {/* First Name + Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 22 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>First Name *</label>
              <motion.input 
                whileFocus="focus" 
                variants={inputVariants} 
                type="text" name="firstName"
                value={formData.firstName} onChange={handleChange}
                style={{ width: "100%", padding: "15px 18px", border: `2px solid ${errors.firstName ? "#dc3545" : "#e0e0e0"}`, borderRadius: 12, fontSize: 15, outline: "none", transition: "all 0.3s ease", background: "#fff", boxSizing: "border-box" }}
                placeholder="Enter first name"
                onMouseEnter={(e) => { if (!errors.firstName) e.target.style.borderColor = "#1f6bff"; }}
                onMouseLeave={(e) => { if (!errors.firstName && !e.target.value) e.target.style.borderColor = "#e0e0e0"; }}
              />
              {errors.firstName && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.firstName}</motion.span>}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Last Name *</label>
              <motion.input 
                whileFocus="focus" 
                variants={inputVariants} 
                type="text" name="lastName"
                value={formData.lastName} onChange={handleChange}
                style={{ width: "100%", padding: "15px 18px", border: `2px solid ${errors.lastName ? "#dc3545" : "#e0e0e0"}`, borderRadius: 12, fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }}
                placeholder="Enter last name"
                onMouseEnter={(e) => { if (!errors.lastName) e.target.style.borderColor = "#1f6bff"; }}
                onMouseLeave={(e) => { if (!errors.lastName && !e.target.value) e.target.style.borderColor = "#e0e0e0"; }}
              />
              {errors.lastName && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.lastName}</motion.span>}
            </motion.div>
          </div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 22 }}
          >
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Email Address *</label>
            <motion.input 
              whileFocus="focus" 
              variants={inputVariants} 
              type="email" name="email"
              value={formData.email} onChange={handleChange}
              style={{ width: "100%", padding: "15px 18px", border: `2px solid ${errors.email ? "#dc3545" : "#e0e0e0"}`, borderRadius: 12, fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }}
              placeholder="your@email.com"
              onMouseEnter={(e) => { if (!errors.email) e.target.style.borderColor = "#1f6bff"; }}
              onMouseLeave={(e) => { if (!errors.email && !e.target.value) e.target.style.borderColor = "#e0e0e0"; }}
            />
            {errors.email && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.email}</motion.span>}
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{ marginBottom: 22 }}
          >
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Phone Number *</label>
            <motion.input 
              whileFocus="focus" 
              variants={inputVariants} 
              type="tel" name="phone"
              value={formData.phone} onChange={handleChange}
              style={{ width: "100%", padding: "15px 18px", border: `2px solid ${errors.phone ? "#dc3545" : "#e0e0e0"}`, borderRadius: 12, fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }}
              placeholder="+20 123 456 7890"
              onMouseEnter={(e) => { if (!errors.phone) e.target.style.borderColor = "#1f6bff"; }}
              onMouseLeave={(e) => { if (!errors.phone && !e.target.value) e.target.style.borderColor = "#e0e0e0"; }}
            />
            {errors.phone && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.phone}</motion.span>}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: 22 }}
          >
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Password *</label>
            <div style={{ position: "relative" }}>
              <motion.input 
                whileFocus="focus" 
                variants={inputVariants}
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password} 
                onChange={handleChange}
                style={{ width: "100%", padding: "15px 18px", paddingRight: 50, border: `2px solid ${errors.password ? "#dc3545" : "#e0e0e0"}`, borderRadius: 12, fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }}
                placeholder="Minimum 6 characters"
                onMouseEnter={(e) => { if (!errors.password) e.target.style.borderColor = "#1f6bff"; }}
                onMouseLeave={(e) => { if (!errors.password && !e.target.value) e.target.style.borderColor = "#e0e0e0"; }}
              />
              <motion.button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </motion.button>
            </div>
            {errors.password && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.password}</motion.span>}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{ marginBottom: 35 }}
          >
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>Confirm Password *</label>
            <div style={{ position: "relative" }}>
              <motion.input 
                whileFocus="focus" 
                variants={inputVariants}
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange}
                style={{ width: "100%", padding: "15px 18px", paddingRight: 50, border: `2px solid ${errors.confirmPassword ? "#dc3545" : "#e0e0e0"}`, borderRadius: 12, fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }}
                placeholder="Confirm your password"
                onMouseEnter={(e) => { if (!errors.confirmPassword) e.target.style.borderColor = "#1f6bff"; }}
                onMouseLeave={(e) => { if (!errors.confirmPassword && !e.target.value) e.target.style.borderColor = "#e0e0e0"; }}
              />
              <motion.button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </motion.button>
            </div>
            {errors.confirmPassword && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: "#dc3545", marginTop: 6, display: "block" }}>{errors.confirmPassword}</motion.span>}
          </motion.div>

          {/* Submit Button */}
          <motion.button 
            type="submit"
            variants={buttonVariants}
            whileHover={!loading ? "hover" : {}}
            whileTap={!loading ? "tap" : {}}
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              width: "100%", padding: "16px",
              background: loading ? "#a0b4d6" : "linear-gradient(135deg, #1f6bff, #00b8a8)",
              color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 12, transition: "all 0.3s ease", marginBottom: 24,
            }}>
            {loading ? (
              <>
                <span style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                Creating Account...
              </>
            ) : (
              <><FaUserPlus size={18} />Create Patient Account<FaCheckCircle size={16} /></>
            )}
          </motion.button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{ textAlign: "center", marginBottom: 20 }}
          >
            <span style={{ color: "#666", fontSize: 13 }}>Already have an account? </span>
            <motion.a 
              whileHover={{ color: "#1f6bff", textDecoration: "underline" }}
              onClick={() => setPage("login")}
              style={{ color: "#1f6bff", fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
              Sign In Here
            </motion.a>
          </motion.div>

          <motion.button 
            type="button" 
            whileHover={{ x: -5, color: "#1f6bff" }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage("home")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ width: "100%", background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px" }}>
            <FaArrowLeft size={12} />
            Back to Home
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}