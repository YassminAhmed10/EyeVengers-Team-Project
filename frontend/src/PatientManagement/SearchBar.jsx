import React from "react";

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-section">
      <div className="search-bar">
        <span className="material-symbols-outlined">search</span>
        <input 
          type="text" 
          placeholder="Search by patient name or phone number"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filters">
        <select>
          <option>Last Visit</option>
          <option>Today</option>
          <option>This Week</option>
        </select>
      </div>
    </div>
  );
}

export default SearchBar;