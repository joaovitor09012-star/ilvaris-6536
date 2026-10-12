import type { AppliedResult } from "../../api/agent/pipeline";
import { PanelHead } from "./ui-kit";

/** What the Registrar filed after a turn: every number that moved, every thing that changed hands. */
export function Registrar({ applied }: { applied: AppliedResult }) {
  const rows: { k: string; v: string; tone?: string }[] = [];
  if (applied.xp) rows.push({ k: "XP", v: `+${applied.xp}`, tone: "#c9a45c" });
  if (applied.levelsGained) rows.push({ k: "Levels", v: `+${applied.levelsGained}`, tone: "#c9a45c" });
  if (applied.coinDelta) rows.push({ k: "Coin", v: `${applied.coinDelta > 0 ? "+" : ""}${applied.coinDelta}`, tone: applied.coinDelta > 0 ? "#c9a45c" : "#b23327" });
  if (applied.hpDelta) rows.push({ k: "HP", v: `${applied.hpDelta > 0 ? "+" : ""}${applied.hpDelta}`, tone: applied.hpDelta > 0 ? "#7d9b7a" : "#b23327" });
  if (applied.inkDelta) rows.push({ k: "Ink", v: `${applied.inkDelta > 0 ? "+" : ""}${applied.inkDelta}`, tone: "#5b86c4" });
  if (applied.debtDelta) rows.push({ k: "Debt", v: `${applied.debtDelta > 0 ? "+" : ""}${applied.debtDelta}`, tone: "#d97b2b" });
  if (applied.stainDelta) rows.push({ k: "Stain", v: `+${applied.stainDelta}`, tone: "#8a6fc4" });

  const lists: { title: string; items: string[]; color: string }[] = [];
  if (applied.itemsGained.length) lists.push({ title: "Acquired", items: applied.itemsGained.map((i) => `${i.qty}× ${i.name}`), color: "#c9a45c" });
  if (applied.itemsLost.length) lists.push({ title: "Lost", items: applied.itemsLost.map((i) => `${i.qty}× ${i.name}`), color: "#b23327" });
  if (applied.newSkills.length) lists.push({ title: "Unlocked", items: applied.newSkills, color: "#8a6fc4" });
  if (applied.newSkillsLearned.length) lists.push({ title: "Learned", items: applied.newSkillsLearned.map((k) => `${k.name} (${k.rank})`), color: "#8a6fc4" });
  if (applied.monstersKilled.length) lists.push({ title: "Killed", items: applied.monstersKilled.map((m) => `${m.count}× ${m.name}`), color: "#b23327" });
  if (applied.discovered.length) lists.push({ title: "Discovered", items: applied.discovered, color: "#5f9e9e" });
  if (applied.loreUnlocked.length) lists.push({ title: "Pages", items: applied.loreUnlocked, color: "#5f9e9e" });
  if (applied.clocksFired.length) lists.push({ title: "Clocks fired", items: applied.clocksFired, color: "#b23327" });
  if (applied.offscreen.length) lists.push({ title: "Elsewhere", items: applied.offscreen, color: "#8b8778" });
  if (applied.arcOpened) lists.push({ title: "Arc opened", items: [applied.arcOpened], color: "#d97b2b" });
  if (applied.arcClosed) lists.push({ title: "Arc closed", items: [applied.arcClosed], color: "#7d9b7a" });

  if (rows.length === 0 && lists.length === 0 && !applied.summary) return null;

  return (
    <div className="panel overflow-hidden">
      <PanelHead title="The Registrar" meta={`turn ${applied.turn} · ${applied.sceneType}`} />
      <div className="p-4">
        {applied.summary && <p className="text-[14.5px] italic leading-relaxed text-paper-2">{applied.summary}</p>}
        {rows.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1.5">
            {rows.map((r) => (
              <span key={r.k} className="flex items-baseline gap-1.5">
                <span className="micro">{r.k}</span>
                <span className="mono text-[12px]" style={{ color: r.tone }}>
                  {r.v}
                </span>
              </span>
            ))}
          </div>
        )}
        {lists.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-line pt-3.5 sm:grid-cols-2">
            {lists.map((l) => (
              <div key={l.title}>
                <div className="micro" style={{ color: l.color }}>
                  {l.title}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {l.items.map((i, n) => (
                    <li key={`${i}-${n}`} className="text-[13px] leading-snug text-paper-2">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
