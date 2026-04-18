import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import ProductCard from "../components/ProductCard";
import "./WishlistPage.css";

export default function WishlistPage({ wishlistProducts, onAddToCart, onToggleWishlist }) {
  return (
    <main className="wishlist-page">
      <div className="container">
        <PageHero
          eyebrow="Wishlist"
          title="Your Saved Frames"
          description="Keep your favorites in one place before you decide."
        />

        {wishlistProducts.length === 0 ? (
          <section className="empty-state">
            <div className="empty-state-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart icon on products to save them here.</p>
            <Link to="/shop" className="btn-primary">
              Explore Shop
            </Link>
          </section>
        ) : (
          <>
            <div className="wishlist-summary">
              <div className="wishlist-summary__count">
                <span className="wishlist-summary__number">{wishlistProducts.length}</span>
                <span className="wishlist-summary__text">
                  {wishlistProducts.length === 1 ? "item" : "items"} in your wishlist
                </span>
              </div>
              <div className="wishlist-summary__actions">
                <button className="clear-wishlist-btn" onClick={() => {}}>
                  Clear all
                </button>
                <button className="add-all-to-cart-btn" onClick={() => {}}>
                  Add all to cart
                </button>
              </div>
            </div>
            <div className="product-grid">
              {wishlistProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}