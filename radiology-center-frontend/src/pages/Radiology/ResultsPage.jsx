import { useState } from "react";

export default function ResultsPage({ setPage, setShowSendModal }) {
  const [filter, setFilter] = useState("الكل");
  const results = [
    { icon: "🧲", name: "رنين مغناطيسي صدر", meta: "15 مارس 2025 · أ.د. سارة محمود · RC-2025-001", status: "جاهزة", badge: "badge-teal" },
    { icon: "🔬", name: "أشعة مقطعية بطن وحوض", meta: "2 فبراير 2025 · د. كريم علي · RC-2025-002", status: "جاهزة", badge: "badge-teal" },
    { icon: "🧠", name: "رنين مغناطيسي مخ", meta: "10 يناير 2025 · د. نور حسن · RC-2025-003", status: "جاهزة", badge: "badge-teal" },
    { icon: "🦴", name: "أشعة سينية ركبة يمنى", meta: "18 ديسمبر 2024 · د. طارق بكر · RC-2024-098", status: "قيد المراجعة", badge: "badge-orange" },
    { icon: "📅", name: "موعد قادم: أشعة سينية عمود فقري", meta: "22 مارس 2025 الساعة 11:00 ص · أ.د. سارة محمود", status: "قادم", badge: "badge-blue" },
  ];
  const filters = ["الكل", "جاهزة", "قيد المراجعة", "قادم"];
  const filtered = filter === "الكل" ? results : results.filter((r) => r.status === filter);

  return (
    <div dir="rtl">
      <div className="page-header">
        <div className="container">
          <span className="page-header-eyebrow">سجلاتي الطبية</span>
          <h1 className="display-title" style={{ color: "#fff" }}>نتائج فحوصاتي</h1>
          <p>استعرض كل نتائجك، وحمّلها، أو أرسلها لطبيبك في لحظة</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="results-toolbar">
            <div className="filter-tabs">
              {filters.map((f) => (
                <button key={f} className={`filter-tab${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setPage("booking")}>🗓 حجز موعد جديد</button>
          </div>
          <div className="results-list">
            {filtered.map((r) => (
              <div className="card result-row" key={r.name}>
                <div className="result-row-left">
                  <div className="result-icon">{r.icon}</div>
                  <div>
                    <div className="result-name">{r.name}</div>
                    <div className="result-meta">{r.meta}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span className={`badge ${r.badge}`}>{r.status}</span>
                  <div className="result-actions">
                    {r.status === "جاهزة" && (
                      <>
                        <button className="result-btn primary-btn" onClick={() => setPage("report")}>👁 عرض</button>
                        <button className="result-btn">⬇ PDF</button>
                        <button className="result-btn send-btn" onClick={() => setShowSendModal(true)}>📤 إرسال</button>
                      </>
                    )}
                    {r.status === "قيد المراجعة" && <button className="result-btn" style={{ opacity: 0.5 }} disabled>⏳ قريباً</button>}
                    {r.status === "قادم" && (
                      <>
                        <button className="result-btn">📝 إعادة جدولة</button>
                        <button className="result-btn" style={{ borderColor: "rgba(220,38,38,.3)", color: "#dc2626" }}>إلغاء</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
