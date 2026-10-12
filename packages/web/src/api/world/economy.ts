/**
 * ILVARIS — the economy.
 *
 * Two currencies that are secretly the same substance: coin, and ink.
 * Commodity prices move with world events (a cleared Binding floods the market;
 * a cut trade road triples grain). The engine writes a price row every turn for
 * everything that moved, so the player can read the history of anything they've
 * touched and learn that the world is honest.
 */

export interface GoodDef {
  id: string;
  name: string;
  category: "food" | "material" | "ink" | "gear" | "luxury" | "service";
  basePrice: number;
  /** how violently this price reacts to world events */
  volatility: number;
  /** locations that trade it; empty = everywhere */
  markets: string[];
}

export const GOODS: GoodDef[] = [
  { id: "grain-sack", name: "Grain, one sack", category: "food", basePrice: 240, volatility: 0.8, markets: ["hollow-market", "hollow-town", "river-quay", "carrow"] },
  { id: "salt-block", name: "Salt, one block", category: "food", basePrice: 180, volatility: 0.6, markets: ["hollow-market", "river-quay", "merchant-quarter"] },
  { id: "timber-bundle", name: "Timber, one bundle", category: "material", basePrice: 320, volatility: 0.7, markets: ["hollow-town", "river-quay"] },
  { id: "iron-ingot", name: "Iron, one ingot", category: "material", basePrice: 560, volatility: 0.9, markets: ["hollow-market", "merchant-quarter", "carrow"] },
  { id: "blot-ichor-bulk", name: "Blot Ichor, by the jar", category: "material", basePrice: 90, volatility: 1.2, markets: ["hollow-market", "fen-gate"] },
  { id: "ink-dram", name: "Ink, one dram", category: "ink", basePrice: 200, volatility: 1.5, markets: ["hollow-market", "merchant-quarter", "fen-gate", "carrow"] },
  { id: "ink-barrel", name: "Ink, one barrel", category: "ink", basePrice: 4200, volatility: 1.6, markets: ["merchant-quarter"] },
  { id: "black-ink-dram", name: "Black Ink, one dram", category: "ink", basePrice: 840, volatility: 1.8, markets: ["quiet-quarter", "carrow-backstreets"] },
  { id: "ward-talisman", name: "Raid Ward, single use", category: "gear", basePrice: 60000, volatility: 0.5, markets: ["merchant-quarter", "carrow"] },
  { id: "healing-rite", name: "Temple healing, minor", category: "service", basePrice: 2000, volatility: 0.3, markets: ["ash-chapel"] },
  { id: "lodging-night", name: "A bed for the night", category: "service", basePrice: 30, volatility: 0.4, markets: ["hollow-town", "fen-gate", "carrow", "river-quay"] },
  { id: "meal-hot", name: "A hot meal", category: "food", basePrice: 8, volatility: 0.5, markets: [] },
  { id: "passage-barge", name: "Barge passage to Carrow", category: "service", basePrice: 400, volatility: 0.6, markets: ["river-quay"] },
  { id: "spice-vial", name: "Spice, one vial", category: "luxury", basePrice: 1600, volatility: 1.1, markets: ["merchant-quarter", "carrow"] },
  { id: "silk-bolt", name: "Silk, one bolt", category: "luxury", basePrice: 9000, volatility: 1.0, markets: ["merchant-quarter"] },
];

export function getGood(id: string): GoodDef | undefined {
  return GOODS.find((g) => g.id === id);
}

/** Wages by station, in shards per day. */
export const WAGES = {
  labourer: 20,
  clerk: 60,
  guard: 45,
  inscriber_journeyman: 400,
  inscriber_master: 2400,
  regent: 400,
} as const;

/** Monster bounty, in shards, paid by the bounty boards. */
export function bountyFor(rank: string): number {
  const table: Record<string, number> = {
    F: 5,
    E: 40,
    D: 300,
    C: 1400,
    B: 6000,
    A: 24000,
    S: 90000,
    SS: 260000,
    SSS: 800000,
  };
  return table[rank] ?? 5;
}

/** A Binding's purse, split among whoever claims it. */
export const BINDING_PURSE = 5000000; // 500 crowns in shards

/**
 * Move a price given the world's state.
 * `shock` is the sum of active market events' magnitudes.
 */
export function driftPrice(base: number, volatility: number, shock: number, random: number): number {
  const noise = (random - 0.5) * 0.08 * volatility;
  const moved = base * (1 + shock * volatility + noise);
  return Math.max(1, Math.round(moved));
}

export const MARKET_EVENTS: Record<string, { label: string; shock: number }> = {
  binding_cleared: { label: "A Binding was cleared — loot floods the market", shock: -0.3 },
  binding_failed: { label: "A Binding failed — demand for everything rises", shock: 0.35 },
  road_cut: { label: "The trade road is cut", shock: 0.6 },
  ink_cornered: { label: "The Mercery is cornering ink", shock: 1.4 },
  rendering_exposed: { label: "A rendering house was exposed", shock: -0.2 },
  famine: { label: "Famine in the Hollow", shock: 1.9 },
  festival: { label: "Academy festival — luxuries spike, food cheap", shock: -0.15 },
  war_levy: { label: "Crown war levy", shock: 0.45 },
};
