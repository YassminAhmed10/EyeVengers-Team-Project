import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ─── Data ─── */
const CARDS = [
  {
    tag: "Advance Technology",
    title: "Advance Technology",
    desc: "Vestibulum morbi blandit cursus risus. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Massa massa ultricies mi quis hendrerit.",
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    accent: "#1f6bff",
    features: [
      { group: "Breast Ultrasound", items: ["A wide array of benefits", "Certified Radiologists"] },
      { group: "Advancing Medical", items: ["Personalized Patient Care", "Cutting-edge Technology"] },
    ],
  },
  {
    tag: "Accurate Radiology",
    title: "Accurate Radiology Reporting",
    desc: "Vestibulum morbi blandit cursus risus. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Massa massa ultricies mi quis hendrerit.",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    accent: "#00b8a8",
    features: [
      { group: "Breast Ultrasound", items: ["A wide array of benefits", "Certified Radiologists"] },
      { group: "Advancing Medical", items: ["Personalized Patient Care", "Cutting-edge Technology"] },
    ],
  },
  {
    tag: "Clinical Imaging",
    title: "Imaging in Clinical Trial",
    desc: "Vestibulum morbi blandit cursus risus. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Massa massa ultricies mi quis hendrerit.",
    img: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80",
    accent: "#7c3aed",
    features: [
      { group: "Breast Ultrasound", items: ["A wide array of benefits", "Certified Radiologists"] },
      { group: "Advancing Medical", items: ["Personalized Patient Care", "Cutting-edge Technology"] },
    ],
  },
];

const CARD_H      = 340;
const CARD_GAP    = 12;
const SCROLL_STEP = 600;

/* ── Single check icon ── */
function Check({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Card layer ── */
function CardLayer({ card, index, total, sectionProgress }) {
  const n        = total;
  const segSize  = 1 / n;
  const segStart = index * segSize;

  const yRaw = useTransform(
    sectionProgress,
    [segStart, segStart + segSize * 0.45],
    ["105%", "0%"]
  );
  const y = useSpring(yRaw, { stiffness: 110, damping: 22 });

  const cardsAbove    = total - 1 - index;
  const shrinkPerCard = 0.035;
  const minScale      = 1 - cardsAbove * shrinkPerCard;

  const scaleRaw = index < total - 1
    ? useTransform(sectionProgress, [(index + 1) * segSize, 1], [1, minScale])
    : useTransform(sectionProgress, [0, 1], [1, 1]);
  const scale = useSpring(scaleRaw, { stiffness: 100, damping: 20 });

  const opacRaw = index < total - 1
    ? useTransform(sectionProgress, [(index + 1) * segSize + segSize * 0.3, 1], [1, 0.5])
    : useTransform(sectionProgress, [0, 1], [1, 1]);
  const opacity = useSpring(opacRaw, { stiffness: 100, damping: 20 });

  const stackTop = 70 + index * CARD_GAP;

  return (
    <motion.div
      style={{
        position: "absolute",
        top: stackTop,
        left: 0, right: 0,
        zIndex: index + 1,
        y, scale, opacity,
        transformOrigin: "top center",
      }}
    >
      {/* ── CARD ── */}
      <div style={{
        background: "#fff",
        borderRadius: 24,
        height: CARD_H,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        boxShadow: "0 8px 48px rgba(11,26,52,0.11)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}>

        {/* LEFT: text content */}
        <div style={{
          flex: 1,
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}>
          {/* Accent bar left */}
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: 5, background: card.accent,
            borderRadius: "24px 0 0 24px",
          }} />

          {/* Counter */}
          <div style={{
            position: "absolute", bottom: 20, right: 32,
            fontSize: 11, fontWeight: 800,
            color: "rgba(0,0,0,0.10)",
            fontFamily: "'Outfit', monospace",
            letterSpacing: "0.12em",
          }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>

          {/* Tag pill */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: card.accent + "14",
            border: `1px solid ${card.accent}30`,
            color: card.accent,
            borderRadius: 50,
            padding: "4px 14px",
            fontSize: 11, fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 14,
            alignSelf: "flex-start",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: card.accent, display: "inline-block" }} />
            {card.tag}
          </span>

          {/* Title */}
          <h2 style={{
            fontSize: "clamp(18px, 2.2vw, 26px)",
            fontWeight: 900,
            fontFamily: "'Outfit', sans-serif",
            color: "#0b1a34",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}>{card.title}</h2>

          {/* Desc */}
          <p style={{
            fontSize: 13,
            color: "#6f86a3",
            lineHeight: 1.7,
            marginBottom: 20,
            maxWidth: 380,
          }}>{card.desc}</p>

          {/* Feature groups */}
          <div style={{ display: "flex", gap: 32 }}>
            {card.features.map((f) => (
              <div key={f.group}>
                <p style={{
                  fontSize: 11, fontWeight: 800,
                  color: card.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}>{f.group}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {f.items.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Check color={card.accent} />
                      <span style={{ fontSize: 13, color: "#30445f", fontWeight: 600, lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: circle image in a square panel */}
        <div style={{
          width: 300,
          flexShrink: 0,
          background: "#f0f5ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            width: 220, height: 220,
            borderRadius: "50%",
            overflow: "hidden",
            border: `4px solid ${card.accent}25`,
            position: "relative",
            zIndex: 1,
          }}>
            <img
              src={card.img}
              alt={card.title}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          {/* decorative bg circle */}
          <div style={{
            position: "absolute",
            width: 280, height: 280,
            borderRadius: "50%",
            background: card.accent + "0d",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
          }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Progress dots ── */
function ProgressDots({ total, sectionProgress }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    return sectionProgress.on("change", (v) => {
      setActive(Math.min(total - 1, Math.floor(v * total)));
    });
  }, [sectionProgress, total]);

  return (
    <div style={{
      position: "absolute", bottom: 28,
      left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: 8, zIndex: 100,
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          animate={{ width: i === active ? 28 : 8, background: i === active ? "#1f6bff" : "rgba(0,0,0,0.15)" }}
          transition={{ duration: 0.3 }}
          style={{ height: 8, borderRadius: 4 }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   EXPORT
══════════════════════════════════════════ */
export default function ScrollCards({
  cards   = CARDS,
  eyebrow = "Our Services",
  title   = "Why Choose Imagon?",
  subtitle = "A unique blend of advanced technology and human care",
}) {
  const n         = cards.length;
  const SECTION_H = 200 + n * SCROLL_STEP + (typeof window !== "undefined" ? window.innerHeight * 0.75 : 600);
  const outerRef  = useRef(null);

  const { scrollYProgress } = useScroll({
    target:  outerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section style={{
      background: "#edf2ff",
      fontFamily: "'Cairo','Outfit',sans-serif",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "80px 40px 52px" }}>
        <span style={{
          display: "inline-block",
          fontSize: 11, fontWeight: 800,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#1f6bff", marginBottom: 12,
        }}>✦ {eyebrow}</span>
        <h2 style={{
          fontSize: "clamp(26px,4vw,44px)",
          fontWeight: 900,
          fontFamily: "'Outfit',sans-serif",
          color: "#0b1a34",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}>{title}</h2>
        <p style={{ fontSize: 15, color: "#6f86a3", marginTop: 12, lineHeight: 1.7 }}>{subtitle}</p>
      </div>

      {/* Scroll-lock zone */}
      <div ref={outerRef} style={{ height: SECTION_H, position: "relative" }}>
        <div style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}>
          <div style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "0 40px",
            position: "relative",
            height: "100%",
          }}>
            {cards.map((card, i) => (
              <CardLayer
                key={card.title}
                card={card}
                index={i}
                total={n}
                sectionProgress={scrollYProgress}
              />
            ))}
          </div>
          <ProgressDots total={n} sectionProgress={scrollYProgress} />
        </div>
      </div>

      <div style={{ height: 80 }} />
    </section>
  );
}