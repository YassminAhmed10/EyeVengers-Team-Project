import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LENS_OPTIONS, PRODUCTS } from "../data/products";
import {
  ProductBreadcrumb,
  ProductColorSelector,
  ProductGallery,
  ProductLensSelector,
  ProductPurchaseFooter,
} from "../product";
import "./Productdetailspage.css";

const EGP_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const formatPrice = (amount) => EGP_FORMATTER.format(amount);

const TRUST_ITEMS = [
  "Free shipping over EGP 500",
  "14-day returns",
  "1-year warranty",
  "Cash on delivery",
];

const FAQ_ITEMS = [
  {
    q: "Can I return this frame if it does not fit?",
    a: "Yes. You can request exchange or return within 14 days if the frame is unused and in original condition.",
  },
  {
    q: "How long does delivery take?",
    a: "Cairo and Giza usually arrive in 2-4 business days. Other governorates usually take 3-6 business days.",
  },
  {
    q: "Can I add prescription lenses later?",
    a: "Yes. You can order frame only now and add prescription lenses later from your account or support.",
  },
];

const REVIEWS = [
  {
    name: "Mariam A.",
    rating: 5,
    text: "Very comfortable and premium finish. Delivery was fast and packaging was elegant.",
  },
  {
    name: "Nour K.",
    rating: 4,
    text: "Color is exactly like photos. I used virtual try-on and it was very close to real fit.",
  },
  {
    name: "Youssef F.",
    rating: 5,
    text: "Lens quality is excellent and frame feels light for all-day use.",
  },
];

export default function ProductDetailsPage({ onAddToCart }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = useMemo(
    () => PRODUCTS.find((item) => String(item.id) === String(productId)),
    [productId]
  );

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedLens, setSelectedLens] = useState(LENS_OPTIONS[0].id);
  const [openFaq, setOpenFaq] = useState(0);

  if (!product) {
    return (
      <main className="main container">
        <div className="details-not-found">
          <h2>Product not found</h2>
          <p>We could not find this frame. Please return to the shop page.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  const palette =
    product.colorOptions?.length > 0
      ? product.colorOptions
      : (product.colors ?? []).map((hex, index) => ({
          name: `color-${index + 1}`,
          label: `Color ${index + 1}`,
          hex,
          image: product.image,
        }));
  const activeColor = palette[selectedColor] ?? palette[0];
  const activeImages =
    activeColor?.images?.length > 0
      ? activeColor.images
      : [activeColor?.image ?? product.image].filter(Boolean);
  const displayImage = activeImages[selectedImageIndex] ?? activeImages[0] ?? product.image;

  const lens = LENS_OPTIONS.find((item) => item.id === selectedLens) ?? LENS_OPTIONS[0];
  const totalPrice = product.price + lens.extraPrice;
  const rating = 4.8;
  const reviewCount = 164;
  const stock = (product.id * 3) % 11 + 2;
  const isLowStock = stock <= 5;

  const relatedProducts = PRODUCTS.filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const byStyle = Number(b.style === product.style) - Number(a.style === product.style);
      return byStyle !== 0 ? byStyle : Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    })
    .slice(0, 4);

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      image: displayImage,
      price: totalPrice,
      color: activeColor?.label ?? activeColor?.name ?? "Default",
      lens: lens.name,
      qty: 1,
    });
  };

  return (
    <main className="main container">
      <ProductBreadcrumb productName={product.name} />

      <section className="product-details">
        {/* ── LEFT: Gallery ── */}
        <ProductGallery
          images={activeImages.length ? activeImages : [displayImage]}
          selectedImageIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
          productName={product.name}
          activeColorLabel={activeColor?.label ?? activeColor?.name ?? "Default"}
        />

        {/* ── RIGHT: Info panel ── */}
        <div className="product-details__content">

          {/* Subtitle + Title */}
          <p className="product-details__subtitle">{product.subtitle}</p>
          <h1 className="product-details__title">{product.name}</h1>

          {/* Rating + stock */}
          <div className="details-social-proof">
            <span className="details-rating">★ {rating}</span>
            <span>{reviewCount} reviews</span>
            <span className={`details-stock ${isLowStock ? "details-stock--low" : ""}`}>
              {isLowStock ? `Low stock: ${stock} left` : `In stock: ${stock}`}
            </span>
          </div>

          {/* Description */}
          <p className="product-details__description">{product.description}</p>

          {/* Meta pills */}
          <div className="product-details__meta">
            <span>Style: {product.style}</span>
            <span>Material: {product.frameMaterial}</span>
            <span>Fit: {product.fit}</span>
          </div>

          {/* ── Surface card: Frame size + Color ── */}
          <div className="details-surface-card">

            {/* Frame size */}
            <div className="frame-size-row">
              <div className="frame-size-header">
                <span className="frame-size-title">Frame size</span>
                <span className="frame-size-dims">54 □ 16 – 147</span>
              </div>
              <div className="frame-size-chips">
                <span className="frame-size-chip">Medium</span>
              </div>
              <div>
                  <button className="size-guide-btn" onClick={() => navigate("/size-guide")}>Size guide</button>
              </div>
            </div>

            {/* Color selector */}
            <ProductColorSelector
              palette={palette}
              selectedColor={selectedColor}
              onSelectColor={(index) => {
                setSelectedColor(index);
                setSelectedImageIndex(0);
              }}
            />
          </div>

          {/* Lens selector */}
          <ProductLensSelector
            lensOptions={LENS_OPTIONS}
            selectedLens={selectedLens}
            onSelectLens={setSelectedLens}
            formatPrice={formatPrice}
          />

          {/* Purchase box */}
          <ProductPurchaseFooter
            totalPrice={totalPrice}
            formatPrice={formatPrice}
            onAddToCart={handleAddToCart}
          />

          {/* Try On */}
          <button
            type="button"
            className="btn-secondary details-tryon-btn"
            onClick={() =>
              navigate(`/virtual-try-on/${product.id}?color=${activeColor?.name ?? ""}`)
            }
          >
            Try This Frame On Your Face
          </button>

          {/* Trust badges */}
          <div className="details-trust">
            {TRUST_ITEMS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

        </div>
      </section>

      {/* ── You May Also Like ── */}
      <section className="details-section-surface">
        <h2>You May Also Like</h2>
        <div className="details-related-grid">
          {relatedProducts.map((item) => (
            <button
              key={item.id}
              type="button"
              className="details-related-card"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <img src={item.image} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <p>{item.subtitle}</p>
              </div>
              <span>{formatPrice(item.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Reviews + FAQ ── */}
      <section className="details-extras-grid">
        <article className="details-section-surface">
          <h2>Customer Reviews</h2>
          <div className="details-review-list">
            {REVIEWS.map((review) => (
              <div key={review.name} className="details-review-item">
                <strong>{review.name}</strong>
                <span>
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
                <p>{review.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="details-section-surface">
          <h2>Product FAQ</h2>
          <div className="details-faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <div key={item.q} className="details-faq-item">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  <span>{item.q}</span>
                  <span>{openFaq === index ? "−" : "+"}</span>
                </button>
                {openFaq === index && <p>{item.a}</p>}
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ── Mobile sticky footer ── */}
      <section className="details-mobile-sticky">
        <div>
          <small>Total</small>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            navigate(`/virtual-try-on/${product.id}?color=${activeColor?.name ?? ""}`)
          }
        >
          Try On
        </button>
        <button type="button" className="btn-primary" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </section>
    </main>
  );
}