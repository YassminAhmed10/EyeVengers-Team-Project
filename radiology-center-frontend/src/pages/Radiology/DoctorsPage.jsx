import DoctorsGrid from "../../components/Radiology/DoctorsGrid";

export default function DoctorsPage({ setPage }) {
  return (
    <div dir="rtl">
      <div className="page-header">
        <div className="container">
          <span className="page-header-eyebrow">فريقنا الطبي</span>
          <h1 className="display-title" style={{ color: "#fff" }}>نخبة من أفضل الأطباء</h1>
          <p>استشاريون وأساتذة بخبرات واسعة في جميع تخصصات الأشعة التشخيصية</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <DoctorsGrid setPage={setPage} />
        </div>
      </section>
    </div>
  );
}
