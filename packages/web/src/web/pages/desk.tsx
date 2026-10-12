import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Square, Sparkles, Footprints, Moon, Eye, FlaskConical, Compass, BookOpen, ArrowUpRight, Feather } from "lucide-react";
import { Link } from "wouter";
import { Loading, Meter, RankChip, PressureDial } from "../components/ui-kit";
import { CompassRose, FrameOver, Medallion, Ribbon, playerArt } from "../components/ornament";
import { Registrar } from "../components/registrar";
import { Inline } from "../components/inline";
import { useSession } from "../queries/saves";
import { orpc } from "../lib/api";
import { streamTurn } from "../lib/turn";
import type { AppliedResult } from "../../api/agent/pipeline";
import { sceneColor } from "./title";
import { cn } from "../lib/utils";

type Decision = { sceneType: string; title: string; directorNote: string; contentFlag: string; presentNpcIds: string[] };

/** Short descriptor under each stat, matching the mock's "STRENGTH 5 / Agility" rhythm. */
const STAT_HINT: Record<string, string> = {
  str: "Force",
  agi: "Speed",
  vit: "Endurance",
  int: "Analysis",
  wis: "Judgement",
  cha: "Presence",
  luk: "The Ledger's favour",
};

export default function DeskPage({ saveId }: { saveId: number }) {
  const qc = useQueryClient();
  const session = useSession(saveId);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [prose, setProse] = useState("");
  const [applied, setApplied] = useState<AppliedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLTextAreaElement | null>(null);

  const system = session.data?.system;
  const character = session.data?.character;
  // recentScenes arrives oldest-first and already trimmed to the last fourteen;
  // the desk keeps the newest six so the page opens where the player is.
  const scenes = (session.data?.recentScenes ?? []).slice(-6);
  const here = session.data?.location;
  const openArcs = (session.data?.arcs ?? []).filter((a) => a.state !== "closed");
  const latest = scenes[scenes.length - 1];

  // open at the top of the newest scene, and follow the stream while it writes
  useLayoutEffect(() => {
    const el = scroller.current;
    const last = el?.querySelector<HTMLElement>("article:last-of-type");
    if (el && last) el.scrollTo({ top: Math.max(0, last.offsetTop - 24) });
  }, [scenes.length]);
  useEffect(() => {
    if (busy) scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [prose, busy]);

  const starters = useMemo(() => {
    const out: { label: string; text: string; icon: typeof Eye }[] = [
      { label: "Look around", text: "I take a slow look around and note everything worth noting.", icon: Eye },
      { label: "Ask about ink", text: "I find someone who looks like they know about ink and ask them what is moving in the market.", icon: Sparkles },
    ];
    if (here?.services.includes("shop")) out.push({ label: "Go to market", text: "I walk down to the market and see what is being sold today.", icon: Compass });
    if (here?.services.includes("grind")) out.push({ label: "Clear the cellar", text: "I go down into the cellars and start clearing whatever is breeding down there.", icon: Footprints });
    if (here?.services.includes("study") || here?.services.includes("library"))
      out.push({ label: "Read", text: "I find a corner of the library and read until something makes sense.", icon: BookOpen });
    out.push({ label: "Rest", text: "I find somewhere quiet and sleep until morning.", icon: Moon });
    out.push({ label: "Research", text: "I sit down with my Codex and try to work out a new instruction.", icon: FlaskConical });
    return out;
  }, [here]);

  const send = async (text: string) => {
    const action = text.trim();
    if (!action || busy) return;
    setBusy(true);
    setError(null);
    setProse("");
    setDecision(null);
    setApplied(null);
    setPhase("The Chorister weighs the ledger");
    const controller = new AbortController();
    abort.current = controller;

    await streamTurn(
      saveId,
      action,
      {
        onPhase: setPhase,
        onDecision: (d) => {
          setDecision(d);
          setPhase(null);
        },
        onDelta: (chunk) => setProse((p) => p + chunk),
        onApplied: (result) => {
          setApplied(result);
          setPhase(null);
        },
        onError: (message) => {
          setError(message);
          setPhase(null);
        },
      },
      controller.signal,
    );

    setBusy(false);
    setInput("");
    abort.current = null;
    setPhase(null);
    for (const k of [orpc.saves, orpc.codex, orpc.ledger, orpc.threads, orpc.bestiary, orpc.world, orpc.chronicle, orpc.bench, orpc.strata])
      qc.invalidateQueries({ queryKey: k.key() });
    boxRef.current?.focus();
  };

  if (session.isLoading) return <Loading label="The page is still taking ink" />;
  if (!session.data || !system || !character) return <div className="panel-quiet p-6 text-paper-2">That save could not be read.</div>;

  const live = busy || prose || decision || applied || error;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[236px_minmax(0,1fr)_296px]">
      {/* ═════════════════════════ where you are */}
      <aside
        data-tour="context"
        className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr] lg:col-span-2 xl:sticky xl:top-6 xl:col-span-1 xl:grid-cols-1 xl:self-start"
      >
        <div className="relative overflow-hidden border border-line bg-ink-2">
          <img src="/art/hero-sm.jpg" alt="" className="h-[150px] w-full object-cover object-[62%_45%] xl:h-[190px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <div className="label-col text-[10px]">
              Chapter {system.chapter} · Turn {system.turn}
            </div>
          </div>
          <FrameOver soft />
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <h1 className="display text-[22px] leading-tight text-paper">{here?.name ?? system.location.name}</h1>
            <div className="micro mt-1 text-gold/80">
              {here?.region || system.location.region} · Danger {here?.danger ?? system.location.danger}
            </div>
            {here?.description && <p className="mt-2.5 text-[14.5px] italic leading-snug text-paper-3">{here.description}</p>}
          </div>

          <div className="space-y-2 border-t border-line pt-3">
            <div className="flex items-center justify-between">
              <span className="micro">Day {system.day}</span>
              <span className="micro text-paper-2">{system.standing}</span>
            </div>
            <PressureDial value={system.pressure} mode={system.mode} />
          </div>

          {openArcs[0] && (
            <Link to="/world" className="group block border border-gold-dim/60 bg-ink-3/70 p-3.5 transition-colors hover:border-gold">
              <div className="flex items-center gap-2">
                <CompassRose size={14} className="text-gold" />
                <span className="label-col text-[10px]">Current arc</span>
                <ArrowUpRight className="ml-auto size-3.5 text-paper-3 group-hover:text-gold" />
              </div>
              <div className="mt-1.5 text-[16px] italic text-paper">{openArcs[0].name}</div>
              <p className="mt-1 line-clamp-3 text-[13.5px] leading-snug text-paper-3">{openArcs[0].summary}</p>
            </Link>
          )}

          {session.data.guns.length > 0 && (
            <div className="hidden border-t border-line pt-3 xl:block">
              <div className="micro mb-2">Left on the table</div>
              <ul className="space-y-1.5">
                {session.data.guns.slice(0, 4).map((g) => (
                  <li key={g.id} className="flex gap-2 text-[13.5px] leading-snug text-paper-3">
                    <span className="mt-[0.45em] size-[5px] shrink-0 rotate-45 bg-gold/70" />
                    {g.fact}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* ═════════════════════════ the page */}
      <section className="min-w-0">
        <div data-tour="scene" className="parchment">
          <div ref={scroller} className="relative max-h-[66vh] min-h-[380px] overflow-y-auto px-6 py-8 md:px-12 md:py-10">
            {scenes.length === 0 && !live && (
              <div className="py-16 text-center">
                <div className="display text-[24px] text-[#2a1f15]">The Blank Page</div>
                <p className="mt-3 italic text-[#7a6448]">Nothing has been written yet. Write your first move below.</p>
              </div>
            )}

            {scenes.map((sc, i) => (
              <article key={sc.id} className={cn(i > 0 && "mt-10")}>
                {i > 0 && <Divider />}
                <SceneHead type={sc.type} title={sc.title} place={sc.locationName} turn={sc.turn} />
                <Prose text={sc.prose} />
              </article>
            ))}

            {live && (
              <article className="fade mt-10">
                {scenes.length > 0 && <Divider />}
                <SceneHead
                  type={decision?.sceneType ?? "…"}
                  title={decision?.title ?? "The pen is moving"}
                  place={here?.name ?? ""}
                  turn={system.turn + 1}
                  live
                />
                {decision && decision.presentNpcIds.length > 0 && (
                  <div className="-mt-3 mb-5 text-center text-[13px] italic text-[#7a6448]">
                    present: {decision.presentNpcIds.map((n) => n.replace(/-/g, " ")).join(", ")}
                  </div>
                )}
                {prose ? (
                  <div className={cn("prose-scene", busy && "blink")}>
                    {prose.split(/\n{2,}/).map((p, n) => (
                      <p key={n}>
                        <Inline text={p} />
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="flex items-center justify-center gap-2 py-6 text-[15px] italic text-[#7a6448]">
                    <Feather className="size-4 animate-pulse" /> {phase ?? "Thinking"}…
                  </p>
                )}
                {phase && prose && <p className="micro mt-3 text-center">{phase}</p>}
                {error && <p className="mt-3 text-center text-[15px] text-[#a8262a]">{error}</p>}
              </article>
            )}
          </div>
        </div>

        {applied && (
          <div className="mt-5">
            <Registrar applied={applied} />
          </div>
        )}

        {/* ─── what you do */}
        <div className="sticky bottom-0 z-10 -mx-1 mt-5 bg-gradient-to-t from-ink via-ink to-ink/0 px-1 pt-4 pb-3">
          <div data-tour="chips" className="flex flex-wrap gap-1.5">
            {starters.map((s) => (
              <button key={s.label} className="chip" disabled={busy} onClick={() => send(s.text)}>
                <s.icon className="mr-1.5 inline size-3" />
                {s.label}
              </button>
            ))}
          </div>
          <div data-tour="input" className="mt-3 flex items-stretch border border-line-strong bg-ink-2 focus-within:border-gold-dim">
            <textarea
              ref={boxRef}
              aria-label="What you do"
              rows={2}
              className="min-h-[60px] flex-1 resize-none bg-transparent px-4 py-3 text-[17px] text-paper outline-none placeholder:text-paper-3 placeholder:italic"
              placeholder="Write what you do, say or try. Anything — the world will answer."
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            {busy ? (
              <button className="btn m-2 self-end" onClick={() => abort.current?.abort()}>
                <Square className="size-3.5" /> Stop
              </button>
            ) : (
              <button className="btn btn-primary btn-lg m-2 self-end px-7" disabled={!input.trim()} onClick={() => send(input)}>
                Act
              </button>
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-[12.5px] italic text-paper-3">
            <span>Ctrl / ⌘ + Enter to act</span>
            {latest && <span>last: {latest.title}</span>}
          </div>
        </div>
      </section>

      {/* ═════════════════════════ the System Window */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div data-tour="status" className="relative border border-line bg-ink-2">
          <div className="relative h-[200px] overflow-hidden">
            <img src={playerArt(character)} alt="" className="size-full object-cover object-[50%_14%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/10 to-transparent" />
            <Ribbon classId={character.classId} className="right-3" />
          </div>
          <div className="absolute top-[150px] left-4 z-[4]">
            <Medallion value={system.level} label="LV" size={60} />
          </div>
          <div className="px-4 pt-3 pb-4">
            <div className="pl-[72px]">
              <div className="display truncate text-[16px] text-paper">{character.name}</div>
              <div className="truncate text-[13.5px] italic text-paper-3">{character.className}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13.5px] text-paper-2">{system.rankLabel}</span>
              <RankChip rank={system.rank} />
            </div>

            <div className="mt-3 space-y-2">
              <Bar label="HP" value={system.hp.cur} max={system.hp.max} color="linear-gradient(90deg,#7a1d20,#c4423a)" />
              <Bar label="XP" value={system.xp} max={system.xpNext} color="linear-gradient(90deg,#8a6a35,#e8cf98)" />
              <Bar label="Ink" value={system.ink.cur} max={system.ink.max} color="linear-gradient(90deg,#2b4a78,#6d9ad6)" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3">
              {system.stats.map((s) => (
                <div key={s.key} title={s.blurb} className="min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className={cn("display text-[10.5px] tracking-[0.12em]", s.main ? "text-gold-bright" : "text-paper-2")}>{s.label}</span>
                    <span className={cn("mono text-[13px]", s.main ? "text-gold-bright" : "text-paper")}>{s.value}</span>
                  </div>
                  <div className="truncate text-[11.5px] italic text-paper-3">{STAT_HINT[s.key] ?? ""}</div>
                </div>
              ))}
            </div>
            {system.freePoints > 0 && (
              <Link to="/codex" className="mt-3 flex items-center justify-between border border-rule-dim bg-[#2a1210] px-3 py-2 hover:border-rule">
                <span className="text-[14px] text-paper">{system.freePoints} free points</span>
                <span className="micro text-rule">spend →</span>
              </Link>
            )}

            <dl className="mt-4 space-y-1 border-t border-line pt-3 text-[13.5px]">
              <Row k="Mark" v={system.covenantMark} />
              <Row k="Covenant debt" v={system.debt > 0 ? system.debt.toLocaleString() : "None"} warn={system.debt > 0} />
              <Row k="Stain" v={String(system.stain)} warn={system.stain > 0} />
              <Row k="Descent" v={system.depth > 0 ? `Stratum ${system.depth}` : "Surface"} />
              <Row k="Purse" v={system.coinLabel} />
            </dl>
          </div>
          <FrameOver />
        </div>

        <div data-tour="quest" className="panel">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <CompassRose size={14} className="text-gold" />
            <span className="display text-[12px] tracking-[0.16em] text-gold-bright">Active quest</span>
          </div>
          <div className="space-y-4 p-4">
            {system.declaredThread && (
              <div>
                <div className="micro">You declared</div>
                <div className="mt-0.5 text-[15px] italic text-paper">{system.declaredThread}</div>
              </div>
            )}
            {openArcs.length === 0 && !system.declaredThread && (
              <p className="text-[14px] italic text-paper-3">Nothing has its hooks in you yet. It will.</p>
            )}
            {openArcs.slice(0, 3).map((a) => (
              <div key={a.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[15px] text-paper">{a.name}</span>
                  <span className="micro shrink-0">{a.kind}</span>
                </div>
                {a.clocks.slice(0, 2).map((c) => (
                  <div key={c.name} className="mt-1.5" title={c.consequence}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12.5px] text-paper-3">{c.name}</span>
                      <span className="mono shrink-0 text-[10.5px] text-paper-3">
                        {c.ticks}/{c.maxTicks}
                      </span>
                    </div>
                    <Meter value={c.ticks} max={c.maxTicks} color={c.status === "fired" ? "#b23327" : "#d97b2b"} className="mt-1" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────── pieces */

function Divider() {
  return (
    <div className="mb-8 flex items-center justify-center gap-3 text-[#a8873f]" aria-hidden>
      <span className="h-px w-14 bg-current opacity-50" />
      <span className="size-[6px] rotate-45 bg-current" />
      <span className="h-px w-14 bg-current opacity-50" />
    </div>
  );
}

function SceneHead({ type, title, place, turn, live = false }: { type: string; title: string; place: string; turn: number; live?: boolean }) {
  return (
    <header className="mb-6 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-2.5 font-[var(--font-display)] text-[10.5px] tracking-[0.2em] uppercase text-[#806a4d]">
        <span style={{ color: sceneColor(type) }}>{type}</span>
        <span>·</span>
        <span>Turn {turn}</span>
        {place && (
          <>
            <span>·</span>
            <span>{place}</span>
          </>
        )}
        {live && <span className="text-[#a8262a]">· writing</span>}
      </div>
      <h2 className="display mt-2 text-[24px] leading-tight tracking-[0.06em] text-[#2a1f15] md:text-[28px]">{title}</h2>
    </header>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="prose-scene">
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>
          <Inline text={p} />
        </p>
      ))}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="display text-[10.5px] tracking-[0.16em] text-paper-2">{label}</span>
        <span className="mono text-[12px] text-paper">
          {value}
          <span className="text-paper-3"> / {max}</span>
        </span>
      </div>
      <div className="meter mt-1 h-[7px]">
        <i style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Row({ k, v, warn = false }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="display text-[10.5px] tracking-[0.14em] text-paper-3">{k}</dt>
      <dd className={cn("mono truncate text-[12.5px]", warn ? "text-[#d97b2b]" : "text-paper-2")}>{v}</dd>
    </div>
  );
}
