import { useState } from "react";

const STYLES = ["All Styles", "Aviator", "Round", "Square", "Geometric", "Cat-eye"];

const COLORS = [
  "#1a1a1a",
  "#D4AF37",
  "#87CEEB",
  "#C0C0C0",
  "#000080",
  "#800000",
  "#228B22",
];

export default function SidebarFilter() {
  const [selectedStyles, setSelectedStyles] = useState(["All Styles"]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState(500);

  const toggleStyle = (style) => {
    if (style === "All Styles") {
      setSelectedStyles(["All Styles"]);
    } else {
      setSelectedStyles((prev) => {
        const without = prev.filter((s) => s !== "All Styles");
        return without.includes(style)
          ? without.filter((s) => s !== style)
          : [...without, style];
      });
    }
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAll = () => {
    setSelectedStyles(["All Styles"]);
    setSelectedColors([]);
    setPriceRange(500);
  };

  return (
    <aside className="sidebar-filter">
      {/* STYLES */}
      <div className="sidebar-filter__section">
        <h4 className="sidebar-filter__title">STYLES</h4>
        <div className="sidebar-filter__styles">
          {STYLES.map((style) => (
            <label key={style} className="sidebar-filter__checkbox-label">
              <input
                type="checkbox"
                checked={selectedStyles.includes(style)}
                onChange={() => toggleStyle(style)}
                className="sidebar-filter__checkbox"
              />
              <span>{style}</span>
            </label>
          ))}
        </div>
      </div>

      {/* COLORS */}
      <div className="sidebar-filter__section">
        <h4 className="sidebar-filter__title">COLORS</h4>
        <div className="sidebar-filter__colors">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`sidebar-filter__color-swatch${
                selectedColors.includes(color)
                  ? " sidebar-filter__color-swatch--active"
                  : ""
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div className="sidebar-filter__section">
        <h4 className="sidebar-filter__title">PRICE RANGE</h4>
        <input
          type="range"
          min={100}
          max={500}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="sidebar-filter__range"
        />
        <div className="sidebar-filter__price-labels">
          <span>$100</span>
          <span>${priceRange}</span>
        </div>
      </div>

      {/* Clear All */}
      <button onClick={clearAll} className="sidebar-filter__clear">
        Clear All Filters
      </button>
    </aside>
  );
}
