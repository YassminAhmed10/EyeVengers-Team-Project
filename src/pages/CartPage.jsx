import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import glassBG6 from "../assets/glassBG6.jpg";
import "./CartPage.css";

const EGP_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const formatPrice = (amount) => EGP_FORMATTER.format(amount);

const quarterSteps = (start, end) => {
  const values = [];
  for (let value = start; value <= end + 0.0001; value += 0.25) {
    const fixed = value.toFixed(2);
    values.push(Number(fixed) > 0 ? `+${fixed}` : fixed);
  }
  return values;
};

const SPHERE_VALUES   = ["None/PL", ...quarterSteps(-12, 6)];
const CYLINDER_VALUES = ["None/SPH", ...quarterSteps(-6, 0).filter((v) => v !== "0.00")];
const AXIS_VALUES     = ["None", ...Array.from({ length: 180 }, (_, i) => String(i + 1))];
const ADD_VALUES      = ["n/a", "+0.75", "+1.00", "+1.25", "+1.50", "+1.75", "+2.00", "+2.25", "+2.50"];
const PD_VALUES       = Array.from({ length: 42 }, (_, i) => (54 + i * 0.5).toFixed(1));
const BIRTH_YEARS     = Array.from({ length: 77 }, (_, i) => String(new Date().getFullYear() - i));

const defaultEye = { sphere: "None/PL", cylinder: "None/SPH", axis: "None" };

const fadeInUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const staggerContainer = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const slideDown = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.2 } },
};

export default function CartPage({ cartItems, onUpdateQty, onRemoveItem }) {
  const navigate = useNavigate();

  const [prescriptionType,      setPrescriptionType]      = useState("single-vision");
  const [rightEye,              setRightEye]              = useState(defaultEye);
  const [leftEye,               setLeftEye]               = useState(defaultEye);
  const [addValue,              setAddValue]              = useState("n/a");
  const [pupillaryDistance,     setPupillaryDistance]     = useState("");
  const [useTwoPd,              setUseTwoPd]              = useState(false);
  const [rightPd,               setRightPd]               = useState("");
  const [leftPd,                setLeftPd]                = useState("");
  const [birthYear,             setBirthYear]             = useState("");
  const [prescriptionName,      setPrescriptionName]      = useState("");
  const [showPrescriptionGuide, setShowPrescriptionGuide] = useState(false);
  const [uploadedPrescription,  setUploadedPrescription]  = useState(null);
  const [uploadError,           setUploadError]           = useState("");
  const fileInputRef = useRef(null);

  const subtotal = useMemo(
    () => cartItems.reduce((t, item) => t + item.price * (item.qty ?? 1), 0),
    [cartItems]
  );

  const handlePrescriptionFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setUploadError("Only PDF files are allowed.");
      setUploadedPrescription(null);
      e.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("PDF size must be less than 8 MB.");
      setUploadedPrescription(null);
      e.target.value = "";
      return;
    }
    setUploadError("");
    setUploadedPrescription({ name: file.name, sizeMb: (file.size / (1024 * 1024)).toFixed(2) });
  };

  /* ── Empty cart ── */
  if (!cartItems.length) {
    return (
      <div className="cart-page" style={{ backgroundImage: `url(${glassBG6})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add your favorite frame first, then complete your prescription details here.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="cart-page" style={{ backgroundImage: `url(${glassBG6})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <motion.div
        className="cart-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* ══════════════════════════════════════
            LEFT — Order panel
        ══════════════════════════════════════ */}
        <motion.aside variants={fadeInUp} className="order-panel">

          <div className="order-panel__currency">EGP</div>

          <div className="order-panel__list">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.article
                  key={item.cartItemId}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.25 }}
                  className="order-item"
                >
                  <img src={item.image} alt={item.name} className="order-item__image" />

                  <div className="order-item__meta">
                    <div className="order-item__info">
                      <h3>{item.name}</h3>
                      <p>{item.color}</p>
                      <small>Lens: {item.lens}</small>
                    </div>

                    <div className="order-item__controls">
                      <strong className="order-item__price">
                        {formatPrice(item.price * (item.qty ?? 1))}
                      </strong>
                      <div className="order-item__qty">
                        <label htmlFor={`qty-${item.cartItemId}`}>Qty</label>
                        <select
                          id={`qty-${item.cartItemId}`}
                          value={item.qty ?? 1}
                          onChange={(e) => onUpdateQty(item.cartItemId, Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5].map((q) => <option key={q} value={q}>{q}</option>)}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="order-item__remove"
                        onClick={() => onRemoveItem(item.cartItemId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <div className="order-panel__subtotal">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <p className="order-panel__shipping-note">
            Free standard shipping on orders over EGP 79.00 (before any shipping fees are added)
          </p>

          <div className="order-panel__perks">
            <span>Need Help?</span>
            <span>60-Day Return</span>
            <span>365-Day Warranty</span>
          </div>
        </motion.aside>

        {/* ══════════════════════════════════════
            RIGHT — Prescription flow
        ══════════════════════════════════════ */}
        <motion.section variants={fadeInUp} className="prescription-flow">

          <div className="prescription-flow__header">
            <Link to="/" className="prescription-flow__back">
              <span className="material-symbols-outlined">chevron_left</span>
              Back
            </Link>
            <button type="button" className="prescription-flow__close" aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            className="prescription-flow__helper"
            onClick={() => setShowPrescriptionGuide((p) => !p)}
          >
            <span className="material-symbols-outlined">info</span>
            {showPrescriptionGuide ? "Hide prescription guide" : "How to read your prescription"}
          </motion.button>

          <AnimatePresence>
            {showPrescriptionGuide && (
              <motion.article
                variants={slideDown} initial="hidden" animate="visible" exit="exit"
                className="prescription-guide-card"
              >
                <h4>Prescription Fields Quick Guide</h4>
                <ul>
                  <li><strong>OD / OS:</strong> Right eye and left eye values.</li>
                  <li><strong>SPH:</strong> Spherical power for near/far vision correction.</li>
                  <li><strong>CYL:</strong> Astigmatism correction value.</li>
                  <li><strong>Axis:</strong> Astigmatism angle from 1 to 180.</li>
                  <li><strong>ADD:</strong> Extra near power for reading/progressive lenses.</li>
                  <li><strong>PD:</strong> Pupillary distance in mm.</li>
                </ul>
              </motion.article>
            )}
          </AnimatePresence>

          <div className="prescription-surface">

            <div className="prescription-surface__top">
              <p><a href="#">Login</a> to use your saved prescription</p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="button"
                className="prescription-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Upload Prescription PDF
              </motion.button>
              <input
                ref={fileInputRef} type="file" accept="application/pdf,.pdf"
                className="sr-only-input" onChange={handlePrescriptionFile}
              />
            </div>

            <AnimatePresence>
              {uploadedPrescription && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="prescription-uploaded"
                >
                  <span className="status-pill status-pill--success">PDF uploaded</span>
                  <p>{uploadedPrescription.name} ({uploadedPrescription.sizeMb} MB)</p>
                  <button type="button" className="btn-link"
                    onClick={() => { setUploadedPrescription(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  >Remove file</button>
                </motion.div>
              )}
            </AnimatePresence>

            {uploadError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prescription-upload-error">
                {uploadError}
              </motion.p>
            )}

            {/* Type toggle */}
            <div className="prescription-type">
              {["single-vision", "bifocal", "progressive"].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="button"
                  className={`prescription-type__btn${prescriptionType === type ? " prescription-type__btn--active" : ""}`}
                  onClick={() => setPrescriptionType(type)}
                >
                  {type.replace("-", " ")}
                </motion.button>
              ))}
            </div>

            {/* Prescription table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="prescription-table"
            >
              <div className="prescription-table__header" />
              <div className="prescription-table__header">SPH</div>
              <div className="prescription-table__header">CYL</div>
              <div className="prescription-table__header">Axis</div>

              <div className="prescription-table__label"><strong>OD</strong><span>(Right Eye)</span></div>
              <select value={rightEye.sphere}   onChange={(e) => setRightEye((p) => ({ ...p, sphere:   e.target.value }))}>
                {SPHERE_VALUES.map((o)   => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={rightEye.cylinder} onChange={(e) => setRightEye((p) => ({ ...p, cylinder: e.target.value }))}>
                {CYLINDER_VALUES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={rightEye.axis}     onChange={(e) => setRightEye((p) => ({ ...p, axis:     e.target.value }))}>
                {AXIS_VALUES.map((o)     => <option key={o} value={o}>{o}</option>)}
              </select>

              <div className="prescription-table__label"><strong>OS</strong><span>(Left Eye)</span></div>
              <select value={leftEye.sphere}   onChange={(e) => setLeftEye((p) => ({ ...p, sphere:   e.target.value }))}>
                {SPHERE_VALUES.map((o)   => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={leftEye.cylinder} onChange={(e) => setLeftEye((p) => ({ ...p, cylinder: e.target.value }))}>
                {CYLINDER_VALUES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={leftEye.axis}     onChange={(e) => setLeftEye((p) => ({ ...p, axis:     e.target.value }))}>
                {AXIS_VALUES.map((o)     => <option key={o} value={o}>{o}</option>)}
              </select>
            </motion.div>

            {/* Extra fields */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="prescription-extra-grid"
            >
              <label className="prescription-extra-grid__label">ADD (Near Addition)</label>
              <select value={addValue} onChange={(e) => setAddValue(e.target.value)}>
                {ADD_VALUES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>

              <label className="prescription-extra-grid__label">PD (Pupillary Distance)</label>
              <div className="pd-group">
                {!useTwoPd && (
                  <select value={pupillaryDistance} onChange={(e) => setPupillaryDistance(e.target.value)}>
                    <option value="">Select PD</option>
                    {PD_VALUES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {useTwoPd && (
                  <div className="pd-double">
                    <select value={rightPd} onChange={(e) => setRightPd(e.target.value)}>
                      <option value="">Right PD</option>
                      {PD_VALUES.map((o) => <option key={`r-${o}`} value={o}>{o}</option>)}
                    </select>
                    <select value={leftPd} onChange={(e) => setLeftPd(e.target.value)}>
                      <option value="">Left PD</option>
                      {PD_VALUES.map((o) => <option key={`l-${o}`} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}
                <label className="pd-toggle">
                  <input type="checkbox" checked={useTwoPd} onChange={(e) => setUseTwoPd(e.target.checked)} />
                  Two PD numbers?
                </label>
              </div>

              <label className="prescription-extra-grid__label">Birth Year</label>
              <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
                <option value="">Select</option>
                {BIRTH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              <label className="prescription-extra-grid__label">Prescription Name</label>
              <input
                type="text" placeholder="e.g. Latest Eye Exam"
                value={prescriptionName} onChange={(e) => setPrescriptionName(e.target.value)}
              />
            </motion.div>

            {/* Checkout bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="cart-summary"
            >
              <div className="cart-summary__total">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="button" className="btn-primary"
                onClick={() => navigate("/checkout")}
              >
                Continue to Checkout
              </motion.button>
            </motion.div>

          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}