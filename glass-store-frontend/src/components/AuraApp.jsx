 import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1, name: "Aeon Aviator", subtitle: "Signature Gold Series", price: 245,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn1ib2rzPBEaeVfR42DisyONqQS_WC_ayJ7-hascH_ydmdxxXq2RtIHE3M-j8FCSdyQpJGJKtgBMaHyzXeAMQadDDWRUE75FtOvOcwu5mSkeN9BawfeEduFW7RIHBjGxeYb9MpJB9dLmlzXFziii281RkFsEx1XPdkNAJfVas72jqLswgSMixO5cphvw3jC3CUWU1wva4wKgA47uyDv8EvOfP3SBjIqDBnc5hJCw7TRjz69Tr0yRUl-QKdtafvZzCfd3V-4aofJw",
    colors: ["#D4AF37", "#000000", "#C0C0C0"], badge: "Best Seller", badgeVariant: "outline",
  },
  {
    id: 2, name: "Solaris Round", subtitle: "Urban Minimalist", price: 210,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXDLt9f6J8gr2zCUTvx_TkFftCX8jUgVZw0aZP2HzO5pbphV4ANfWdomB-u3EQ2dSfjL0zAzEQu5H-7f08SuKsXs7GXUVwaslPRuhBVwooQ5LpqkJr2QZxORQf5e-jKSm1KBEDg4cPkeMqWVYvyvHeUh7URbXCjf_06CcV2AVb2KXDMaeAp_5cOYsr2Ju2Q--oibEGw8P8HuecuKcCO70zEg9-OvWFeLpY-61Sj2BOURo_Jew7vRzO0iVi0oA916wUvSOHkiSbVg",
    colors: ["#000000", "#4A3728"],
  },
  {
    id: 3, name: "Luna Cat-eye", subtitle: "Classic Feminine", price: 195,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRMcph3rvHFWkbjOgvdJ2J7oAkMChdhY0yDZM-EtUlq42BRuRCQWyHvuYFFKq4BN3ATHpyK2FGMkT_lnRS-jEfBKbHtDH5MZvBu_BzZ8cMeiHsq1gkdjX-Lq4rkTIbbGb5dqAYyG8ZPLm09R3YUcTLlKa7ZIPtgzM3X6FCKqzlvsS61FQzWKS26EJ6WBJzQ6h2WFfdD8WV207p_nkkeJLPbMtTKofyhIK3X2zGBJlSNoLbshhmjZHndQxFakPudeYcXrY5yk9vzw",
    colors: ["#8B4513", "#000000", "#FFB6C1", "#E6E6FA"], badge: "New", badgeVariant: "solid",
  },
  {
    id: 4, name: "Nova Square", subtitle: "Bold Architectural", price: 230,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3vypsjywd1pkCbqJdKRIrKQSTcVqwQt2sYsNJGgps948LIP3xGbQH6Qb3Q0-3FxtARS7zbdhQGu4HGMgVYvosOjG1LS69QtXzVYJIhcfEbcP1W7-5FORUyBLSWFNDC0FW_TTbxofIO38g0lXAd-GoRguwhgEzTlt3ySFJwPD2VzzNDfT97NI92nYUDjixNm9agJzhUTtTFvgHklfeODDmV8EHXx666QemyZyh0XDpWxq0oUg1-Z0y8afBMLMK1qFSd0xLg_oadQ",
    colors: ["#1a1a1a"],
  },
  {
    id: 5, name: "Astra Geometric", subtitle: "Avant Garde Series", price: 260,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_MMJ9GFMHymbsUrUSdaxKp3F5LIGunz9g7C9aleDF4enr82TDzOWYQRQLE8th9VWxjRXet4VyWP_IlyrZpz1S7zRy9N5BYHyKoJiJ4couYlLt4wotzC__keXhdmnN8uK2TJJK5Lnss4rH7wBi1_rMG8spfb1KroVXvXsfc8jfKLtW47L_YptcV7R3zI7xqzTdyOWHKo7oi_S3_3Y4s9_4WEj0Osxmx_Q8C-Oyssd4PDucowgeAq5MQ7fgE0Yr005V-S_2DVo7rQ",
    colors: ["#E5E4E2", "#2F4F4F", "#800000"],
  },
  {
    id: 6, name: "Helios Rectangle", subtitle: "Professional Luxury", price: 215,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrLOygAaT3OXzYfGgNoCBYnRt6XnMf6IdqPIL3D-o1uSDcgekSGPdhuC0B0bWjSiGS37MNTZDstBvjJ0wu_o6-tlMD-IWC_MPFy4cxqjiPbA4smNx13iJUGi0TZco5FoOEEi9copBn8ZuQ8UTzAgpra42CUeiY_BGOM5ivXJT3BXcDvX7T_ryI26Qoovj1nyRNmR1MNhDxDp5c5tMgQC1y6ddZ9UV8bdzaxUJjw5D_DI-SNBlQ7z-rF_q5zjohMuGa9qbviCmBKg",
    colors: ["#000080", "#556B2F"],
  },
];

const FOOTER_LINKS = {
  Collections: ["New Arrivals", "Sunglasses", "Optical Frames", "Limited Edition"],
  Support: ["Shipping & Returns", "Care Instructions", "Fit Guide", "Contact Us"],
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function AuraLogo({ size = "size-8" }) {
  return (
    <svg className={size} fill="none" viewBox="0 0 48 48">
      <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const navLinks = ["Collections", "Sunglasses", "Optical", "About"];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, width: "100%",
      borderBottom: "1px solid #e2e8f0",
      background: "rgba(248,246,246,0.85)", backdropFilter: "blur(12px)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ color: "#ec5b13" }}><AuraLogo /></div>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.05em" }}>AURA</span>
            </div>
            <nav style={{ display: "flex", gap: 32 }}>
              {navLinks.map(link => (
                <a key={link} href="#" style={{
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  color: link === "Sunglasses" ? "#ec5b13" : "#334155",
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => e.target.style.color = "#ec5b13"}
                  onMouseLeave={e => e.target.style.color = link === "Sunglasses" ? "#ec5b13" : "#334155"}
                >{link}</a>
              ))}
            </nav>
          </div>
          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", background: "#f1f5f9",
              borderRadius: 999, padding: "8px 16px", border: "1px solid transparent",
            }}>
              <span style={{ fontSize: 20, color: "#94a3b8" }}>🔍</span>
              <input placeholder="Find your style..." style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: 14, width: 180, marginLeft: 8, color: "#334155",
              }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ position: "relative", padding: 8, background: "none", border: "none", cursor: "pointer", borderRadius: 999 }}>
                🛍️
                <span style={{
                  position: "absolute", top: 4, right: 4, width: 8, height: 8,
                  background: "#ec5b13", borderRadius: 999,
                }} />
              </button>
              <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>👤</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "flex-end",
        justifyContent: "space-between", gap: 24,
        borderBottom: "1px solid #e2e8f0", paddingBottom: 32,
      }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{
            color: "#ec5b13", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", fontSize: 11, display: "block", marginBottom: 8,
          }}>The 2024 Collection</span>
          <h2 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Premium Eyewear
          </h2>
          <p style={{ fontSize: 18, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
            Discover our curated selection of modern, luxurious frames designed for every face.
            Handcrafted with precision and sustainable materials.
          </p>
        </div>
        <button style={{
          background: "#ec5b13", color: "#fff", fontWeight: 700, fontSize: 15,
          border: "none", borderRadius: 12, padding: "14px 28px", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(236,91,19,0.2)", transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.target.style.opacity = 0.85}
          onMouseLeave={e => e.target.style.opacity = 1}
        >View All Frames</button>
      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

function FilterBar() {
  const [active, setActive] = useState("All Categories");
  const filters = ["All Categories", "Sunglasses", "Optical", "New Arrivals"];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 48 }}>
      {filters.map(f => (
        <button key={f} onClick={() => setActive(f)} style={{
          height: 44, display: "flex", alignItems: "center", gap: 8,
          padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
          border: `1px solid ${active === f ? "#ec5b13" : "#e2e8f0"}`,
          background: active === f ? "#ec5b13" : "#fff",
          color: active === f ? "#fff" : "#1e293b",
          boxShadow: active === f ? "0 4px 12px rgba(236,91,19,0.15)" : "none",
          transition: "all 0.2s",
        }}>
          {f}
          <span style={{ fontSize: 16 }}>{f === "New Arrivals" ? "⭐" : "▾"}</span>
        </button>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
        <span>Sort by:</span>
        <select style={{ fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", color: "#1e293b", outline: "none" }}>
          <option>Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const { name, subtitle, price, image, colors, badge, badgeVariant } = product;
  const [selectedColor, setSelectedColor] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Image */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative", aspectRatio: "1/1", overflow: "hidden",
          borderRadius: 16, background: "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
          border: `1px solid ${hovered ? "rgba(236,91,19,0.2)" : "transparent"}`,
          transition: "border-color 0.4s", cursor: "pointer",
        }}
      >
        <img src={image} alt={name} style={{
          width: "100%", height: "auto", objectFit: "contain",
          transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
          transition: "transform 0.6s ease",
        }} />

        {/* Action buttons */}
        <div style={{
          position: "absolute", top: 16, right: 16,
          display: "flex", flexDirection: "column", gap: 8,
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }}>
          <button onClick={() => setWishlist(!wishlist)} style={{
            padding: 8, background: "#fff", border: "none", borderRadius: 999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer", fontSize: 18,
            color: wishlist ? "#ec5b13" : "#334155",
          }}>{wishlist ? "❤️" : "🤍"}</button>
          <button style={{
            padding: 8, background: "#fff", border: "none", borderRadius: 999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer", fontSize: 18,
          }}>👁️</button>
        </div>

        {/* Badge */}
        {badge && (
          <div style={{ position: "absolute", bottom: 16, left: 16 }}>
            <span style={{
              padding: "4px 12px", borderRadius: 999,
              fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
              background: badgeVariant === "solid" ? "rgba(236,91,19,0.9)" : "rgba(255,255,255,0.95)",
              color: badgeVariant === "solid" ? "#fff" : "#1e293b",
              border: badgeVariant === "outline" ? "1px solid #e2e8f0" : "none",
            }}>{badge}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{name}</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>{subtitle}</p>
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#ec5b13" }}>${price}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {colors.map((color, i) => (
              <button key={i} onClick={() => setSelectedColor(i)} style={{
                width: 24, height: 24, borderRadius: 999,
                background: color, cursor: "pointer",
                border: `2px solid ${selectedColor === i ? "#ec5b13" : "#e2e8f0"}`,
                boxShadow: selectedColor === i ? "0 0 0 3px rgba(236,91,19,0.2)" : "none",
                transition: "all 0.2s",
              }} />
            ))}
          </div>
          <button style={{
            fontSize: 14, fontWeight: 700, background: "none", border: "none",
            borderBottom: "2px solid #ec5b13", paddingBottom: 2, cursor: "pointer",
            color: "#1e293b", transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#ec5b13"}
            onMouseLeave={e => e.target.style.color = "#1e293b"}
          >Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

function ProductGrid() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 40,
    }}>
      {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ total = 3 }) {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 80 }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} style={pageBtnStyle(false)}>‹</button>
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <button key={n} onClick={() => setPage(n)} style={pageBtnStyle(page === n)}>{n}</button>
      ))}
      <button onClick={() => setPage(p => Math.min(total, p + 1))} style={pageBtnStyle(false)}>›</button>
    </div>
  );
}
const pageBtnStyle = (active) => ({
  width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer",
  border: active ? "none" : "1px solid #e2e8f0",
  background: active ? "#ec5b13" : "#fff",
  color: active ? "#fff" : "#1e293b",
  transition: "all 0.2s",
});

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0", paddingTop: 64, paddingBottom: 32, marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 48, marginBottom: 64 }}>
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#ec5b13" }}>
              <AuraLogo size="size-6" />
              <span style={{ fontSize: 18, fontWeight: 900 }}>AURA</span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
              Redefining perspective through luxury eyewear. Crafted with Italian acetate and premium German lenses.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["🌐", "🔗", "📢"].map((icon, i) => (
                <a key={i} href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 20 }}>{icon}</a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontWeight: 700, marginBottom: 24, fontSize: 15 }}>{title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {links.map(link => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none" }}
                      onMouseEnter={e => e.target.style.color = "#ec5b13"}
                      onMouseLeave={e => e.target.style.color = "#94a3b8"}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 24, fontSize: 15 }}>Newsletter</h4>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>Subscribe for exclusive releases and insights.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Your email" type="email" style={{
                flex: 1, background: "#f1f5f9", border: "none", borderRadius: 10,
                padding: "10px 14px", fontSize: 14, outline: "none",
              }} />
              <button style={{
                background: "#ec5b13", color: "#fff", border: "none",
                borderRadius: 10, padding: "0 14px", cursor: "pointer", fontSize: 18,
              }}>→</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>© 2024 AURA Eyewear. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Cookies"].map(item => (
              <a key={item} href="#" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f6f6", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1e293b" }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 2rem" }}>
        <Hero />
        <FilterBar />
        <ProductGrid />
        <Pagination total={3} />
      </main>
      <Footer />
    </div>
  );
}
