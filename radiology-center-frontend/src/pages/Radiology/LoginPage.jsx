import ScanIcon from "../../components/Radiology/ScanIcon";

export default function LoginPage({ setPage, onLogin }) {
  return (
    <div dir="rtl">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <div className="nav-logo-mark"><ScanIcon /></div>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--dark)" }}>Ima<span style={{ color: "var(--primary)" }}>gon</span></span>
            </div>
          </div>
          <div className="auth-title">مرحباً بعودتك 👋</div>
          <div className="auth-sub">سجّل دخولك للوصول لنتائجك ومواعيدك</div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>رقم الهاتف أو البريد الإلكتروني</label>
            <input className="form-control" placeholder="010xxxxxxxx أو email@example.com" />
          </div>
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label>كلمة المرور</label>
            <input className="form-control" type="password" placeholder="••••••••" />
          </div>
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>نسيت كلمة المرور؟</span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", borderRadius: 10, padding: 15 }} onClick={() => { onLogin(); setPage("results"); }}>
            دخول ←
          </button>
          <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-text">أو</span><div className="auth-divider-line" /></div>
          <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", borderRadius: 10 }} onClick={() => { onLogin(); setPage("results"); }}>
            🔢 دخول برقم المريض
          </button>
          <div className="auth-link">ليس لديك حساب؟ <a onClick={() => setPage("register")}>سجّل الآن مجاناً</a></div>
        </div>
      </div>
    </div>
  );
}
