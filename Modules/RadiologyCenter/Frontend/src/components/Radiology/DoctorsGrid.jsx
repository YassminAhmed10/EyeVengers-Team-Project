import { DOCTORS } from "../../constants/RadiologyDoctors";

export default function DoctorsGrid({ setPage, limit }) {
  const docs = limit ? DOCTORS.slice(0, limit) : DOCTORS;

  return (
    <div className="doctors-grid">
      {docs.map((d) => (
        <div className="card doctor-card" key={d.name}>
          <div className="doctor-banner" style={{ background: `${d.bg}33` }}>
            <div className="doctor-ava" style={{ background: d.bg }}>
              {d.initials}
            </div>
          </div>
          <div className="doctor-body">
            <div className="doctor-name">{d.name}</div>
            <div className="doctor-spec">{d.spec}</div>
            <div className="doctor-exp">{d.exp}</div>
            <div className="doctor-skills">
              {d.skills.map((s) => (
                <span className="doctor-skill" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <button className="doctor-btn" onClick={() => setPage("booking")}>
              احجز موعداً
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
