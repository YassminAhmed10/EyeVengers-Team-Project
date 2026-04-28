import ProductCard from "./ProductCard";
import { PRODUCTS } from "../data/products";
import "./ProductGrid.css";

export default function ProductGrid({
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onToggleCompare,
  compareIds = [],
  products = PRODUCTS,
}) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistIds.includes(product.id)}
          onToggleCompare={onToggleCompare}
          isCompared={compareIds.includes(product.id)}
        />
      ))}
    </div>
  );
}
