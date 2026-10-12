import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame, renownOf } from "../game/state";
import { allocatePoints, deriveStanding, characterSummary } from "../game/progress";
import { systemWindow, skillView } from "../game/view";
import { getClass, CLASSES, STAT_GAIN_PER_LEVEL } from "../world/classes";
import { STAT_KEYS, RANKS, RANK_LABEL, RANK_COLOR } from "../world/ranks";
import { getSkillTemplate } from "../world/skills";

const allocation = z.object({
  str: z.number().int().min(0).max(99).optional(),
  agi: z.number().int().min(0).max(99).optional(),
  vit: z.number().int().min(0).max(99).optional(),
  int: z.number().int().min(0).max(99).optional(),
  wis: z.number().int().min(0).max(99).optional(),
  cha: z.number().int().min(0).max(99).optional(),
  luk: z.number().int().min(0).max(99).optional(),
});

export const codex = {
  /** The Codex screen: who the player is, what they can do, and what is next. */
  get: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const cls = getClass(state.character.classId);
    const owned = new Set(state.skills.map((k) => k.slug));
    return {
      system: systemWindow(state),
      summary: characterSummary(state.character),
      character: {
        id: state.character.id,
        name: state.character.name,
        pronouns: state.character.pronouns,
        appearance: state.character.appearance,
        portraitKey: state.character.portraitKey,
        classId: cls.id,
        className: cls.name,
        epithet: cls.epithet,
        tagline: cls.tagline,
        playstyle: cls.playstyle,
        grindLoop: cls.grindLoop,
        difficulty: cls.difficulty,
        mainStats: cls.mainStats,
        affinities: cls.affinities,
        researchBonus: cls.researchBonus,
      },
      progression: {
        statGainPerLevel: STAT_GAIN_PER_LEVEL,
        note: `Each level: +${STAT_GAIN_PER_LEVEL.main} to ${cls.mainStats.join(" and ")}, +${STAT_GAIN_PER_LEVEL.free} free points.`,
      },
      skills: state.skills
        .map(skillView)
        .sort((a, b) => RANKS.indexOf(b.rank as (typeof RANKS)[number]) - RANKS.indexOf(a.rank as (typeof RANKS)[number]) || b.power - a.power),
      /** what the class table still owes the player */
      pending: cls.skillTable
        .filter((u) => u.level > state.character.level)
        .map((u) => {
          const tpl = getSkillTemplate(u.slug);
          return { level: u.level, slug: u.slug, name: tpl?.name ?? u.slug, rank: tpl?.rank ?? "F", owned: owned.has(u.slug) };
        }),
      statKeys: STAT_KEYS,
      rankLabels: RANK_LABEL,
      rankColors: RANK_COLOR,
    };
  }),

  /** Spend free points. Never allows over-spending. */
  allocate: base
    .input(z.object({ saveId: z.number(), allocation }))
    .handler(async ({ input }) => {
      const [char] = await db.select().from(s.characters).where(eq(s.characters.saveId, input.saveId));
      if (!char) throw new ORPCError("NOT_FOUND", { message: "No character in that save" });
      const total = Object.values(input.allocation).reduce((a, b) => a + (b ?? 0), 0);
      if (total > char.freePoints)
        throw new ORPCError("BAD_REQUEST", {
          message: `Only ${char.freePoints} free point${char.freePoints === 1 ? "" : "s"} remain.`,
        });
      if (total === 0) throw new ORPCError("BAD_REQUEST", { message: "No points allocated." });
      const updated = await allocatePoints(char.id, input.allocation);
      return { character: updated, system: systemWindow(await loadGame(input.saveId)) };
    }),

  /** Equip / unequip a working. Equipped workings are what the narrator may use freely. */
  equip: base
    .input(z.object({ saveId: z.number(), skillId: z.number(), equipped: z.boolean() }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const owned = state.skills.find((k) => k.id === input.skillId);
      if (!owned) throw new ORPCError("NOT_FOUND", { message: "Not your working." });
      if (input.equipped) {
        const equippedCount = state.skills.filter((k) => k.equipped).length;
        const cap = 4 + Math.floor(state.character.level / 5);
        if (equippedCount >= cap)
          throw new ORPCError("BAD_REQUEST", { message: `You can hold ${cap} workings ready at once.` });
      }
      await db.update(s.characterSkills).set({ equipped: input.equipped }).where(eq(s.characterSkills.id, input.skillId));
      return { ok: true };
    }),

  /** Rename the player character, or rewrite their appearance seed (also re-seeds the portrait). */
  update: base
    .input(
      z.object({
        saveId: z.number(),
        name: z.string().min(1).max(48).optional(),
        pronouns: z.string().max(24).optional(),
        appearance: z.string().max(600).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { saveId, ...patch } = input;
      if (Object.keys(patch).length === 0) return { ok: true };
      await db.update(s.characters).set(patch).where(eq(s.characters.saveId, saveId));
      return { ok: true };
    }),

  /** Every class, for the creation screen and for the "what could I have been" page. */
  classes: base.handler(() => CLASSES),

  /**
   * Standing, recomputed from level and the renown the world has actually
   * watched you earn. Renown is never taken from the caller — it is counted
   * from resolved threads and closed arcs, which is the same number the turn
   * loop uses.
   */
  standing: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const renown = renownOf(state);
    const standing = deriveStanding(state.character.level, renown);
    await db.update(s.characters).set({ standing }).where(eq(s.characters.id, state.character.id));
    return { standing, renown };
  }),
};
