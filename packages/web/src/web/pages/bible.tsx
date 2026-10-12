import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { BookLock } from "lucide-react";
import { useBible } from "../queries/bible";
import { Loading } from "../components/ui-kit";
import { CompassRose, PageTitle } from "../components/ornament";
import { cn } from "../lib/utils";

type Block =
  | { t: "p"; text: string }
  | { t: "h3"; text: string }
  | { t: "quote"; lines: string[] }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] };

/* ─────────────────────────────────────────────── inline markdown */

/** `**bold**`, `*italic*` and `` `code` `` — the only inline marks the bible uses. */
function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) out.push(<strong key={k++} className="font-semibold text-[#3a1d10]">{m[2]}</strong>);
    else if (m[3] !== undefined) out.push(<em key={k++}>{m[3]}</em>);
    else if (m[4] !== undefined)
      out.push(
        <code key={k++} className="mono rounded-[2px] bg-[#d9c8a2]/70 px-1 py-px text-[0.82em] text-[#4a2a14]">
          {m[4]}
        </code>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/* ─────────────────────────────────────────────── blocks */

function BlockView({ b, first }: { b: Block; first?: boolean }) {
  switch (b.t) {
    case "p":
      return (
        <p className={cn("my-4 text-[17.5px] leading-[1.72]", first && "bible-drop")}>
          <Inline text={b.text} />
        </p>
      );
    case "h3":
      return (
        <h3 className="display mt-9 mb-3 flex items-center gap-3 text-[15px] tracking-[0.14em] text-[#7a2418]">
          <span className="size-[6px] rotate-45 bg-[#a8262a]" />
          <Inline text={b.text} />
        </h3>
      );
    case "quote":
      return (
        <blockquote className="my-6 border-l-2 border-[#a8873f] bg-[#e3d3ad]/50 py-3 pr-4 pl-5 text-[17px] italic leading-relaxed text-[#4b3b29]">
          {b.lines.map((l, i) => (
            <p key={i} className={cn(i > 0 && "mt-1.5", l.startsWith("—") && "mt-3 text-right text-[14.5px] not-italic tracking-wide text-[#7a6448]")}>
              <Inline text={l} />
            </p>
          ))}
        </blockquote>
      );
    case "ul":
    case "ol": {
      const Tag = b.t;
      return (
        <Tag className="my-4 space-y-2.5 pl-1">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[17px] leading-[1.65]">
              <span className="mt-[0.15em] shrink-0 font-[var(--font-display)] text-[13px] text-[#a8262a]">
                {b.t === "ol" ? `${i + 1}.` : "◆"}
              </span>
              <span>
                <Inline text={it} />
              </span>
            </li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <div className="my-6 overflow-x-auto border border-[#b39a6c]">
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="bg-[#2a1f15] text-[#e8cf98]">
                {b.head.map((h, i) => (
                  <th key={i} className="display px-3 py-2 text-left text-[11.5px] tracking-[0.12em] whitespace-nowrap">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className={cn("border-t border-[#cdb88f] align-top", i % 2 === 1 && "bg-[#e3d3ad]/45")}>
                  {r.map((c, j) => (
                    <td key={j} className={cn("px-3 py-2 leading-snug", j === 0 && "font-semibold text-[#3a1d10]")}>
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/* ─────────────────────────────────────────────── page */

export default function BiblePage() {
  const q = useBible();
  const sections = useMemo(() => q.data?.sections ?? [], [q.data]);
  const [active, setActive] = useState<string>("");

  // scroll-spy: the section whose heading most recently passed the top third
  useEffect(() => {
    if (!sections.length) return;
    const els = sections.map((s) => document.getElementById(`b-${s.id}`)).filter(Boolean) as HTMLElement[];
    const on = () => {
      const y = window.innerHeight * 0.3;
      let cur = els[0]?.id ?? "";
      for (const el of els) if (el.getBoundingClientRect().top <= y) cur = el.id;
      setActive(cur.replace(/^b-/, ""));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [sections]);

  const minutes = useMemo(() => Math.round((q.data?.words ?? 0) / 230), [q.data?.words]);

  if (q.isLoading) return <Loading label="Opening the bible" />;
  if (!q.data) return <Loading label="The bible would not open" />;

  const go = (id: string) => {
    const el = document.getElementById(`b-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: "smooth" });
  };

  return (
    <div>
      <PageTitle
        eyebrow="Out-of-world reference"
        title="The World Bible"
        subtitle="The truth of Ilvaris, written for the one holding the pen. Read it in any order — or not at all; the story teaches everything it needs to."
        right={
          <div className="text-right">
            <div className="label-col">Length</div>
            <div className="display mt-1 text-[15px] text-paper">
              {sections.length} sections · {q.data.words.toLocaleString()} words
            </div>
            <div className="text-[14px] italic text-paper-3">about {minutes} minutes</div>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* contents */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="panel p-4">
            <div className="label-col mb-3 flex items-center gap-2">
              <CompassRose size={14} className="text-gold" /> Contents
            </div>
            <ol className="max-h-[70vh] space-y-0.5 overflow-y-auto pr-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => go(s.id)}
                    className={cn(
                      "group flex w-full items-baseline gap-2.5 px-2 py-1.5 text-left transition-colors",
                      active === s.id ? "bg-ink-4 text-paper" : "text-paper-2 hover:text-paper",
                    )}
                  >
                    <span className={cn("section-num w-6 shrink-0 text-[13px]", active !== s.id && "opacity-60")}>
                      {s.num.padStart(2, "0")}
                    </span>
                    <span className="text-[15px] leading-snug">{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4 flex gap-3 border border-rule-dim bg-[#1a0d0c] p-3.5 text-[14px] leading-snug text-paper-2">
            <BookLock className="mt-0.5 size-4 shrink-0 text-rule" strokeWidth={1.6} />
            <span>
              <span className="display text-[11px] tracking-[0.14em] text-paper">Sealed from the world.</span> No character can
              read this page, and nothing here is ever told to them. What they know, they learned in the story.
            </span>
          </div>
        </aside>

        {/* the page */}
        <article className="parchment px-6 py-10 md:px-14 md:py-14">
          <div className="mx-auto max-w-[70ch]">
            <div className="mb-8 text-center">
              <div className="micro text-[10px] tracking-[0.3em]">Ilvaris · the reader's copy</div>
              <div className="display mt-2 text-[28px] tracking-[0.18em] text-[#2a1f15]">The Ledger Remembers</div>
            </div>
            {q.data.intro.map((b, i) => (
              <BlockView key={`i${i}`} b={b as Block} />
            ))}

            {sections.map((s, si) => (
              <Fragment key={s.id}>
                <section id={`b-${s.id}`} className="scroll-mt-6 pt-6">
                  <div className="mt-6 mb-5 flex items-center gap-4">
                    <span className="font-[var(--font-display)] text-[34px] leading-none text-[#a8262a]">
                      {s.num.padStart(2, "0")}
                    </span>
                    <h2 className="display text-[22px] leading-tight tracking-[0.1em] text-[#2a1f15] md:text-[25px]">{s.title}</h2>
                    <span className="h-px flex-1 bg-gradient-to-r from-[#a8873f] to-transparent" />
                  </div>
                  {s.blocks.map((b, i) => (
                    <BlockView key={i} b={b as Block} first={i === 0 && b.t === "p"} />
                  ))}
                </section>
                {si < sections.length - 1 && (
                  <div className="my-10 flex items-center justify-center gap-3 text-[#a8873f]" aria-hidden>
                    <span className="h-px w-16 bg-current opacity-50" />
                    <span className="size-[6px] rotate-45 bg-current" />
                    <span className="h-px w-16 bg-current opacity-50" />
                  </div>
                )}
              </Fragment>
            ))}

            <div className="mt-14 text-center text-[14px] italic text-[#7a6448]">— end of the reader's copy —</div>
          </div>
        </article>
      </div>
    </div>
  );
}
