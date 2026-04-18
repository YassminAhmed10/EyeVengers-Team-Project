import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import PlaceholderImage from "../components/PlaceholderImage";

export default function ComparePage({ compareProducts }) {
  return (
    <main className="main container">
      <PageHero
        eyebrow="Compare"
        title="Compare Up To 3 Frames"
        description="Line up style, fit, and price before buying."
      />

      {compareProducts.length === 0 ? (
        <section className="empty-state">
          <PlaceholderImage label="Compare Placeholder" ratio="16 / 6" />
          <p>You have not selected frames to compare yet.</p>
          <Link className="btn-primary" to="/shop">
            Go to Shop
          </Link>
        </section>
      ) : (
        <section className="compare-grid">
          {compareProducts.map((item) => (
            <article key={item.id} className="compare-card">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>{item.subtitle}</p>
              <ul>
                <li>Style: {item.style}</li>
                <li>Material: {item.frameMaterial}</li>
                <li>Fit: {item.fit}</li>
              </ul>
              <strong>EGP {item.price}</strong>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
