import { useState } from "react";
import { FlaskConical, Sparkles, AlertTriangle, BookMarked } from "lucide-react";
import { Loading, Panel, PanelHead, SectionHeader, Empty, RankChip, Dot, Tag, Meter, KeyValue } from "../components/ui-kit";
import { useBench, useBenchPreview, useRunResearch, useBenchIndex, useSkillLibrary } from "../queries/bench";
import { cn } from "../lib/utils";

type RunResult = {
  success: boolean;
  roll: number;
  chance: number;
  name: string;
  rank: string;
  description: string;
  power: number;
  costInk: number;
  recoil: number;
  debt: number;
  skillId: string | null;
  note: string;
  inkSpent: number;
  stainGained: number;
};

export default function BenchPage({ saveId }: { saveId: number }) {
  const bench = useBench(saveId);
  const index = useBenchIndex(saveId);
  const library = useSkillLibrary();
  const run = useRunResearch(saveId);

  const [vectorId, setVectorId] = useState("");
  const [shapeId, setShapeId] = useState("");
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [tab, setTab] = useState<"journal" | "library" | "index">("journal");

  const ready = vectorId !== "" && shapeId !== "";
  const preview = useBenchPreview(saveId, { vectorId, shapeId, modifiers }, ready);

  if (bench.isLoading) return <Loading label="Setting out the bench" />;
  if (!bench.data) return <Empty>The bench is locked. You are not enrolled.</Empty>;
  const d = bench.data;

  const toggleMod = (id: string) => {
    setResult(null);
    setModifiers((cur) => (cur.includes(id) ? cur.filter((m) => m !== id) : cur.length >= 3 ? cur : [...cur, id]));
  };

  const p = preview.data;

  return (
    <div>
      <SectionHeader
        label="The Research Bench"
        title="Mana is ink that holds instruction"
        subtitle="Vector is what the instruction is made of. Shape is how it is delivered. Modifiers are further instructions laid on top. Every combination is legal, most are useless, and the journal keeps the failures — because familiarity is what makes the next attempt likelier."
        right={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="micro">
              {d.stats.successes}/{d.stats.attempts} held
            </span>
            <span className="micro">stain {d.stain}</span>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-5">
        <Stat k="Ink" v={`${d.ink}/${d.inkMax}`} />
        <Stat k="Insight" v={String(d.insight)} />
        <Stat k="Wisdom" v={String(d.wisdom)} />
        <Stat k="Fortune" v={String(d.fortune)} />
        <Stat k="Research bonus" v={`+${Math.round(d.researchBonus * 100)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel className="overflow-hidden">
            <PanelHead
              title="Vector"
              meta="what it is made of"
              right={<span className="micro">your class reads {d.affinities.length} of these naturally</span>}
            />
            <div className="grid grid-cols-1 gap-px bg-line-soft sm:grid-cols-2">
              {d.vectors.map((v) => (
                <button
                  key={v.id}
                  className={cn(
                    "bg-ink-2 px-4 py-3 text-left transition-colors hover:bg-ink-3",
                    vectorId === v.id && "bg-ink-4 ring-1 ring-inset ring-rule",
                  )}
                  onClick={() => {
                    setVectorId(vectorId === v.id ? "" : v.id);
                    setResult(null);
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Dot color={v.affinity ? "#c9a227" : "#5f9e9e"} />
                    <span className="display text-[11px] text-paper">{v.name}</span>
                    {v.affinity && <Tag color="#c9a227">affinity</Tag>}
                    {v.attempts > 0 && (
                      <span className="micro ml-auto">
                        {v.successes}/{v.attempts}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-paper-3">{v.blurb}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="micro">weight {v.weight.toFixed(2)}</span>
                    <span className="micro">ink ×{v.inkMult.toFixed(1)}</span>
                    <span className="micro" style={{ color: v.recoil >= 3 ? "#b23327" : undefined }}>
                      recoil {v.recoil}
                    </span>
                    <span className="micro">vol {v.volatility.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Shape" meta="how it is delivered" />
            <div className="grid grid-cols-2 gap-px bg-line-soft sm:grid-cols-3 lg:grid-cols-5">
              {d.shapes.map((sh) => (
                <button
                  key={sh.id}
                  className={cn(
                    "bg-ink-2 px-3.5 py-3 text-left transition-colors hover:bg-ink-3",
                    shapeId === sh.id && "bg-ink-4 ring-1 ring-inset ring-rule",
                  )}
                  onClick={() => {
                    setShapeId(shapeId === sh.id ? "" : sh.id);
                    setResult(null);
                  }}
                >
                  <div className="display text-[11px] text-paper">{sh.name}</div>
                  <p className="mt-1.5 text-[12px] leading-snug text-paper-3">{sh.blurb}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="micro">×{sh.powerMult.toFixed(2)}</span>
                    <span className="micro">ink ×{sh.inkMult.toFixed(1)}</span>
                    <span className="micro">{sh.scope}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Modifiers" meta={`${modifiers.length} of 3 laid on`} />
            <div className="grid grid-cols-1 gap-px bg-line-soft sm:grid-cols-2 lg:grid-cols-3">
              {d.modifiers.map((m) => (
                <button
                  key={m.id}
                  className={cn(
                    "bg-ink-2 px-3.5 py-2.5 text-left transition-colors hover:bg-ink-3",
                    modifiers.includes(m.id) && "bg-ink-4 ring-1 ring-inset ring-rule",
                  )}
                  onClick={() => toggleMod(m.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="display text-[11px] text-paper">{m.name}</span>
                    {m.recoil > 0 && <span className="micro text-rule">recoil +{m.recoil}</span>}
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-paper-3">{m.blurb}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3">
                    <span className="micro">×{m.powerMult.toFixed(2)}</span>
                    <span className="micro">
                      ink {m.inkAdd > 0 ? "+" : ""}
                      {m.inkAdd}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <div className="flex flex-wrap gap-1.5">
            {(["journal", "library", "index"] as const).map((t) => (
              <button key={t} className={cn("chip", tab === t && "chip-on")} onClick={() => setTab(t)}>
                {t === "journal" ? `the journal (${d.journal.length})` : t === "library" ? "what exists" : "familiar pairs"}
              </button>
            ))}
          </div>

          {tab === "journal" && (
            <Panel className="overflow-hidden">
              <PanelHead title="Journal" meta="newest first — failures kept on purpose" />
              {d.journal.length === 0 ? (
                <Empty className="m-4">The bench is clean. That will not last.</Empty>
              ) : (
                <div className="divide-y divide-line-soft">
                  {d.journal.map((j) => (
                    <div key={j.id} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="mono w-[44px] flex-none text-[11px] text-paper-3">t{j.turn}</span>
                      <Dot color={j.success ? "#7d9b7a" : "#b23327"} className="mt-1.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[13.5px] text-paper-2">
                            {j.vectorName} · {j.shapeName}
                            {j.modifiers.length > 0 && <span className="text-paper-3"> · {j.modifiers.join(", ")}</span>}
                          </span>
                          {j.resultRank && <RankChip rank={j.resultRank} />}
                        </div>
                        <p className="mt-1 text-[13px] leading-snug text-paper-3">
                          {j.success ? j.resultName : j.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {tab === "library" && (
            <Panel className="overflow-hidden">
              <PanelHead title="Workings that exist" meta="names only — the world knows them, you may not" right={<BookMarked className="size-3.5 text-paper-3" />} />
              <div className="grid grid-cols-1 gap-px bg-line-soft sm:grid-cols-2">
                {(library.data ?? []).map((t) => (
                  <div key={t.slug} className="bg-ink-2 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <RankChip rank={t.rank} />
                      <span className="text-[13.5px] text-paper">{t.name}</span>
                      <span className="micro ml-auto">{t.source}</span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-paper-3">{t.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3">
                      <span className="micro">ink {t.costInk}</span>
                      <span className="micro">power {t.power}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {tab === "index" && (
            <Panel className="overflow-hidden">
              <PanelHead title="Pairs you have tried" meta="familiarity is the whole game" />
              {(index.data ?? []).length === 0 ? (
                <Empty className="m-4">You have tried nothing twice.</Empty>
              ) : (
                <div className="divide-y divide-line-soft">
                  {(index.data ?? []).map((row, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-paper-2">
                        {row.vectorName} · {row.shapeName}
                        {row.modifierNames.length > 0 && <span className="text-paper-3"> · {row.modifierNames.join(", ")}</span>}
                      </span>
                      <div className="w-[90px] flex-none">
                        <Meter value={row.successes} max={Math.max(1, row.attempts)} color="#7d9b7a" />
                      </div>
                      <span className="mono w-[46px] flex-none text-right text-[11px] text-paper-3">
                        {row.successes}/{row.attempts}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>

        <div className="lg:sticky lg:top-[68px] lg:self-start">
          <Panel className="overflow-hidden">
            <PanelHead title="The composed instruction" right={<FlaskConical className="size-3.5 text-paper-3" />} />
            {!ready ? (
              <Empty className="m-4">
                Choose a vector and a shape. The bench will tell you the odds before it costs you anything — it is honest, and it is often discouraging.
              </Empty>
            ) : preview.isLoading ? (
              <Loading className="px-4 py-8" label="Composing" />
            ) : !p ? (
              <Empty className="m-4">The bench refuses to compose that.</Empty>
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <RankChip rank={p.rank} />
                  <span className="display text-[13px] text-paper">{p.name}</span>
                  {p.affinity && <Tag color="#c9a227">affinity</Tag>}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-paper-2">{p.description}</p>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="micro">Chance it holds</span>
                    <span className="mono text-[11px]" style={{ color: p.successChance > 60 ? "#7d9b7a" : p.successChance > 30 ? "#c9a227" : "#b23327" }}>
                      {p.successChance}%
                    </span>
                  </div>
                  <Meter value={p.successChance} max={100} color={p.successChance > 60 ? "#7d9b7a" : p.successChance > 30 ? "#c9a227" : "#b23327"} />
                </div>

                <div className="mt-4">
                  <KeyValue k="Power" v={String(p.power)} mono />
                  <KeyValue k="Ink cost" v={`${p.costInk} of ${p.inkAvailable}`} mono />
                  <KeyValue k="Recoil" v={String(p.recoil)} mono />
                  <KeyValue k="Debt" v={String(p.debt)} mono />
                  <KeyValue k="Familiarity" v={`${p.familiarity}%`} mono />
                  <KeyValue k="Prior attempts" v={`${p.priorSuccess} held of ${p.priorAttempts}`} mono />
                </div>

                <div className="panel-quiet mt-4 p-3">
                  <div className="micro mb-1">The bench's verdict</div>
                  <p className="text-[13px] italic leading-relaxed text-paper-2">{p.verdict}</p>
                </div>

                <button
                  className="btn btn-primary mt-4 w-full"
                  disabled={run.isPending || p.costInk > p.inkAvailable}
                  onClick={() =>
                    run.mutate(
                      { saveId, vectorId, shapeId, modifiers },
                      { onSuccess: (r) => setResult(r as RunResult) },
                    )
                  }
                >
                  {run.isPending ? "Working it" : "Commit to the attempt"}
                </button>
                {p.costInk > p.inkAvailable && (
                  <p className="mt-2 text-[12.5px] text-rule">Not enough ink. Rest, or find ink.</p>
                )}

                {run.isError && <p className="mt-3 text-[13px] text-rule">{(run.error as Error).message}</p>}

                {result && (
                  <div className={cn("fade mt-4 border-t pt-4", result.success ? "border-line-strong" : "border-rule-dim")}>
                    <div className="flex items-center gap-2.5">
                      {result.success ? <Sparkles className="size-4 text-gold" /> : <AlertTriangle className="size-4 text-rule" />}
                      <span className="display text-[11px]" style={{ color: result.success ? "#c9a227" : "#b23327" }}>
                        {result.success ? "It held" : "It refused"}
                      </span>
                      <span className="micro ml-auto">
                        rolled {result.roll} against {result.chance}
                      </span>
                    </div>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-paper-2">{result.note}</p>
                    {result.success && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2.5">
                          <RankChip rank={result.rank} />
                          <span className="text-[13.5px] text-paper">{result.name}</span>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-paper-3">{result.description}</p>
                      </div>
                    )}
                    <div className="mt-3">
                      <KeyValue k="Ink spent" v={String(result.inkSpent)} mono />
                      {result.stainGained > 0 && <KeyValue k="Stain gained" v={`+${result.stainGained}`} mono />}
                      {result.skillId && <KeyValue k="Filed as" v={result.skillId} mono />}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <Panel className="mt-4 overflow-hidden">
            <PanelHead title="Why this works" />
            <div className="space-y-2 p-4 text-[13px] leading-relaxed text-paper-3">
              <p>
                Ink is not fuel. It is a substance that carries instruction, and a working is a sentence you write
                into it. Vector is the vocabulary, shape is the grammar.
              </p>
              <p>
                Nothing here is unlocked by a menu. You invent it, the bench prices it, and the world finds out what
                you have made when you use it in front of people.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
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
