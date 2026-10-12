/**
 * ILVARIS — rank system.
 *
 * Every monster, item, and skill in the world carries a rank from F to SSS.
 * The player's System Window shows ranks because the player's blank page
 * renders as an interface; natives see the same thing as a feeling of weight.
 */

export const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"] as const;
export type Rank = (typeof RANKS)[number];

export function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

/** Power thresholds for each rank, in "power units". */
const THRESHOLDS: [Rank, number][] = [
  ["F", 0],
  ["E", 40],
  ["D", 110],
  ["C", 240],
  ["B", 460],
  ["A", 820],
  ["S", 1400],
  ["SS", 2400],
  ["SSS", 4200],
];

export function rankFromPower(power: number): Rank {
  let out: Rank = "F";
  for (const [rank, floor] of THRESHOLDS) if (power >= floor) out = rank;
  return out;
}

export function powerFloor(rank: Rank): number {
  return THRESHOLDS[rankIndex(rank)][1];
}

/** Loot and effect scaling per rank. */
export const RANK_MULT: Record<Rank, number> = {
  F: 1,
  E: 1.4,
  D: 2,
  C: 3,
  B: 4.6,
  A: 7,
  S: 11,
  SS: 17,
  SSS: 26,
};

/** XP a monster of this rank is worth at the given level. */
export function xpForRank(rank: Rank, level: number): number {
  return Math.round((8 + level * 3) * RANK_MULT[rank]);
}

export const RANK_LABEL: Record<Rank, string> = {
  F: "F — Unformed",
  E: "E — Marginal",
  D: "D — Drafted",
  C: "C — Inscribed",
  B: "B — Bonded",
  A: "A — Authored",
  S: "S — Sovereign",
  SS: "SS — Almost True",
  SSS: "SSS — Written",
};

/** Colour per rank, used across the UI. */
export const RANK_COLOR: Record<Rank, string> = {
  F: "#6b7280",
  E: "#7d9a8a",
  D: "#5f9ea0",
  C: "#4f8fc0",
  B: "#8a7fc0",
  A: "#c0a04f",
  S: "#d98324",
  SS: "#c0392b",
  SSS: "#e8d9a8",
};

export const STAT_KEYS = ["str", "agi", "vit", "int", "wis", "cha", "luk"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_LABEL: Record<StatKey, string> = {
  str: "Strength",
  agi: "Agility",
  vit: "Vitality",
  int: "Insight",
  wis: "Wisdom",
  cha: "Presence",
  luk: "Fortune",
};

export const STAT_BLURB: Record<StatKey, string> = {
  str: "Force of body. Physical damage, carrying, breaking.",
  agi: "Speed and fine control. Initiative, evasion, Passage timing.",
  vit: "Endurance. Health, ink capacity, resistance to Recoil.",
  int: "Analytical power. Research success, Declarative and Subjunctive force.",
  wis: "Perception and judgement. Interrogative depth, resistance to Mind work.",
  cha: "Presence. How much of you other people believe, and want. Social workings.",
  luk: "Fortune. The Ledger's goodwill. Loot, critical moments, surviving what should kill you.",
};

/** XP required to reach the next level from `level`. */
export function xpCurve(level: number): number {
  return Math.round(100 * Math.pow(level, 1.55));
}
