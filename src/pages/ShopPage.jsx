import { useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { PRODUCTS } from "../data/products";
import heroBg from "../assets/glassBG2.jpg";
import "./ShopPage.css";

const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Name A-Z"];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.96,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export default function ShopPage({
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onToggleCompare,
  compareIds,
}) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const sortBy = searchParams.get("sort") ?? "Featured";
  const collection = searchParams.get("collection") ?? "all";
  const maxPrice = Number(searchParams.get("maxPrice") ?? "300");

  const updateParam = (key, value, defaultValue) => {
    const params = new URLSearchParams(searchParams);
    if (value === "" || value === defaultValue || value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    setSearchParams(params, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const base = PRODUCTS.filter((item) => {
      const search = query.trim().toLowerCase();
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.subtitle.toLowerCase().includes(search) ||
        item.style.toLowerCase().includes(search);
      const audience = item.audience ?? "adult";
      const matchesCollection = collection === "all" || collection === audience;
      return matchesSearch && matchesCollection && item.price <= maxPrice;
    });

    const sorted = [...base];
    if (sortBy === "Price: Low to High") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "Name A-Z") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [query, sortBy, collection, maxPrice]);

  const hasActiveFilters =
    query !== "" || sortBy !== "Featured" || collection !== "all" || maxPrice !== 300;

  const clearFilters = () => setSearchParams({}, { replace: true });

  const collectionTabs = [
    { value: "all", label: "All" },
    { value: "adult", label: "Adults" },
    { value: "kids", label: "Kids" },
  ];

  return (
    <main className="shop-page">

      {/* ── HERO ── */}
      <section className="shop-hero" ref={heroRef}>
        <motion.div
          className="shop-hero__bg"
          style={{ backgroundImage: `url(${heroBg})`, y: heroY }}
        />
        <div className="shop-hero__overlay" />
        <motion.div className="shop-hero__content" style={{ opacity: heroOpacity }}>
          <motion.span
            className="shop-hero__tag"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            New Collection 2025
          </motion.span>
          <motion.h1
            className="shop-hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Find Your <span className="shop-hero__title--accent">Perfect Frame</span>
          </motion.h1>
          <motion.p
            className="shop-hero__subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Premium eyewear crafted for every face, every style, every moment.
          </motion.p>
          <motion.div
            className="shop-hero__actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.45 }}
          >
            <Link className="shop-hero__btn-primary" to="/compare">
              Compare Frames
            </Link>
            <Link className="shop-hero__btn-secondary" to="/virtual-try-on">
              Virtual Try-On
            </Link>
          </motion.div>
          <motion.div
            className="shop-hero__stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="shop-hero__stat">
              <span className="shop-hero__stat-value">{PRODUCTS.length}+</span>
              <span className="shop-hero__stat-label">Frames</span>
            </div>
            <div className="shop-hero__stat-divider" />
            <div className="shop-hero__stat">
              <span className="shop-hero__stat-value">50K+</span>
              <span className="shop-hero__stat-label">Customers</span>
            </div>
            <div className="shop-hero__stat-divider" />
            <div className="shop-hero__stat">
              <span className="shop-hero__stat-value">4.9★</span>
              <span className="shop-hero__stat-label">Rating</span>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          className="shop-hero__scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span className="shop-hero__scroll-dot" />
          <span>Scroll to explore</span>
        </motion.div>
      </section>

      {/* ── CONTROLS ── */}
      <motion.section
        className="shop-controls-wrap"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Collection tabs */}
        <div className="shop-tabs">
          {collectionTabs.map((tab) => (
            <button
              key={tab.value}
              className={`shop-tab ${collection === tab.value ? "shop-tab--active" : ""}`}
              onClick={() => updateParam("collection", tab.value, "all")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="shop-filters">
          <div className="shop-search-wrap">
            <span className="material-symbols-outlined shop-search-icon">search</span>
            <input
              type="search"
              className="shop-search"
              placeholder="Search frames, styles…"
              value={query}
              onChange={(e) => updateParam("q", e.target.value, "")}
            />
          </div>

          <select
            className="shop-select"
            value={sortBy}
            onChange={(e) => updateParam("sort", e.target.value, "Featured")}
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <label className="shop-range-label">
            <span className="shop-range-text">
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>payments</span>
              Max: EGP {maxPrice}
            </span>
            <input
              type="range"
              className="shop-range"
              min={150}
              max={300}
              step={5}
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", Number(e.target.value), 300)}
            />
          </label>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                className="shop-clear-btn"
                onClick={clearFilters}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Results count */}
        <motion.p
          key={filteredProducts.length}
          className="shop-results-count"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="shop-results-count__number">{filteredProducts.length}</span> frames found
        </motion.p>
      </motion.section>

      {/* ── GRID ── */}
      <section className="shop-grid-wrap">
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={`${collection}-${sortBy}-${query}-${maxPrice}`}
              className="shop-product-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map((product) => (
                <motion.div key={product.id} variants={cardVariants} layout>
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleCompare={onToggleCompare}
                    isCompared={compareIds.includes(product.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="shop-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <span className="material-symbols-outlined shop-empty__icon">search_off</span>
              <h3 className="shop-empty__title">No frames found</h3>
              <p className="shop-empty__desc">Try adjusting your filters or raising the max price.</p>
              <button className="shop-empty__btn" onClick={clearFilters}>
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </main>
  );
}