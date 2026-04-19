export default function ContactPage() {
  return (
    <div dir="rtl">
      <div className="page-header">
        <div className="container">
          <span className="page-header-eyebrow">تواصل معنا</span>
          <h1 className="display-title" style={{ color: "#fff" }}>نحن هنا لمساعدتك</h1>
          <p>فريق خدمة العملاء متاح 7 أيام في الأسبوع من 8 ص حتى 10 م</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <div>
              <div className="contact-info">
                {[["📍", "العنوان", "12 شارع التحرير، الدقي، الجيزة\nبجوار مستشفى الدقي التخصصي"], ["📞", "الهاتف", "02-37600000\n01000000000 (واتساب)"], ["✉️", "البريد الإلكتروني", "info@imagon.eg\nresults@imagon.eg"], ["🕐", "مواعيد العمل", "السبت – الخميس: 8 ص – 10 م\nالجمعة: 10 ص – 6 م"]].map(([ic, t, v]) => (
                  <div className="ci-card" key={t}>
                    <div className="ci-icon">{ic}</div>
                    <div>
                      <div className="ci-title">{t}</div>
                      <div className="ci-val" style={{ whiteSpace: "pre-line" }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="map-box">
                <div style={{ fontSize: 36 }}>🗺</div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>الدقي، الجيزة — خريطة Google</div>
              </div>
            </div>
            <div className="contact-form-wrap">
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--dark)", marginBottom: 6 }}>أرسل لنا رسالة</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>وسيتواصل معك فريقنا خلال ساعتين</p>
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group"><label>الاسم</label><input className="form-control" placeholder="اسمك الكامل" /></div>
                <div className="form-group"><label>رقم الهاتف</label><input className="form-control" type="tel" placeholder="010xxxxxxxx" /></div>
                <div className="form-group full"><label>البريد الإلكتروني</label><input className="form-control" type="email" placeholder="email@example.com" /></div>
                <div className="form-group full"><label>موضوع الرسالة</label>
                  <select className="form-control">
                    {["استفسار عام", "سؤال عن نتيجة", "تعديل موعد", "شكوى", "اقتراح"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group full"><label>رسالتك</label><textarea className="form-control" rows={5} placeholder="اكتب رسالتك هنا..." /></div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", borderRadius: 10, padding: 15 }}>إرسال الرسالة ←</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
