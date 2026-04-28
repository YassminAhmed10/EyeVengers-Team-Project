import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import "./ProductsSlider.css";

export default function ProductsSlider({
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onToggleCompare,
  compareIds = [],
  products = PRODUCTS,
  /** Pass true when rendering inside HomePage to hide Try On / Add to Cart */
  homePage = false,
}) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const SLIDE_WIDTH = () => {
    const card = trackRef.current?.querySelector(".ps-card");
    return card ? card.offsetWidth + 30 : 400;
  };

  const checkBounds = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkBounds, { passive: true });
    checkBounds();
    return () => el.removeEventListener("scroll", checkBounds);
  }, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * SLIDE_WIDTH(), behavior: "smooth" });
  };

  return (
    <div className="ps-root">
      <button
        className={`ps-nav ps-nav--prev ${!canPrev ? "ps-nav--hidden" : ""}`}
        onClick={() => scroll(-1)}
        aria-label="Previous"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="ps-track" ref={trackRef}>
        {products.map((product, i) => (
          <SliderCard
            key={`existing-${product.id}`}
            product={product}
            index={i}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlistIds.includes(product.id)}
            onToggleCompare={onToggleCompare}
            isCompared={compareIds.includes(product.id)}
            homePage={homePage}
          />
        ))}
      </div>

      <button
        className={`ps-nav ps-nav--next ${!canNext ? "ps-nav--hidden" : ""}`}
        onClick={() => scroll(1)}
        aria-label="Next"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Original card (your existing design)
   homePage=true → hides Try On & Add to Cart
───────────────────────────────────────── */
function SliderCard({
  product,
  index,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onToggleCompare,
  isCompared,
  homePage,
}) {
  const navigate = useNavigate();
  const { name, subtitle, price, colorOptions = [] } = product;
  const [selectedColor, setSelectedColor] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const activeColor = colorOptions[selectedColor] ?? colorOptions[0];
  const images = activeColor?.images?.length > 0 ? activeColor.images : [activeColor?.image ?? product.image];
  const img1 = images[0] ?? "";
  const img2 = images[1] ?? img1;

  const handleCart = (e) => {
    e.stopPropagation();
    onAddToCart?.({
      productId: product.id,
      name,
      image: img1,
      color: activeColor?.label ?? "Default",
      lens: "Standard",
      price,
      qty: 1,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  };

  const EGP = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "EGP",
    currencyDisplay: "code", minimumFractionDigits: 2,
  }).format(price);

  return (
    <motion.div
      className="ps-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.34, 1.2, 0.64, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Image area */}
      <div
        className="ps-card__img-wrap"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <motion.img
          className="ps-card__img ps-card__img--1"
          src={img1}
          alt={name}
          animate={hovered ? { opacity: 0, y: -20, scale: 0.93, filter: "blur(6px)" } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.38, ease: "easeInOut" }}
        />
        <motion.img
          className="ps-card__img ps-card__img--2"
          src={img2}
          alt={name}
          animate={hovered ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : { opacity: 0, y: 28, scale: 0.92, filter: "blur(7px)" }}
          transition={{ duration: 0.38, ease: "easeInOut" }}
        />

        {/* Wishlist / Compare icons */}
        <motion.div
          className="ps-card__actions"
          animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.22 }}
        >
          <button
            className="ps-card__icon-btn"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.id); }}
            title="Wishlist"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 17, fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
            >favorite</span>
          </button>
          <button
            className="ps-card__icon-btn"
            onClick={(e) => { e.stopPropagation(); onToggleCompare?.(product.id); }}
            title="Compare"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 17, fontVariationSettings: isCompared ? "'FILL' 1" : "'FILL' 0" }}
            >compare_arrows</span>
          </button>
        </motion.div>

        {/* CTA buttons — hidden on HomePage */}
        {!homePage && (
          <motion.div
            className="ps-card__cta"
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="ps-card__btn ps-card__btn--try"
              onClick={(e) => { e.stopPropagation(); navigate(`/virtual-try-on/${product.id}`); }}
            >Try On</button>
            <AnimatePresence mode="wait">
              <motion.button
                key={cartAdded ? "added" : "cart"}
                className="ps-card__btn ps-card__btn--cart"
                onClick={handleCart}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {cartAdded ? "✓ Added!" : "Add to Cart"}
              </motion.button>
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="ps-card__info">
        <p className="ps-card__subtitle-top">{subtitle}</p>
        <div className="ps-card__row">
          <h3 className="ps-card__name">{name}</h3>
          <span className="ps-card__price">{EGP}</span>
        </div>
        <div className="ps-card__swatches">
          {colorOptions.map((c, i) => (
            <button
              key={i}
              className={`ps-card__swatch ${selectedColor === i ? "ps-card__swatch--active" : ""}`}
              style={{ background: c.hex }}
              title={c.label}
              onClick={() => setSelectedColor(i)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}