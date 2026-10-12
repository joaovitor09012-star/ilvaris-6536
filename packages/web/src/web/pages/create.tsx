import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Lightbulb, SlidersHorizontal } from "lucide-react";
import { Loading, RankChip } from "../components/ui-kit";
import { CompassRose, FrameOver, Ribbon, SectionHeading, classArt } from "../components/ornament";
import { useCreationOptions, useCreateSave } from "../queries/saves";
import { useActiveSave } from "../lib/session";
import { cn } from "../lib/utils";

const STAT_LABEL: Record<string, string> = {
  str: "Strength",
  agi: "Agility",
  vit: "Vitality",
  int: "Insight",
  wis: "Wisdom",
  cha: "Presence",
  luk: "Fortune",
};

const PRONOUNS = [
  { v: "he/him", l: "He / Him" },
  { v: "she/her", l: "She / Her" },
  { v: "they/them", l: "They / Them" },
];
const VOICES = [
  { id: "literary", label: "Literary", d: "Measured, close third person." },
  { id: "lean", label: "Lean", d: "Short sentences. Action first." },
  { id: "lush", label: "Lush", d: "Sensory and slow." },
] as const;
const PACES = [
  { id: "slow", d: "More quiet scenes between the trouble." },
  { id: "standard", d: "The intended rhythm." },
  { id: "fast", d: "Trouble arrives sooner and more often." },
] as const;
const APPEARANCE_MAX = 600;

export default function CreatePage() {
  const [, navigate] = useLocation();
  const [, setSaveId] = useActiveSave();
  const options = useCreationOptions();
  const create = useCreateSave();

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState(PRONOUNS[0].v);
  const [appearance, setAppearance] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [proseVoice, setProseVoice] = useState<"literary" | "lean" | "lush">("literary");
  const [pacing, setPacing] = useState<"slow" | "standard" | "fast">("standard");
  const [tuning, setTuning] = useState(false);

  const chosen = useMemo(() => options.data?.classes.find((c) => c.id === classId) ?? null, [options.data, classId]);
  const missing = !name.trim() ? "Write a name to sign." : !classId ? "Choose a class to sign." : null;

  const choose = (id: string) => {
    setClassId(id);
    // on narrow screens the commission sits below — bring it into view
    if (window.innerWidth < 1024) document.querySelector('[data-tour="commission"]')?.scrollIntoView({ behavior: "smooth" });
  };

  const submit = () => {
    if (missing || !classId) return;
    create.mutate(
      { name: name.trim(), pronouns, classId, appearance: appearance.trim(), pacing, proseVoice },
      {
        onSuccess: (data) => {
          setSaveId(data.saveId);
          navigate("/desk");
        },
      },
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* ───────────────────────── header */}
      <header className="relative overflow-hidden border-b border-line">
        <img
          src="/art/hero-sm.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover object-[50%_30%] opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-8 pb-9 md:px-10">
          <Link to="/" className="micro inline-flex items-center gap-1.5 text-gold/80 hover:text-gold-bright">
            <ArrowLeft className="size-3" /> Back to the saves
          </Link>
          <div className="mt-6 flex flex-col items-center text-center">
            <CompassRose size={34} className="text-gold" />
            <h1 className="engraved mt-3 text-[44px] leading-none tracking-[0.16em] md:text-[62px]">Enrollment</h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-10 bg-gold/50" />
              <span className="micro text-[10.5px] tracking-[0.28em] text-gold">The Registry Hall · Vellum Athenaeum</span>
              <span className="h-px w-10 bg-gold/50" />
            </div>
            <p className="mt-4 text-[18px] italic text-paper-2">Different lives. The same world. Which one will you write?</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        {options.isLoading && <Loading label="Fetching the class tables" />}

        {options.data && (
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-12">
              {/* ───────── 01 the person */}
              <section data-tour="person" className="rise">
                <SectionHeading n="01" title="The Person" caption="What the Registry writes down" />
                <div className="panel p-5 md:p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto]">
                    <label className="block">
                      <span className="label-col mb-2 block">Name</span>
                      <input
                        aria-label="Name"
                        className="field text-[18px]"
                        value={name}
                        maxLength={48}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Cassian Vey"
                      />
                    </label>
                    <div>
                      <span className="label-col mb-2 block">Pronouns</span>
                      <div className="flex border border-line-strong">
                        {PRONOUNS.map((p, i) => (
                          <button
                            key={p.v}
                            aria-pressed={pronouns === p.v}
                            onClick={() => setPronouns(p.v)}
                            className={cn(
                              "display px-4 py-2.5 text-[11px] tracking-[0.14em] whitespace-nowrap transition-colors",
                              i > 0 && "border-l border-line-strong",
                              pronouns === p.v ? "bg-gradient-to-b from-[#efe0bd] to-[#d8c394] text-[#22190f]" : "text-paper-2 hover:text-paper",
                            )}
                          >
                            {p.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_250px]">
                    <label className="block">
                      <span className="mb-2 flex items-baseline justify-between">
                        <span className="label-col">Appearance</span>
                        <span className="mono text-[11px] text-paper-3">
                          {appearance.length}/{APPEARANCE_MAX}
                        </span>
                      </span>
                      <textarea
                        aria-label="Appearance"
                        className="field min-h-[132px] resize-y"
                        maxLength={APPEARANCE_MAX}
                        value={appearance}
                        onChange={(e) => setAppearance(e.target.value)}
                        placeholder="Hair, eyes, build, what you wear, what people notice first…"
                      />
                    </label>
                    <div className="flex gap-3 border border-gold-dim/60 bg-ink-3/70 p-4 text-[14.5px] leading-relaxed text-paper-2">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.6} />
                      <div>
                        <div className="display mb-1 text-[11px] tracking-[0.14em] text-gold">Be specific</div>
                        Concrete detail beats adjectives: <em>"ink under the nails, a coat one size too big"</em> says more than
                        "mysterious". Optional — leave it blank and your class will write you a face.
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ───────── 02 the class */}
              <section data-tour="class" className="rise" style={{ animationDelay: "80ms" }}>
                <SectionHeading n="02" title="The Class" caption="Eight ways into the same building" />
                <p className="-mt-2 mb-5 max-w-[70ch] text-[15.5px] leading-relaxed text-paper-3">
                  Your class sets your starting stats and the skills you can learn. It is a starting point, not a cage — anyone
                  can learn anything in Ilvaris, it just costs more outside your path.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {options.data.classes.map((c) => {
                    const active = classId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => choose(c.id)}
                        aria-pressed={active}
                        className={cn(
                          "group relative flex flex-col overflow-hidden border bg-ink-2 text-left transition-[transform,border-color,box-shadow] duration-300",
                          active
                            ? "border-gold shadow-[0_0_0_1px_var(--gold),0_14px_40px_-12px_rgba(201,164,92,0.45)]"
                            : "border-line hover:-translate-y-0.5 hover:border-gold-dim",
                        )}
                      >
                        <div className="relative aspect-[4/3.6] overflow-hidden">
                          <img
                            src={classArt(c.id)}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover object-[50%_18%] transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/10 to-transparent" />
                          <Ribbon classId={c.id} className="left-3" />
                          <span className="absolute top-2.5 right-2.5 border border-line-strong bg-ink/80 px-1.5 py-0.5 font-[var(--font-display)] text-[9px] tracking-[0.14em] text-paper-2 uppercase">
                            {c.difficulty}
                          </span>
                          {active && (
                            <span className="absolute right-2.5 bottom-2.5 grid size-7 place-items-center rounded-full border border-gold bg-ink text-gold-bright">
                              <Check className="size-4" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col px-4 pt-1 pb-4">
                          <div className="display text-[16px] text-paper">{c.name}</div>
                          <div className="mt-0.5 text-[14px] italic text-gold/90">{c.epithet}</div>
                          <p className="mt-2.5 flex-1 text-[14.5px] leading-snug text-paper-2">{c.tagline}</p>
                          <div className="mt-3 text-[12.5px] text-paper-3">
                            Strong in{" "}
                            <span className="text-paper-2">{c.mainStats.map((s) => STAT_LABEL[s]).join(" & ")}</span>
                          </div>
                          <span
                            className={cn(
                              "mt-3.5 inline-flex items-center gap-1 border-t border-line pt-3 font-[var(--font-display)] text-[10px] tracking-[0.1em] whitespace-nowrap uppercase",
                              active ? "text-gold-bright" : "text-gold/80 group-hover:text-gold-bright",
                            )}
                          >
                            {active ? "Path chosen" : "Choose this path"} <ChevronRight className="size-3.5" />
                          </span>
                        </div>
                        <FrameOver soft={!active} />
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ───────── optional: the telling */}
              <section className="rise" style={{ animationDelay: "140ms" }}>
                <button
                  onClick={() => setTuning((t) => !t)}
                  className="flex w-full items-center gap-3 border border-line bg-ink-2/60 px-4 py-3 text-left transition-colors hover:border-gold-dim"
                  aria-expanded={tuning}
                >
                  <SlidersHorizontal className="size-4 text-gold" strokeWidth={1.6} />
                  <span className="display text-[12px] tracking-[0.14em] text-paper">How the story is told</span>
                  <span className="text-[14px] italic text-paper-3">optional — {proseVoice} voice, {pacing} pacing</span>
                  <ChevronRight className={cn("ml-auto size-4 text-paper-3 transition-transform", tuning && "rotate-90")} />
                </button>
                {tuning && (
                  <div className="grid grid-cols-1 gap-6 border border-t-0 border-line bg-ink-2/40 p-5 md:grid-cols-2">
                    <div>
                      <div className="label-col mb-2">Prose voice</div>
                      <div className="space-y-1.5">
                        {VOICES.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setProseVoice(v.id)}
                            className={cn("tile flex w-full items-baseline gap-3 p-3 text-left", proseVoice === v.id && "border-gold-dim bg-ink-4")}
                          >
                            <span className="display w-16 shrink-0 text-[11px] text-paper">{v.label}</span>
                            <span className="text-[14px] text-paper-3">{v.d}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="label-col mb-2">Pacing</div>
                      <div className="space-y-1.5">
                        {PACES.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPacing(p.id)}
                            className={cn("tile flex w-full items-baseline gap-3 p-3 text-left", pacing === p.id && "border-gold-dim bg-ink-4")}
                          >
                            <span className="display w-16 shrink-0 text-[11px] text-paper capitalize">{p.id}</span>
                            <span className="text-[14px] text-paper-3">{p.d}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 text-[13.5px] italic text-paper-3">Both can be changed later in Settings.</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ───────── the commission */}
            <aside data-tour="commission" className="lg:sticky lg:top-6 lg:self-start">
              <div className="relative overflow-hidden border border-line bg-ink-2">
                <div className="relative h-[210px] overflow-hidden">
                  <img
                    key={chosen?.id ?? "none"}
                    src={chosen ? classArt(chosen.id) : "/art/hero-sm.jpg"}
                    alt=""
                    className={cn("fade size-full object-cover", chosen ? "object-[50%_15%]" : "object-[70%_40%] opacity-70")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/30 to-transparent" />
                  {chosen && <Ribbon classId={chosen.id} className="left-4" />}
                </div>

                <div className="relative -mt-10 px-5 pb-5">
                  <div className="label-col">The Commission</div>
                  <div className="display mt-1.5 truncate text-[24px] leading-tight text-paper">{name.trim() || "Unnamed"}</div>
                  <div className="text-[15px] italic text-paper-3">
                    {chosen ? `${chosen.name} — ${chosen.epithet}` : "No class chosen"}
                  </div>
                  <div className="rule mt-4" />

                  {chosen ? (
                    <>
                      <p className="mt-4 text-[15px] leading-relaxed text-paper-2">{chosen.playstyle}</p>
                      <div className="mt-4">
                        <div className="label-col mb-2">Starting stats</div>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                          {Object.entries(chosen.baseStats).map(([k, v]) => {
                            const main = (chosen.mainStats as string[]).includes(k);
                            return (
                              <div key={k} className="flex items-baseline justify-between border-b border-line-soft py-0.5">
                                <span className={cn("text-[14px]", main ? "text-paper" : "text-paper-3")}>{STAT_LABEL[k]}</span>
                                <span className={cn("mono text-[12.5px]", main ? "text-gold-bright" : "text-paper-2")}>{v}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="label-col mb-2">You begin with</div>
                        <div className="space-y-1">
                          {chosen.startingSkills.map((s) => (
                            <div key={s.slug} className="flex items-center justify-between gap-2">
                              <span className="text-[14.5px] text-paper-2">{s.name}</span>
                              <RankChip rank="F" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <details className="group mt-4">
                        <summary className="label-col flex cursor-pointer list-none items-center gap-1.5 text-gold/80 hover:text-gold-bright">
                          <ChevronRight className="size-3 transition-transform group-open:rotate-90" /> Skills you can unlock
                        </summary>
                        <div className="mt-2 space-y-1">
                          {chosen.skillTable.map((u) => (
                            <div key={u.slug} className="flex items-center justify-between gap-2">
                              <span className="text-[14px] text-paper-2">{u.name}</span>
                              <span className="mono text-[11px] text-paper-3">Lv {u.level}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </>
                  ) : (
                    <p className="mt-4 text-[15px] leading-relaxed text-paper-3">
                      Name yourself and choose a class. The Registry will write the rest — where you wake, who notices, and what
                      you already owe.
                    </p>
                  )}

                  <button className="btn btn-primary btn-lg mt-6 w-full" disabled={!!missing || create.isPending} onClick={submit}>
                    {create.isPending ? "The Registry is writing…" : "Sign the Commission"}
                    {!create.isPending && <ArrowRight className="size-4" />}
                  </button>
                  <p className="mt-2 text-center text-[13.5px] italic text-paper-3">
                    {create.isPending ? "This takes a few seconds." : (missing ?? "Your first scene opens at the Desk.")}
                  </p>
                  {create.isError && <p className="mt-2 text-[13px] text-rule">{(create.error as Error).message}</p>}
                </div>
                <FrameOver />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
