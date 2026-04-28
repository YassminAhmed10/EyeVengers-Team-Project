import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";

function getSizeData(faceWidth, bridgeFit) {
  const baseFrameWidth = Math.round(faceWidth * 0.92);
  const bridgeOffset = bridgeFit === "narrow" ? -1 : bridgeFit === "wide" ? 1 : 0;
  const bridge = Math.max(16, Math.min(22, Math.round(faceWidth * 0.135) + bridgeOffset));

  if (baseFrameWidth <= 128) {
    return {
      label: "Small",
      frameWidth: `${Math.max(124, baseFrameWidth - 2)}-${Math.max(128, baseFrameWidth + 2)} mm`,
      lensWidth: "47-50 mm",
      bridge: `${bridge} mm`,
      temple: "135-140 mm",
    };
  }

  if (baseFrameWidth <= 138) {
    return {
      label: "Medium",
      frameWidth: `${Math.max(131, baseFrameWidth - 2)}-${Math.max(138, baseFrameWidth + 2)} mm`,
      lensWidth: "51-54 mm",
      bridge: `${bridge} mm`,
      temple: "140-145 mm",
    };
  }

  return {
    label: "Large",
    frameWidth: `${Math.max(139, baseFrameWidth - 2)}-${Math.max(146, baseFrameWidth + 2)} mm`,
    lensWidth: "55-58 mm",
    bridge: `${bridge} mm`,
    temple: "145-150 mm",
  };
}

export default function SizeGuidePage() {
  const [faceWidth, setFaceWidth] = useState(136);
  const [bridgeFit, setBridgeFit] = useState("regular");
  const [wearStyle, setWearStyle] = useState("daily");

  const recommendation = useMemo(() => getSizeData(faceWidth, bridgeFit), [faceWidth, bridgeFit]);

  const styleNote = {
    daily: "For all-day wear, prefer lighter acetate or slim metal frames with medium temple length.",
    office: "For long screen sessions, choose anti-reflective lenses and softer nose bridge pressure.",
    active: "For active movement, pick flexible hinges and slightly wrapped temples for stability.",
  }[wearStyle];

  return (
    <main className="main container">
      <PageHero
        eyebrow="Fit"
        title="Interactive Size Guide"
        description="Estimate your frame size in seconds and shop with confidence."
      />

      <section className="size-guide-layout">
        <article className="size-guide-card">
          <h3>1) Face Width</h3>
          <p>Move the slider to your approximate face width.</p>
          <label>
            <span>{faceWidth} mm</span>
            <input
              type="range"
              min={118}
              max={160}
              step={1}
              value={faceWidth}
              onChange={(event) => setFaceWidth(Number(event.target.value))}
            />
          </label>

          <h3>2) Bridge Preference</h3>
          <div className="size-guide-segmented">
            {[
              { id: "narrow", label: "Narrow" },
              { id: "regular", label: "Regular" },
              { id: "wide", label: "Wide" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={bridgeFit === item.id ? "is-active" : ""}
                onClick={() => setBridgeFit(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <h3>3) Usage Style</h3>
          <select value={wearStyle} onChange={(event) => setWearStyle(event.target.value)}>
            <option value="daily">Daily Wear</option>
            <option value="office">Office & Screen</option>
            <option value="active">Active Lifestyle</option>
          </select>
        </article>

        <article className="size-guide-card size-guide-card--result">
          <span className="size-chip">Recommended Size: {recommendation.label}</span>
          <ul>
            <li>
              <strong>Frame Width:</strong> {recommendation.frameWidth}
            </li>
            <li>
              <strong>Lens Width:</strong> {recommendation.lensWidth}
            </li>
            <li>
              <strong>Bridge:</strong> {recommendation.bridge}
            </li>
            <li>
              <strong>Temple:</strong> {recommendation.temple}
            </li>
          </ul>
          <p>{styleNote}</p>
          <Link to="/shop" className="btn-primary">
            Shop Frames For This Size
          </Link>
        </article>
      </section>
    </main>
  );
}
