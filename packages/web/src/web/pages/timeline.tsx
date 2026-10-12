import { useState } from "react";
import { CornerDownRight, Flame, Eye, Scroll } from "lucide-react";
import { Loading, Panel, PanelHead, SectionHeader, Empty, Dot, Tag, Meter, PressureDial } from "../components/ui-kit";
import { useTimeline, useArcLedger, useChapter } from "../queries/chronicle";
import { cn } from "../lib/utils";

const KIND_COLOR: Record<string, string> = {
  gain: "#7d9b7a",
  loss: "#b23327",
  kill: "#b23327",
  travel: "#5f9e9e",
  study: "#8a6fc4",
  social: "#c9a227",
  arc: "#d97b2b",
  system: "#5b86c4",
};

type Tab = "causes" | "chapters" | "arcs";

export default function TimelinePage({ saveId }: { saveId: number }) {
  const timeline = useTimeline(saveId);
  const ledger = useArcLedger(saveId);
  const [tab, setTab] = useState<Tab>("causes");
  const [chapter, setChapter] = useState<number | null>(null);

  if (timeline.isLoading) return <Loading label="Reading the chronicle" />;
  if (!timeline.data) return <Empty>The chronicle has not been started.</Empty>;
  const t = timeline.data;

  return (
    <div>
      <SectionHeader
        label="The Chronicle"
        title="Nothing happens without a cause"
        subtitle="Every event the director introduces has to cite the event that caused it. If the ledger cannot name a cause, the event was never allowed in. This is the whole spine of the simulation, shown to you plainly."
        right={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="micro">{t.counts.events} events</span>
            <span className="micro">{t.counts.scenes} scenes</span>
            <span className="micro">turn {t.counts.turns}</span>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        <Stat k="Turn" v={String(t.counts.turns)} />
        <Stat k="Chapter" v={String(t.counts.chapter)} />
        <Stat k="Events recorded" v={String(t.counts.events)} />
        <Stat k="Open threads" v={String(t.openThreads.length)} />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {(
          [
            ["causes", "Cause & effect"],
            ["chapters", "Chapters"],
            ["arcs", "Arcs & clocks"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={cn("chip", tab === id && "chip-on")} onClick={() => setTab(id as Tab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "causes" && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_300px]">
          <Panel className="overflow-hidden">
            <PanelHead title="The chain" meta="newest first" right={<Scroll className="size-3.5 text-paper-3" />} />
            {t.events.length === 0 ? (
              <Empty className="m-4">Nothing has happened yet. That is about to change.</Empty>
            ) : (
              <div className="divide-y divide-line-soft">
                {t.events.map((e) => (
                  <div key={e.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="mono w-[46px] flex-none text-[11px] text-paper-3">t{e.turn}</span>
                      <Dot color={KIND_COLOR[e.kind] ?? "#8b8778"} />
                      <span className="micro flex-none">{e.kind}</span>
                      {e.locationName && <span className="micro truncate text-paper-3">{e.locationName}</span>}
                      {e.npcName && <span className="micro ml-auto truncate">{e.npcName}</span>}
                    </div>
                    <p className="mt-2 pl-[58px] text-[14px] leading-relaxed text-paper-2">{e.description}</p>
                    {e.cause && (
                      <div className="mt-2 ml-[58px] flex gap-2 border-l border-rule-dim pl-3">
                        <CornerDownRight className="mt-0.5 size-3 flex-none text-paper-3" />
                        <span className="text-[12.5px] italic leading-snug text-paper-3">{e.cause}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <div className="space-y-4">
            <Panel className="overflow-hidden">
              <PanelHead title="By kind" />
              <div className="p-3.5">
                {t.kinds.length === 0 ? (
                  <span className="micro">Nothing yet.</span>
                ) : (
                  t.kinds.map((k) => (
                    <div key={k.kind} className="mb-2 flex items-center gap-2.5">
                      <span className="micro w-[62px] flex-none">{k.kind}</span>
                      <Meter value={k.count} max={t.kinds[0].count} color={KIND_COLOR[k.kind] ?? "#8b8778"} className="flex-1" />
                      <span className="mono w-[28px] flex-none text-right text-[11px] text-paper-3">{k.count}</span>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <PanelHead title="Open threads" />
              {t.openThreads.length === 0 ? (
                <Empty className="m-3">No thread is currently pulling at you.</Empty>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {t.openThreads.map((th) => (
                    <li key={th.name} className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Dot color={th.state === "fraying" ? "#d97b2b" : "#5f9e9e"} />
                        <span className="text-[13.5px] text-paper-2">{th.name}</span>
                        <span className="micro ml-auto">{th.progress}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}

      {tab === "chapters" && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[290px_1fr]">
          <Panel className="overflow-hidden">
            <PanelHead title="Chapters" meta={`${t.chapters.length}`} />
            {t.chapters.length === 0 ? (
              <Empty className="m-4">The first chapter has not closed.</Empty>
            ) : (
              <ul className="divide-y divide-line-soft">
                {t.chapters.map((c) => (
                  <li key={c.chapter}>
                    <button
                      className={cn("w-full px-4 py-3 text-left transition-colors", chapter === c.chapter ? "bg-ink-4" : "hover:bg-ink-3")}
                      onClick={() => setChapter(chapter === c.chapter ? null : c.chapter)}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="display text-[11px] text-paper">Chapter {c.chapter}</span>
                        <span className="micro">{c.scenes} scenes</span>
                      </div>
                      <div className="mt-1.5 truncate text-[13px] text-paper-3">{c.title}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {Object.entries(c.types).map(([k, n]) => (
                          <Tag key={k} color={KIND_COLOR[k]}>
                            {k} {n}
                          </Tag>
                        ))}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <ChapterReader saveId={saveId} chapter={chapter} />
        </div>
      )}

      {tab === "arcs" && (
        <div className="space-y-6">
          {!ledger.data ? (
            <Loading label="Consulting the board" />
          ) : (
            <>
              <Panel className="overflow-hidden">
                <PanelHead title="Pressure" meta="the pacing law, enforced by the engine" />
                <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <PressureDial value={ledger.data.pressure.value} mode={ledger.data.pressure.mode} />
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span className="micro">pressure streak {ledger.data.pressure.pressureStreak}</span>
                    <span className="micro">breath streak {ledger.data.pressure.breathStreak}</span>
                    <span className="micro">max three Pressure scenes in a row</span>
                  </div>
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                <Panel className="overflow-hidden">
                  <PanelHead title="Clocks" meta={`${ledger.data.clocks.length} running`} />
                  {ledger.data.clocks.length === 0 ? (
                    <Empty className="m-4">No clock is ticking against you.</Empty>
                  ) : (
                    <div className="divide-y divide-line-soft">
                      {ledger.data.clocks.map((k) => (
                        <div key={k.id} className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[13.5px] text-paper-2">{k.name}</span>
                            <span className="micro ml-auto">
                              {k.ticks}/{k.maxTicks}
                            </span>
                            <Tag color={k.status === "fired" ? "#b23327" : "#c9a227"}>{k.status}</Tag>
                          </div>
                          <div className="mt-2">
                            <Meter value={k.ticks} max={k.maxTicks} color={k.pct > 70 ? "#b23327" : "#d97b2b"} />
                          </div>
                          <p className="mt-2 text-[13px] leading-snug text-paper-3">{k.consequence}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>

                <Panel className="overflow-hidden">
                  <PanelHead title="Guns not yet fired" meta={`${ledger.data.guns.filter((g) => !g.fired).length} live`} right={<Flame className="size-3.5 text-paper-3" />} />
                  {ledger.data.guns.length === 0 ? (
                    <Empty className="m-4">Nothing has been promised to you yet.</Empty>
                  ) : (
                    <ul className="divide-y divide-line-soft">
                      {ledger.data.guns.map((g) => (
                        <li key={g.id} className="flex items-start gap-3 px-4 py-3">
                          <Dot color={g.fired ? "#7d9b7a" : "#b23327"} className="mt-1.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] leading-snug text-paper-2">{g.fact}</p>
                            <div className="micro mt-1">introduced turn {g.introducedTurn}</div>
                          </div>
                          <Tag color={g.fired ? "#7d9b7a" : "#b23327"}>{g.fired ? "fired" : g.retired ? "retired" : "live"}</Tag>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>

              <Panel className="overflow-hidden">
                <PanelHead title="Arc board" meta={`${ledger.data.arcs.length}`} />
                {ledger.data.arcs.length === 0 ? (
                  <Empty className="m-4">No arc has opened. Do something the world has to answer.</Empty>
                ) : (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-4 lg:grid-cols-2">
                    {ledger.data.arcs.map((a) => (
                      <div key={a.id} className="border-t border-line pt-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Dot color={a.state === "closed" ? "#8b8778" : "#d97b2b"} />
                          <span className="display text-[11px] text-paper">{a.name}</span>
                          <Tag>{a.kind}</Tag>
                          <Tag color={a.state === "closed" ? "#8b8778" : "#c9a227"}>{a.state}</Tag>
                          <span className="micro ml-auto">turn {a.enteredTurn}</span>
                        </div>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-paper-3">{a.summary}</p>
                        {a.theme && <p className="mt-2 text-[13px] italic leading-relaxed text-paper-2">{a.theme}</p>}
                        {a.scar && (
                          <p className="mt-2 text-[13px] leading-relaxed text-rule">
                            <span className="micro">scar · </span>
                            {a.scar}
                          </p>
                        )}
                        {a.clocks.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {a.clocks.map((k) => (
                              <div key={k.name}>
                                <div className="flex items-baseline justify-between gap-3">
                                  <span className="micro">{k.name}</span>
                                  <span className="mono text-[11px] text-paper-3">
                                    {k.ticks}/{k.maxTicks}
                                  </span>
                                </div>
                                <Meter value={k.ticks} max={k.maxTicks} color="#d97b2b" className="mt-1" />
                              </div>
                            ))}
                          </div>
                        )}
                        {a.exits.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {a.exits.map((x) => (
                              <Tag key={x} color="#c9a227">
                                {x}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel className="overflow-hidden">
                <PanelHead title="Rumour" meta="what is being said, and whether it is true" right={<Eye className="size-3.5 text-paper-3" />} />
                {ledger.data.rumours.length === 0 ? (
                  <Empty className="m-4">Nobody is talking about you. Yet.</Empty>
                ) : (
                  <div className="divide-y divide-line-soft">
                    {ledger.data.rumours.map((r) => (
                      <div key={r.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <Dot color={r.isTrue ? "#7d9b7a" : "#b23327"} className="mt-1.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] leading-snug text-paper-2">{r.text}</p>
                            <div className="micro mt-1">
                              {r.isTrue ? "true" : "false"} · spread {r.spread} · turn {r.turn}
                              {r.believedBy.length > 0 && <span className="text-paper-3"> · believed by {r.believedBy.join(", ")}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ChapterReader({ saveId, chapter }: { saveId: number; chapter: number | null }) {
  const ch = useChapter(saveId, chapter);

  if (chapter === null) {
    return (
      <Panel className="overflow-hidden">
        <PanelHead title="A chapter" meta="nothing open" />
        <Empty className="m-4">
          <Scroll className="mx-auto mb-3 size-5 text-paper-3" />
          Pick a chapter. Scenes are shown in the order they were lived, with the player's own words kept above the prose.
        </Empty>
      </Panel>
    );
  }

  if (ch.isLoading) return <Loading label="Turning back the pages" />;
  if (!ch.data) return <Empty>That chapter will not open.</Empty>;

  return (
    <Panel className="overflow-hidden">
      <PanelHead
        title={`Chapter ${ch.data.chapter}`}
        meta={`${ch.data.scenes.length} scenes · ${ch.data.words.toLocaleString()} words`}
      />
      <div className="divide-y divide-line-soft">
        {ch.data.scenes.length === 0 ? (
          <Empty className="m-4">No scenes were written in this chapter.</Empty>
        ) : (
          ch.data.scenes.map((sc) => (
            <article key={sc.id} className="px-5 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="mono text-[11px] text-paper-3">turn {sc.turn}</span>
                <Dot color={KIND_COLOR[sc.type] ?? "#8b8778"} />
                <span className="micro">{sc.type}</span>
                <span className="display text-[11px] text-paper">{sc.title}</span>
                <span className="micro ml-auto">{sc.locationName}</span>
              </div>
              {sc.playerInput && (
                <div className="mt-3 border-l border-rule-dim pl-3">
                  <div className="micro mb-1">you said</div>
                  <p className="text-[13.5px] italic leading-relaxed text-paper-2">{sc.playerInput}</p>
                </div>
              )}
              <div className="prose-scene mt-4 max-w-[74ch] text-[14.5px]">{sc.prose}</div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-line pt-2">
      <div className="micro">{k}</div>
      <div className="mono mt-1 text-[14px] text-paper">{v}</div>
    </div>
  );
}
