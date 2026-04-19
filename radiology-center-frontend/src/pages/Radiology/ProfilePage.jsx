export default function ProfilePage({ setPage }) {
  return (
    <div dir="rtl">
      <div className="page-header">
        <div className="container">
          <span className="page-header-eyebrow">حساب المريض</span>
          <h1 className="display-title" style={{ color: "#fff" }}>ملفي الطبي</h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="profile-layout">
            <div className="card profile-sidebar-card">
              <div className="profile-ava">أح</div>
              <div className="profile-name">أحمد حسن محمود</div>
              <div className="profile-id">RC-2024-4872</div>
              <span className="badge badge-teal" style={{ margin: "0 auto" }}>متصل ●</span>
              <div className="profile-divider" />
              <div className="profile-stat-row">
                {[["4", "فحوصات"], ["2", "مواعيد"], ["3", "تقارير"]].map(([n, l]) => (
                  <div className="profile-stat" key={l}>
                    <div className="profile-stat-num">{n}</div>
                    <div className="profile-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
              <div className="profile-divider" />
              <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={() => setPage("results")}>📋 نتائجي</button>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", borderRadius: 10 }} onClick={() => setPage("booking")}>🗓 حجز جديد</button>
            </div>
            <div>
              <div className="card" style={{ padding: 32, marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--dark)", marginBottom: 24 }}>البيانات الشخصية</h3>
                <div className="form-grid">
                  {[["الاسم الأول", "أحمد"], ["اسم العائلة", "حسن"], ["رقم الهاتف", "01012345678"], ["البريد الإلكتروني", "ahmed@example.com"], ["الرقم القومي", "290051500000000"], ["تاريخ الميلاد", "1990-05-15"]].map(([l, v]) => (
                    <div className="form-group" key={l}><label>{l}</label><input className="form-control" defaultValue={v} /></div>
                  ))}
                  <div className="form-group"><label>الجنس</label><select className="form-control"><option>ذكر</option></select></div>
                  <div className="form-group"><label>فصيلة الدم</label><select className="form-control"><option>O+</option></select></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 20, borderRadius: 10 }}>حفظ التغييرات</button>
              </div>
              <div className="card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--dark)", marginBottom: 16 }}>المعلومات الطبية</h3>
                <div className="form-group" style={{ marginBottom: 16 }}><label>أمراض مزمنة</label><textarea className="form-control" rows={3} defaultValue="لا يوجد" /></div>
                <div className="form-group"><label>حساسية من أدوية / مواد</label><textarea className="form-control" rows={2} defaultValue="لا يوجد" /></div>
                <button className="btn btn-primary" style={{ marginTop: 20, borderRadius: 10 }}>تحديث السجل الطبي</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
