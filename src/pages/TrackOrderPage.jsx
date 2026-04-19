import { useState } from "react";
import { motion } from "framer-motion";
import glassBG6 from "../assets/glassBG6.jpg";
import "./TrackOrderPage.css";

const STAGES = [
  { label: "Order Received",   icon: "📦" },
  { label: "Lens Processing",  icon: "🔬" },
  { label: "Quality Check",    icon: "✅" },
  { label: "Out for Delivery", icon: "🚚" },
];

const MOCK_ACTIVE = 1;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: d },
  }),
};

export default function TrackOrderPage() {
  const [orderId, setOrderId]   = useState("");
  const [phone, setPhone]       = useState("");
  const [searched, setSearched] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="track-page">
      {/* ── Fixed background layers ── */}
      <div
        className="track-bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${glassBG6})` }}
      />
      <div className="track-grid" aria-hidden="true" />

      <div className="track-container">

        {/* ── Hero — fully transparent, no card ── */}
        <header className="track-hero">
          <motion.p
            className="track-hero__eyebrow"
            variants={fadeUp} custom={0}
            initial="hidden" animate="visible"
          >
            
          </motion.p>

          <motion.h1
            className="track-hero__title"
            variants={fadeUp} custom={0.1}
            initial="hidden" animate="visible"
          >
            Track Your Eyewear <em>Delivery</em>
          </motion.h1>

          <motion.p
            className="track-hero__desc"
            variants={fadeUp} custom={0.2}
            initial="hidden" animate="visible"
          >
            Enter your order code and phone number to check live status.
          </motion.p>
        </header>

        {/* ── Main card ── */}
        <motion.section
          className="track-order-box"
          variants={fadeUp} custom={0.3}
          initial="hidden" animate="visible"
        >
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button className="btn-primary" type="submit">Track</button>
          </form>

          {searched && (
            <>
              <div className="track-divider"><span>Order status</span></div>

              <ul className="track-order-steps" data-active={MOCK_ACTIVE + 1}>
                {STAGES.map((stage, index) => {
                  const isDone    = index < MOCK_ACTIVE;
                  const isCurrent = index === MOCK_ACTIVE;
                  const isActive  = index <= MOCK_ACTIVE;
                  return (
                    <li
                      key={stage.label}
                      className={[
                        isActive  ? "is-active"  : "",
                        isCurrent ? "is-current" : "",
                        isDone    ? "is-done"    : "",
                      ].filter(Boolean).join(" ")}
                    >
                      <span aria-hidden="true">{isDone ? "✓" : index + 1}</span>
                      <p>{stage.label}</p>
                    </li>
                  );
                })}
              </ul>

              <div className="track-eta">
                <div className="track-eta__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="track-eta__text">
                  <strong>Estimated delivery: </strong>
                  <span>April 22 – April 24</span>
                  &nbsp;· Your lenses are being precision-crafted.
                </p>
              </div>
            </>
          )}
        </motion.section>

      </div>
    </div>
  );
}