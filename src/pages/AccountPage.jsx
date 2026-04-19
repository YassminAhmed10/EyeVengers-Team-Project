import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import glassBG6 from "../assets/glassBG6.jpg";
import PageHero from "../components/PageHero";
import InfoCard from "../components/InfoCard";
import "./AccountPage.css";

const EGP_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: d },
  }),
};

export default function AccountPage({ wishlistProducts = [], recentlyViewedProducts = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "overview";
  const activeTab = ["overview", "saved", "recent"].includes(rawTab) ? rawTab : "overview";

  const setTab = (tab) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="account-page">
      {/* ── Fixed background layers ── */}
      <div
        className="account-bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${glassBG6})` }}
      />
      <div className="account-grid" aria-hidden="true" />

      <div className="container">
        {/* ── Hero ── */}
        <PageHero
          eyebrow="Account"
          title="Your Profile & Orders"
          description="Manage profile data, addresses, orders, and saved prescription."
          action={
            <div className="inline-actions">
              <Link className="btn-secondary" to="/login">Login</Link>
              <Link className="btn-primary" to="/register">Create Account</Link>
            </div>
          }
        />

        {/* ── Tabs ── */}
        <motion.section
          className="account-tabs"
          aria-label="Account sections"
          variants={fadeUp} custom={0.15}
          initial="hidden" animate="visible"
        >
          {["overview", "saved", "recent"].map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "is-active" : ""}
              onClick={() => setTab(tab)}
            >
              {tab === "overview" ? "Overview" : tab === "saved" ? "Saved Items" : "Recently Viewed"}
            </button>
          ))}
        </motion.section>

        {/* ── Overview info cards ── */}
        {activeTab === "overview" && (
          <motion.section
            className="cards-grid"
            variants={fadeUp} custom={0.25}
            initial="hidden" animate="visible"
          >
            <InfoCard
              title="Profile"
              text="Update your name, phone, and email settings."
              cta={<button className="btn-link">Edit Profile</button>}
            />
            <InfoCard
              title="Addresses"
              text="Save multiple delivery addresses for faster checkout."
              cta={<button className="btn-link">Manage Addresses</button>}
            />
            <InfoCard
              title="Orders"
              text="See current and previous order status details."
              cta={<Link to="/track-order" className="btn-link">Track an Order</Link>}
            />
            <InfoCard
              title="Saved Prescription"
              text="Store and reuse your latest prescription values."
              cta={<button className="btn-link">View Prescription</button>}
            />
          </motion.section>
        )}

        {/* ── Showcase (Saved + Recent) ── */}
        {(activeTab === "saved" || activeTab === "overview" || activeTab === "recent") && (
          <motion.section
            className="account-showcase-grid"
            variants={fadeUp} custom={0.35}
            initial="hidden" animate="visible"
          >
            {(activeTab === "saved" || activeTab === "overview") && (
              <article className="account-showcase">
                <div className="account-showcase__head">
                  <h3>Saved Items</h3>
                  <Link to="/wishlist" className="btn-link">Open Wishlist</Link>
                </div>

                {wishlistProducts.length === 0 && (
                  <p className="account-empty-note">
                    No saved items yet. Tap the heart icon to save frames.
                  </p>
                )}

                <div className="account-product-list">
                  {wishlistProducts.slice(0, 8).map((item) => (
                    <Link key={item.id} className="account-product-item" to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.subtitle}</p>
                      </div>
                      <span>{EGP_FORMATTER.format(item.price)}</span>
                    </Link>
                  ))}
                </div>
              </article>
            )}

            {(activeTab === "recent" || activeTab === "overview") && (
              <article className="account-showcase">
                <div className="account-showcase__head">
                  <h3>Recently Viewed</h3>
                  <Link to="/shop" className="btn-link">Continue Shopping</Link>
                </div>

                {recentlyViewedProducts.length === 0 && (
                  <p className="account-empty-note">
                    Start browsing products and your recently viewed list will appear here.
                  </p>
                )}

                <div className="account-product-list">
                  {recentlyViewedProducts.slice(0, 8).map((item) => (
                    <Link key={item.id} className="account-product-item" to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.subtitle}</p>
                      </div>
                      <span>{EGP_FORMATTER.format(item.price)}</span>
                    </Link>
                  ))}
                </div>
              </article>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}