import { eq } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";
import { getClass, unlockedClassSkills, STAT_GAIN_PER_LEVEL } from "../world/classes";
import { xpCurve, type StatKey } from "../world/ranks";
import { getSkillTemplate } from "../world/skills";
import { formatCoin } from "../world/items";

/**
 * Progression law, engine-enforced:
 *   • each level: +1 to both class main stats, +3 free points
 *   • class skills unlock on the class's own table
 *   • everything else must be earned (research, study, drops, prizes, fate)
 */

export interface LevelUpResult {
  levelsGained: number;
  newLevel: number;
  freePoints: number;
  statGains: Partial<Record<StatKey, number>>;
  newSkills: string[];
  hpGain: number;
  inkGain: number;
}

export async function grantXp(charId: number, amount: number): Promise<LevelUpResult> {
  const [char] = await db.select().from(s.characters).where(eq(s.characters.id, charId));
  if (!char) throw new Error("no character");

  let xp = char.xp + amount;
  let level = char.level;
  let xpNext = char.xpNext;
  let free = char.freePoints;
  let hpMax = char.hpMax;
  let inkMax = char.inkMax;
  const statGains: Partial<Record<StatKey, number>> = {};
  const newSkills: string[] = [];
  let levelsGained = 0;

  const cls = getClass(char.classId);

  while (xp >= xpNext) {
    xp -= xpNext;
    level += 1;
    levelsGained += 1;
    xpNext = xpCurve(level);

    for (const stat of cls.mainStats) {
      statGains[stat] = (statGains[stat] ?? 0) + STAT_GAIN_PER_LEVEL.main;
    }
    free += STAT_GAIN_PER_LEVEL.free;
    hpMax += 6 + Math.round(cls.baseStats.vit / 3);
    inkMax += 2;

    for (const slug of unlockedClassSkills(char.classId, level)) {
      const existing = await db
        .select()
        .from(s.characterSkills)
        .where(eq(s.characterSkills.charId, charId));
      if (existing.some((e) => e.slug === slug)) continue;
      const tpl = getSkillTemplate(slug);
      if (!tpl) continue;
      await db.insert(s.characterSkills).values({
        charId,
        slug: tpl.slug,
        name: tpl.name,
        rank: tpl.rank,
        vector: tpl.vector,
        shape: tpl.shape,
        costInk: tpl.costInk,
        power: tpl.power,
        recoil: tpl.recoil,
        description: tpl.description,
        source: "class",
        mastery: 0,
      });
      newSkills.push(tpl.name);
    }
  }

  const patch: Partial<typeof s.characters.$inferInsert> = {
    xp,
    level,
    xpNext,
    freePoints: free,
    hpMax,
    inkMax,
    hp: Math.min(hpMax, char.hp + (hpMax - char.hpMax)),
    ink: Math.min(inkMax, char.ink + (inkMax - char.inkMax)),
  };
  for (const [k, v] of Object.entries(statGains)) {
    (patch as Record<string, number>)[k] = (char as unknown as Record<string, number>)[k] + (v ?? 0);
  }
  await db.update(s.characters).set(patch).where(eq(s.characters.id, charId));

  return {
    levelsGained,
    newLevel: level,
    freePoints: free,
    statGains,
    newSkills,
    hpGain: hpMax - char.hpMax,
    inkGain: inkMax - char.inkMax,
  };
}

/** Spend free points. Returns the new stat block. */
export async function allocatePoints(
  charId: number,
  allocation: Partial<Record<StatKey, number>>,
): Promise<typeof s.characters.$inferSelect> {
  const [char] = await db.select().from(s.characters).where(eq(s.characters.id, charId));
  if (!char) throw new Error("no character");
  const total = Object.values(allocation).reduce((a, b) => a + (b ?? 0), 0);
  if (total > char.freePoints) throw new Error("Not enough free points");
  const patch: Record<string, number> = { freePoints: char.freePoints - total };
  for (const [k, v] of Object.entries(allocation)) {
    if (!v) continue;
    patch[k] = (char as unknown as Record<string, number>)[k] + v;
  }
  // vitality raises HP and ink capacity
  if (allocation.vit) {
    patch.hpMax = char.hpMax + allocation.vit * 5;
    patch.hp = Math.min(patch.hpMax, char.hp + allocation.vit * 5);
    patch.inkMax = char.inkMax + allocation.vit;
  }
  if (allocation.int) {
    patch.inkMax = (patch.inkMax ?? char.inkMax) + allocation.int;
  }
  await db.update(s.characters).set(patch).where(eq(s.characters.id, charId));
  const [updated] = await db.select().from(s.characters).where(eq(s.characters.id, charId));
  return updated;
}

/** Effective stat: base + class affinity isn't a stat, so this is just the base plus level drift. */
export function effectiveStats(char: typeof s.characters.$inferSelect): Record<StatKey, number> {
  return {
    str: char.str,
    agi: char.agi,
    vit: char.vit,
    int: char.int,
    wis: char.wis,
    cha: char.cha,
    luk: char.luk,
  };
}

/** Standing is derived from level, fame and academy reputation — recomputed, never hand-set. */
export function deriveStanding(level: number, renown: number): string {
  const score = level * 2 + renown;
  if (score > 120) return "Champion of the Ladder";
  if (score > 90) return "Named";
  if (score > 65) return "Fourth Year · Circled";
  if (score > 45) return "Third Year · Circled";
  if (score > 28) return "Second Year · Provisional Circle";
  if (score > 14) return "Second Year";
  if (score > 6) return "First Year";
  return "Provisional";
}

export function characterSummary(char: typeof s.characters.$inferSelect): string {
  return `${char.name} · Level ${char.level} · ${getClass(char.classId).name} · ${formatCoin(char.coin)}`;
}
