import type { GameState } from "../game/state";
import { getClass } from "../world/classes";
import { getLocation, LOCATIONS } from "../world/map";
import { getNpcTemplate } from "../world/npcs";
import { formatCoin } from "../world/items";
import { getMonster, monstersAt } from "../world/monsters";
import { getGood } from "../world/economy";

/* ────────────────────────────────────────────────────────────────────────────
   CONTEXT SEPARATION — the architectural firewall.

   Four contexts, built separately and never merged:
     1. DIRECTOR  — sees everything. The only thing that does.
     2. NARRATOR  — sees the public scene + NPC outward manner. Never secrets,
                    never the player's statistics, never world truth.
     3. NPC       — sees only its own mind + what is observable.
     4. REGISTRAR — sees the numbers and the prose, so it can record the delta.

   NPC knowledge leaks are the single easiest way to destroy this simulation,
   so the NPC context is built here, once, and nothing else may add to it.
   ──────────────────────────────────────────────────────────────────────────── */

export function buildDirectorContext(state: GameState): string {
  const { character: c, save } = state;
  const cls = getClass(c.classId);
  const loc = getLocation(c.locationId);

  const known = state.mapReveal
    .map((m) => ({ m, l: getLocation(m.locationId) }))
    .filter((x) => x.l)
    .map(({ m, l }) => `${l!.name}${m.visited ? " (visited)" : ""}${m.cleared ? " [cleared]" : ""}`)
    .join("; ");

  const npcBlocks = state.npcs
    .map((n) => {
      const t = getNpcTemplate(n.npcId);
      const rel = state.relations.find((r) => r.npcId === n.npcId && r.targetId === "player");
      const facts = state.facts.filter((f) => f.npcId === n.npcId).slice(-6);
      const beliefs = state.beliefs.filter((b) => b.npcId === n.npcId).slice(-5);
      const goals = state.goals.filter((g) => g.npcId === n.npcId && !g.done);
      const secret = state.secrets.find((x) => x.npcId === n.npcId);
      const lines = [
        `  ${n.name} (${n.npcId}) — ${t?.role ?? ""} [${t?.faction ?? ""}] ${n.met ? "MET" : "not yet met"}${n.revised ? " REVISED" : ""}${n.alive ? "" : " DEAD"}`,
        t ? `    voice: ${t.voice}` : "",
        rel
          ? `    toward player — trust ${rel.trust} fear ${rel.fear} debt ${rel.debt} desire ${rel.desire} grudge ${rel.grudge}${rel.note ? ` | ${rel.note}` : ""}`
          : "",
        goals.length ? `    wants: ${goals.map((g) => `${g.goal} (${g.horizon})`).join("; ")}` : "",
        facts.length ? `    knows: ${facts.map((f) => f.fact).join(" | ")}` : "",
        beliefs.length
          ? `    believes: ${beliefs.map((b) => `${b.belief}${b.isTrue ? "" : " [FALSE]"} (${b.confidence}%)`).join(" | ")}`
          : "",
        secret ? `    hides: ${secret.secret}${secret.revealed ? " [ALREADY REVEALED]" : ""}` : "",
        t?.threadRole ? `    THREAD: cast as ${t.threadRole}. Fated: ${t.threadFate}` : "",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n");

  const openArcs = state.arcs
    .filter((a) => a.state !== "closed")
    .map((a) => `  ${a.name} [${a.kind}, ${a.state}] pressure ${a.pressure} — ${a.summary}`)
    .join("\n");

  const runningClocks = state.clocks
    .filter((k) => k.status === "running")
    .map((k) => `  ${k.name} — ${k.ticks}/${k.maxTicks} — if it fires: ${k.consequence}`)
    .join("\n");

  const guns = state.guns
    .filter((g) => !g.fired && !g.retired)
    .map((g) => `  (turn ${g.introducedTurn}) ${g.fact}`)
    .join("\n");

  const threadsBlock = state.threads
    .map((t) => `  ${t.name} — ${t.role} | fated: ${t.fate} | state ${t.state}, progress ${t.progress}`)
    .join("\n");

  const recentEvents = state.events
    .slice(0, 30)
    .reverse()
    .map((e) => `  t${e.turn} [${e.kind}] ${e.description}${e.causeEventId ? ` (caused by event #${e.causeEventId})` : ""}`)
    .join("\n");

  const lastScenes = state.scenes
    .slice(0, 5)
    .reverse()
    .map((sc) => `  t${sc.turn} [${sc.type}] at ${getLocation(sc.locationId)?.name ?? sc.locationId} — player did: "${sc.playerInput}"`)
    .join("\n");

  const marketShocks = state.prices.length
    ? Object.entries(
        state.prices.reduce<Record<string, number[]>>((acc, p) => {
          (acc[p.goodId] ??= []).push(p.price);
          return acc;
        }, {}),
      )
        .map(([goodId, list]) => {
          const base = getGood(goodId)?.basePrice ?? list[0];
          const now = list[0];
          const pct = Math.round(((now - base) / base) * 100);
          return Math.abs(pct) > 15 ? `  ${getGood(goodId)?.name ?? goodId}: ${pct > 0 ? "+" : ""}${pct}%` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  return `══ WORLD TRUTH (you alone see this) ══
The world is the Ledger's text. You are its authoring function. Natives do not know you exist.
The player's Codex first page is blank: the Ledger cannot read or predict them.

══ SAVE STATE ══
turn ${save.turn} · chapter ${save.chapter} · day ${save.day} · ${save.season} · mode ${save.mode}
pressure ${save.pressure} · consecutive Pressure scenes ${save.pressureStreak} · consecutive Breath ${save.breathStreak}
content: follows the player's own register (no preset level); absolute limits always hold

══ THE PLAYER (full statistics — they cannot see that you see this) ══
${c.name} (${c.pronouns}) · ${cls.name} · Level ${c.level} (xp ${c.xp}/${c.xpNext}) · Depth ${c.depth} · Standing ${c.standing}
stats STR ${c.str} AGI ${c.agi} VIT ${c.vit} INT ${c.int} WIS ${c.wis} CHA ${c.cha} LUK ${c.luk} · free points ${c.freePoints}
HP ${c.hp}/${c.hpMax} · Ink ${c.ink}/${c.inkMax} · coin ${formatCoin(c.coin)} · Ledger Debt ${c.debt} · Stain ${c.stain}
location: ${loc?.name ?? c.locationId} (${loc?.region ?? ""}) · covenant mark: ${c.covenantMark}
class affinities: ${cls.affinities.join(", ")} · declared Thread: ${c.declaredThread ?? "none"}
skills: ${state.skills.map((k) => `${k.name} (${k.rank})`).join(", ") || "none"}
inventory: ${state.inventory.map((i) => `${i.itemId}×${i.qty}`).join(", ") || "empty"}

══ THE SIX THREADS ══
${threadsBlock || "  none"}

══ OPEN ARCS ══
${openArcs || "  none"}

══ RUNNING CLOCKS ══
${runningClocks || "  none"}

══ UNFIRED GUNS (Chekhov's ledger — fire or retire these) ══
${guns || "  none"}

══ RECENT CAUSAL RECORD ══
${recentEvents || "  nothing yet"}

══ RECENT SCENES ══
${lastScenes || "  none"}

══ MAP THE PLAYER KNOWS ══
${known || "  nothing"}
(all locations that exist: ${LOCATIONS.map((l) => l.id).join(", ")})

══ MARKET DRIFT ══
${marketShocks || "  stable"}

══ EVERY MIND IN THE WORLD ══
${npcBlocks}
`;
}

/* ──────────────────────────────────────────────────────────────────────────── */

export function buildNarratorContext(
  state: GameState,
  decision: {
    sceneType: string;
    title: string;
    directorNote: string;
    presentNpcIds: string[];
    locationId?: string | null;
    contentFlag?: string;
  },
): string {
  const { character: c } = state;
  const locId = decision.locationId ?? c.locationId;
  const loc = getLocation(locId);
  const cls = getClass(c.classId);

  const present = decision.presentNpcIds
    .map((id) => {
      const t = getNpcTemplate(id);
      if (!t) return "";
      const rel = state.relations.find((r) => r.npcId === id && r.targetId === "player");
      const goals = state.goals.filter((g) => g.npcId === id && !g.done);
      // NOTE: no facts, no beliefs, no secrets. Only how they behave and what they want.
      return [
        `  ${t.name} — ${t.role} [${t.station}]`,
        `    manner and speech: ${t.voice}`,
        `    outward bearing toward the player: ${
          rel
            ? describeDisposition(rel.trust, rel.fear, rel.desire, rel.grudge)
            : "wary, unread"
        }`,
        goals.length ? `    what they want (SHOW, NEVER STATE): ${goals.map((g) => g.goal).join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  /** what any student standing here would know about the wildlife */
  const monstersHere = monstersAt(locId, c.depth)
    .slice(0, 6)
    .map((m) => `  ${m.name} (${m.rank}, lv ${m.level}) — ${m.lore}`)
    .join("\n");

  const prevTail = state.scenes[0]?.prose?.slice(-600) ?? "";

  return `══ SCENE BRIEF FROM THE CHORISTER ══
type: ${decision.sceneType}
title: ${decision.title}
content flag: ${decision.contentFlag ?? "none"}

${decision.directorNote}

══ PLACE ══
${loc?.name ?? locId} — ${loc?.region ?? ""}
${loc?.description ?? ""}

══ WHO IS PRESENT ══
${present || "  nobody. The player is alone."}

══ WHAT LURKS HERE (public knowledge) ══
${monstersHere || "  nothing known"}

══ THE PLAYER, AS OTHERS SEE THEM ══
${c.name}, ${cls.name}, ${c.standing}. ${c.stain > 3 ? "There is a greyness about them that the initiated would notice." : "They look unremarkable."}
${c.appearance}

══ WHAT HAPPENED IMMEDIATELY BEFORE ══
${prevTail || "(this is the opening of the story)"}

══ THE PLAYER'S LAST STATED ACTION ══
"${state.scenes[0]?.playerInput ?? ""}"

Write the scene now.`;
}

function describeDisposition(trust: number, fear: number, desire: number, grudge: number): string {
  const bits: string[] = [];
  if (trust > 50) bits.push("at ease with them");
  else if (trust > 20) bits.push("civil, watching");
  else if (trust < -20) bits.push("cold");
  else bits.push("guarded");
  if (fear > 40) bits.push("visibly careful of them");
  if (desire > 40) bits.push("drawn toward them and not hiding it well");
  else if (desire > 15) bits.push("aware of them in a way they are not admitting");
  if (grudge > 40) bits.push("keeping a ledger of their own about them");
  return bits.join("; ");
}

/* ────────────────────────────────────────────────────────────────────────────
   NPC CONTEXT — the firewall. Built for one NPC at a time, and nothing else
   may ever add to it. If an NPC needs to know something, they must be told it.
   ──────────────────────────────────────────────────────────────────────────── */

export function buildNpcContext(state: GameState, npcId: string): string {
  const t = getNpcTemplate(npcId);
  if (!t) return "";
  const facts = state.facts.filter((f) => f.npcId === npcId);
  const beliefs = state.beliefs.filter((b) => b.npcId === npcId);
  const rel = state.relations.find((r) => r.npcId === npcId && r.targetId === "player");
  const goals = state.goals.filter((g) => g.npcId === npcId && !g.done);
  const secret = state.secrets.find((x) => x.npcId === npcId);
  const npcRow = state.npcs.find((n) => n.npcId === npcId);

  return `You are ${t.name}. ${t.role}. ${t.age} years old. ${t.station}. Of ${t.faction}.
Your manner and speech: ${t.voice}
What the world knows of you: ${t.public}

WHAT YOU HAVE PERSONALLY LEARNED (each with its source and your confidence in it):
${facts.map((f) => `  · ${f.fact} — ${f.source.replace(/_/g, " ")}, ${f.confidence}% sure`).join("\n") || "  · nothing yet"}

WHAT YOU BELIEVE (some of this is wrong; you do not know which parts):
${beliefs.map((b) => `  · ${b.belief} — ${b.confidence}% sure`).join("\n") || "  · nothing yet"}

WHAT YOU WANT:
${goals.map((g) => `  · ${g.goal} (${g.horizon} term)`).join("\n") || "  · nothing pressing"}

HOW YOU FEEL ABOUT ${state.character.name}:
  trust ${rel?.trust ?? 0} · fear ${rel?.fear ?? 0} · what you owe them ${rel?.debt ?? 0} · desire ${rel?.desire ?? 0} · grudge ${rel?.grudge ?? 0}
  ${rel?.note ?? ""}
${secret && !secret.revealed ? `\nWHAT YOU ARE HIDING: ${secret.secret}\nYou will not volunteer this. You will not deny it if caught directly.` : ""}

YOU DO NOT KNOW, AND CANNOT KNOW:
  · that the world is a text, or that anything called the Ledger or the Chorister exists
  · what anyone else is thinking or feeling
  · the player's statistics, level, skills, Debt, or Stain
  · anything that happened when you were not there, unless someone told you
${npcRow?.met ? "" : "  · you have not met the player before\n"}
Speak and act only from what is written above. If you do not know something, say so, guess badly, or refuse to answer.`;
}

/* ──────────────────────────────────────────────────────────────────────────── */

/** The canon roster the registrar is allowed to file against, here and already-known. */
function registrarRoster(state: GameState, locId: string, depth: number): string {
  const here = monstersAt(locId, depth);
  const known = state.bestiary
    .map((b) => getMonster(b.monsterId))
    .filter((m): m is NonNullable<typeof m> => !!m && !here.some((h) => h.id === m.id));
  const lines = [...here, ...known].map((m) => `  ${m.id} — ${m.name} (${m.rank}, lv ${m.level})`);
  return lines.length ? lines.join("\n") : "  (nothing recorded here; a new creature needs a newMonsters entry)";
}

export function buildRegistrarContext(state: GameState, playerInput: string, prose: string): string {
  const c = state.character;
  return `══ CURRENT STATE (do not duplicate what is already here) ══
level ${c.level} · xp ${c.xp}/${c.xpNext} · depth ${c.depth}
hp ${c.hp}/${c.hpMax} · ink ${c.ink}/${c.inkMax} · coin ${c.coin} shards · debt ${c.debt} · stain ${c.stain}
location ${c.locationId} · mode ${state.save.mode}
skills owned: ${state.skills.map((k) => k.name).join(", ") || "none"}
items owned: ${state.inventory.map((i) => `${i.itemId}×${i.qty}`).join(", ") || "none"}
monsters already known: ${state.bestiary.map((b) => b.monsterId).join(", ") || "none"}
known locations: ${state.mapReveal.map((m) => m.locationId).join(", ")}

══ THE ROSTER — creatures that already exist, with their EXACT ids ══
${registrarRoster(state, c.locationId, c.depth)}
A creature in the prose that matches one of these MUST be recorded under its listed id — never a variant like
"blot-small" for a Blot. Only if the prose establishes something genuinely new do you use "newMonsters".

══ PLAYER'S STATED ACTION ══
"${playerInput}"

══ THE SCENE THAT WAS WRITTEN ══
${prose}

Record what changed. Return JSON only.`;
}
