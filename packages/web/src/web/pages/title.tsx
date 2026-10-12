import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Trash2, ArrowRight, ChevronRight, BarChart3, MapPin, Moon, Feather, Waypoints, ScrollText, Layers } from "lucide-react";
import { Loading } from "../components/ui-kit";
import { CompassRose, FrameOver, Medallion, Ribbon, SectionHeading, classArt } from "../components/ornament";
import { useSaves, useDeleteSave } from "../queries/saves";
import { useActiveSave } from "../lib/session";

export default function TitlePage() {
  const [, navigate] = useLocation();
  const [, setSaveId] = useActiveSave();
  const saves = useSaves();
  const remove = useDeleteSave();
  const [confirming, setConfirming] = useState<number | null>(null);

  const open = (id: number) => {
    setSaveId(id);
    navigate("/desk");
  };

  return (
    <div className="relative">
      {/* ───────────────────────── hero */}
      <section className="relative h-[440px] overflow-hidden md:h-[500px]">
        <img
          src="/art/hero.jpg"
          srcSet="/art/hero-sm.jpg 1200w, /art/hero.jpg 2400w"
          sizes="100vw"
          alt="The Vellum Athenaeum on its cliff above the Hollow, at dusk"
          className="absolute inset-0 h-full w-full object-cover object-[62%_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-[1320px] flex-col justify-center px-5 md:px-10">
          <div className="max-w-[560px] text-center">
            <CompassRose size={58} className="rise mx-auto text-gold" />
            <h1 className="engraved rise mt-2 text-[72px] leading-[0.9] tracking-[0.08em] md:text-[112px]" style={{ animationDelay: "80ms" }}>
              ILVARIS
            </h1>
            <div className="rise mt-3 flex items-center justify-center gap-3" style={{ animationDelay: "160ms" }}>
              <span className="h-px w-10 bg-gold/60" />
              <span className="display text-[13px] uppercase tracking-[0.42em] text-gold">An Interactive World</span>
              <span className="h-px w-10 bg-gold/60" />
            </div>
            <p className="rise mx-auto mt-5 max-w-[40ch] text-[19px] leading-relaxed text-paper" style={{ animationDelay: "240ms" }}>
              You wake inside a book that keeps writing itself. The world turns, and so do you.
            </p>
          </div>
        </div>

        <ul className="absolute right-6 top-1/2 hidden -translate-y-1/2 space-y-2 text-right lg:block">
          {["Places", "People", "Choices", "Consequences", "An endless story"].map((w, n) => (
            <li key={w} className="rise micro text-gold/85" style={{ animationDelay: `${320 + n * 60}ms` }}>
              {w}
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────────────── the shelf */}
      <div className="relative mx-auto -mt-6 max-w-[1320px] px-5 pb-16 md:px-10">
        <div className="rise flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: "360ms" }}>
          <div className="min-w-[260px] flex-1">
            <SectionHeading title="Saves" size="lg" caption={<span className="font-[var(--font-body)] text-[16px] normal-case italic tracking-normal">Different lives. The same world.</span>} className="mb-0" />
          </div>
          <Link to="/new" data-tour="new-life" className="btn btn-primary btn-lg">
            <CompassRose size={20} className="text-gold-bright" />
            Begin a New Life
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div data-tour="saves" className="mt-8 min-h-[120px]">
          {saves.isLoading && <Loading label="Opening the Registry" />}

          {saves.data && saves.data.length === 0 && (
            <div className="panel mx-auto max-w-[720px] px-8 py-12 text-center">
              <CompassRose size={40} className="mx-auto text-gold" />
              <p className="display mt-4 text-[20px] text-paper">No one has been enrolled yet</p>
              <p className="mx-auto mt-3 max-w-[50ch] text-[17px] leading-relaxed text-paper-2">
                The Vellum Athenaeum admits one student at a time, and its gate has never been shut. Choose a class, write
                yourself a face, and the first scene will be written for you.
              </p>
              <Link to="/new" className="btn btn-primary btn-lg mt-7 inline-flex">
                Enrol <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          {saves.data && saves.data.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {saves.data.map((s, n) => {
                const classId = s.character?.classId ?? "necromancer";
                return (
                  <article
                    key={s.id}
                    className="rise group relative flex flex-col overflow-hidden border border-line bg-ink-3 transition-transform duration-150 hover:-translate-y-0.5"
                    style={{ animationDelay: `${420 + n * 80}ms` }}
                  >
                    <FrameOver />
                    <button onClick={() => open(s.id)} className="relative block h-[210px] w-full overflow-hidden text-left" aria-label={`Continue as ${s.character?.name ?? s.name}`}>
                      <img src={classArt(classId)} alt="" className="h-full w-full object-cover object-[50%_18%] transition-transform duration-500 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-3 via-ink-3/30 to-transparent" />
                      <div className="absolute bottom-3 left-5 right-20">
                        <div className="display truncate text-[24px] text-paper">{s.character?.name ?? s.name}</div>
                        <div className="micro mt-0.5 text-gold">{s.character?.className ?? "Unfiled"}</div>
                      </div>
                    </button>
                    <Ribbon classId={classId} className="left-5" />
                    <Medallion value={s.character?.level ?? 1} size={54} className="absolute right-5 top-[180px] z-[4]" />

                    {confirming === s.id ? (
                      <div className="absolute right-3 top-3 z-[5] flex items-center gap-2 border border-rule bg-ink/95 px-2.5 py-1.5">
                        <button
                          className="micro text-rule hover:underline"
                          onClick={() => {
                            remove.mutate({ saveId: s.id });
                            setConfirming(null);
                          }}
                        >
                          Erase
                        </button>
                        <span className="h-3 w-px bg-line-strong" />
                        <button className="micro text-paper hover:underline" onClick={() => setConfirming(null)}>
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        className="absolute right-3 top-3 z-[5] grid size-8 place-items-center border border-line bg-ink/70 text-paper-3 opacity-0 transition-all hover:border-rule hover:text-rule group-hover:opacity-100 focus:opacity-100"
                        title="Erase this life"
                        aria-label="Erase this life"
                        onClick={() => setConfirming(s.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}

                    <div className="space-y-2 px-5 pt-5">
                      <Row icon={BarChart3} k="Standing" v={s.character?.standing ?? "Provisional"} />
                      <Row icon={MapPin} k="Location" v={s.character?.locationName ?? "—"} gold />
                      <Row icon={Moon} k="Turn" v={`${s.turn} · Ch. ${s.chapter} · Day ${s.day}`} />
                    </div>

                    <button onClick={() => open(s.id)} className="mt-4 flex items-center gap-3 border-t border-line px-5 py-3.5 text-left transition-colors hover:bg-ink-4">
                      <div className="min-w-0 flex-1">
                        <div className="micro text-[9.5px]">{s.currentArc ? "Current arc" : "Last scene"}</div>
                        <div className="mt-0.5 truncate text-[16px] italic text-paper">
                          {s.currentArc?.name ?? s.lastScene?.title ?? "The Blank Page"}
                        </div>
                      </div>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold/60 text-gold transition-colors group-hover:border-gold-bright group-hover:text-gold-bright">
                        <ChevronRight className="size-4" />
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ───────────────────────── how it plays */}
        <section className="mt-16">
          <SectionHeading title="How it plays" caption="Four things to know" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Feather, t: "You write anything", d: "No menus of moves. Type what your character does, in your own words, and the world answers." },
              { icon: ScrollText, t: "Everything has a cause", d: "Every event cites the event that caused it. Nothing appears from nowhere — including your rewards." },
              { icon: Waypoints, t: "People keep their own minds", d: "Everyone you meet has private facts, beliefs and secrets, and acts on them whether you're watching or not." },
              { icon: Layers, t: "The map is earned", d: "You start knowing a handful of places. Everything else must be walked to, heard about, or survived." },
            ].map((c) => (
              <div key={c.t} className="panel-quiet p-5">
                <c.icon className="size-5 text-gold" strokeWidth={1.5} />
                <div className="display mt-3 text-[15px] text-paper">{c.t}</div>
                <p className="mt-2 text-[15.5px] leading-relaxed text-paper-3">{c.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ icon: Icon, k, v, gold = false }: { icon: typeof MapPin; k: string; v: string; gold?: boolean }) {
  return (
    <div className="grid grid-cols-[18px_96px_1fr] items-center gap-2">
      <Icon className="size-3.5 text-gold/80" strokeWidth={1.6} />
      <span className="micro text-[9.5px]">{k}</span>
      <span className={gold ? "truncate text-[15.5px] text-gold-bright" : "truncate text-[15.5px] text-paper"}>{v}</span>
    </div>
  );
}

export function sceneColor(type: string) {
  switch (type) {
    case "Pressure":
      return "#b23327";
    case "Consequence":
      return "#d97b2b";
    case "Reveal":
      return "#8a6fc4";
    case "Turn":
      return "#c9a227";
    default:
      return "#5f9e9e";
  }
}
