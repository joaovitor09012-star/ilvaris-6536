import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { CompassRose, FrameOver } from "../components/ornament";
import { Loading, Panel, PanelHead, SectionHeader, Disposition, Dot, Tag, Empty, KeyValue } from "../components/ui-kit";
import { useThreads } from "../queries/threads";
import { useRegeneratePortrait } from "../queries/media";
import { cn } from "../lib/utils";

const STATE_COLOR: Record<string, string> = {
  open: "#5f9e9e",
  fraying: "#d97b2b",
  resolved: "#7d9b7a",
  severed: "#b23327",
  revised: "#8a6fc4",
};

export default function ThreadsPage({ saveId }: { saveId: number }) {
  const threads = useThreads(saveId);
  const draw = useRegeneratePortrait(saveId);
  const [openId, setOpenId] = useState<string | null>(null);

  if (threads.isLoading) return <Loading label="Counting the people you have met" />;
  if (!threads.data) return <Empty>Nobody can be reached.</Empty>;
  const d = threads.data;

  return (
    <div>
      <SectionHeader
        label="The Ledger of People"
        title="The Six Threads"
        subtitle="Cast before you arrived, with fates already written. They are not a checklist — love, enmity, severance and refusal all close a thread. What you see here is only what the world has let you see."
        right={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="micro">{d.counts.met} of {d.castSize} met</span>
            <span className="micro">{d.counts.resolved + d.counts.severed} closed</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
        {d.threads.map((t) => {
          const color = STATE_COLOR[t.state] ?? "#8b8778";
          const expanded = openId === t.threadId;
          const drawingThis = draw.isPending && draw.variables?.npcId === t.npcId;
          return (
            <div key={t.id} className={cn("panel relative overflow-hidden", expanded && "border-rule-dim")}>
              <FrameOver soft />
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
                {t.portraitKey ? (
                  <img src={`/api/media/${t.portraitKey}`} alt={t.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="relative h-full">
                    <img src="/art/hero-sm.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-[2px] grayscale-[40%]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
                    <div className="relative flex h-full flex-col items-center px-6 pt-10 text-center">
                      <CompassRose size={22} className="opacity-70" />
                      <div className="engraved mt-3 text-[88px] leading-none">
                        {t.name.charAt(0)}
                      </div>
                      <p className="mt-3 line-clamp-3 max-w-[30ch] text-[13px] italic leading-snug text-paper-3">{t.appearance}</p>
                      <button
                        className="btn btn-sm mt-4"
                        disabled={drawingThis}
                        onClick={() => draw.mutate({ saveId, npcId: t.npcId, regenerate: true })}
                      >
                        {drawingThis ? <Loader2 className="size-3 animate-spin" /> : <ImagePlus className="size-3" />}
                        {drawingThis ? "Drawing…" : "Draw their plate"}
                      </button>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/85 to-transparent px-4 pb-3 pt-10">
                  <div className="flex items-center gap-2">
                    <Dot color={color} />
                    <span className="micro" style={{ color }}>
                      {t.state}
                    </span>
                    <span className="micro text-paper-3">{t.allure}</span>
                  </div>
                  <div className="display-tight mt-1.5 text-[20px] leading-none text-paper">{t.name}</div>
                  <div className="micro mt-1.5">{t.role}</div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <Disposition disposition={t.disposition} compact />
                <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                  <Tag color={color}>progress {t.progress}%</Tag>
                  {t.disposition.debt > 40 && <Tag color="#c9a227">owes you</Tag>}
                  {t.disposition.grudge > 40 && <Tag color="#b23327">grudge</Tag>}
                  {t.disposition.desire > 40 && <Tag color="#b23327">want</Tag>}
                </div>
                <button className="micro transition-colors hover:text-paper" onClick={() => setOpenId(expanded ? null : t.threadId)}>
                  {expanded ? "close" : "their register, and their fate →"}
                </button>
                {expanded && (
                  <div className="fade space-y-3 border-t border-line pt-3">
                    <div>
                      <div className="micro mb-1.5">How they speak</div>
                      <p className="text-[13px] leading-relaxed text-paper-3">{t.voice}</p>
                    </div>
                    <div>
                      <div className="micro mb-1.5">Their face</div>
                      <p className="text-[13px] leading-relaxed text-paper-3">{t.appearance}</p>
                    </div>
                    <div className="panel-quiet p-3">
                      <div className="micro mb-1">The fate written before you arrived</div>
                      <p className="text-[13px] italic leading-relaxed text-paper-2">
                        {t.fate ?? "Not yet known. Whatever is written there, no one has let you read it."}
                      </p>
                    </div>
                    {t.disposition.note && (
                      <div>
                        <div className="micro mb-1">Where you stand</div>
                        <p className="text-[13px] leading-relaxed text-paper-3">{t.disposition.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-[1fr_320px]">
        <Panel className="overflow-hidden">
          <PanelHead title="Everyone else you have met" meta={`${d.met.length} people`} />
          {d.met.length === 0 ? (
            <Empty className="m-4">You have not met anyone yet. That will change by the second scene.</Empty>
          ) : (
            <div className="divide-y divide-line-soft">
              {d.met.map((n) => (
                <div key={n.npcId} className="grid grid-cols-1 gap-x-6 gap-y-2 px-4 py-3.5 sm:grid-cols-[190px_1fr]">
                  <div>
                    <div className="text-[14.5px] text-paper">{n.name}</div>
                    <div className="micro mt-1">{n.role}</div>
                    <div className="micro mt-0.5 text-paper-3">
                      {n.station} · seen turn {n.lastSeenTurn}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <Disposition disposition={n.disposition} compact />
                    {n.publicNote && <p className="mt-2 text-[13px] leading-snug text-paper-3">{n.publicNote}</p>}
                    {n.disposition.note && (
                      <p className="mt-1.5 text-[13px] italic leading-snug text-paper-2">{n.disposition.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHead title="Named, not met" meta="you have heard of them" />
            {d.rumoured.length === 0 ? (
              <Empty className="m-3">You know everyone in the cast.</Empty>
            ) : (
              <ul className="divide-y divide-line-soft">
                {d.rumoured.map((p) => (
                  <li key={p.id} className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] text-paper-2">{p.name}</span>
                      {p.isThread && <Dot color="#b23327" />}
                    </div>
                    <div className="micro mt-1">{p.role}</div>
                    <div className="micro mt-0.5 text-paper-3">usually at {p.homeName}</div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Thread states" />
            <div className="p-3.5">
              <KeyValue k="Open" v={String(d.counts.open)} mono />
              <KeyValue k="Fraying" v={String(d.counts.fraying)} mono />
              <KeyValue k="Resolved" v={String(d.counts.resolved)} mono />
              <KeyValue k="Severed" v={String(d.counts.severed)} mono />
              <KeyValue k="Revised" v={String(d.counts.revised)} mono />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
