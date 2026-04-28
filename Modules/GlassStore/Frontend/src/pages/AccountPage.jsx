import { Link, useSearchParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import InfoCard from "../components/InfoCard";

const EGP_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

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
    <main className="main container">
      <PageHero
        eyebrow="Account"
        title="Your Profile & Orders"
        description="Manage profile data, addresses, orders, and saved prescription."
        action={
          <div className="inline-actions">
            <Link className="btn-secondary" to="/login">
              Login
            </Link>
            <Link className="btn-primary" to="/register">
              Create Account
            </Link>
          </div>
        }
      />

      <section className="account-tabs" aria-label="Account sections">
        <button
          type="button"
          className={activeTab === "overview" ? "is-active" : ""}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={activeTab === "saved" ? "is-active" : ""}
          onClick={() => setTab("saved")}
        >
          Saved Items
        </button>
        <button
          type="button"
          className={activeTab === "recent" ? "is-active" : ""}
          onClick={() => setTab("recent")}
        >
          Recently Viewed
        </button>
      </section>

      {activeTab === "overview" && (
        <section className="cards-grid">
          <InfoCard title="Profile" text="Update your name, phone, and email settings." cta={<button className="btn-link">Edit Profile</button>} />
          <InfoCard title="Addresses" text="Save multiple delivery addresses for faster checkout." cta={<button className="btn-link">Manage Addresses</button>} />
          <InfoCard title="Orders" text="See current and previous order status details." cta={<Link to="/track-order" className="btn-link">Track an Order</Link>} />
          <InfoCard title="Saved Prescription" text="Store and reuse your latest prescription values." cta={<button className="btn-link">View Prescription</button>} />
        </section>
      )}

      {(activeTab === "saved" || activeTab === "overview" || activeTab === "recent") && (
        <section className="account-showcase-grid">
          {(activeTab === "saved" || activeTab === "overview") && (
            <article className="account-showcase">
              <div className="account-showcase__head">
                <h3>Saved Items</h3>
                <Link to="/wishlist" className="btn-link">
                  Open Wishlist
                </Link>
              </div>

              {wishlistProducts.length === 0 && (
                <p className="account-empty-note">No saved items yet. Tap the heart icon to save frames.</p>
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
                <Link to="/shop" className="btn-link">
                  Continue Shopping
                </Link>
              </div>

              {recentlyViewedProducts.length === 0 && (
                <p className="account-empty-note">Start browsing products and your recently viewed list will appear here.</p>
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
        </section>
      )}
    </main>
  );
}
