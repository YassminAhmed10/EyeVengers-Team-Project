import { useState } from "react";
import logoSrc from "../../assets/logo.png";

export default function Footer({ setPage }) {
  const [logoOk, setLogoOk] = useState(true);
  return (
    <footer className="footer" dir="ltr">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            {logoOk && logoSrc ? (
              <img
                src={logoSrc}
                alt="Nile Radiology Logo"
                onError={() => setLogoOk(false)}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  objectFit: "cover",
                  marginBottom: 12,
                }}
              />
            ) : (
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: "linear-gradient(135deg, #1f6bff, #00b8a8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 24,
                fontWeight: 800,
                marginBottom: 12,
              }}>
                NR
              </div>
            )}
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 12 }}>
              Nile <span style={{ color: "var(--primary)" }}>Radiology</span>
            </div>
            <p className="footer-desc">Nile Radiology Center — Your premier destination for cutting-edge medical imaging services with the highest quality standards since 2010.</p>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            {["MRI Scan", "CT Scan", "X-Ray", "Ultrasound", "Nuclear Medicine"].map((s) => (
              <a key={s} onClick={() => setPage("services")}>
                {s}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h5>For Patients</h5>
            {[
              ["Register", "register"],
              ["Login", "login"],
              ["Book Appointment", "booking"],
              ["My Results", "results"],
              ["Our Doctors", "doctors"],
            ].map(([l, p]) => (
              <a key={l} onClick={() => setPage(p)}>
                {l}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h5>Contact Us</h5>
            <a>📍 Dokki, Giza</a>
            <a>📞 02-37600000</a>
            <a>💬 01000000000</a>
            <a>✉ info@nileradiology.eg</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Nile Radiology Center — All Rights Reserved</div>
          <div className="footer-copy">Privacy Policy · Terms & Conditions</div>
        </div>
      </div>
    </footer>
  );
}
