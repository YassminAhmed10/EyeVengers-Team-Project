import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const EGP_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const formatPrice = (amount) => EGP_FORMATTER.format(amount);

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionButton = motion.button;

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  onToggleCompare,
  isCompared = false,
}) {
  const { name, subtitle, price, image, colors, colorOptions, badge, badgeVariant } = product;
  const [selectedColor, setSelectedColor] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const navigate = useNavigate();
  const palette =
    colorOptions?.length > 0
      ? colorOptions
      : (colors ?? []).map((hex, index) => ({
          name: `color-${index + 1}`,
          label: `Color ${index + 1}`,
          hex,
          image,
        }));
  const activeColor = palette[selectedColor] ?? palette[0];
  const activeImages =
    activeColor?.images?.length > 0
      ? activeColor.images
      : [activeColor?.image ?? image].filter(Boolean);
  const displayImage = activeImages[previewIndex] ?? activeImages[0] ?? image;
  const galleryImages = activeImages.slice(1);

  const openDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      image: activeImages[0] ?? displayImage,
      color: activeColor?.label ?? activeColor?.name ?? "Default",
      lens: "Standard",
      price: product.price,
      qty: 1,
    });
  };

  return (
    <MotionArticle
      className="product-card"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <MotionDiv
        className="product-card__image-wrapper"
        onClick={openDetails}
        onMouseEnter={() => {
          if (activeImages.length > 1) {
            setPreviewIndex(1);
          }
        }}
        onMouseLeave={() => setPreviewIndex(0)}
        whileHover={{ y: -6 }}
      >
        <img
          src={displayImage}
          alt={name}
          className="product-card__image"
        />

        {galleryImages.length > 0 && (
          <div className="product-card__thumbs">
            {galleryImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                className={`product-card__thumb ${previewIndex === idx + 1 ? "product-card__thumb--active" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviewIndex(idx + 1);
                }}
                title={`Preview image ${idx + 2}`}
              >
                <img src={img} alt={`${name} preview ${idx + 2}`} />
              </button>
            ))}
          </div>
        )}

        <div className="product-card__actions">
          <MotionButton
            onClick={(event) => {
              event.stopPropagation();
              onToggleWishlist?.(product.id);
            }}
            className="product-card__action-btn"
            title="Toggle wishlist"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </MotionButton>
          <MotionButton
            className="product-card__action-btn"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCompare?.(product.id);
            }}
            title="Toggle compare"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: isCompared ? "'FILL' 1" : "'FILL' 0" }}
            >
              compare_arrows
            </span>
          </MotionButton>
        </div>

        {badge && (
          <span
            className={`product-card__badge ${
              badgeVariant === "solid"
                ? "product-card__badge--solid"
                : "product-card__badge--outline"
            }`}
          >
            {badge}
          </span>
        )}
      </MotionDiv>

      <div className="product-card__info">
        <div className="product-card__header">
          <div>
            <h3 className="product-card__name">{name}</h3>
            <p className="product-card__subtitle">{subtitle}</p>
          </div>
          <span className="product-card__price">{formatPrice(price)}</span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__colors">
            {palette.map((color, i) => (
              <label key={i} className="cursor-pointer">
                <input
                  type="radio"
                  name={`color-${product.id}`}
                  className="hidden"
                  checked={selectedColor === i}
                  onChange={() => {
                    setSelectedColor(i);
                    setPreviewIndex(0);
                  }}
                />
                <span
                  className={`product-card__swatch ${
                    selectedColor === i ? "product-card__swatch--active" : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              </label>
            ))}
          </div>

          <div className="product-card__cta-group">
            <button
              className="product-card__add-btn product-card__add-btn--secondary"
              onClick={() => navigate(`/virtual-try-on/${product.id}?color=${activeColor?.name ?? ""}`)}
            >
              Try On
            </button>
            <button className="product-card__add-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </MotionArticle>
  );
}
