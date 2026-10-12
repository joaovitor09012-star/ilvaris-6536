import { useEffect, useState } from "react";
import { Check, Lock, Plus } from "lucide-react";
import { Loading, Panel, PanelHead, RankChip, SectionHeader, Tag, Meter, Empty } from "../components/ui-kit";
import { useCodex, useAllocate, useEquipSkill } from "../queries/codex";
import { usePlayerPortrait } from "../queries/media";
import { cn } from "../lib/utils";

const STAT_KEYS = ["str", "agi", "vit", "int", "wis", "cha", "luk"] as const;
const SOURCE_LABEL: Record<string, string> = {
  class: "Class table",
  research: "Bench",
  study: "Study",
  prize: "Prize",
  item: "Item",
  drop: "Drop",
  fate: "Fate",
};

export default function CodexPage({ saveId }: { saveId: number }) {
  const codex = useCodex(saveId);
  const allocate = useAllocate(saveId);
  const equip = useEquipSkill(saveId);
  const portrait = usePlayerPortrait(saveId);
  const [draft, setDraft] = useState<Record<string, number>>({});

  useEffect(() => {
    setDraft({});
  }, [codex.data?.system.freePoints]);

  if (codex.isLoading) return <Loading label="Reading your Commission" />;
  if (!codex.data) return <Empty>Your Codex could not be opened.</Empty>;

  const { system, character, skills, pending, progression } = codex.data;
  const spent = Object.values(draft).reduce((a, b) => a + b, 0);
  const remaining = system.freePoints - spent;

  const bump = (k: string, delta: number) => {
    setDraft((d) => {
      const next = Math.max(0, (d[k] ?? 0) + delta);
      const total = { ...d, [k]: next };
      const sum = Object.values(total).reduce((a, b) => a + b, 0);
      if (sum > system.freePoints) return d;
      return total;
    });
  };

  const byRank = new Map<string, typeof skills>();
  for (const s of skills) {
    const arr = byRank.get(s.rank) ?? [];
    arr.push(s);
    byRank.set(s.rank, arr);
  }
  const rankOrder = ["SSS", "SS", "S", "A", "B", "C", "D", "E", "F"].filter((r) => byRank.has(r));

  return (
    <div>
      <SectionHeader
        label="The Codex"
        title={character.name}
        subtitle={`${character.className} — ${character.epithet}. ${character.tagline}`}
        right={
          <div className="flex items-center gap-2">
            <RankChip rank={system.rank} />
            <span className="micro">{system.standing}</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[300px_1fr]">
        {/* ── dossier */}
        <div className="space-y-4">
          <Panel inset className="overflow-hidden">
            <div className="aspect-[3/4] w-full overflow-hidden bg-ink">
              {portrait.isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <span className="micro">Developing the plate…</span>
                </div>
              ) : portrait.data?.url ? (
                <img src={portrait.data.url} alt={character.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center">
                  <span className="micro text-paper-3">No plate yet</span>
                </div>
              )}
            </div>
            <div className="border-t border-line p-3.5">
              <div className="display text-[12px] text-paper">{character.name}</div>
              <div className="micro mt-1">{character.pronouns}</div>
              {character.appearance && (
                <p className="mt-2 text-[13px] leading-relaxed text-paper-3">{character.appearance}</p>
              )}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="The class" meta={character.difficulty} />
            <div className="space-y-3 p-4">
              <p className="text-[14px] leading-relaxed text-paper-2">{character.playstyle}</p>
              <div className="flex flex-wrap gap-1.5">
                {character.mainStats.map((s) => (
                  <Tag key={s} color="#c9a227">
                    main · {s}
                  </Tag>
                ))}
                {character.affinities.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
                <Tag color="#5f9e9e">research ×{character.researchBonus.toFixed(2)}</Tag>
              </div>
              <div className="border-t border-line pt-3">
                <div className="micro mb-1.5">Grind loop</div>
                <p className="text-[13px] leading-relaxed text-paper-3">{character.grindLoop}</p>
              </div>
              <div className="border-t border-line pt-3">
                <div className="micro mb-1.5">Progression law</div>
                <p className="text-[13px] leading-relaxed text-paper-3">{progression.note}</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* ── the numbers */}
        <div className="min-w-0 space-y-8">
          <Panel className="overflow-hidden">
            <PanelHead
              title="System Window"
              meta={`${system.rankLabel} · power ${system.power}`}
              right={<span className="micro">{system.freePoints} free</span>}
            />
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <BarLine label="XP" value={system.xp} max={system.xpNext} color="#c9a227" />
                <BarLine label="HP" value={system.hp.cur} max={system.hp.max} color="#b23327" />
                <BarLine label="Ink" value={system.ink.cur} max={system.ink.max} color="#5b86c4" />
                <div className="flex items-baseline justify-between border-t border-line pt-2">
                  <span className="micro">Level</span>
                  <span className="mono text-[13px]">{system.level}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="micro">Purse</span>
                  <span className="mono text-[13px] text-gold">{system.coinLabel}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="micro">Stain</span>
                  <span className="mono text-[13px]">{system.stain}</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="micro">Attributes</span>
                  {remaining > 0 && <span className="micro text-gold">{remaining} to spend</span>}
                </div>
                <div className="space-y-1.5">
                  {STAT_KEYS.map((k) => {
                    const stat = system.stats.find((s) => s.key === k)!;
                    const add = draft[k] ?? 0;
                    return (
                      <div key={k} className="flex items-center gap-2" title={stat.blurb}>
                        <span className={cn("micro w-[68px] flex-none", stat.main && "text-gold")}>{stat.label}</span>
                        <span className="mono w-[26px] flex-none text-right text-[13px]">{stat.value + add}</span>
                        {add > 0 && <span className="mono text-[11px] text-gold">+{add}</span>}
                        {system.freePoints > 0 && (
                          <span className="ml-auto flex items-center gap-1">
                            <button
                              className="flex size-5 items-center justify-center rounded-sm border border-line-strong text-paper-3 transition-colors hover:border-rule hover:text-paper"
                              onClick={() => bump(k, -1)}
                              disabled={add === 0}
                            >
                              −
                            </button>
                            <button
                              className="flex size-5 items-center justify-center rounded-sm border border-line-strong text-paper-3 transition-colors hover:border-rule hover:text-paper"
                              onClick={() => bump(k, 1)}
                              disabled={remaining === 0}
                            >
                              <Plus className="size-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {spent > 0 && (
                  <button
                    className="btn btn-primary btn-sm mt-3 w-full"
                    disabled={allocate.isPending}
                    onClick={() =>
                      allocate.mutate(
                        { saveId, allocation: draft },
                        { onSuccess: () => setDraft({}) },
                      )
                    }
                  >
                    {allocate.isPending ? "Committing…" : "Commit"}
                  </button>
                )}
                {allocate.isError && <p className="mt-2 text-[13px] text-rule">{(allocate.error as Error).message}</p>}
              </div>
            </div>
          </Panel>

          {/* ── workings */}
          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="label-col">Workings</div>
                <h2 className="display-tight mt-1.5 text-[22px] leading-none">{skills.length} inscribed</h2>
              </div>
              <span className="micro">
                Ready at once: {skills.filter((s) => s.equipped).length} / {4 + Math.floor(system.level / 5)}
              </span>
            </div>
            <div className="rule-dim" />

            {skills.length === 0 ? (
              <Empty className="mt-4">You have inscribed nothing yet.</Empty>
            ) : (
              <div className="mt-4 space-y-7">
                {rankOrder.map((rank) => (
                  <div key={rank}>
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <RankChip rank={rank} />
                      <span className="micro">{byRank.get(rank)!.length} workings</span>
                    </div>
                    <div className="tile-grid">
                      {byRank.get(rank)!.map((s) => (
                        <div key={s.id} className={cn("tile p-3.5", s.equipped && "border-rule-dim")}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="display text-[12px] leading-tight text-paper">{s.name}</span>
                            {s.equipped && <Check className="size-3.5 flex-none text-rule" />}
                          </div>
                          <p className="mt-2 text-[13px] leading-snug text-paper-3">{s.description}</p>
                          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2">
                            <span className="micro">
                              {s.vector} · {s.shape}
                            </span>
                            <span className="micro">ink {s.costInk}</span>
                            <span className="micro">pow {s.power}</span>
                            {s.recoil > 0 && <span className="micro text-rule">recoil {s.recoil}</span>}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="micro text-paper-3">{SOURCE_LABEL[s.source] ?? s.source}</span>
                            <button
                              className="micro transition-colors hover:text-paper"
                              disabled={equip.isPending}
                              onClick={() => equip.mutate({ saveId, skillId: s.id, equipped: !s.equipped })}
                            >
                              {s.equipped ? "release" : "ready"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {equip.isError && <p className="mt-3 text-[13px] text-rule">{(equip.error as Error).message}</p>}
          </div>

          {/* ── the class table */}
          {pending.length > 0 && (
            <div>
              <div className="label-col mb-1.5">Still owed by the table</div>
              <div className="rule-dim" />
              <div className="mt-4 tile-grid">
                {pending.map((p) => (
                  <div key={p.slug} className="tile p-3.5 opacity-70">
                    <div className="flex items-start justify-between gap-2">
                      <span className="display text-[12px] text-paper-2">{p.name}</span>
                      <Lock className="size-3.5 flex-none text-paper-3" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <RankChip rank={p.rank} />
                      <span className="micro">level {p.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarLine({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="micro w-[26px] flex-none">{label}</span>
      <Meter value={value} max={max} color={color} className="flex-1" />
      <span className="mono w-[66px] flex-none text-right text-[11px] text-paper-2">
        {value}
        <span className="text-paper-3">/{max}</span>
      </span>
    </div>
  );
}
