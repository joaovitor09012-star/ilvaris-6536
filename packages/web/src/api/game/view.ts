import * as s from "../database/schema";
import { loadGame, type GameState } from "./state";
import { getClass } from "../world/classes";
import { STAT_KEYS, STAT_LABEL, STAT_BLURB, rankFromPower, RANK_LABEL, type StatKey } from "../world/ranks";
import { getLocation } from "../world/map";
import { getItem, formatCoin } from "../world/items";
import { getMonster } from "../world/monsters";
import { getNpcTemplate } from "../world/npcs";
import { getGlobalArc } from "../world/arcs";
import { getLore } from "../world/lore";

/**
 * Read models. Everything the frontend renders is assembled here so that no page
 * has to know the shape of the database. Nothing in this file writes.
 */

export function playerPower(char: typeof s.characters.$inferSelect, skills: (typeof s.characterSkills.$inferSelect)[]): number {
  const top = [...skills].sort((a, b) => b.power - a.power).slice(0, 6);
  const skillPower = top.reduce((a, b) => a + b.power, 0);
  return Math.round(skillPower * 0.6 + char.level * 14 + char.depth * 6 + char.stain * 2);
}

export interface SystemWindow {
  level: number;
  xp: number;
  xpNext: number;
  xpPct: number;
  freePoints: number;
  rank: string;
  rankLabel: string;
  power: number;
  standing: string;
  hp: { cur: number; max: number };
  ink: { cur: number; max: number };
  coin: number;
  coinLabel: string;
  debt: number;
  stain: number;
  depth: number;
  covenantMark: string;
  declaredThread: string | null;
  stats: { key: StatKey; label: string; blurb: string; value: number; main: boolean }[];
  mode: string;
  pressure: number;
  day: number;
  turn: number;
  chapter: number;
  location: { id: string; name: string; region: string; danger: number };
  skillCount: number;
}

export function systemWindow(state: GameState): SystemWindow {
  const { character: c, save, skills } = state;
  const cls = getClass(c.classId);
  const power = playerPower(c, skills);
  const rank = rankFromPower(power);
  const loc = getLocation(c.locationId);
  return {
    level: c.level,
    xp: c.xp,
    xpNext: c.xpNext,
    xpPct: c.xpNext > 0 ? Math.min(100, Math.round((c.xp / c.xpNext) * 100)) : 0,
    freePoints: c.freePoints,
    rank,
    rankLabel: RANK_LABEL[rank],
    power,
    standing: c.standing,
    hp: { cur: c.hp, max: c.hpMax },
    ink: { cur: c.ink, max: c.inkMax },
    coin: c.coin,
    coinLabel: formatCoin(c.coin),
    debt: c.debt,
    stain: c.stain,
    depth: c.depth,
    covenantMark: c.covenantMark,
    declaredThread: c.declaredThread,
    stats: STAT_KEYS.map((k) => ({
      key: k,
      label: STAT_LABEL[k],
      blurb: STAT_BLURB[k],
      value: c[k],
      main: cls.mainStats.includes(k),
    })),
    mode: save.mode,
    pressure: save.pressure,
    day: save.day,
    turn: save.turn,
    chapter: save.chapter,
    location: {
      id: c.locationId,
      name: loc?.name ?? c.locationId,
      region: loc?.region ?? "",
      danger: loc?.danger ?? 0,
    },
    skillCount: skills.length,
  };
}

export interface SkillView {
  id: number;
  slug: string;
  name: string;
  rank: string;
  vector: string;
  shape: string;
  modifiers: string[];
  costInk: number;
  power: number;
  recoil: number;
  mastery: number;
  source: string;
  description: string;
  equipped: boolean;
}

export function skillView(row: typeof s.characterSkills.$inferSelect): SkillView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    rank: row.rank,
    vector: row.vector,
    shape: row.shape,
    modifiers: row.modifiers ?? [],
    costInk: row.costInk,
    power: row.power,
    recoil: row.recoil,
    mastery: row.mastery,
    source: row.source,
    description: row.description,
    equipped: row.equipped,
  };
}

export interface InventoryView {
  id: number;
  itemId: string;
  name: string;
  type: string;
  rank: string;
  qty: number;
  condition: number;
  acquiredTurn: number;
  description: string;
  value: number;
  custom: boolean;
}

export function inventoryView(row: typeof s.inventory.$inferSelect): InventoryView {
  const t = getItem(row.itemId);
  return {
    id: row.id,
    itemId: row.itemId,
    name: t?.name ?? row.itemId,
    type: t?.type ?? "misc",
    rank: t?.rank ?? "F",
    qty: row.qty,
    condition: row.condition,
    acquiredTurn: row.acquiredTurn,
    description: t?.description ?? "",
    value: t?.price ?? 0,
    custom: !t,
  };
}

export interface NpcView {
  npcId: string;
  name: string;
  met: boolean;
  alive: boolean;
  revised: boolean;
  voiceNote: string;
  lastSeenTurn: number;
  role: string;
  faction: string;
  station: string;
  rank: string;
  allure: string;
  appearance: string;
  publicNote: string;
  home: string;
  isThread: boolean;
  portraitKey: string | null;
  disposition: { trust: number; fear: number; debt: number; desire: number; grudge: number; note: string };
  knownFacts: { fact: string; source: string; confidence: number; turn: number }[];
  heldBeliefs: { belief: string; isTrue: boolean; confidence: number }[];
  secrets: { secret: string; revealed: boolean }[];
}

export function npcView(state: GameState, row: typeof s.npcs.$inferSelect): NpcView {
  const t = getNpcTemplate(row.npcId);
  const rel = state.relations.find((r) => r.npcId === row.npcId && r.targetId === "player");
  return {
    npcId: row.npcId,
    name: row.name,
    met: row.met,
    alive: row.alive,
    revised: row.revised,
    voiceNote: row.voiceNote,
    lastSeenTurn: row.lastSeenTurn,
    role: t?.role ?? "",
    faction: t?.faction ?? "",
    station: t?.station ?? "",
    rank: t?.rank ?? "F",
    allure: t?.allure ?? "comely",
    appearance: t?.appearance ?? "",
    publicNote: t?.public ?? "",
    home: t?.home ?? "",
    isThread: t?.isThread ?? false,
    portraitKey: row.portraitKey,
    disposition: {
      trust: rel?.trust ?? 0,
      fear: rel?.fear ?? 0,
      debt: rel?.debt ?? 0,
      desire: rel?.desire ?? 0,
      grudge: rel?.grudge ?? 0,
      note: rel?.note ?? "",
    },
    // the player only ever sees what the NPC has let slip — never their private beliefs
    knownFacts: state.facts
      .filter((f) => f.npcId === row.npcId && f.source === "told_by_player")
      .map((f) => ({ fact: f.fact, source: f.source, confidence: f.confidence, turn: f.turn })),
    heldBeliefs: state.beliefs
      .filter((b) => b.npcId === row.npcId && b.confidence >= 70)
      .map((b) => ({ belief: b.belief, isTrue: b.isTrue, confidence: b.confidence })),
    secrets: state.secrets
      .filter((x) => x.npcId === row.npcId && x.revealed)
      .map((x) => ({ secret: x.secret, revealed: x.revealed })),
  };
}

export interface ThreadView {
  id: number;
  threadId: string;
  npcId: string;
  name: string;
  role: string;
  /** the written fate — null until the thread closes (see isFateRevealed) */
  fate: string | null;
  fateRevealed: boolean;
  state: string;
  progress: number;
  resolution: string | null;
  allure: string;
  portraitKey: string | null;
  appearance: string;
  voice: string;
  disposition: { trust: number; fear: number; debt: number; desire: number; grudge: number; note: string };
}

/**
 * A thread's written fate is world truth. The player may read it only once the thread has
 * closed — resolved, severed, revised, or carried to 100%. Every public view goes through this;
 * the director and narrator read `state.threads` directly and are unaffected.
 */
export function isFateRevealed(row: { state: string; progress: number }) {
  return row.state === "resolved" || row.state === "severed" || row.state === "revised" || row.progress >= 100;
}

export function threadView(state: GameState, row: typeof s.threads.$inferSelect): ThreadView {
  const t = getNpcTemplate(row.npcId);
  const npcRow = state.npcs.find((n) => n.npcId === row.npcId);
  const rel = state.relations.find((r) => r.npcId === row.npcId && r.targetId === "player");
  return {
    id: row.id,
    threadId: row.threadId,
    npcId: row.npcId,
    name: row.name,
    role: row.role,
    fate: isFateRevealed(row) ? row.fate : null,
    fateRevealed: isFateRevealed(row),
    state: row.state,
    progress: row.progress,
    resolution: row.resolution,
    allure: t?.allure ?? "striking",
    portraitKey: npcRow?.portraitKey ?? null,
    appearance: t?.appearance ?? "",
    voice: t?.voice ?? "",
    disposition: {
      trust: rel?.trust ?? 0,
      fear: rel?.fear ?? 0,
      debt: rel?.debt ?? 0,
      desire: rel?.desire ?? 0,
      grudge: rel?.grudge ?? 0,
      note: rel?.note ?? "",
    },
  };
}

export interface EventView {
  id: number;
  turn: number;
  kind: string;
  description: string;
  causeEventId: number | null;
  cause: string | null;
  locationId: string | null;
  locationName: string | null;
  npcId: string | null;
  npcName: string | null;
  weight: number;
}

export function eventViews(state: GameState, limit = 200): EventView[] {
  const byId = new Map(state.events.map((e) => [e.id, e]));
  return state.events
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
    .map((e) => {
      const cause = e.causeEventId ? byId.get(e.causeEventId) : undefined;
      const npc = e.npcId ? state.npcs.find((n) => n.npcId === e.npcId) : undefined;
      return {
        id: e.id,
        turn: e.turn,
        kind: e.kind,
        description: e.description,
        causeEventId: e.causeEventId,
        cause: cause?.description ?? null,
        locationId: e.locationId ?? null,
        locationName: e.locationId ? getLocation(e.locationId)?.name ?? e.locationId : null,
        npcId: e.npcId ?? null,
        npcName: npc?.name ?? (e.npcId ? getNpcTemplate(e.npcId)?.name ?? e.npcId : null),
        weight: e.weight,
      };
    });
}

export interface ArcView {
  id: number;
  arcId: string;
  name: string;
  kind: string;
  state: string;
  pressure: number;
  summary: string;
  scar: string;
  enteredTurn: number;
  closedTurn: number | null;
  theme: string | null;
  exits: string[];
  clocks: { name: string; ticks: number; maxTicks: number; consequence: string; status: string }[];
}

export function arcViews(state: GameState): ArcView[] {
  return state.arcs
    .slice()
    .sort((a, b) => (a.state === "closed" ? 1 : 0) - (b.state === "closed" ? 1 : 0) || b.id - a.id)
    .map((a) => {
      const g = getGlobalArc(a.arcId);
      return {
        id: a.id,
        arcId: a.arcId,
        name: a.name,
        kind: a.kind,
        state: a.state,
        pressure: a.pressure,
        summary: a.summary,
        scar: a.scar,
        enteredTurn: a.enteredTurn,
        closedTurn: a.closedTurn,
        theme: g?.theme ?? null,
        exits: g?.exits ?? [],
        clocks: state.clocks
          .filter((k) => k.arcId === a.arcId)
          .map((k) => ({
            name: k.name,
            ticks: k.ticks,
            maxTicks: k.maxTicks,
            consequence: k.consequence,
            status: k.status,
          })),
      };
    });
}

export function loreViews(state: GameState) {
  const unlockedIds = new Set(state.lore.map((l) => l.loreId));
  return state.lore.map((l) => {
    const entry = getLore(l.loreId);
    return {
      id: l.loreId,
      category: entry?.category ?? "history",
      title: entry?.title ?? l.loreId,
      body: entry?.body ?? "",
      turn: l.turn,
      unlocked: true,
    };
  }).filter((e) => e.body).sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))
    .map((e) => ({ ...e, unlockedIds }));
}

export function bestiaryViews(state: GameState) {
  return state.bestiary
    .slice()
    .sort((a, b) => b.kills - a.kills || a.monsterId.localeCompare(b.monsterId))
    .map((row) => {
      const t = getMonster(row.monsterId);
      const custom = row.custom;
      return {
        monsterId: row.monsterId,
        name: t?.name ?? custom?.name ?? row.monsterId,
        rank: t?.rank ?? custom?.rank ?? "F",
        level: t?.level ?? custom?.level ?? 1,
        hp: t?.hp ?? custom?.hp ?? 0,
        damage: t?.damage ?? custom?.damage ?? 0,
        armour: t?.armour ?? custom?.armour ?? 0,
        /** what any student knows on sight */
        lore: t?.lore ?? custom?.lore ?? "",
        /** what only a studied entry reveals */
        revealed: row.studied ? (t?.studied ?? custom?.lore ?? "") : "",
        habitat: t?.habitat ?? "unknown",
        engagement: t?.engagement ?? "—",
        drops: t?.drops ?? [],
        kills: row.kills,
        studied: row.studied,
        firstSeenTurn: row.firstSeenTurn,
        custom: !t,
      };
    });
}

export { loadGame, formatCoin };
export type { GameState };
