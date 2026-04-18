import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";

const REASONS = [
  "Wrong size/fit",
  "Not as expected",
  "Damaged item",
  "Changed my mind",
  "Delivered wrong product",
];

export default function ReturnsCenterPage() {
  const [form, setForm] = useState({
    orderId: "",
    email: "",
    reason: REASONS[0],
    itemCondition: "unworn",
    action: "exchange",
  });
  const [request, setRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(
    () => form.orderId.trim().length >= 4 && form.email.includes("@"),
    [form.email, form.orderId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const requestId = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;
    setRequest({
      requestId,
      eta: "Review in 24-48 hours",
      pickup: "Pickup window after approval: 1-2 business days",
    });
    setIsSubmitting(false);
  };

  return (
    <main className="main container">
      <PageHero
        eyebrow="Support"
        title="Returns & Exchange Center"
        description="Submit a return or exchange request without waiting for manual support."
      />

      <section className="returns-layout">
        <form className="returns-card" onSubmit={handleSubmit}>
          <h3>Start New Request</h3>

          <label>
            <span>Order Number</span>
            <input
              placeholder="Ex: AURA-20451"
              value={form.orderId}
              onChange={(event) => setForm((prev) => ({ ...prev, orderId: event.target.value }))}
            />
          </label>

          <label>
            <span>Email Address</span>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label>
            <span>Reason</span>
            <select
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
            >
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Item Condition</span>
            <select
              value={form.itemCondition}
              onChange={(event) => setForm((prev) => ({ ...prev, itemCondition: event.target.value }))}
            >
              <option value="unworn">Unused with original packaging</option>
              <option value="opened">Opened but no visible damage</option>
              <option value="used">Used (support review required)</option>
            </select>
          </label>

          <label>
            <span>Preferred Action</span>
            <select
              value={form.action}
              onChange={(event) => setForm((prev) => ({ ...prev, action: event.target.value }))}
            >
              <option value="exchange">Exchange</option>
              <option value="refund">Refund</option>
              <option value="store-credit">Store Credit</option>
            </select>
          </label>

          <button type="submit" className="btn-primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        <article className="returns-card returns-card--status">
          <h3>Request Status</h3>
          {!request && <p>Submit your details to generate a live return request ID.</p>}

          {request && (
            <div className="returns-status-box">
              <span className="status-pill status-pill--info">Request Created</span>
              <strong>{request.requestId}</strong>
              <p>{request.eta}</p>
              <p>{request.pickup}</p>
            </div>
          )}

          <ul>
            <li>Returns accepted within 14 days from delivery.</li>
            <li>Prescription lenses are reviewed case-by-case.</li>
            <li>Refunds are processed after quality check.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
