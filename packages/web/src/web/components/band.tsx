/**
 * Landscape bands — the reference's signature move, rebuilt in flat vector.
 *
 * Layered silhouettes: a cream sky, four ridges of progressively darker
 * charcoal, one cream valley running through the middle, and a single red rule
 * where the band meets the page. No gradients except the haze.
 */

const RIDGE = ["#4a555c", "#333d44", "#212a30", "#141a1e"];
const RIDGE_DUSK = ["#5a6169", "#3c444c", "#262e35", "#161c21"];

export function Band({
  variant = "valley",
  dusk = false,
  height = 210,
  className = "",
}: {
  variant?: "valley" | "ridge" | "depths" | "gate";
  dusk?: boolean;
  height?: number;
  className?: string;
}) {
  const r = dusk ? RIDGE_DUSK : RIDGE;
  const sky = dusk ? ["#8f8a7c", "#c9c0a8", "#e9dfc9"] : ["#e9dfc9", "#dfd4bb", "#cfc2a5"];

  return (
    <div className={`band ${className}`} style={{ height }} aria-hidden>
      <svg viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ height, width: "100%" }}>
        <defs>
          <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky[0]} />
            <stop offset="55%" stopColor={sky[1]} />
            <stop offset="100%" stopColor={sky[2]} />
          </linearGradient>
        </defs>
        <rect width="1200" height="300" fill={`url(#sky-${variant})`} />

        {variant === "valley" && (
          <>
            <path d="M0 120 L120 62 L210 104 L320 44 L430 108 L520 76 L640 130 L760 70 L880 116 L990 58 L1100 100 L1200 64 L1200 300 L0 300 Z" fill={r[0]} opacity="0.55" />
            <path d="M0 168 L140 116 L260 156 L380 104 L500 160 L620 122 L740 172 L860 118 L980 162 L1100 128 L1200 164 L1200 300 L0 300 Z" fill={r[1]} opacity="0.85" />
            <path d="M470 300 L520 210 L560 176 L596 150 L620 176 L668 214 L716 300 Z" fill="#e2d8bf" />
            <path d="M0 214 L120 186 L250 208 L370 178 L480 214 L610 190 L720 222 L850 186 L980 214 L1100 190 L1200 212 L1200 300 L0 300 Z" fill={r[2]} />
            <path d="M0 262 L160 244 L300 262 L440 238 L580 264 L720 246 L860 268 L1000 244 L1200 262 L1200 300 L0 300 Z" fill={r[3]} />
          </>
        )}

        {variant === "ridge" && (
          <>
            <path d="M0 200 L90 120 L170 168 L250 96 L340 160 L430 108 L520 172 L610 118 L700 176 L800 122 L900 174 L1010 116 L1110 166 L1200 128 L1200 300 L0 300 Z" fill={r[0]} opacity="0.5" />
            <path d="M0 236 L110 178 L220 226 L330 166 L450 228 L560 186 L680 240 L800 182 L920 236 L1040 190 L1200 232 L1200 300 L0 300 Z" fill={r[1]} opacity="0.85" />
            <path d="M0 272 L140 244 L280 274 L420 246 L560 276 L700 248 L840 278 L980 250 L1200 274 L1200 300 L0 300 Z" fill={r[3]} />
          </>
        )}

        {variant === "depths" && (
          <>
            <rect width="1200" height="300" fill="#0d1013" />
            <path d="M0 40 L1200 12 L1200 300 L0 300 Z" fill="#151a1f" />
            <path d="M0 118 L300 96 L620 132 L900 100 L1200 130 L1200 300 L0 300 Z" fill="#1c2329" />
            <path d="M0 210 L260 190 L540 224 L820 194 L1200 220 L1200 300 L0 300 Z" fill="#232b32" />
            <path d="M0 264 L1200 258 L1200 300 L0 300 Z" fill="#2b343c" />
            <path d="M560 0 L600 130 L640 0 Z" fill="#e9dfc9" opacity="0.16" />
            <path d="M180 0 L206 96 L232 0 Z" fill="#e9dfc9" opacity="0.09" />
            <path d="M900 0 L930 108 L960 0 Z" fill="#e9dfc9" opacity="0.11" />
          </>
        )}

        {variant === "gate" && (
          <>
            <path d="M0 140 L180 84 L340 128 L520 66 L700 132 L880 78 L1050 124 L1200 86 L1200 300 L0 300 Z" fill={r[0]} opacity="0.5" />
            <path d="M0 200 L200 156 L400 200 L600 158 L800 202 L1000 160 L1200 198 L1200 300 L0 300 Z" fill={r[1]} opacity="0.85" />
            {/* the gate itself: black iron, cream stone, never shut */}
            <rect x="470" y="118" width="16" height="182" fill={r[3]} />
            <rect x="714" y="118" width="16" height="182" fill={r[3]} />
            <path d="M470 118 Q600 62 730 118 L730 134 Q600 80 470 134 Z" fill={r[3]} />
            <path d="M486 140 L714 140 L714 154 L486 154 Z" fill={r[3]} opacity="0.7" />
            <path d="M0 276 L1200 268 L1200 300 L0 300 Z" fill={r[3]} />
          </>
        )}
        <rect x="0" y="298" width="1200" height="2" fill="#b23327" />
      </svg>
    </div>
  );
}

/** A thin band used as a chapter divider. */
export function Rule({ className = "" }: { className?: string }) {
  return <div className={`rule ${className}`} />;
}
