import { Link } from "react-router-dom";

export default function ProductBreadcrumb({ productName }) {
  return (
    <div className="details-breadcrumb">
      <Link to="/">Shop</Link>
      <span>/</span>
      <span>{productName}</span>
    </div>
  );
}
