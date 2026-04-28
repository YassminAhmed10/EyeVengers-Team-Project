import { Link, useLocation } from "react-router-dom";
import PageHero from "../components/PageHero";

export default function OrderStatusPage() {
  const location = useLocation();
  const isSuccess = location.pathname.includes("success");

  return (
    <main className="main container">
      <PageHero
        eyebrow="Order Status"
        title={isSuccess ? "Order Placed Successfully" : "Payment Failed"}
        description={
          isSuccess
            ? "Your order is confirmed. You can track it from your account."
            : "There was an issue while processing payment. Please try again."
        }
      />

      <section className="status-card">
        <p>
          {isSuccess
            ? "A confirmation message will be sent to your phone and email."
            : "No payment was charged. Your cart is still available for retry."}
        </p>
        <div className="status-card__actions">
          <Link className="btn-primary" to={isSuccess ? "/track-order" : "/checkout"}>
            {isSuccess ? "Track Your Order" : "Back to Checkout"}
          </Link>
          <Link className="btn-secondary" to="/shop">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
