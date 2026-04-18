export default function ConfirmPage({ setPage }) {
  return (
    <div dir="rtl">
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,var(--primary),var(--teal))", height: 8 }} />
            <div className="success-wrap">
              <div className="success-circle">✅</div>
              <div className="success-title">تم الحجز بنجاح!</div>
              <div className="success-sub">سيصلك رسالة تأكيد على هاتفك والبريد الإلكتروني خلال دقائق</div>
              <div className="booking-ref-box">RC-2025-089432</div>
              <div className="booking-summary">
                {[["نوع الفحص", "رنين مغناطيسي صدر"], ["الطبيب", "أ.د. سارة محمود"], ["التاريخ", "22 مارس 2025"], ["الوقت", "11:00 صباحاً"], ["الموقع", "الدقي، الجيزة"]].map(([l, v]) => (
                  <div className="bs-row" key={l}>
                    <span className="bs-label">{l}</span>
                    <span className="bs-val">{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-outline" onClick={() => setPage("results")}>📋 نتائجي</button>
                <button className="btn btn-primary" onClick={() => setPage("home")}>العودة للرئيسية</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
