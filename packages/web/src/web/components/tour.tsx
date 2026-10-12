import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { CompassRose } from "./ornament";

export interface TourStep {
  /** value of a `data-tour` attribute; omit for a centred card */
  target?: string;
  title: string;
  body: ReactNode;
  placement?: "right" | "left" | "top" | "bottom";
}

type Rect = { x: number; y: number; w: number; h: number };

const PAD = 8;
const GAP = 64;
const CARD_W = 372;

function measure(target?: string): Rect | null {
  if (!target) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
}

function choosePlacement(r: Rect, pref: TourStep["placement"], vw: number, vh: number, ch: number) {
  const room = {
    right: vw - (r.x + r.w),
    left: r.x,
    bottom: vh - (r.y + r.h),
    top: r.y,
  };
  const fitsSide = (s: "right" | "left") => room[s] >= CARD_W + GAP + 16;
  const fitsVert = (s: "top" | "bottom") => room[s] >= ch + GAP + 16;
  if (pref && (pref === "right" || pref === "left" ? fitsSide(pref) : fitsVert(pref))) return pref;
  if (fitsSide("right")) return "right";
  if (fitsSide("left")) return "left";
  if (fitsVert("bottom")) return "bottom";
  if (fitsVert("top")) return "top";
  return "inside";
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function Tour({ steps, onClose }: { steps: TourStep[]; onClose: (finished: boolean) => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [cardH, setCardH] = useState(220);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  // bring the target into view, then measure; re-measure on scroll/resize
  useEffect(() => {
    const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    let raf = 0;
    const tick = () => {
      setRect(measure(step.target));
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    tick();
    const t = window.setTimeout(tick, 380);
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [step.target]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [i, rect]);

  const next = useCallback(() => (last ? onClose(true) : setI((n) => n + 1)), [last, onClose]);
  const back = useCallback(() => setI((n) => Math.max(0, n - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back, onClose]);

  /* ── layout: card position + arrow path */
  let card = { x: (vp.w - CARD_W) / 2, y: (vp.h - cardH) / 2 };
  let arrow: { d: string; ex: number; ey: number } | null = null;

  if (rect) {
    const place = choosePlacement(rect, step.placement, vp.w, vp.h, cardH);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    if (place === "right") card = { x: rect.x + rect.w + GAP, y: clamp(cy - cardH / 2, 16, vp.h - cardH - 16) };
    else if (place === "left") card = { x: rect.x - GAP - CARD_W, y: clamp(cy - cardH / 2, 16, vp.h - cardH - 16) };
    else if (place === "bottom") card = { x: clamp(cx - CARD_W / 2, 16, vp.w - CARD_W - 16), y: rect.y + rect.h + GAP };
    else if (place === "top") card = { x: clamp(cx - CARD_W / 2, 16, vp.w - CARD_W - 16), y: rect.y - GAP - cardH };
    else card = { x: clamp(cx - CARD_W / 2, 16, vp.w - CARD_W - 16), y: clamp(rect.y + 24, 16, vp.h - cardH - 16) };

    if (place !== "inside") {
      // start on the card edge that faces the target, end just outside the target's edge
      let sx: number, sy: number, ex: number, ey: number;
      if (place === "right") {
        sx = card.x - 6;
        sy = clamp(cy, card.y + 24, card.y + cardH - 24);
        ex = rect.x + rect.w + 8;
        ey = clamp(cy, rect.y + 10, rect.y + rect.h - 10);
      } else if (place === "left") {
        sx = card.x + CARD_W + 6;
        sy = clamp(cy, card.y + 24, card.y + cardH - 24);
        ex = rect.x - 8;
        ey = clamp(cy, rect.y + 10, rect.y + rect.h - 10);
      } else if (place === "bottom") {
        sx = clamp(cx, card.x + 30, card.x + CARD_W - 30);
        sy = card.y - 6;
        ex = clamp(cx, rect.x + 12, rect.x + rect.w - 12);
        ey = rect.y + rect.h + 8;
      } else {
        sx = clamp(cx, card.x + 30, card.x + CARD_W - 30);
        sy = card.y + cardH + 6;
        ex = clamp(cx, rect.x + 12, rect.x + rect.w - 12);
        ey = rect.y - 8;
      }
      // a gentle bow so it reads as a hand-drawn pointer, not a connector line
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const dx = ex - sx;
      const dy = ey - sy;
      const bow = Math.min(36, Math.hypot(dx, dy) * 0.28);
      const len = Math.hypot(dx, dy) || 1;
      const qx = mx + (-dy / len) * bow;
      const qy = my + (dx / len) * bow;
      arrow = { d: `M${sx},${sy} Q${qx},${qy} ${ex},${ey}`, ex, ey };
    }
  }

  return createPortal(
    <dialog open aria-modal="true" aria-label="Guided tour" className="fixed inset-0 z-[100] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-inherit">
      {/* the dim — a full-screen veil when there is no target, a spotlight cut-out when there is */}
      {rect ? (
        <div className="tour-hole tour-pulse" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />
      ) : (
        <div className="absolute inset-0 bg-[rgba(5,4,3,0.82)] fade" />
      )}
      {/* click-catcher: clicking the dim does not dismiss, so nobody loses the tour by accident */}
      <div className="absolute inset-0" />

      {arrow && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <marker id="tour-head" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="13" markerHeight="13" orient="auto-start-reverse">
              <path d="M1,1 L11,6 L1,11 L4,6 Z" fill="var(--gold-bright)" />
            </marker>
          </defs>
          <path d={arrow.d} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="5" strokeLinecap="round" />
          <path d={arrow.d} fill="none" stroke="var(--gold-bright)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 0" markerEnd="url(#tour-head)" />
          <circle cx={arrow.ex} cy={arrow.ey} r="3" fill="var(--gold-bright)" opacity="0.6">
            <animate attributeName="r" values="3;9;3" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      )}

      <div
        ref={cardRef}
        key={i}
        className="panel absolute fade p-5"
        style={{ left: card.x, top: card.y, width: CARD_W, transition: "left 260ms ease, top 260ms ease" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CompassRose size={22} className="text-gold" />
            <span className="micro text-gold">
              Step {i + 1} of {steps.length}
            </span>
          </div>
          <button className="micro inline-flex items-center gap-1 text-paper-3 transition-colors hover:text-paper" onClick={() => onClose(false)}>
            Skip tour <X className="size-3" />
          </button>
        </div>
        <h3 className="display mt-3 text-[20px] text-gold-bright">{step.title}</h3>
        <div className="mt-2 text-[16px] leading-relaxed text-paper-2">{step.body}</div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {steps.map((_, n) => (
              <span
                key={n}
                className="size-[6px] rotate-45 border border-gold/70"
                style={{ background: n === i ? "var(--gold-bright)" : n < i ? "var(--gold-dim)" : "transparent" }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={back}>
                <ArrowLeft className="size-3" /> Back
              </button>
            )}
            <button className="btn btn-sm btn-primary" onClick={next} autoFocus>
              {last ? "Got it" : "Next"} {!last && <ArrowRight className="size-3" />}
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

/* ─────────────────────────────────────────────── persistence */

const seenKey = (name: string) => `ilvaris.tour.${name}`;

export function tourSeen(name: string) {
  try {
    return localStorage.getItem(seenKey(name)) === "done";
  } catch {
    return true;
  }
}

export function markTourSeen(name: string) {
  try {
    localStorage.setItem(seenKey(name), "done");
  } catch {
    /* storage disabled */
  }
}

/** Re-open the guide for the current page from anywhere (the rail's Help button). */
export const TOUR_EVENT = "ilvaris:tour";
export function openTour() {
  window.dispatchEvent(new CustomEvent(TOUR_EVENT));
}

/** Forget every guide so each page shows its walkthrough again on the next visit. */
export function resetTours() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("ilvaris.tour.")) localStorage.removeItem(k);
  } catch {
    /* storage disabled */
  }
}
