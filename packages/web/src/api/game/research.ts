import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";
import { getClass } from "../world/classes";
import { composeSkill, familiarityFor, modifier, shape, vector } from "../world/skills";
import { addEvent } from "./state";

/**
 * THE RESEARCH BENCH.
 *
 * Pure combinatorics with an honest dice roll, and a journal that remembers
 * everything — including failures. This is the "scientist" loop: components in,
 * a hypothesis out, and a written record you can read back and improve on.
 */

export interface ResearchRequest {
  saveId: number;
  vectorId: string;
  shapeId: string;
  modifiers: string[];
  /** optional: spend a research aid to improve the roll */
  useInk?: number;
}

export interface ResearchResult {
  success: boolean;
  roll: number;
  chance: number;
  composed: ReturnType<typeof composeSkill>;
  skillId?: number;
  note: string;
  inkSpent: number;
  stainGained: number;
}

export async function runResearch(req: ResearchRequest): Promise<ResearchResult> {
  const [save] = await db.select().from(s.saves).where(eq(s.saves.id, req.saveId));
  if (!save) throw new Error("no save");
  const [char] = await db.select().from(s.characters).where(eq(s.characters.saveId, req.saveId));
  if (!char) throw new Error("no character");

  const cls = getClass(char.classId);
  const mods = req.modifiers.filter((m) => modifier(m)).slice(0, 3);

  const log = await db
    .select()
    .from(s.researchLog)
    .where(eq(s.researchLog.charId, char.id))
    .orderBy(desc(s.researchLog.id))
    .limit(200);

  const familiarity = familiarityFor(log, req.vectorId, req.shapeId, mods);
  const insight = (char.int + char.wis) / 2;

  // class affinity: a bonus for reading your own vectors
  const affinity = cls.affinities.includes(req.vectorId) ? 1.12 : 1;
  const researchBonus = cls.researchBonus * affinity;

  const composed = composeSkill({
    vectorId: req.vectorId,
    shapeId: req.shapeId,
    modifiers: mods,
    insight,
    level: char.level,
    familiarity,
    researchBonus,
    fortune: char.luk,
  });

  const inkSpent = Math.min(char.ink, Math.max(1, Math.ceil(composed.costInk / 2)));
  const roll = Math.random();
  const success = roll <= composed.successChance;

  let skillId: number | undefined;
  let note = "";

  if (success) {
    const [row] = await db
      .insert(s.characterSkills)
      .values({
        charId: char.id,
        slug: `res-${req.vectorId}-${req.shapeId}-${mods.join("-")}-${Date.now()}`,
        name: composed.name,
        rank: composed.rank,
        vector: req.vectorId,
        shape: req.shapeId,
        modifiers: mods,
        costInk: composed.costInk,
        power: composed.power,
        recoil: composed.recoil,
        description: composed.description,
        source: "research",
        mastery: 0,
      })
      .returning();
    skillId = row.id;
    note = `The working held. ${vector(req.vectorId).name} shaped as ${shape(req.shapeId).name} — ranked ${composed.rank}.`;
  } else {
    note =
      roll > 0.92
        ? "The ink took the instruction and gave it back wrong. Something in the room is now slightly different and you cannot say how."
        : "The instruction would not hold. The ink ran out of the shape and pooled on the floor, and the floor is a little colder for it.";
  }

  await db.insert(s.researchLog).values({
    charId: char.id,
    vector: req.vectorId,
    shape: req.shapeId,
    modifiers: mods,
    success,
    resultName: success ? composed.name : null,
    resultRank: success ? composed.rank : null,
    note,
    turn: save.turn,
  });

  const stainGained = success ? (composed.recoil > 5 ? 1 : 0) : 1;
  await db
    .update(s.characters)
    .set({
      ink: Math.max(0, char.ink - inkSpent),
      stain: char.stain + stainGained,
      debt: char.debt + composed.debt,
    })
    .where(eq(s.characters.id, char.id));

  await addEvent(
    req.saveId,
    save.turn,
    "magic",
    success
      ? `Inscribed a new working at the bench: ${composed.name} (${composed.rank})`
      : `A research attempt failed: ${vector(req.vectorId).name} / ${shape(req.shapeId).name}`,
    { locationId: char.locationId },
  );

  return {
    success,
    roll,
    chance: composed.successChance,
    composed,
    skillId,
    note,
    inkSpent,
    stainGained,
  };
}

/** What the bench shows before the player commits: odds, cost, and what they already know. */
export async function previewResearch(req: Omit<ResearchRequest, "useInk">) {
  const [char] = await db.select().from(s.characters).where(eq(s.characters.saveId, req.saveId));
  if (!char) throw new Error("no character");
  const cls = getClass(char.classId);
  const mods = req.modifiers.filter((m) => modifier(m)).slice(0, 3);
  const log = await db
    .select()
    .from(s.researchLog)
    .where(eq(s.researchLog.charId, char.id))
    .orderBy(desc(s.researchLog.id))
    .limit(200);
  const familiarity = familiarityFor(log, req.vectorId, req.shapeId, mods);
  const affinity = cls.affinities.includes(req.vectorId) ? 1.12 : 1;
  const composed = composeSkill({
    vectorId: req.vectorId,
    shapeId: req.shapeId,
    modifiers: mods,
    insight: (char.int + char.wis) / 2,
    level: char.level,
    familiarity,
    researchBonus: cls.researchBonus * affinity,
    fortune: char.luk,
  });
  const priorAttempts = log.filter(
    (l) =>
      l.vector === req.vectorId &&
      l.shape === req.shapeId &&
      [...(l.modifiers ?? [])].sort().join(",") === [...mods].sort().join(","),
  );
  return {
    composed,
    familiarity,
    affinity: cls.affinities.includes(req.vectorId),
    inkAvailable: char.ink,
    inkCost: Math.min(char.ink, Math.max(1, Math.ceil(composed.costInk / 2))),
    priorAttempts: priorAttempts.length,
    priorSuccess: priorAttempts.some((p) => p.success),
  };
}
