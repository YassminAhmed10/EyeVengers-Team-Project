import { useState } from "react";

export default function AdminLogin({ setPage }) {
  const [email, setEmail] = useState("yassmin@adminr.com");
  const [password, setPassword] = useState("2392005");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const RADIOLOGY_BASE = import.meta.env.VITE_RADIOLOGY_BASE_URL || (import.meta.env.VITE_RADIOLOGY_API_URL ? import.meta.env.VITE_RADIOLOGY_API_URL.replace(/\/fhir.*$/i, "") : undefined) || "http://localhost:5301";
  const API_URL = RADIOLOGY_BASE.endsWith("/api") ? RADIOLOGY_BASE : `${RADIOLOGY_BASE}/api`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/adminauth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.error) || "Login failed");
        setLoading(false);
        return;
      }
      if (data && data.success) {
        localStorage.setItem("radiologyAdminEmail", data.email || email);
        localStorage.setItem("radiologyAdminRole", data.role || "admin");
        localStorage.setItem("radiologyAdminLoggedIn", "true");
        setPage("admin-dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "36px auto", padding: 22, borderRadius: 12, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
      <h2 style={{ margin: 0, fontSize: 22 }}>Admin Login</h2>
      <p style={{ marginTop: 8, color: "rgba(0,0,0,0.6)" }}>Use the seeded admin account for development.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />

        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#0070b8", color: "#fff", fontWeight: 700 }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button type="button" onClick={() => setPage("home")} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", background: "#fff" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
