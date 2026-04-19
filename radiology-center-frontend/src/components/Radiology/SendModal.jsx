import { useState } from "react";

export default function SendModal({ onClose }) {
  const [selected, setSelected] = useState(0);
  const opts = [
    { icon: "📧", title: "البريد الإلكتروني", desc: "ارسال بصيغة PDF مشفرة" },
    { icon: "💬", title: "واتساب", desc: "رابط مؤمن صالح لـ 72 ساعة" },
    { icon: "🏥", title: "إرسال مباشر للطبيب", desc: "اختر الطبيب من داخل المنظومة" },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} dir="rtl">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-title">📤 إرسال النتائج</div>
        <div className="modal-sub">اختر طريقة إرسال نتائج الفحص إلى الطبيب أو شخص آخر</div>
        <div className="send-options">
          {opts.map((o, i) => (
            <div key={i} className={`send-option${selected === i ? " selected" : ""}`} onClick={() => setSelected(i)}>
              <div className="send-opt-icon">{o.icon}</div>
              <div>
                <div className="send-opt-title">{o.title}</div>
                <div className="send-opt-desc">{o.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label>البريد أو رقم الهاتف</label>
          <input className="form-control" placeholder="email@example.com أو 010xxxxxxxx" />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", borderRadius: 10 }} onClick={onClose}>
          إرسال النتائج الآن
        </button>
      </div>
    </div>
  );
}
