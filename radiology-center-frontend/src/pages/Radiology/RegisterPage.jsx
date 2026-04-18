import ScanIcon from "../../components/Radiology/ScanIcon";

export default function RegisterPage({ setPage, onLogin }) {
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
          <div className="auth-title">تسجيل حساب جديد</div>
          <div className="auth-sub">أنشئ حسابك مرة واحدة واحتفظ بكل تاريخك الطبي</div>
          <div className="form-grid">
            <div className="form-group"><label>الاسم الأول *</label><input className="form-control" placeholder="محمد" /></div>
            <div className="form-group"><label>الاسم الأخير *</label><input className="form-control" placeholder="أحمد" /></div>
            <div className="form-group"><label>رقم الهاتف *</label><input className="form-control" type="tel" placeholder="010xxxxxxxx" /></div>
            <div className="form-group"><label>البريد الإلكتروني *</label><input className="form-control" type="email" placeholder="email@example.com" /></div>
            <div className="form-group"><label>الرقم القومي *</label><input className="form-control" placeholder="14 رقم" /></div>
            <div className="form-group"><label>تاريخ الميلاد *</label><input className="form-control" type="date" /></div>
            <div className="form-group"><label>الجنس</label><select className="form-control"><option>ذكر</option><option>أنثى</option></select></div>
            <div className="form-group"><label>فصيلة الدم</label><select className="form-control"><option>-- اختر --</option>{["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}</select></div>
            <div className="form-group full"><label>كلمة المرور *</label><input className="form-control" type="password" placeholder="8 أحرف على الأقل" /></div>
            <div className="form-group full"><label>تأكيد كلمة المرور *</label><input className="form-control" type="password" placeholder="كرر كلمة المرور" /></div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 24, borderRadius: 10, padding: "15px" }} onClick={() => { onLogin(); setPage("booking"); }}>
            إنشاء الحساب ←
          </button>
          <div className="auth-link">لديك حساب؟ <a onClick={() => setPage("login")}>سجّل دخولك</a></div>
        </div>
      </div>
    </div>
  );
}
