import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Feather,
  BookMarked,
  ScrollText,
  Waypoints,
  Layers,
  Skull,
  Globe,
  Hourglass,
  FlaskConical,
  Library,
  Settings,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "../queries/saves";
import { tourFor, type TourDef } from "../lib/tours";
import { CompassRose, playerArt } from "./ornament";
import { Tour, TOUR_EVENT, markTourSeen, openTour, tourSeen } from "./tour";

type NavItem = { to: string; label: string; icon: LucideIcon; needsSave?: boolean };

const RECORDS: NavItem[] = [
  { to: "/codex", label: "Codex", icon: BookMarked, needsSave: true },
  { to: "/ledger", label: "Ledger", icon: ScrollText, needsSave: true },
  { to: "/threads", label: "Threads", icon: Waypoints, needsSave: true },
];
const EXPLORE: NavItem[] = [
  { to: "/strata", label: "Strata", icon: Layers, needsSave: true },
  { to: "/bestiary", label: "Bestiary", icon: Skull, needsSave: true },
  { to: "/world", label: "World", icon: Globe, needsSave: true },
  { to: "/timeline", label: "Timeline", icon: Hourglass, needsSave: true },
];

export function Shell({
  saveId,
  children,
  bleed = false,
}: {
  saveId: number | null;
  children: ReactNode;
  /** page draws its own full-width layout (home, enrollment) */
  bleed?: boolean;
}) {
  const [path] = useLocation();
  const session = useSession(saveId);
  const system = session.data?.system;
  const character = session.data?.character;
  const hasSave = saveId !== null;

  /* ── the guide for this page */
  const [tour, setTour] = useState<TourDef | null>(null);
  useEffect(() => {
    setTour(null);
    const def = tourFor(path);
    if (!def || !def.auto || tourSeen(def.name)) return;
    // wait until the page has drawn the first thing the guide points at
    const first = def.steps.find((s) => s.target)?.target;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      const ready = !first || document.querySelector(`[data-tour="${first}"]`);
      if (ready || tries > 30) {
        window.clearInterval(id);
        if (ready) window.setTimeout(() => setTour(def), 350);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [path]);
  useEffect(() => {
    const on = () => setTour(tourFor(path));
    window.addEventListener(TOUR_EVENT, on);
    return () => window.removeEventListener(TOUR_EVENT, on);
  }, [path]);

  const item = (n: NavItem) => {
    const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
    const locked = n.needsSave && !hasSave;
    const inner = (
      <>
        <n.icon className="size-[18px] shrink-0" strokeWidth={1.5} />
        <span className="hidden xl:inline">{n.label}</span>
      </>
    );
    if (locked)
      return (
        <span key={n.to} className="rail-link cursor-not-allowed opacity-35" title={`${n.label} — open a save first`}>
          {inner}
        </span>
      );
    return (
      <Link key={n.to} to={n.to} className="rail-link" data-active={active} title={n.label}>
        {inner}
      </Link>
    );
  };

  return (
    <div className="relative z-[1] min-h-screen md:pl-[68px] xl:pl-[212px]">
      {/* ───────────────────────── the rail */}
      <aside
        data-tour="rail"
        className="sticky top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-line bg-ink-2/95 px-2 py-1.5 backdrop-blur md:fixed md:inset-y-0 md:left-0 md:w-[68px] md:flex-col md:items-stretch md:overflow-visible md:border-r md:border-b-0 md:px-2 md:py-5 xl:w-[212px] xl:px-3"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(40,31,22,0.5), rgba(12,10,8,0.2))" }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-gold/0 via-gold/40 to-gold/0 md:block" />

        <Link to="/" className="flex shrink-0 items-center gap-2 px-2 md:mb-5 md:flex-col md:gap-1.5 md:px-0">
          <CompassRose size={30} className="text-gold" />
          <span className="engraved hidden text-[22px] tracking-[0.2em] xl:block">ILVARIS</span>
          <span className="micro hidden text-[8.5px] text-gold/70 xl:block">An interactive world</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 md:flex-col md:items-stretch">
          {item({ to: "/", label: "Home", icon: Home })}
          <div data-tour="rail-play" className="flex items-center gap-0.5 md:flex-col md:items-stretch">
            {item({ to: "/desk", label: "The Desk", icon: Feather, needsSave: true })}
            <div data-tour="rail-codex" className="flex items-center gap-0.5 md:flex-col md:items-stretch">
              {RECORDS.map(item)}
            </div>
            <div data-tour="rail-explore" className="flex items-center gap-0.5 md:flex-col md:items-stretch">
              {EXPLORE.map(item)}
            </div>
            <div data-tour="rail-bench" className="flex md:flex-col">
              {item({ to: "/bench", label: "Bench", icon: FlaskConical, needsSave: true })}
            </div>
          </div>
        </nav>

        <div className="mx-2 my-1 h-5 w-px shrink-0 bg-line-strong md:my-4 md:h-px md:w-auto" />

        <nav className="flex shrink-0 items-center gap-0.5 md:flex-col md:items-stretch">
          <div data-tour="rail-bible" className="flex md:flex-col">
            {item({ to: "/bible", label: "World Bible", icon: Library })}
          </div>
          {item({ to: "/settings", label: "Settings", icon: Settings, needsSave: true })}
          <button data-tour="rail-help" className="rail-link text-left" onClick={openTour} title="Help — replay the guide">
            <CircleHelp className="size-[18px] shrink-0" strokeWidth={1.5} />
            <span className="hidden xl:inline">Help</span>
          </button>
        </nav>

        {/* the open life, at the foot of the rail */}
        <div className="mt-auto hidden md:block">
          {character && system ? (
            <Link to="/desk" className="group flex items-center gap-2.5 border border-line p-1.5 transition-colors hover:border-gold-dim xl:p-2">
              <img src={playerArt(character)} alt="" className="size-10 shrink-0 object-cover object-top" />
              <div className="hidden min-w-0 xl:block">
                <div className="display truncate text-[12.5px] text-paper">{character.name}</div>
                <div className="truncate text-[12.5px] italic text-paper-3">
                  Lv {system.level} · {system.location.name}
                </div>
              </div>
            </Link>
          ) : (
            <div className="hidden items-center gap-2 px-2 text-gold/60 xl:flex">
              <CompassRose size={18} />
              <span className="micro text-[9px] leading-snug text-gold/60">An interactive narrative</span>
            </div>
          )}
        </div>
      </aside>

      {bleed ? children : <main className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 md:py-10">{children}</main>}

      {tour && (
        <Tour
          key={tour.name}
          steps={tour.steps}
          onClose={() => {
            markTourSeen(tour.name);
            setTour(null);
          }}
        />
      )}
    </div>
  );
}
