import { useState } from "react";
import PageHero from "../components/PageHero";

const STAGES = ["Order Received", "Lens Processing", "Quality Check", "Out for Delivery"];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <main className="main container">
      <PageHero
        eyebrow="Track Order"
        title="Track Your Eyewear Delivery"
        description="Enter your order code and phone number to check live status."
      />

      <section className="track-order-box">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearched(true);
          }}
        >
          <input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            required
          />
          <input type="tel" placeholder="Phone number" required />
          <button className="btn-primary" type="submit">
            Track
          </button>
        </form>

        {searched && (
          <ul className="track-order-steps">
            {STAGES.map((stage, index) => (
              <li key={stage} className={index <= 1 ? "is-active" : ""}>
                <span>{index + 1}</span>
                <p>{stage}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
