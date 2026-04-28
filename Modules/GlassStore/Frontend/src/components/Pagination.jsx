import { useState } from "react";

export default function Pagination({ totalPages = 3 }) {
  const [current, setCurrent] = useState(1);

  return (
    <div className="pagination">
      <button
        onClick={() => setCurrent((p) => Math.max(1, p - 1))}
        className="pagination__btn"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrent(page)}
          className={`pagination__btn ${
            current === page ? "pagination__btn--active" : ""
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrent((p) => Math.min(totalPages, p + 1))}
        className="pagination__btn"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
