import { useState } from "react";
import { BookOpen, Skull, Eye } from "lucide-react";
import { Loading, Panel, PanelHead, SectionHeader, Empty, RankChip, Dot, Tag, Meter } from "../components/ui-kit";
import { useBestiary, useStudy } from "../queries/bestiary";
import { cn } from "../lib/utils";

export default function BestiaryPage({ saveId }: { saveId: number }) {
  const bestiary = useBestiary(saveId);
  const study = useStudy(saveId);
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  if (bestiary.isLoading) return <Loading label="Opening the field book" />;
  if (!bestiary.data) return <Empty>The bestiary is blank. You have killed nothing and seen nothing.</Empty>;
  const d = bestiary.data;

  const ranksPresent = d.ranks.map((r) => r.rank).filter((r) => d.entries.some((e) => e.rank === r));
  const entries =
    filter === "all"
      ? d.entries
      : filter === "studied"
        ? d.entries.filter((e) => e.studied)
        : filter === "unknown"
          ? d.entries.filter((e) => !e.studied)
          : d.entries.filter((e) => e.rank === filter);

  return (
    <div>
      <SectionHeader
        label="The Bestiary"
        title="What you have killed, and what you understand"
        subtitle="Two different things. Killing a creature gives you an entry with its name in it. Studying it — a scene, a page of ink, and no sword — gives you the half of the entry that keeps students alive. The ranks run F to SSS and they are honest."
        right={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="micro">
              {d.counts.discovered} of {d.counts.total} known
            </span>
            <span className="micro">{d.counts.studied} studied</span>
            <span className="micro">{d.counts.kills} kills</span>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <Panel className="overflow-hidden">
          <PanelHead
            title={`Standing in ${d.here.name}`}
            meta={`${d.presentHere.length} species here`}
            right={<Eye className="size-3.5 text-paper-3" />}
          />
          {d.presentHere.length === 0 ? (
            <Empty className="m-4">Nothing here has a name in your book.</Empty>
          ) : (
            <div className="divide-y divide-line-soft">
              {d.presentHere.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                  <RankChip rank={m.rank} />
                  <span className={cn("min-w-0 flex-1 text-[14px]", m.known ? "text-paper" : "text-paper-2")}>
                    {m.known ? m.name : "something you have not named"}
                  </span>
                  <span className="micro">lv {m.level}</span>
                  <Tag>{m.engagement}</Tag>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHead title="The rank scale" meta="bounty paid on proof" />
          <div className="divide-y divide-line-soft">
            {d.ranks.map((r) => (
              <div key={r.rank} className="flex items-center gap-3 px-4 py-2">
                <RankChip rank={r.rank} />
                <span className="min-w-0 flex-1 text-[13px] text-paper-3">{r.label}</span>
                <span className="mono text-[11px] text-gold">{r.bountyLabel}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button className={cn("chip", filter === "all" && "chip-on")} onClick={() => setFilter("all")}>
          all <span className="ml-1.5 text-paper-3">{d.entries.length}</span>
        </button>
        <button className={cn("chip", filter === "studied" && "chip-on")} onClick={() => setFilter("studied")}>
          studied <span className="ml-1.5 text-paper-3">{d.counts.studied}</span>
        </button>
        <button className={cn("chip", filter === "unknown" && "chip-on")} onClick={() => setFilter("unknown")}>
          not yet understood <span className="ml-1.5 text-paper-3">{d.entries.length - d.counts.studied}</span>
        </button>
        {ranksPresent.map((r) => (
          <button key={r} className={cn("chip", filter === r && "chip-on")} onClick={() => setFilter(r)}>
            {r}
          </button>
        ))}
      </div>

      {(study.isError || note) && (
        <p className={cn("mb-4 text-[13px]", study.isError ? "text-rule" : "text-gold")}>
          {study.isError ? (study.error as Error).message : note}
        </p>
      )}

      {entries.length === 0 ? (
        <Empty>Nothing under that heading. You have not met it yet.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          {entries.map((e) => {
            const expanded = openId === e.monsterId;
            return (
              <div key={e.monsterId} className={cn("panel overflow-hidden", expanded && "border-rule-dim")}>
                <div className="flex items-start gap-3 border-b border-line px-4 py-3">
                  <RankChip rank={e.rank} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="display text-[13px] text-paper">{e.name}</div>
                    <div className="micro mt-1">
                      lv {e.level} · {e.engagement}
                      {e.here && <span className="text-gold"> · here now</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-[11px] text-paper-3">{e.kills} killed</div>
                    <div className="mono text-[11px] text-gold">{e.bountyLabel}</div>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-3 gap-x-3">
                    <Cell k="HP" v={e.hp} />
                    <Cell k="Damage" v={e.damage} />
                    <Cell k="Armour" v={e.armour} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="micro w-[54px] flex-none">Health</span>
                    <Meter value={e.hp} max={Math.max(200, e.hp)} color="#b23327" className="flex-1" />
                  </div>

                  <p className="text-[13.5px] leading-relaxed text-paper-3">{e.lore}</p>

                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <span className="micro">first seen turn {e.firstSeenTurn}</span>
                    <span className="micro">·</span>
                    <span className="micro">{e.studied ? "understood" : "not yet understood"}</span>
                    {e.custom && <Tag color="#8a6fc4">described in play</Tag>}
                    <button className="micro ml-auto transition-colors hover:text-paper" onClick={() => setOpenId(expanded ? null : e.monsterId)}>
                      {expanded ? "close" : "full entry →"}
                    </button>
                  </div>

                  {expanded && (
                    <div className="fade space-y-3 border-t border-line pt-3">
                      <div>
                        <div className="micro mb-1.5">Drops</div>
                        {e.drops.length === 0 ? (
                          <p className="text-[13px] text-paper-3">Nothing worth carrying.</p>
                        ) : (
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {e.drops.map((dr) => (
                              <span key={dr.name} className="flex items-center gap-1.5">
                                <RankChip rank={dr.rank} />
                                <span className="text-[13px] text-paper-2">{dr.name}</span>
                                <span className="micro">{Math.round(dr.chance * 100)}%</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {e.studied ? (
                        <div className="panel-quiet p-3">
                          <div className="micro mb-1.5">What studying it bought you</div>
                          <p className="text-[13.5px] italic leading-relaxed text-paper-2">{e.revealed}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 border-t border-line pt-3">
                          <BookOpen className="size-4 flex-none text-paper-3" />
                          <p className="min-w-0 flex-1 text-[13px] leading-snug text-paper-3">
                            One scene with it at a distance, and one point of ink. You will learn the thing that
                            keeps people alive.
                          </p>
                          <button
                            className="btn btn-sm flex-none"
                            disabled={study.isPending}
                            onClick={() =>
                              study.mutate(
                                { saveId, monsterId: e.monsterId },
                                { onSuccess: (r) => setNote(`Studied ${r.name}. ${r.body}`) },
                              )
                            }
                          >
                            {study.isPending ? "Reading" : "Study"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Panel className="mt-10 overflow-hidden">
        <PanelHead title="The rule of the field book" right={<Skull className="size-3.5 text-paper-3" />} />
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-4 sm:grid-cols-3">
          <Rule n="01" t="Killing is not knowing" b="A kill writes the name and the shape. Nothing else. Most students die with a book full of names." />
          <Rule n="02" t="Study costs a scene" b="One point of ink and a scene at a distance. It halves what a creature can surprise you with, permanently." />
          <Rule n="03" t="Ranks are honest" b="An F is not a joke and an SSS is not a challenge. The scale describes what the thing does to a room, not how rare it is." />
        </div>
      </Panel>
    </div>
  );
}

function Cell({ k, v }: { k: string; v: number }) {
  return (
    <div className="border-t border-line pt-2">
      <div className="micro">{k}</div>
      <div className="mono mt-1 text-[13px] text-paper">{v}</div>
    </div>
  );
}

function Rule({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Dot color="#b23327" />
        <span className="micro">{n}</span>
        <span className="display text-[11px] text-paper">{t}</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-paper-3">{b}</p>
    </div>
  );
}
