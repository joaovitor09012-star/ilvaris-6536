import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Save, ArrowLeft, CircleHelp } from "lucide-react";
import { openTour, resetTours } from "../components/tour";
import { Loading, Panel, PanelHead, SectionHeader, Empty, Dot, KeyValue } from "../components/ui-kit";
import { useSession, useUpdateSettings } from "../queries/saves";
import { cn } from "../lib/utils";

const VOICE = [
  { id: "literary", label: "Literary", blurb: "Long sentences, interiority, a slow camera. The house voice." },
  { id: "lean", label: "Lean", blurb: "Short sentences, hard cuts, no ornament. Crime-novel prose." },
  { id: "lush", label: "Lush", blurb: "Sensory, close, unafraid of beauty. Everything is warm and slightly too much." },
] as const;

const PACING = [
  { id: "slow", label: "Slow", blurb: "Scenes breathe. More Breath scenes, longer arcs, fewer crises." },
  { id: "standard", label: "Standard", blurb: "The designed rhythm. Bindings, then Breath, then pressure." },
  { id: "fast", label: "Fast", blurb: "Fewer resting scenes. The world moves whether or not you are ready." },
] as const;

const DIRECTOR_MODELS = ["anthropic/claude-haiku-4.5", "anthropic/claude-sonnet-5"];
const NARRATOR_MODELS = ["anthropic/claude-sonnet-5", "anthropic/claude-haiku-4.5"];

export default function SettingsPage({ saveId }: { saveId: number }) {
  const session = useSession(saveId);
  const update = useUpdateSettings(saveId);

  const [proseVoice, setProseVoice] = useState<string>("");
  const [pacing, setPacing] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [directorModel, setDirectorModel] = useState<string>("");
  const [narratorModel, setNarratorModel] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [guides, setGuides] = useState(false);

  const s = session.data?.save;

  useEffect(() => {
    if (!s) return;
    setProseVoice(s.proseVoice);
    setPacing(s.pacing);
    setName(s.name);
    setDirectorModel(s.directorModel);
    setNarratorModel(s.narratorModel);
  }, [s]);

  if (session.isLoading) return <Loading label="Reading the setting" />;
  if (!session.data || !s) return <Empty>No life is open.</Empty>;

  const dirty =
    proseVoice !== s.proseVoice ||
    pacing !== s.pacing ||
    name !== s.name ||
    directorModel !== s.directorModel ||
    narratorModel !== s.narratorModel;

  const commit = () =>
    update.mutate(
      {
        saveId,
        proseVoice: proseVoice as "literary" | "lean" | "lush",
        pacing: pacing as "slow" | "standard" | "fast",
        name,
        directorModel,
        narratorModel,
      },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2400);
        },
      },
    );

  return (
    <div>
      <SectionHeader
        label="Settings"
        title="How this life is told"
        subtitle="These are the only knobs. They change the telling, never the world — the economy, the ranks, the rules and the people are the same in every save."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/desk" className="btn btn-sm">
              <ArrowLeft className="size-3" /> Back to the Desk
            </Link>
            <button className="btn btn-sm btn-primary" disabled={!dirty || update.isPending} onClick={commit}>
              <Save className="size-3" /> {update.isPending ? "Writing" : "Commit"}
            </button>
          </div>
        }
      />

      {update.isError && <p className="mb-4 text-[13px] text-rule">{(update.error as Error).message}</p>}
      {saved && !dirty && <p className="mb-4 text-[13px] text-gold">Written into the front matter.</p>}

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Panel className="overflow-hidden">
            <PanelHead title="Content" meta="follows your lead" />
            <div className="space-y-2 p-5 text-[15px] leading-relaxed text-paper-2">
              <p>
                There is no content setting. The story matches the register you play in — keep things gentle and it stays
                gentle; pursue romance or violence and the scene follows you, never further than you went.
              </p>
              <p className="text-paper-3">
                Every character in Ilvaris is an adult — the Athenaeum admits at nineteen — and some lines are never crossed,
                whatever is asked: nothing sexual involving minors, and sexual violence is never framed as desirable. Intimacy,
                when it happens, is with adults who have come to trust you.
              </p>
              <p className="text-paper-3">
                Violence has weight. Death is permanent, and the story does not look away from it — nor linger on it for its
                own sake.
              </p>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Prose voice" meta="the narrator's hand" />
            <div className="grid grid-cols-1 gap-px bg-line-soft sm:grid-cols-3">
              {VOICE.map((v) => (
                <button
                  key={v.id}
                  className={cn("bg-ink-2 px-4 py-3 text-left transition-colors hover:bg-ink-3", proseVoice === v.id && "bg-ink-4 ring-1 ring-inset ring-rule")}
                  onClick={() => setProseVoice(v.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <Dot color={proseVoice === v.id ? "#c9a227" : "#4a3b29"} />
                    <span className="display text-[11px] text-paper">{v.label}</span>
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-paper-3">{v.blurb}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Rhythm" meta="the pacing law, still enforced" />
            <div className="grid grid-cols-1 gap-px bg-line-soft sm:grid-cols-3">
              {PACING.map((p) => (
                <button
                  key={p.id}
                  className={cn("bg-ink-2 px-4 py-3 text-left transition-colors hover:bg-ink-3", pacing === p.id && "bg-ink-4 ring-1 ring-inset ring-rule")}
                  onClick={() => setPacing(p.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <Dot color={pacing === p.id ? "#5f9e9e" : "#4a3b29"} />
                    <span className="display text-[11px] text-paper">{p.label}</span>
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-paper-3">{p.blurb}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="The table" meta="who writes, and who reads" />
            <div className="space-y-4 p-4">
              <div>
                <div className="micro mb-2">Director — mines arcs, decides what the world does next</div>
                <div className="flex flex-wrap gap-1.5">
                  {DIRECTOR_MODELS.map((m) => (
                    <button key={m} className={cn("chip", directorModel === m && "chip-on")} onClick={() => setDirectorModel(m)}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="micro mb-2">Narrator — writes the scene you read</div>
                <div className="flex flex-wrap gap-1.5">
                  {NARRATOR_MODELS.map((m) => (
                    <button key={m} className={cn("chip", narratorModel === m && "chip-on")} onClick={() => setNarratorModel(m)}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[14px] leading-relaxed text-paper-3">
                The Registrar always runs on the cheap model. It only files what the narrator already wrote — it is
                not allowed to invent anything, so there is nothing to buy by upgrading it.
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHead title="This life" meta={`save ${s.id}`} />
            <div className="p-4">
              <label className="micro mb-2 block" htmlFor="savename">
                Name of the life
              </label>
              <input
                id="savename"
                aria-label="Name of the life"
                className="field mb-4 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
              <KeyValue k="Turn" v={String(s.turn)} mono />
              <KeyValue k="Chapter" v={String(s.chapter)} mono />
              <KeyValue k="Day" v={`${s.day} · ${s.season}`} mono />
              <KeyValue k="Mode" v={s.mode.replace(/_/g, " ")} />
              <KeyValue k="Pressure" v={String(s.pressure)} mono />
              <KeyValue k="Class" v={session.data.character.className} />
              <KeyValue k="Pronouns" v={session.data.character.pronouns} />
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="The guide" right={<CircleHelp className="size-3.5 text-gold" />} />
            <div className="space-y-3 p-4">
              <p className="text-[14px] leading-relaxed text-paper-3">
                The walkthrough with arrows that shows where everything is. Replay it on any page with Help in the rail.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-sm" onClick={openTour}>
                  This page's guide
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    resetTours();
                    setGuides(true);
                  }}
                >
                  {guides ? "All guides reset" : "Reset all guides"}
                </button>
              </div>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="The rules that never change" />
            <div className="space-y-2 p-4 text-[14px] leading-relaxed text-paper-3">
              <p>Nobody in Ilvaris can see a number. The interface is yours alone.</p>
              <p>An NPC knows only what that person has been told, and believes only what they believe.</p>
              <p>Nothing happens without a cause, and every cause is on the record.</p>
              <p>Pacing is enforced by the engine: no more than three Pressure scenes in a row.</p>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Danger" />
            <div className="p-4">
              <p className="text-[14px] leading-relaxed text-paper-3">
                Erasing a life is done from the Home page, not from here. Deleting a save removes every scene, person,
                page and scar attached to it, and cannot be undone.
              </p>
              <Link to="/" className="btn btn-sm mt-3">
                Go to Home
              </Link>
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
