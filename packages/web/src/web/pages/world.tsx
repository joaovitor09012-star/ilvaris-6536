import { useState } from "react";
import { Lock, BookMarked, Map, GitBranch } from "lucide-react";
import { Loading, Panel, PanelHead, SectionHeader, Empty, Dot, Tag, Meter, KeyValue } from "../components/ui-kit";
import { useLore, useArcBoard, useAtlas, useBuyLore } from "../queries/world";
import { cn } from "../lib/utils";

const LORE_PRICE = 400;

type Tab = "bible" | "arcs" | "atlas";

export default function WorldPage({ saveId }: { saveId: number }) {
  const lore = useLore(saveId);
  const arcs = useArcBoard(saveId);
  const atlas = useAtlas(saveId);
  const buy = useBuyLore(saveId);
  const [tab, setTab] = useState<Tab>("bible");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  if (lore.isLoading) return <Loading label="Opening the bible" />;
  if (!lore.data) return <Empty>The bible is chained shut.</Empty>;
  const l = lore.data;

  return (
    <div>
      <SectionHeader
        label="The World"
        title="The bible, as fog of war"
        subtitle="Everything the world knows is written down here — and none of it is yours yet. An unread page shows you its title and what would buy it, and nothing else. The engine does not send the text of a page you have not earned."
        right={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="micro">
              {l.counts.open} of {l.counts.total} pages read
            </span>
            <span className="micro">{Math.round((l.counts.open / Math.max(1, l.counts.total)) * 100)}%</span>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {(
          [
            ["bible", "The Bible", BookMarked],
            ["arcs", "The Six Arcs", GitBranch],
            ["atlas", "The Atlas", Map],
          ] as const
        ).map(([id, label, Icon]) => (
          <button key={id} className={cn("chip", tab === id && "chip-on")} onClick={() => setTab(id as Tab)}>
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {buy.isError && <p className="mb-4 text-[13px] text-rule">{(buy.error as Error).message}</p>}
      {note && <p className="mb-4 text-[13px] text-gold">{note}</p>}

      {tab === "bible" && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_290px]">
          <div className="space-y-8">
            {l.categories.map((c) => {
              const rows = l.entries.filter((e) => e.category === c.category);
              if (rows.length === 0) return null;
              return (
                <div key={c.category}>
                  <div className="mb-3 grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-[170px_1fr]">
                    <div className="label-col pt-1">{c.label}</div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="display text-[12px] text-paper-2">
                        {c.open} of {c.total} read
                      </span>
                      <Meter value={c.open} max={c.total} color="#c9a227" className="w-32" />
                    </div>
                  </div>
                  <div className="rule mb-4" />
                  <div className="space-y-2.5">
                    {rows.map((e) => {
                      const open = openId === e.id;
                      return (
                        <div key={e.id} className={cn("panel overflow-hidden", e.unlocked && "border-line-strong", open && "border-rule-dim")}>
                          <button
                            className="flex w-full items-center gap-3 px-4 py-3 text-left"
                            onClick={() => setOpenId(open ? null : e.id)}
                          >
                            <Dot color={e.unlocked ? "#c9a227" : "#3a444b"} />
                            <span className={cn("min-w-0 flex-1 text-[14.5px]", e.unlocked ? "text-paper" : "text-paper-3")}>
                              {e.title}
                            </span>
                            {e.unlocked ? (
                              <span className="micro flex-none">turn {e.turn}</span>
                            ) : (
                              <Lock className="size-3.5 flex-none text-paper-3" />
                            )}
                          </button>
                          {open && (
                            <div className="fade border-t border-line px-4 py-4">
                              {e.unlocked ? (
                                <div className="prose-scene max-w-[70ch] text-[14.5px]">{e.body}</div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                  <span className="micro">
                                    Not yet yours. This page is unlocked by: <span className="text-paper-2">{e.hint}</span>
                                  </span>
                                  <button
                                    className="btn btn-sm ml-auto"
                                    disabled={buy.isPending}
                                    onClick={() =>
                                      buy.mutate(
                                        { saveId, loreId: e.id, price: LORE_PRICE },
                                        { onSuccess: (r) => setNote(`Bought the page "${r.title}".`) },
                                      )
                                    }
                                  >
                                    Buy a copy · {LORE_PRICE} shards
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <Panel className="overflow-hidden">
              <PanelHead title="Reading" meta="what buys a page" />
              <div className="space-y-2 p-4 text-[13px] leading-relaxed text-paper-3">
                <p>Pages are bought with play, not with coin — though a tutor will sell you a copy of one for {LORE_PRICE} shards if you can find someone who has it.</p>
                <p>Visiting a place, meeting a person, reaching a level, working a vector at the bench, finishing a thread: each of those opens things.</p>
              </div>
            </Panel>
            <Panel className="overflow-hidden">
              <PanelHead title="By category" />
              <div className="p-3.5">
                {l.categories.map((c) => (
                  <KeyValue key={c.category} k={c.label} v={`${c.open}/${c.total}`} mono />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "arcs" && (
        <div className="space-y-10">
          {!arcs.data ? (
            <Loading label="Consulting the director's board" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {arcs.data.global.map((g) => {
                    const known = g.premise !== "";
                    const color = g.state === "closed" ? "#8b8778" : g.state === "dormant" ? "#3a444b" : "#b23327";
                    return (
                      <div key={g.id} className="panel overflow-hidden">
                        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                          <Dot color={color} />
                          <span className={cn("display text-[12px]", known ? "text-paper" : "text-paper-3")}>
                            {known ? g.name : "An arc you have not touched"}
                          </span>
                          <span className="micro">ch {g.chapters[0]}–{g.chapters[1]}</span>
                          <Tag color={color}>{g.state}</Tag>
                          {g.enteredTurn !== null && <span className="micro ml-auto">entered turn {g.enteredTurn}</span>}
                        </div>
                        {known ? (
                          <div className="space-y-4 p-4">
                            <p className="text-[14px] leading-relaxed text-paper-2">{g.premise}</p>
                            <div className="panel-quiet p-3">
                              <div className="micro mb-1">Theme</div>
                              <p className="text-[13px] italic leading-relaxed text-paper-2">{g.theme}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                              <div>
                                <div className="micro mb-2">Stages</div>
                                <ol className="space-y-2">
                                  {g.stages.map((st) => (
                                    <li key={st.at} className="flex gap-2.5">
                                      <span className="mono w-[14px] flex-none pt-0.5 text-[11px] text-paper-3">{st.at}</span>
                                      <span className="text-[13px] leading-snug text-paper-3">{st.beat}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <div className="micro mb-2">Clocks it runs</div>
                                  {g.clocks.map((k) => (
                                    <div key={k.name} className="mb-2">
                                      <div className="flex items-baseline justify-between gap-3">
                                        <span className="text-[13px] text-paper-2">{k.name}</span>
                                        <span className="mono text-[11px] text-paper-3">{k.maxTicks}</span>
                                      </div>
                                      <p className="mt-1 text-[12.5px] leading-snug text-paper-3">{k.consequence}</p>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <div className="micro mb-2">Ways out</div>
                                  <ul className="space-y-1.5">
                                    {g.exits.map((x) => (
                                      <li key={x} className="flex gap-2.5">
                                        <Dot color="#c9a227" className="mt-1.5" />
                                        <span className="text-[13px] leading-snug text-paper-3">{x}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="micro mb-1.5">If nobody touches it</div>
                                  <p className="text-[13px] italic leading-relaxed text-rule">{g.scarIfIgnored}</p>
                                </div>
                                <div>
                                  <div className="micro mb-1.5">Opens when</div>
                                  <p className="text-[13px] leading-relaxed text-paper-3">{g.opensWhen}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-3">
                            <span className="micro">
                              Six arcs are running in Ilvaris whether or not you are in them. This one has not touched you yet.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <Panel className="overflow-hidden">
                    <PanelHead title="Open now" meta={`${arcs.data.running.length}`} />
                    {arcs.data.running.length === 0 ? (
                      <Empty className="m-4">Nothing is currently running against you.</Empty>
                    ) : (
                      <div className="divide-y divide-line-soft">
                        {arcs.data.running.map((a) => (
                          <div key={a.id} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Dot color={a.kind === "global" ? "#b23327" : "#c9a227"} />
                              <span className="text-[13.5px] text-paper-2">{a.name}</span>
                              <Tag>{a.kind}</Tag>
                            </div>
                            <p className="mt-2 text-[13px] leading-snug text-paper-3">{a.summary}</p>
                            <div className="mt-2 flex items-center gap-2.5">
                              <span className="micro">pressure</span>
                              <Meter value={a.pressure} max={100} color="#b23327" className="flex-1" />
                              <span className="mono text-[11px] text-paper-3">{a.pressure}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>

                  <Panel className="overflow-hidden">
                    <PanelHead title="What the world is asking" meta="the miner's queries" />
                    <div className="divide-y divide-line-soft">
                      {arcs.data.questions.map((q) => (
                        <div key={q.id} className="px-4 py-3">
                          <div className="text-[13.5px] text-paper-2">{q.label}</div>
                          <p className="mt-1 text-[12.5px] leading-snug text-paper-3">{q.rule}</p>
                          <div className="micro mt-1.5 text-paper-3">yields · {q.yields}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>

              <Panel className="overflow-hidden">
                <PanelHead title="Shapes a mini-arc can take" meta="a menu, not a script" />
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {arcs.data.shapes.map((sh) => (
                    <div key={sh.id}>
                      <div className="flex items-center gap-2.5">
                        <Dot color="#5f9e9e" />
                        <span className="display text-[11px] text-paper">{sh.name}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-paper-3">{sh.shape}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}
        </div>
      )}

      {tab === "atlas" && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {atlas.isLoading ? (
            <Loading label="Drawing the atlas" />
          ) : (atlas.data ?? []).length === 0 ? (
            <Empty>You know of nowhere at all.</Empty>
          ) : (
            (atlas.data ?? []).map((r) => (
              <Panel key={r.region} className="overflow-hidden">
                <PanelHead title={r.region} meta={`${r.known} of ${r.total} places`} />
                <div className="px-4 pt-3">
                  <Meter value={r.known} max={r.total} color="#c9a227" />
                </div>
                <ul className="divide-y divide-line-soft p-1">
                  {r.places.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                      <Dot color={p.danger >= 3 ? "#b23327" : p.danger >= 2 ? "#d97b2b" : "#7d9b7a"} />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-paper-2">{p.name}</span>
                      <span className="micro flex-none">danger {p.danger}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            ))
          )}
        </div>
      )}
    </div>
  );
}
