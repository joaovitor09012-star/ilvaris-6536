import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

/* ─────────────────────────────────────────────── rank */

/** Mirrors RANK_COLOR in api/world/ranks.ts — keep the two in step. */
export const RANK_COLOR: Record<string, string> = {
  F: "#6b7280",
  E: "#7d9a8a",
  D: "#5f9ea0",
  C: "#4f8fc0",
  B: "#8a7fc0",
  A: "#c0a04f",
  S: "#d98324",
  SS: "#c0392b",
  SSS: "#e8d9a8",
};

export function RankChip({ rank, className = "" }: { rank: string; className?: string }) {
  const color = RANK_COLOR[rank] ?? RANK_COLOR.F;
  return (
    <span className={cn("rank-chip", className)} style={{ color, background: `${color}1a` }}>
      {rank}
    </span>
  );
}

/* ─────────────────────────────────────────────── status dot */

export function Dot({ color = "#8b8778", className = "" }: { color?: string; className?: string }) {
  return <span className={cn("dot", className)} style={{ background: color }} />;
}

/* ─────────────────────────────────────────────── section header */

export function SectionHeader({
  label,
  title,
  subtitle,
  right,
  className = "",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div data-tour="page" className={cn("mb-8 rise", className)}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          {label && <div className="label-col mb-2">{label}</div>}
          <h1 className="engraved text-[36px] leading-[1.04] md:text-[46px]">{title}</h1>
          {subtitle && <p className="mt-3 max-w-[66ch] text-[17px] italic leading-relaxed text-paper-2">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="rule-orn mt-6" />
    </div>
  );
}

/* ─────────────────────────────────────────────── panel */

export function Panel({
  children,
  className = "",
  inset = false,
}: {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return <div className={cn(inset ? "panel-inset" : "panel", className)}>{children}</div>;
}

export function PanelHead({
  title,
  meta,
  right,
  className = "",
}: {
  title: string;
  meta?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-line px-5 py-3", className)}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span className="display whitespace-nowrap text-[12.5px] uppercase tracking-[0.16em] text-gold-bright">{title}</span>
        {meta && <span className="micro">{meta}</span>}
      </div>
      {right}
    </div>
  );
}

/* ─────────────────────────────────────────────── meter */

export function Meter({
  value,
  max,
  color,
  className = "",
}: {
  value: number;
  max: number;
  color?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={cn("meter", className)}>
      <i style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function StatLine({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number | string;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="micro">{label}</span>
      <span className="mono text-[12px] text-paper">
        {value}
        {max !== undefined && <span className="text-paper-3">/{max}</span>}
        {suffix && <span className="text-paper-3">{suffix}</span>}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────── loading / empty */

export function Loading({ label = "Reading the ledger", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-14 text-paper-3", className)}>
      <Loader2 className="size-4 animate-spin" />
      <span className="micro">{label}</span>
    </div>
  );
}

export function Empty({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel-quiet px-4 py-8 text-center text-[14px] text-paper-3", className)}>{children}</div>;
}

/* ─────────────────────────────────────────────── tile */

export function Tile({
  children,
  onClick,
  className = "",
  active = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn("tile p-3.5 text-left", active && "border-rule bg-ink-4", onClick && "cursor-pointer", className)}
    >
      {children}
    </Comp>
  );
}

/* ─────────────────────────────────────────────── disposition bars */

/** trust runs −100…+100 and fills from the centre; the rest run 0…100 and fill from the left */
const DISPOSITION_KEYS = [
  { key: "trust", label: "Trust", color: "#7d9b7a", bipolar: true },
  { key: "desire", label: "Desire", color: "#b23327", bipolar: false },
  { key: "fear", label: "Fear", color: "#8a6fc4", bipolar: false },
  { key: "debt", label: "Debt", color: "#c9a227", bipolar: false },
  { key: "grudge", label: "Grudge", color: "#d97b2b", bipolar: false },
] as const;

/** A centre-origin meter: positive fills right of the midline, negative fills left in `negColor`. */
function BipolarMeter({ value, color, negColor = "#b23327", className = "" }: { value: number; color: string; negColor?: string; className?: string }) {
  const pct = Math.min(100, Math.abs(value)) / 2; // half the bar per side
  return (
    <div className={cn("meter relative", className)}>
      <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-[#2a2118]" />
      {value !== 0 && (
        <i
          className="absolute inset-y-0"
          style={{ width: `${pct}%`, background: value > 0 ? color : negColor, left: value > 0 ? "50%" : `${50 - pct}%` }}
        />
      )}
    </div>
  );
}

export function Disposition({
  disposition,
  compact = false,
}: {
  disposition: { trust: number; fear: number; debt: number; desire: number; grudge: number };
  compact?: boolean;
}) {
  const rows = DISPOSITION_KEYS.map((k) => ({ ...k, value: (disposition as unknown as Record<string, number>)[k.key] ?? 0 }));
  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-2.5">
          <span className="micro w-[52px] flex-none">{r.label}</span>
          {r.bipolar ? (
            <BipolarMeter value={r.value} color={r.color} className="flex-1" />
          ) : (
            <Meter value={Math.max(0, r.value)} max={100} color={r.color} className="flex-1" />
          )}
          <span className="mono w-[34px] flex-none text-right text-[11px] text-paper-2">{r.value > 0 ? `+${r.value}` : r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────── pressure dial */

export function PressureDial({ value, mode }: { value: number; mode: string }) {
  const color = value > 70 ? "#b23327" : value > 40 ? "#d97b2b" : "#5f9e9e";
  return (
    <div className="flex items-center gap-2.5">
      <span className="micro">Pressure</span>
      <Meter value={value} max={100} color={color} className="w-24" />
      <span className="mono text-[11px]" style={{ color }}>
        {value}
      </span>
      <span className="micro text-paper-3">{mode.replace(/_/g, " ")}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────── misc */

export function KeyValue({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-soft py-1.5 last:border-0">
      <span className="micro">{k}</span>
      <span className={cn("text-right text-[13px] text-paper", mono && "mono")}>{v}</span>
    </div>
  );
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="micro rounded-sm border px-1.5 py-0.5"
      style={{ borderColor: color ?? "var(--line-strong)", color: color ?? undefined }}
    >
      {children}
    </span>
  );
}
