import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const Logo = () => (
  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
  </svg>
);

export default function Navbar({ cartCount = 0, wishlistCount = 0, compareCount = 0, forceTransparent = false }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = forceTransparent ? !scrolled : false;

  return (
    <motion.header
      className={`navbar ${isTransparent ? "navbar--transparent" : "navbar--scrolled"}`}
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container">
        <div className="navbar__inner">
          <div className="navbar__left">
            <Link to="/" className="navbar__logo">
              <span className="navbar__logo-mark" aria-hidden="true">
                <Logo />
              </span>
              <div className="navbar__logo-copy">
                <h1 className="navbar__logo-text">AURA</h1>
                <small className="navbar__logo-home">Home</small>
              </div>
            </Link>
            <nav className="navbar__nav">
              <NavLink to="/shop" className={({ isActive }) => `navbar__nav-link ${isActive ? "navbar__nav-link--active" : ""}`}>
                Shop
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => `navbar__nav-link ${isActive ? "navbar__nav-link--active" : ""}`}>
                Search
              </NavLink>
              <NavLink to="/wishlist" className={({ isActive }) => `navbar__nav-link ${isActive ? "navbar__nav-link--active" : ""}`}>
                Wishlist
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `navbar__nav-link ${isActive ? "navbar__nav-link--active" : ""}`}>
                About
              </NavLink>
              <NavLink to="/help-center" className={({ isActive }) => `navbar__nav-link ${isActive ? "navbar__nav-link--active" : ""}`}>
                Help
              </NavLink>
            </nav>
          </div>

          <div className="navbar__right">
            <div className="navbar__actions">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link to="/compare" className="navbar__icon-btn" aria-label="Open compare">
                  <span className="material-symbols-outlined">balance</span>
                  {compareCount > 0 && <span className="navbar__cart-count">{compareCount}</span>}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link to="/wishlist" className="navbar__icon-btn" aria-label="Open wishlist">
                  <span className="material-symbols-outlined">favorite</span>
                  {wishlistCount > 0 && <span className="navbar__cart-count">{wishlistCount}</span>}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link to="/cart" className="navbar__icon-btn" aria-label="Open cart">
                  <span className="material-symbols-outlined">shopping_bag</span>
                  {cartCount > 0 && <span className="navbar__cart-dot" />}
                  {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link to="/account" className="navbar__icon-btn" aria-label="Open account">
                  <span className="material-symbols-outlined">person</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}