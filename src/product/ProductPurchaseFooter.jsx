export default function ProductPurchaseFooter({ totalPrice, formatPrice, onAddToCart }) {
  return (
    <div className="purchase-box">
      <div>
        <p className="price-label">Total</p>
        <h2 className="price">{formatPrice(totalPrice)}</h2>
      </div>

      <button className="btn-primary add-to-cart" onClick={onAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}