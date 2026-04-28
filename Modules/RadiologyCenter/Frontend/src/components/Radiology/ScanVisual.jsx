export default function ScanVisual({ dark = true }) {
  return (
    <svg viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="340" height="160" fill={dark ? "#0d1b2a" : "#f7fafd"} />
      <ellipse cx="170" cy="80" rx="66" ry="62" fill="none" stroke={dark ? "rgba(10,108,255,.2)" : "rgba(10,108,255,.12)"} strokeWidth="1" />
      <ellipse cx="170" cy="80" rx="44" ry="44" fill="none" stroke={dark ? "rgba(10,108,255,.3)" : "rgba(10,108,255,.2)"} strokeWidth="1" />
      <path
        d="M130 80 Q150 58 170 56 Q190 58 210 80 Q190 102 170 104 Q150 102 130 80Z"
        fill={dark ? "rgba(10,108,255,.08)" : "rgba(10,108,255,.06)"}
        stroke={dark ? "rgba(10,108,255,.5)" : "rgba(10,108,255,.4)"}
        strokeWidth="1.5"
      />
      <line x1="60" y1="80" x2="280" y2="80" stroke={dark ? "rgba(10,108,255,.08)" : "rgba(10,108,255,.06)"} strokeWidth=".5" />
      <line x1="170" y1="20" x2="170" y2="140" stroke={dark ? "rgba(10,108,255,.08)" : "rgba(10,108,255,.06)"} strokeWidth=".5" />
      <circle cx="170" cy="80" r="5" fill={dark ? "#00c2a8" : "#0a6cff"} />
      <circle cx="170" cy="80" r="9" fill="none" stroke={dark ? "rgba(0,194,168,.3)" : "rgba(10,108,255,.2)"} strokeWidth="1" />
      <text x="16" y="148" fill={dark ? "rgba(10,108,255,.4)" : "rgba(10,108,255,.35)"} fontSize="9" fontFamily="monospace">
        CHEST PA · 1.5T MRI · 2025-03-15
      </text>
    </svg>
  );
}
