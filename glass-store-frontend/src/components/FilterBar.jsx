import { useState } from "react";

const filters = ["All Categories", "Sunglasses", "Optical"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Newest"];

export default function FilterBar() {
  const [active, setActive] = useState("All Categories");
  const [sort, setSort] = useState("Featured");

  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActive(filter)}
          className={`filter-bar__btn ${
            active === filter ? "filter-bar__btn--active" : ""
          }`}
        >
          {filter}
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      ))}

      <div className="filter-bar__sort">
        <span>Sort by:</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {sortOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
