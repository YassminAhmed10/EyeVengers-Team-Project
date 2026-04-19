import { Link, useNavigate } from "react-router-dom";
import glassBG6 from "../assets/glassBG6.jpg";
import PageHero from "../components/PageHero";
import "./CheckoutPage.css";

const EGP_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const formatPrice = (amount) => EGP_FORMATTER.format(amount);

export default function CheckoutPage({ cartItems, onCheckoutSuccess }) {
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((total, item) => total + item.price * (item.qty ?? 1), 0);
  const shipping = subtotal > 500 ? 0 : 40;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (typeof onCheckoutSuccess === "function") {
      onCheckoutSuccess();
    }
    navigate("/order/success");
  };

  if (!cartItems.length) {
    return (
      <main
        className="main container"
        style={{
          backgroundImage: `url(${glassBG6})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <section className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Please add at least one item before checkout.</p>
          <Link className="btn-primary" to="/shop">
            Browse Frames
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className="main container"
      style={{
        backgroundImage: `url(${glassBG6})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <PageHero
        eyebrow=""
        title="Secure Checkout"
        description="Complete your order details and place your eyewear order."
      />

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={(event) => event.preventDefault()}>
          <h3>Shipping Information</h3>
          <input type="text" placeholder="Full name" required />
          <input type="tel" placeholder="Phone number" required />
          <input type="text" placeholder="City" required />
          <input type="text" placeholder="Address" required />

          <h3>Payment</h3>
          <select defaultValue="cod">
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card on Delivery</option>
            <option value="online">Online Payment</option>
          </select>

          <div className="checkout-form__actions">
            <button className="btn-primary" type="button" onClick={handlePlaceOrder}>
              Place Order
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate("/order/failed")}
            >
              Simulate Payment Failure
            </button>
          </div>
        </form>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item.cartItemId} className="checkout-summary__row">
              <span>{item.name} x {item.qty ?? 1}</span>
              <strong>{formatPrice(item.price * (item.qty ?? 1))}</strong>
            </div>
          ))}
          <div className="checkout-summary__row">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "Free" : formatPrice(shipping)}</strong>
          </div>
          <div className="checkout-summary__row checkout-summary__row--total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </aside>
      </section>
    </main>
  );
}