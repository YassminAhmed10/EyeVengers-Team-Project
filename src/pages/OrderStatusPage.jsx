import { Link, useLocation } from "react-router-dom";
import glassBG6 from "../assets/glassBG6.jpg";
import PageHero from "../components/PageHero";
import "./OrderStatusPage.css";

const SUCCESS_STEPS = [
  { label: "Confirmed", done: true },
  { label: "Processing", done: true },
  { label: "Shipped", active: true },
  { label: "Delivered", done: false },
];

export default function OrderStatusPage() {
  const location = useLocation();
  const isSuccess = location.pathname.includes("success");

  return (
    <div
      className="order-status-page"
      style={{
        backgroundImage: `url(${glassBG6})`,
      }}
    >
      <main className="main container">
        <PageHero
          eyebrow=""
          title={isSuccess ? "Order Placed Successfully " : "Payment Failed"}
          description={
            isSuccess
              ? "Your order is confirmed. You can track it from your account."
              : "There was an issue while processing payment. Please try again."
          }
        />

        {/* Status Icon */}
        <div className="status-icon-wrap">
          <div className={`status-icon ${isSuccess ? "status-icon--success" : "status-icon--failed"}`}>
            {isSuccess ? "✓" : "✕"}
          </div>
        </div>

        <section className={`status-card ${isSuccess ? "status-card--success" : "status-card--failed"}`}>

          {/* Order Steps — success only */}
          {isSuccess && (
            <div className="status-steps">
              {SUCCESS_STEPS.map((step, index) => (
                <>
                  <div
                    key={step.label}
                    className={`status-step ${step.done ? "status-step--done" : ""} ${step.active ? "status-step--active" : ""}`}
                  >
                    <div className="status-step__dot">
                      {step.done ? "✓" : index + 1}
                    </div>
                    <span className="status-step__label">{step.label}</span>
                  </div>
                  {index < SUCCESS_STEPS.length - 1 && (
                    <div className={`status-step-line ${step.done ? "status-step-line--done" : ""}`} />
                  )}
                </>
              ))}
            </div>
          )}

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
    </div>
  );
}