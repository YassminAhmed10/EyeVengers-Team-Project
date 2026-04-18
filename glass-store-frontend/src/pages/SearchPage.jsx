import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { PRODUCTS } from "../data/products";
import "./SearchPage.css";
import glassBG1 from "../assets/glassBG1.jpg"; // Adjust path as needed

export default function SearchPage() {
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const keyword = term.trim().toLowerCase();

    if (!keyword) {
      return [];
    }

    return PRODUCTS.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.subtitle.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      );
    });
  }, [term]);

  return (
    <main className="search-page">
      <div className="container">
        <PageHero
          eyebrow=""
          title="Discover Eyewear Fast"
          description="Search by product name, style, or description."
        />

        {/* Search Box with Frame */}
        <section className="search-box-section">
          <div className="search-card">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                className="search-input"
                placeholder="Type anything... cat-eye, tortoise, lightweight"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
              />
              {term && (
                <button className="search-clear" onClick={() => setTerm("")}>
                  ✕
                </button>
              )}
            </div>
            <p className="search-hint">
              Try: "round frame", "blue light", "metal", "aviator"
            </p>
          </div>
        </section>

        {/* Empty State with Image */}
        {!term && (
          <section className="empty-state-section">
            <div className="empty-state-card">
              <div 
                className="empty-state-graphic"
                style={{ backgroundImage: `url(${glassBG1})` }}
              >
                <div className="empty-state-overlay"></div>
              </div>
              <div className="empty-state-content">
                <h3>Start exploring</h3>
                <p>Type a keyword to find your perfect pair of glasses</p>
                <div className="search-suggestions">
                  <span>Popular searches:</span>
                  <button onClick={() => setTerm("cat-eye")}>cat-eye</button>
                  <button onClick={() => setTerm("round")}>round</button>
                  <button onClick={() => setTerm("metal")}>metal</button>
                  <button onClick={() => setTerm("blue light")}>blue light</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search Results */}
        {term && (
          <section className="results-section">
            <div className="results-header">
              <p className="results-count">
                <span className="count-number">{results.length}</span>
                {results.length === 1 ? " result found" : " results found"}
              </p>
              <p className="results-keyword">for "{term}"</p>
            </div>

            {results.length > 0 ? (
              <div className="results-grid">
                {results.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="result-card">
                    <div className="result-card__image">
                      <img src={item.image} alt={item.name} />
                      {item.badge && <span className="result-badge">{item.badge}</span>}
                    </div>
                    <div className="result-card__content">
                      <h3 className="result-card__title">{item.name}</h3>
                      <p className="result-card__subtitle">{item.subtitle}</p>
                      <div className="result-card__footer">
                        <strong className="result-card__price">EGP {item.price}</strong>
                        <span className="result-card__arrow">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-results-card">
                <div className="no-results-icon">😕</div>
                <h3>No matches found</h3>
                <p>Try a different keyword or browse our collections</p>
                <div className="no-results-suggestions">
                  <Link to="/shop" className="suggestion-link">Browse all frames</Link>
                  <Link to="/size-guide" className="suggestion-link">Size guide</Link>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}