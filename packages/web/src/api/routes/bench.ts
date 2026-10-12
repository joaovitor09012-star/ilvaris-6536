import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame } from "../game/state";
import { previewResearch, runResearch } from "../game/research";
import { VECTORS, SHAPES, MODIFIERS, SKILL_LIBRARY, vector, shape, modifier } from "../world/skills";
import { getClass } from "../world/classes";
import { RANK_COLOR, RANK_LABEL, type Rank } from "../world/ranks";

/**
 * THE RESEARCH BENCH.
 *
 * Mana is ink that holds instruction. Vector is what it is made of, shape is how
 * it is delivered, modifiers are further instructions. Every combination is
 * legal, most are useless, and the journal remembers the failures — which is the
 * whole point, because familiarity is what makes the next attempt likelier.
 */
const selection = z.object({
  vectorId: z.string(),
  shapeId: z.string(),
  modifiers: z.array(z.string()).max(3).default([]),
});

export const bench = {
  /** The bench itself: parts, affinity, and the journal so far. */
  get: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const cls = getClass(state.character.classId);
    const log = await db
      .select()
      .from(s.researchLog)
      .where(eq(s.researchLog.charId, state.character.id))
      .orderBy(desc(s.researchLog.id))
      .limit(120);

    const attempts = log.length;
    const successes = log.filter((l) => l.success).length;

    return {
      vectors: VECTORS.map((v) => ({
        id: v.id,
        name: v.name,
        weight: v.weight,
        inkMult: v.inkMult,
        recoil: v.recoil,
        volatility: v.volatility,
        blurb: v.blurb,
        flavour: v.flavour,
        affinity: cls.affinities.includes(v.id),
        attempts: log.filter((l) => l.vector === v.id).length,
        successes: log.filter((l) => l.vector === v.id && l.success).length,
      })),
      shapes: SHAPES.map((sh) => ({
        id: sh.id,
        name: sh.name,
        powerMult: sh.powerMult,
        inkMult: sh.inkMult,
        scope: sh.scope,
        blurb: sh.blurb,
        attempts: log.filter((l) => l.shape === sh.id).length,
      })),
      modifiers: MODIFIERS.map((m) => ({
        id: m.id,
        name: m.name,
        powerMult: m.powerMult,
        inkAdd: m.inkAdd,
        recoil: m.recoil,
        blurb: m.blurb,
        attempts: log.filter((l) => (l.modifiers ?? []).includes(m.id)).length,
      })),
      affinities: cls.affinities,
      researchBonus: cls.researchBonus,
      ink: state.character.ink,
      inkMax: state.character.inkMax,
      insight: state.character.int,
      wisdom: state.character.wis,
      fortune: state.character.luk,
      stain: state.character.stain,
      journal: log.map((l) => ({
        id: l.id,
        turn: l.turn,
        vector: l.vector,
        vectorName: vector(l.vector).name,
        shape: l.shape,
        shapeName: shape(l.shape).name,
        modifiers: l.modifiers ?? [],
        success: l.success,
        resultName: l.resultName,
        resultRank: l.resultRank,
        note: l.note,
      })),
      stats: { attempts, successes, failures: attempts - successes },
      /** what the player's class already reads naturally */
      known: state.skills.map((k) => ({ name: k.name, rank: k.rank, vector: k.vector, shape: k.shape, source: k.source })),
    };
  }),

  /** Odds, cost and precedent, before committing. */
  preview: base
    .input(z.object({ saveId: z.number() }).and(selection))
    .handler(async ({ input }) => {
      const p = await previewResearch({
        saveId: input.saveId,
        vectorId: input.vectorId,
        shapeId: input.shapeId,
        modifiers: input.modifiers,
      });
      const c = p.composed;
      return {
        name: c.name,
        rank: c.rank,
        rankLabel: RANK_LABEL[c.rank as Rank] ?? c.rank,
        rankColor: RANK_COLOR[c.rank as Rank] ?? "#8b8778",
        description: c.description,
        power: c.power,
        costInk: p.inkCost,
        recoil: c.recoil,
        debt: c.debt,
        successChance: Math.round(c.successChance * 100),
        familiarity: Math.round(p.familiarity * 100),
        affinity: p.affinity,
        inkAvailable: p.inkAvailable,
        priorAttempts: p.priorAttempts,
        priorSuccess: p.priorSuccess,
        /** the honest verdict the bench gives, in words */
        verdict: verdictFor(c.successChance, c.recoil, p.inkAvailable, p.inkCost),
      };
    }),

  /** Commit. Success or failure, the journal gets a page. */
  run: base
    .input(z.object({ saveId: z.number() }).and(selection))
    .handler(async ({ input }) => {
      const r = await runResearch({
        saveId: input.saveId,
        vectorId: input.vectorId,
        shapeId: input.shapeId,
        modifiers: input.modifiers,
      });
      return {
        success: r.success,
        roll: Math.round(r.roll * 100),
        chance: Math.round(r.chance * 100),
        name: r.composed.name,
        rank: r.composed.rank,
        description: r.composed.description,
        power: r.composed.power,
        /** the ink actually charged — the same number the preview quoted */
        costInk: r.inkSpent,
        recoil: r.composed.recoil,
        debt: r.composed.debt,
        skillId: r.skillId ?? null,
        note: r.note,
        inkSpent: r.inkSpent,
        stainGained: r.stainGained,
      };
    }),

  /** The library of workings that exist in the world, discoverable by name only. */
  library: base.handler(() =>
    SKILL_LIBRARY.map((t) => ({
      slug: t.slug,
      name: t.name,
      rank: t.rank,
      vector: t.vector,
      shape: t.shape,
      costInk: t.costInk,
      power: t.power,
      description: t.description,
      source: t.fromClass ? "Class" : t.obtain,
    })),
  ),

  /** Names of every modifier the player has ever touched, for the journal's index. */
  index: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const log = await db.select().from(s.researchLog).where(eq(s.researchLog.charId, state.character.id));
    const pairs = new Map<string, { vector: string; shape: string; modifiers: string[]; attempts: number; successes: number }>();
    for (const l of log) {
      const key = `${l.vector}|${l.shape}|${[...(l.modifiers ?? [])].sort().join(",")}`;
      const row = pairs.get(key) ?? { vector: l.vector, shape: l.shape, modifiers: l.modifiers ?? [], attempts: 0, successes: 0 };
      row.attempts += 1;
      if (l.success) row.successes += 1;
      pairs.set(key, row);
    }
    return [...pairs.values()]
      .map((p) => ({
        ...p,
        vectorName: vector(p.vector).name,
        shapeName: shape(p.shape).name,
        modifierNames: p.modifiers.map((m) => modifier(m)?.name ?? m),
      }))
      .sort((a, b) => b.attempts - a.attempts);
  }),
};

function verdictFor(chance: number, recoil: number, inkAvailable: number, inkCost: number): string {
  if (inkCost > inkAvailable) return "You do not have the ink for this.";
  const parts: string[] = [];
  if (chance > 0.75) parts.push("The instruction wants to hold.");
  else if (chance > 0.5) parts.push("It is a fair bet.");
  else if (chance > 0.3) parts.push("It will probably refuse you.");
  else parts.push("This is a hypothesis, not a working.");
  if (recoil >= 4) parts.push("The Recoil will mark you.");
  else if (recoil >= 2) parts.push("Expect Recoil.");
  if (inkCost * 3 > inkAvailable) parts.push("It will cost you most of what you have.");
  return parts.join(" ");
}
