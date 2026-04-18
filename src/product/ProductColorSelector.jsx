export default function ProductColorSelector({ palette, selectedColor, onSelectColor }) {
  return (
    <div className="details-section">
      <div className="color-selector-header">
        <h3 className="section-title">Frame Color</h3>
        <span className="selected-color-label">{palette[selectedColor]?.label}</span>
      </div>

      <div className="color-options">
        {palette.map((color, index) => (
          <button
            key={color.name}
            onClick={() => onSelectColor(index)}
            className={`color-circle ${selectedColor === index ? "active" : ""}`}
            title={color.label}
            aria-label={`Select ${color.label} color`}
          >
            <span style={{ background: color.hex }} />
          </button>
        ))}
      </div>
    </div>
  );
}