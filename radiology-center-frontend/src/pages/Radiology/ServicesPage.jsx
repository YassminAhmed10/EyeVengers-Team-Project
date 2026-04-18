export default function ServicesPage({ setPage }) {
  const all = [
    { icon: "🧲", cls: "svc-icon-blue", name: "رنين مغناطيسي MRI", desc: "جهاز 3 تسلا عالي الدقة لتصوير المخ والعمود الفقري والمفاصل والأنسجة الرخوة بتفاصيل فائقة.", range: "800 – 2000 جنيه" },
    { icon: "🔬", cls: "svc-icon-teal", name: "أشعة مقطعية CT", desc: "جهاز 128 شريحة لتصوير الصدر والبطن والرأس والعنق بصور ثلاثية الأبعاد.", range: "600 – 1500 جنيه" },
    { icon: "🦴", cls: "svc-icon-green", name: "أشعة سينية X-Ray", desc: "أشعة رقمية فورية لفحص العظام والكسور والصدر والمفاصل مع تقرير فوري من الطبيب.", range: "150 – 400 جنيه" },
    { icon: "❤️", cls: "svc-icon-orange", name: "سونار / موجات صوتية", desc: "فحص بطن - حوض - قلب - أوعية دموية - متابعة حمل بأجهزة 4D حديثة.", range: "300 – 700 جنيه" },
    { icon: "🧠", cls: "svc-icon-purple", name: "تصوير المخ والأعصاب", desc: "MRI وCT متخصص لكشف الأورام والجلطات الدماغية والضغط على الأعصاب.", range: "1200 – 2500 جنيه" },
    { icon: "🫀", cls: "svc-icon-red", name: "تصوير قلب وأوعية دموية", desc: "فحص شرايين القلب والأوعية الدموية بالصبغة للكشف المبكر عن الانسدادات.", range: "900 – 2200 جنيه" },
    { icon: "💉", cls: "svc-icon-blue", name: "أشعة بالصبغة", desc: "تصوير الكلى والمسالك البولية والجهاز الهضمي بالصبغة لدراسة الوظيفة والتشريح.", range: "500 – 1200 جنيه" },
    { icon: "🔴", cls: "svc-icon-red", name: "طب نووي PET", desc: "تحديد مرحلة السرطان وتقييم الاستجابة للعلاج باستخدام إشعاع نووي آمن.", range: "4000 – 8000 جنيه" },
    { icon: "🦷", cls: "svc-icon-green", name: "أشعة الأسنان CBCT", desc: "أشعة مقطعية مخروطية لتصوير الفكين والأسنان ثلاثي الأبعاد للتخطيط الجراحي.", range: "500 – 900 جنيه" },
  ];

  return (
    <div dir="rtl">
      <div className="page-header">
        <div className="container">
          <span className="page-header-eyebrow">خدماتنا الطبية</span>
          <h1 className="display-title" style={{ color: "#fff" }}>كل أنواع التصوير</h1>
          <p>نستخدم أحدث الأجهزة الطبية المستوردة مع طاقم طبي متخصص على أعلى مستوى</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="services-grid">
            {all.map((s) => (
              <div className="card service-card" key={s.name}>
                <div className={`svc-icon ${s.cls}`}>{s.icon}</div>
                <div className="svc-name">{s.name}</div>
                <div className="svc-desc">{s.desc}</div>
                <div className="svc-price">{s.range}</div>
                <button className="btn btn-primary" style={{ marginTop: 16, width: "100%", borderRadius: 8, justifyContent: "center" }} onClick={() => setPage("booking")}>احجز الآن</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
