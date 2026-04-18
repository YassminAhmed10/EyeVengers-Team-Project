export default function InfoCard({ title, text, cta }) {
  return (
    <article className="info-card">
      <h3>{title}</h3>
      <p>{text}</p>
      {cta ? <div className="info-card__cta">{cta}</div> : null}
    </article>
  );
}
