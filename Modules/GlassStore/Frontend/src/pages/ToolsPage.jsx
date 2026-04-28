import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { PRODUCTS } from "../data/products";

const FACE_SHAPES = [
  {
    id: "round",
    label: "Round",
    note: "Soft curves, similar width and height",
    visual: "round",
    recommendedStyles: ["Square", "Geometric", "Cat-eye"],
  },
  {
    id: "oval",
    label: "Oval",
    note: "Balanced proportions, gently narrow jaw",
    visual: "oval",
    recommendedStyles: ["Round", "Square", "Geometric", "Cat-eye"],
  },
  {
    id: "square",
    label: "Square",
    note: "Strong jaw and broad forehead",
    visual: "square",
    recommendedStyles: ["Round", "Cat-eye"],
  },
  {
    id: "heart",
    label: "Heart",
    note: "Wider forehead, narrower chin",
    visual: "heart",
    recommendedStyles: ["Round", "Geometric", "Aviator"],
  },
  {
    id: "diamond",
    label: "Diamond",
    note: "Wider cheekbones with narrow forehead",
    visual: "diamond",
    recommendedStyles: ["Cat-eye", "Oval", "Round"],
  },
];

const SKIN_TONES = [
  { id: "fair", label: "Fair / Light", colors: ["black", "pink", "rosegold", "blue"] },
  { id: "medium", label: "Medium / Wheatish", colors: ["gold", "tortoise", "green", "burgundy"] },
  { id: "deep", label: "Deep / Dark", colors: ["gold", "clear", "pink&gold", "pattern"] },
  { id: "neutral", label: "Neutral / Unsure", colors: ["black", "tortoise", "gold"] },
];

const STYLE_PREFERENCES = [
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "classic", label: "Classic" },
  { id: "fashion", label: "Fashion-forward" },
];

const STYLE_MAP = {
  minimal: ["Square", "Round"],
  bold: ["Geometric", "Cat-eye"],
  classic: ["Round", "Square"],
  fashion: ["Cat-eye", "Geometric"],
};

const WIDTH_LABELS = {
  narrow: "Narrow / Small Face",
  medium: "Medium",
  wide: "Wide / Broad Face",
};

const getWidthFromMm = (faceWidthMm) => {
  if (!faceWidthMm) {
    return "medium";
  }

  if (faceWidthMm < 132) {
    return "narrow";
  }

  if (faceWidthMm > 146) {
    return "wide";
  }

  return "medium";
};

const normalizeStyle = (style) => style?.trim().toLowerCase();

const toReadableColor = (name) =>
  name
    .replace("&", " & ")
    .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

const getProductColorNames = (product) =>
  (product.colorOptions ?? []).map((item) => (item.name || "").toLowerCase());

const getRecommendationSummary = ({ shape, tone, width, picks }) => {
  if (!shape) {
    return [];
  }

  const bullets = [
    `For ${shape.label.toLowerCase()} face, styles like ${shape.recommendedStyles.join(", ")} usually work best.`,
    `Based on your skin tone, colors like ${tone.colors.map(toReadableColor).slice(0, 3).join(", ")} are highlighted.`,
    `Recommended fit width: ${WIDTH_LABELS[width]}.`,
  ];

  if (picks.length) {
    bullets.push(`Your vibe selection favors: ${picks.join(", ")}.`);
  }

  return bullets;
};

export default function ToolsPage() {
  const [faceShapeId, setFaceShapeId] = useState("oval");
  const [skinToneId, setSkinToneId] = useState("neutral");
  const [faceWidthMm, setFaceWidthMm] = useState(138);
  const [bridgeMm, setBridgeMm] = useState(18);
  const [stylePicks, setStylePicks] = useState(["classic"]);
  const [referencePhotoUrl, setReferencePhotoUrl] = useState("");

  const selectedShape = FACE_SHAPES.find((item) => item.id === faceShapeId) ?? FACE_SHAPES[1];
  const selectedTone = SKIN_TONES.find((item) => item.id === skinToneId) ?? SKIN_TONES[3];
  const width = getWidthFromMm(faceWidthMm);

  const preferredStyles = useMemo(() => {
    const fromShape = selectedShape.recommendedStyles.map(normalizeStyle);
    const fromPicks = stylePicks.flatMap((item) => (STYLE_MAP[item] ?? []).map(normalizeStyle));
    return new Set([...fromShape, ...fromPicks]);
  }, [selectedShape, stylePicks]);

  const recommendations = useMemo(() => {
    return PRODUCTS.map((product) => {
      let score = 0;
      const style = normalizeStyle(product.style);
      const fit = (product.fit || "").toLowerCase();
      const productColors = getProductColorNames(product);

      if (preferredStyles.has(style)) {
        score += 5;
      }

      if (selectedTone.colors.some((color) => productColors.includes(color))) {
        score += 3;
      }

      if (fit === width) {
        score += 4;
      }

      if (Math.abs((Number(product.bridgeSize) || 18) - bridgeMm) <= 1) {
        score += 1;
      }

      return { ...product, score };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [preferredStyles, selectedTone, width, bridgeMm]);

  const summaryBullets = getRecommendationSummary({
    shape: selectedShape,
    tone: selectedTone,
    width,
    picks: stylePicks,
  });

  const togglePick = (id) => {
    setStylePicks((prev) => {
      if (prev.includes(id)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (referencePhotoUrl) {
      URL.revokeObjectURL(referencePhotoUrl);
    }

    setReferencePhotoUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (referencePhotoUrl) {
        URL.revokeObjectURL(referencePhotoUrl);
      }
    };
  }, [referencePhotoUrl]);

  return (
    <main className="main container">
      <PageHero
        eyebrow="Eyewear Tool"
        title="Fit Assistant"
        description="Answer a few style and face questions to get personalized frame recommendations."
      />

      <section className="fit-layout">
        <form className="fit-form" onSubmit={(event) => event.preventDefault()}>
          <h3>1) Face Shape</h3>
          <div className="face-shape-grid">
            {FACE_SHAPES.map((shape) => (
              <button
                key={shape.id}
                type="button"
                className={`face-shape-card ${faceShapeId === shape.id ? "is-active" : ""}`}
                onClick={() => setFaceShapeId(shape.id)}
              >
                <span className={`face-shape-visual face-shape-visual--${shape.visual}`} />
                <strong>{shape.label}</strong>
                <small>{shape.note}</small>
              </button>
            ))}
          </div>

          <h3>2) Skin Tone</h3>
          <select value={skinToneId} onChange={(event) => setSkinToneId(event.target.value)}>
            {SKIN_TONES.map((tone) => (
              <option key={tone.id} value={tone.id}>
                {tone.label}
              </option>
            ))}
          </select>

          <h3>3) Face Size</h3>
          <label>
            Face Width (mm): {faceWidthMm}
            <input
              type="range"
              min={118}
              max={160}
              step={1}
              value={faceWidthMm}
              onChange={(event) => setFaceWidthMm(Number(event.target.value))}
            />
          </label>

          <label>
            Bridge Preference (mm): {bridgeMm}
            <input
              type="range"
              min={14}
              max={24}
              step={1}
              value={bridgeMm}
              onChange={(event) => setBridgeMm(Number(event.target.value))}
            />
          </label>

          <h3>4) Eyewear Vibe</h3>
          <div className="fit-picks">
            {STYLE_PREFERENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={stylePicks.includes(item.id) ? "is-active" : ""}
                onClick={() => togglePick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <h3>5) Optional Reference Photo</h3>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          {referencePhotoUrl && <img src={referencePhotoUrl} alt="Reference" className="fit-reference-image" />}
        </form>

        <aside className="fit-result">
          <h3>Your Fit Summary</h3>
          <ul>
            {summaryBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3>Top Picks For You</h3>
          <div className="fit-product-list">
            {recommendations.map((item) => (
              <article key={item.id} className="fit-product-card">
                <img src={item.image} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.subtitle}</p>
                  <small>Match Score: {item.score}</small>
                </div>
                <div className="fit-product-card__actions">
                  <Link className="btn-secondary" to={`/product/${item.id}`}>
                    View
                  </Link>
                  <Link className="btn-primary" to={`/virtual-try-on/${item.id}`}>
                    Try On
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
