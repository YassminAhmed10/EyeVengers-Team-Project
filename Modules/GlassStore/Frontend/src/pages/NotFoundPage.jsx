import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="main container">
      <section className="empty-state">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="btn-primary" to="/">
          Back to Home
        </Link>
      </section>
    </main>
  );
}
