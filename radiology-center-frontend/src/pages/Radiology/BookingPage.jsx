import { useState } from "react";
import { DOCTORS } from "../../constants/RadiologyDoctors";

export default function BookingPage({ setPage }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("🧲 رنين مغناطيسي MRI");
  const [selectedDoctor, setSelectedDoctor] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState("11:00 ص");

  const scanTypes = ["🧲 رنين مغناطيسي MRI", "🔬 أشعة مقطعية CT", "🦴 أشعة سينية X-Ray", "❤️ سونار", "🧠 تصوير مخ وأعصاب", "🫀 تصوير قلب", "💉 أشعة بالصبغة", "🔴 طب نووي PET"];
  const slots = ["9:00 ص", "10:00 ص", "11:00 ص", "12:00 م", "1:00 م", "2:00 م", "3:00 م", "4:00 م", "5:00 م"];
  const busySlots = ["10:00 ص", "1:00 م", "4:00 م"];

  return (
    <div dir="rtl">
      <div className="page-header">
        <div className="container">
          <span className="page-header-eyebrow">حجز موعد</span>
          <h1 className="display-title" style={{ color: "#fff" }}>احجز في دقيقتين</h1>
          <p>اختر الفحص والطبيب والوقت المناسب لك بكل سهولة</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="step-tabs" style={{ marginBottom: 40 }}>
            {[["نوع الفحص", 1], ["الطبيب والوقت", 2], ["بيانات المريض", 3]].map(([label, n]) => (
              <button key={n} className={`step-tab${step === n ? " active" : step > n ? " done" : ""}`} onClick={() => step >= n && setStep(n)}>
                <span className="step-tab-num">{step > n ? "✓" : n}</span> {label}
              </button>
            ))}
          </div>

          <div className="booking-layout">
            <div>
              {step === 1 && (
                <div className="booking-panel">
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--dark)", marginBottom: 6 }}>اختر نوع الفحص</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>يمكنك اختيار أكثر من نوع إذا احتجت</p>
                  <div className="chips-row" style={{ flexDirection: "column", gap: 10 }}>
                    {scanTypes.map((t) => (
                      <div key={t} className={`chip${selectedType === t ? " selected" : ""}`} style={{ borderRadius: 10, padding: "13px 18px" }} onClick={() => setSelectedType(t)}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>سبب الفحص / تعليمات الطبيب</label>
                    <textarea className="form-control" rows={3} placeholder="مثال: ألم في الركبة اليمنى - بناءً على طلب د. محمد" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>هل لديك تحويل طبي؟</label>
                    <select className="form-control">
                      <option>لا، أحجز مباشرة</option>
                      <option>نعم، من طبيب</option>
                      <option>نعم، من مستشفى</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", borderRadius: 10 }} onClick={() => setStep(2)}>
                    التالي: اختر الطبيب →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="booking-panel" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--dark)", marginBottom: 20 }}>اختر الطبيب</h3>
                    {DOCTORS.slice(0, 3).map((d, i) => (
                      <div
                        key={d.name}
                        onClick={() => setSelectedDoctor(i)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "16px 20px",
                          border: `1.5px solid ${selectedDoctor === i ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: 12,
                          cursor: "pointer",
                          background: selectedDoctor === i ? "var(--primary-lt)" : "var(--white)",
                          marginBottom: 10,
                          transition: "all .2s",
                        }}
                      >
                        <div style={{ width: 46, height: 46, borderRadius: "50%", background: d.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15, flexShrink: 0 }}>
                          {d.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dark)" }}>{d.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.spec}</div>
                        </div>
                        <span className={`badge ${i === 0 ? "badge-teal" : "badge-orange"}`}>{i === 0 ? "متاح الآن" : "بعد يومين"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="booking-panel">
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)", marginBottom: 14 }}>اختر التاريخ والوقت</h3>
                    <input type="date" className="form-control" defaultValue="2025-03-22" style={{ marginBottom: 16 }} />
                    <div className="time-slots">
                      {slots.map((s) => (
                        <div key={s} className={`time-slot${busySlots.includes(s) ? " booked" : selectedSlot === s ? " selected" : ""}`} onClick={() => !busySlots.includes(s) && setSelectedSlot(s)}>
                          {s}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", marginTop: 10, marginBottom: 20 }}>
                      <span>🔵 متاح</span><span style={{ opacity: 0.5 }}>⚫ محجوز</span><span style={{ color: "var(--primary)" }}>✅ اخترته</span>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button className="btn btn-outline" onClick={() => setStep(1)}>← رجوع</button>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep(3)}>التالي: بياناتك →</button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="booking-panel">
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--dark)", marginBottom: 6 }}>بيانات المريض</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>تأكد من صحة بياناتك قبل تأكيد الحجز</p>
                  <div className="form-grid" style={{ marginBottom: 16 }}>
                    <div className="form-group"><label>الاسم الأول</label><input className="form-control" placeholder="أحمد" /></div>
                    <div className="form-group"><label>اسم العائلة</label><input className="form-control" placeholder="حسن" /></div>
                    <div className="form-group"><label>رقم الهاتف</label><input className="form-control" type="tel" placeholder="010xxxxxxxx" /></div>
                    <div className="form-group"><label>تاريخ الميلاد</label><input className="form-control" type="date" /></div>
                    <div className="form-group"><label>الجنس</label><select className="form-control"><option>ذكر</option><option>أنثى</option></select></div>
                    <div className="form-group"><label>فصيلة الدم</label><select className="form-control"><option>-- اختر --</option>{["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}</select></div>
                    <div className="form-group full"><label>البريد الإلكتروني</label><input className="form-control" type="email" placeholder="email@example.com" /></div>
                    <div className="form-group full"><label>ملاحظات طبية</label><textarea className="form-control" rows={3} placeholder="حساسية / أمراض مزمنة..." /></div>
                  </div>
                  <div className="alert alert-info">📋 {selectedType} · {DOCTORS[selectedDoctor].name} · 22 مارس 2025 · {selectedSlot}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-outline" onClick={() => setStep(2)}>← رجوع</button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setPage("confirm")}>✅ تأكيد الحجز</button>
                  </div>
                </div>
              )}
            </div>

            <div className="booking-sidebar">
              <div className="sidebar-title">ملخص الحجز</div>
              <div className="sidebar-sub">راجع تفاصيل موعدك قبل التأكيد</div>
              <div className="sidebar-info">
                {[["🔬", "نوع الفحص", selectedType], ["👨‍⚕️", "الطبيب", DOCTORS[selectedDoctor].name], ["📅", "التاريخ", "22 مارس 2025"], ["🕐", "الوقت", selectedSlot], ["📍", "الموقع", "الدقي، الجيزة"]].map(([ic, l, v]) => (
                  <div className="si-item" key={l}>
                    <div className="si-icon">{ic}</div>
                    <div>
                      <div className="si-label">{l}</div>
                      <div className="si-val">{v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 8 }}>
                  <span>رسوم الكشف</span><span style={{ color: "#fff", fontWeight: 700 }}>0 جنيه</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 16 }}>
                  <span>تكلفة الفحص</span><span style={{ color: "#fff", fontWeight: 700 }}>تُحدد في المركز</span>
                </div>
                <div style={{ background: "rgba(0,194,168,.15)", border: "1px solid rgba(0,194,168,.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#00c2a8" }}>
                  ✅ الحجز مجاني — الدفع عند الحضور
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
