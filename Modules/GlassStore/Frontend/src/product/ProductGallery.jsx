import { useState } from "react";

export default function ProductGallery({
  images,
  selectedImageIndex,
  onSelectImage,
  productName,
  activeColorLabel,
}) {
  const safeImages = images?.length ? images : [];
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = safeImages[selectedImageIndex] ?? safeImages[0];

  return (
    <div className="product-gallery-wrapper">
      <div className="product-gallery">
        
        {/* 🔹 Thumbnails */}
        <div className="product-gallery__thumbnails">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelectImage(index)}
              className={`thumb ${selectedImageIndex === index ? "active" : ""}`}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>

        {/* 🔹 Main Image */}
        <div
          className="product-gallery__main"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={currentImage}
            alt={`${productName} in ${activeColorLabel}`}
            className={`main-image ${isZoomed ? "zoomed" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}