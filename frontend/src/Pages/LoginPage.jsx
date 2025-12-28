// src/Pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!role) {
      setError("Please select your role before signing in.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5201/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Check if the role matches
      if (data.user.role !== role) {
        setError(`This account is registered as ${data.user.role}, not ${role}`);
        setLoading(false);
        return;
      }

      // Store authentication data
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userName", data.user.username);
      localStorage.setItem("userEmail", data.user.email);

      // Navigate based on role
      if (data.user.role === "Doctor") {
        navigate("/doctor");
      } else if (data.user.role === "Receptionist") {
        navigate("/receptionist");
      } else if (data.user.role === "Patient") {
        navigate("/patient");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      
      <div style={styles.mainContent}>
        <div style={styles.brandSection}>
          <div style={styles.logo}>
            <img 
              src="src/images/logo.png" 
              alt="Dr Mohab Khairy" 
              style={styles.logoImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={styles.logoFallback}>
              <span className="material-symbols-outlined" style={{fontSize: '2.5rem'}}>
                local_hospital
              </span>
            </div>
            <h1 style={styles.clinicName}>Dr Mohab Khairy</h1>
          </div>
          <div style={styles.brandContent}>
            <h2 style={styles.welcomeText}>Welcome to Dr Mohab Khairy Eye     Clinic</h2>
            <p style={styles.subtitle}>
              Advanced eye care management system for doctors, staff, and patients
            </p>
            <div style={styles.features}>
              <div style={styles.featureItem}>
              </div>
              <div style={styles.featureItem}>
              </div>
              <div style={styles.featureItem}>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.loginSection}>
          <div style={styles.loginCard}>
            <div style={styles.loginHeader}>
              <h2 style={styles.loginTitle}>Sign In</h2>
              <p style={styles.loginSubtitle}>Access your account</p>
            </div>

            <div style={styles.roleGrid}>
              {["Doctor", "Receptionist", "Patient"].map((r) => (
                <div
                  key={r}
                  style={{
                    ...styles.roleCard,
                    ...(role === r ? styles.roleCardActive : {})
                  }}
                  onClick={() => setRole(r)}
                >
                  <div style={styles.roleImageContainer}>
                    <img 
                      src={`src/images/${r.toLowerCase()}-icon.png`} 
                      alt={r}
                      style={styles.roleImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const emoji = r === "Doctor" ? "" : r === "Receptionist" ? "" : "";
                        e.target.nextSibling.textContent = emoji;
                      }}
                    />
                    <span style={styles.roleFallback}></span>
                  </div>
                  <span style={styles.roleText}>{r}</span>
                </div>
              ))}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {error && (
              <div style={styles.errorMessage}>
                <span className="material-symbols-outlined" style={{fontSize: '1.2rem'}}>error</span>
                <span>{error}</span>
              </div>
            )}

            <button 
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleLogin}
              disabled={loading}
            >
              <span style={styles.buttonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </span>
              {!loading && <span style={styles.buttonIcon}>→</span>}
            </button>

            <div style={styles.signUpSection}>
              <p style={styles.signUpText}>
                Don't have an account?{" "}
                <Link to="/signup" style={styles.signUpLink}>
                  Create one now
                </Link>
              </p>
            </div>

            <div style={styles.footer}>
              <p style={styles.footerText}>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('src/images/login1.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity: 0.1,
    zIndex: 0,
  },
  mainContent: {
    display: "flex",
    width: "100%",
    maxWidth: "1200px",
    height: "700px",
    backgroundColor: "white",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    zIndex: 1,
    position: "relative",
  },
  brandSection: {
    flex: 1,
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "white",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
  },
  logoImage: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  logoFallback: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid white",
  },
  clinicName: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: 0,
  },
  brandContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: "2.5rem",
    fontWeight: "700",
    lineHeight: "1.2",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "1.125rem",
    opacity: 0.9,
    lineHeight: "1.6",
    marginBottom: "40px",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "1rem",
    opacity: 0.9,
  },
  featureIcon: {
    fontSize: "1.25rem",
    width: "24px",
    textAlign: "center",
  },
  loginSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "white",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
  },
  loginHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  loginTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  loginSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: 0,
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    marginBottom: "32px",
  },
  roleCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc",
  },
  roleCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
  },
  roleImageContainer: {
    position: "relative",
    marginBottom: "8px",
  },
  roleImage: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid #e2e8f0",
  },
  roleFallback: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.5rem",
  },
  roleText: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#475569",
  },
  formGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "1rem",
    color: "#1f2937",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginTop: "8px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "8px",
    marginBottom: "8px",
  },
  buttonText: {
    fontSize: "1rem",
  },
  buttonIcon: {
    fontSize: "1.25rem",
  },
  signUpSection: {
    textAlign: "center",
    padding: "20px 0",
    margin: "16px 0",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },
  signUpText: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
  },
  signUpLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s ease",
  },
  signUpLinkHover: {
    color: "#1d4ed8",
  },
  footer: {
    marginTop: "16px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
  },
  footerLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500",
  },
};