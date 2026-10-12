import type { ReactNode } from "react";
import { Skull, Sword, Landmark, Shield, VenetianMask, WandSparkles, PawPrint, Hammer, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

/* ─────────────────────────────────────────────── compass rose */

/** The eight-pointed star from the mocks: wordmark mark, ornament, arc icon. */
export function CompassRose({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55">
        <circle cx="32" cy="32" r="17" />
        <circle cx="32" cy="32" r="11" />
      </g>
      <g fill="currentColor">
        <path d="M32 2 L35.2 28.8 L32 32 L28.8 28.8 Z" />
        <path d="M32 62 L28.8 35.2 L32 32 L35.2 35.2 Z" />
        <path d="M2 32 L28.8 28.8 L32 32 L28.8 35.2 Z" />
        <path d="M62 32 L35.2 35.2 L32 32 L35.2 28.8 Z" />
      </g>
      <g fill="currentColor" opacity="0.7">
        <path d="M11 11 L30 29 L32 32 L29 30 Z" />
        <path d="M53 11 L35 30 L32 32 L34 29 Z" />
        <path d="M11 53 L29 34 L32 32 L30 35 Z" />
        <path d="M53 53 L34 35 L32 32 L35 34 Z" />
      </g>
      <circle cx="32" cy="32" r="2.2" fill="var(--ink)" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ─────────────────────────────────────────────── class glyphs */

export const CLASS_GLYPH: Record<string, LucideIcon> = {
  necromancer: Skull,
  "blade-dancer": Sword,
  architect: Landmark,
  warden: Shield,
  nightblade: VenetianMask,
  enchanter: WandSparkles,
  beastcaller: PawPrint,
  runesmith: Hammer,
};

const CRIMSON = new Set(["blade-dancer", "warden", "enchanter", "runesmith"]);

export function classArt(classId: string | null | undefined) {
  return classId && CLASS_GLYPH[classId] ? `/art/classes/${classId}.jpg` : "/art/classes/necromancer.jpg";
}

/** The player's face: their drawn portrait if they have one, otherwise their class plate. */
export function playerArt(c: { classId: string; portraitKey?: string | null } | null | undefined) {
  if (c?.portraitKey) return `/api/media/${c.portraitKey}`;
  return classArt(c?.classId);
}

/** A banner that hangs from the top edge of a card, carrying the class glyph. */
export function Ribbon({ classId, className = "" }: { classId: string; className?: string }) {
  const Icon = CLASS_GLYPH[classId] ?? Skull;
  return (
    <div className={cn("ribbon", !CRIMSON.has(classId) && "ribbon-slate", className)}>
      <Icon className="size-4" strokeWidth={1.6} />
    </div>
  );
}

/* ─────────────────────────────────────────────── medallion */

export function Medallion({
  value,
  label = "LVL",
  size = 52,
  className = "",
}: {
  value: number | string;
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("medallion", className)} style={{ width: size, height: size }}>
      <span style={{ fontSize: Math.max(8, size * 0.16), letterSpacing: "0.14em" }} className="text-paper-3">
        {label}
      </span>
      <span style={{ fontSize: size * 0.4, fontWeight: 600, marginTop: size * 0.03 }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────── frame overlay */

/** Ornate gold corners painted above content — for cards whose art would cover a plain border. */
export function FrameOver({ soft = false }: { soft?: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3]"
      style={{
        border: "1px solid transparent",
        borderImage: `url("/ornament/${soft ? "frame-soft" : "frame"}.svg") 20 / 20px stretch`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────── section heading */

/** "01  THE PERSON ───────────── what the registry writes down" */
export function SectionHeading({
  n,
  title,
  caption,
  size = "md",
  className = "",
}: {
  n?: string;
  title: string;
  caption?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const fs = size === "lg" ? "text-[30px] md:text-[34px]" : size === "sm" ? "text-[17px]" : "text-[22px] md:text-[26px]";
  return (
    <div className={cn("mb-5 flex items-center gap-4", className)}>
      <div className="flex shrink-0 items-baseline gap-3">
        {n && <span className={cn("section-num", fs)}>{n}</span>}
        <h2 className={cn("display text-paper", fs)}>{title}</h2>
      </div>
      <div className="relative h-px flex-1 bg-gradient-to-r from-gold/70 via-gold/30 to-gold/10">
        <span className="absolute -top-[3px] left-0 size-[7px] rotate-45 border border-gold bg-ink" />
      </div>
      {caption && <span className="shrink-0 font-[var(--font-display)] text-[10.5px] tracking-[0.15em] uppercase text-gold/80">{caption}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────── page title */

/** The large engraved page title used at the top of in-world pages. */
export function PageTitle({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div data-tour="page" className="mb-8 rise">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          {eyebrow && <div className="label-col mb-2">{eyebrow}</div>}
          <h1 className="engraved text-[38px] leading-[1.02] md:text-[50px]">{title}</h1>
          {subtitle && <p className="mt-3 max-w-[64ch] text-[17px] italic leading-relaxed text-paper-2">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="rule-orn mt-6" />
    </div>
  );
}
