export default function PlaceholderImage({ label = "Image Placeholder", ratio = "4 / 3" }) {
  return (
    <div className="placeholder-image" style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}
