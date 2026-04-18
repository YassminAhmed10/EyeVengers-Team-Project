import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import ShopPage from "./pages/ShopPage";
import SearchPage from "./pages/SearchPage";
import WishlistPage from "./pages/WishlistPage";
import ComparePage from "./pages/ComparePage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import AccountPage from "./pages/AccountPage";
import AuthPage from "./pages/AuthPage";
import ContentPage from "./pages/ContentPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import ToolsPage from "./pages/ToolsPage";
import VirtualTryOnPage from "./pages/VirtualTryOnPage";
import SizeGuidePage from "./pages/SizeGuidePage";
import ReturnsCenterPage from "./pages/ReturnsCenterPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import { PRODUCTS } from "./data/products";
import "./components/styles.css";
import "./App.css";

const STORAGE_KEYS = {
  cartItems: "aura_cart_items_v1",
  wishlistIds: "aura_wishlist_ids_v1",
  compareIds: "aura_compare_ids_v1",
  recentlyViewedIds: "aura_recently_viewed_ids_v1",
};

const safeReadArray = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* Standard animated shell for all pages */
function RouteShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* Full-width shell — used ONLY for CartPage so it escapes any width constraints */
function FullWidthShell({ children }) {
  return (
    <motion.div
      style={{ width: "100%", overflowX: "hidden" }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [cartItems, setCartItems] = useState(() => safeReadArray(STORAGE_KEYS.cartItems));
  const [wishlistIds, setWishlistIds] = useState(() => safeReadArray(STORAGE_KEYS.wishlistIds));
  const [compareIds, setCompareIds] = useState(() => safeReadArray(STORAGE_KEYS.compareIds));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() =>
    safeReadArray(STORAGE_KEYS.recentlyViewedIds)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cartItems, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.wishlistIds, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.compareIds, JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recentlyViewedIds, JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  useEffect(() => {
    const match = location.pathname.match(/^\/product\/(\d+)/);
    if (!match) return;
    const viewedId = Number(match[1]);
    if (!Number.isFinite(viewedId)) return;
    setRecentlyViewedIds((prev) =>
      [viewedId, ...prev.filter((id) => id !== viewedId)].slice(0, 8)
    );
  }, [location.pathname]);

  const handleAddToCart = (item) => {
    setCartItems((prev) => [
      ...prev,
      {
        ...item,
        cartItemId: `${item.productId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      },
    ]);
  };

  const handleUpdateQty = (cartItemId, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  const handleRemoveItem = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleCheckoutSuccess = () => setCartItems([]);

  const handleToggleWishlist = (productId) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleToggleCompare = (productId) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= 3) return [...prev.slice(1), productId];
      return [...prev, productId];
    });
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.qty ?? 1), 0),
    [cartItems]
  );

  const wishlistProducts = useMemo(
    () => PRODUCTS.filter((item) => wishlistIds.includes(item.id)),
    [wishlistIds]
  );

  const compareProducts = useMemo(
    () => PRODUCTS.filter((item) => compareIds.includes(item.id)),
    [compareIds]
  );

  const recentlyViewedProducts = useMemo(() => {
    const productsById = new Map(PRODUCTS.map((item) => [item.id, item]));
    return recentlyViewedIds.map((id) => productsById.get(id)).filter(Boolean);
  }, [recentlyViewedIds]);

  const kidsProducts = useMemo(
    () => PRODUCTS.filter((item) => (item.audience ?? "adult") === "kids"),
    []
  );

  const adultProducts = useMemo(
    () => PRODUCTS.filter((item) => (item.audience ?? "adult") !== "kids"),
    []
  );

  const withTransition    = (element) => <RouteShell>{element}</RouteShell>;
  const withFullWidth     = (element) => <FullWidthShell>{element}</FullWidthShell>;

  return (
    <div className="app">
      <ScrollToTop />
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        compareCount={compareIds.length}
        forceTransparent={isHome}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          <Route
            path="/"
            element={withTransition(
              <HomePage
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlistIds}
                onToggleCompare={handleToggleCompare}
                compareIds={compareIds}
                adultProducts={adultProducts}
                kidsProducts={kidsProducts}
              />
            )}
          />

          <Route
            path="/shop"
            element={withTransition(
              <ShopPage
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlistIds}
                onToggleCompare={handleToggleCompare}
                compareIds={compareIds}
              />
            )}
          />

          <Route path="/search" element={withTransition(<SearchPage />)} />

          <Route
            path="/wishlist"
            element={withTransition(
              <WishlistPage
                wishlistProducts={wishlistProducts}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
              />
            )}
          />

          <Route
            path="/compare"
            element={withTransition(<ComparePage compareProducts={compareProducts} />)}
          />

          <Route
            path="/product/:productId"
            element={withTransition(<ProductDetailsPage onAddToCart={handleAddToCart} />)}
          />

          {/* ── Cart — uses FullWidthShell to escape container constraints ── */}
          <Route
            path="/cart"
            element={withFullWidth(
              <CartPage
                cartItems={cartItems}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
              />
            )}
          />

          <Route
            path="/checkout"
            element={withTransition(
              <CheckoutPage cartItems={cartItems} onCheckoutSuccess={handleCheckoutSuccess} />
            )}
          />

          <Route path="/order/success"      element={withTransition(<OrderStatusPage />)} />
          <Route path="/order/failed"       element={withTransition(<OrderStatusPage />)} />
          <Route path="/track-order"        element={withTransition(<TrackOrderPage />)} />

          <Route
            path="/account"
            element={withTransition(
              <AccountPage
                wishlistProducts={wishlistProducts}
                recentlyViewedProducts={recentlyViewedProducts}
              />
            )}
          />

          <Route path="/login"            element={withTransition(<AuthPage />)} />
          <Route path="/register"         element={withTransition(<AuthPage />)} />
          <Route path="/forgot-password"  element={withTransition(<AuthPage />)} />
          <Route path="/about"            element={withTransition(<ContentPage />)} />
          <Route path="/contact"          element={withTransition(<ContentPage />)} />
          <Route path="/faq"              element={withTransition(<ContentPage />)} />

          <Route
            path="/virtual-try-on"
            element={withTransition(<VirtualTryOnPage />)}
          />
          <Route
            path="/virtual-try-on/:productId"
            element={withTransition(<VirtualTryOnPage />)}
          />

          <Route path="/fit-assistant"      element={withTransition(<ToolsPage />)} />
          <Route path="/size-guide"         element={withTransition(<SizeGuidePage />)} />
          <Route path="/returns-center"     element={withTransition(<ReturnsCenterPage />)} />
          <Route path="/help-center"        element={withTransition(<HelpCenterPage />)} />
          <Route path="/shipping-returns"   element={withTransition(<ContentPage />)} />
          <Route path="/warranty"           element={withTransition(<ContentPage />)} />
          <Route path="/privacy"            element={withTransition(<ContentPage />)} />
          <Route path="/terms"              element={withTransition(<ContentPage />)} />
          <Route path="/cookies"            element={withTransition(<ContentPage />)} />
          <Route path="/admin"              element={withTransition(<AdminPage />)} />
          <Route path="*"                   element={withTransition(<NotFoundPage />)} />

        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  );
}