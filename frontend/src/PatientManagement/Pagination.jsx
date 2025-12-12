import React from "react";

function Pagination() {
  return (
    <div className="pagination">
      <a href="#">«</a>
      <a href="#" className="active">1</a>
      <a href="#">2</a>
      <a href="#">3</a>
      <a href="#">...</a>
      <a href="#">10</a>
      <a href="#">»</a>
    </div>
  );
}

export default Pagination;