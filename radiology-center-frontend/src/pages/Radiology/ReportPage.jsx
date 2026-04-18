import ScanVisual from "../../components/Radiology/ScanVisual";

export default function ReportPage({ setPage, setShowSendModal }) {
  return (
    <div dir="rtl">
      <section className="section" style={{ paddingTop: 100 }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <button className="btn btn-outline" style={{ padding: "9px 18px" }} onClick={() => setPage("results")}>← رجوع</button>
            <div>
              <span className="section-eyebrow" style={{ marginBottom: 4 }}>تقرير الفحص</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--dark)" }}>رنين مغناطيسي صدر</div>
            </div>
          </div>
          <div className="report-layout">
            <div>
              <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>رقم التقرير</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>RC-2025-001</div>
                  </div>
                  <span className="badge badge-teal" style={{ fontSize: 13, padding: "8px 16px" }}>✓ تقرير معتمد</span>
                </div>
                <div className="hc-meta" style={{ marginBottom: 20 }}>
                  {[["التاريخ", "15 مارس 2025"], ["الطبيب", "أ.د. سارة محمود"], ["الجهاز", "MRI 1.5 Tesla"], ["مدة الفحص", "45 دقيقة"]].map(([l, v]) => (
                    <div className="hc-meta-item" key={l}>
                      <div className="hc-meta-label">{l}</div>
                      <div className="hc-meta-val">{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="report-section-title">📋 نتيجة الفحص</div>
                  <div className="report-content">
                    تم إجراء تصوير الرنين المغناطيسي لمنطقة الصدر باستخدام جهاز 1.5 تسلا.<br /><br />
                    <strong>النتيجة:</strong> لا يوجد أورام أو كتل واضحة. حجم القلب طبيعي. لا يوجد انصباب جنبي.<br />
                    <strong>الأنسجة الرخوة:</strong> سليمة دون أي تضخم في الغدد الليمفاوية.<br />
                    <strong>الخلاصة:</strong> الفحص في حدوده الطبيعية ولا يوجد ما يستدعي القلق.
                  </div>
                </div>
                <div className="alert alert-success">✅ توصية الطبيب: يُنصح بمتابعة سنوية دورية. لا داعي لأي إجراء علاجي حالياً.</div>
              </div>
            </div>
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dark)", marginBottom: 12 }}>صورة الأشعة</div>
                <div className="report-scan-preview" style={{ marginBottom: 12 }}><ScanVisual /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="result-btn" style={{ flex: 1 }}>🔍 تكبير</button>
                  <button className="result-btn" style={{ flex: 1 }}>⬇ DICOM</button>
                </div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dark)", marginBottom: 14 }}>إجراءات التقرير</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn btn-primary" style={{ justifyContent: "center", borderRadius: 10 }}>⬇ تحميل PDF</button>
                  <button className="btn btn-outline" style={{ justifyContent: "center", borderRadius: 10 }} onClick={() => setShowSendModal(true)}>📤 إرسال للطبيب</button>
                  <button className="btn btn-outline" style={{ justifyContent: "center", borderRadius: 10 }}>🖨 طباعة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
