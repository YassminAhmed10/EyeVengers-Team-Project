import ScanIcon from "./ScanIcon";

export default function Footer({ setPage }) {
  return (
    <footer className="footer" dir="rtl">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo-mark">
              <ScanIcon />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 12 }}>
              Ima<span style={{ color: "var(--primary)" }}>gon</span>
            </div>
            <p className="footer-desc">مركز Imagon للأشعة التشخيصية — وجهتك الأولى لأحدث خدمات التصوير الطبي بأعلى معايير الجودة منذ 2010.</p>
          </div>
          <div className="footer-col">
            <h5>خدماتنا</h5>
            {["رنين مغناطيسي", "أشعة مقطعية", "أشعة سينية", "سونار", "طب نووي"].map((s) => (
              <a key={s} onClick={() => setPage("services")}>
                {s}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h5>للمريض</h5>
            {[
              ["تسجيل جديد", "register"],
              ["تسجيل الدخول", "login"],
              ["حجز موعد", "booking"],
              ["نتائجي", "results"],
              ["الأطباء", "doctors"],
            ].map(([l, p]) => (
              <a key={l} onClick={() => setPage(p)}>
                {l}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h5>تواصل معنا</h5>
            <a>📍 الدقي، الجيزة</a>
            <a>📞 02-37600000</a>
            <a>💬 01000000000</a>
            <a>✉ info@imagon.eg</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Imagon Radiology Center — جميع الحقوق محفوظة</div>
          <div className="footer-copy">سياسة الخصوصية · الشروط والأحكام</div>
        </div>
      </div>
    </footer>
  );
}
