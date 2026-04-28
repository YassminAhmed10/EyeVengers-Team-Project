export default function ProductLensSelector({
  lensOptions,
  selectedLens,
  onSelectLens,
  formatPrice,
}) {
  return (
    <div className="details-section">
      <h3 className="section-title">Lens Type</h3>

      <div className="lens-grid">
        {lensOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectLens(option.id)}
            className={`lens-card ${selectedLens === option.id ? "active" : ""}`}
            aria-pressed={selectedLens === option.id}
          >
            <div className="lens-card__body">
              <strong className="lens-card__name">{option.name}</strong>
              <p className="lens-card__desc">{option.description}</p>
            </div>
            <span className="lens-price">
              {option.extraPrice === 0
                ? "Included"
                : `+${formatPrice(option.extraPrice)}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}