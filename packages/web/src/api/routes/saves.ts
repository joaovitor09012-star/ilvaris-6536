import { z } from "zod";
import { and, desc, eq, ne } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame } from "../game/state";
import { createGame, OPENING_SCENE } from "../game/seed";
import { systemWindow, skillView, inventoryView, threadView, npcView, arcViews } from "../game/view";
import { getClass, CLASSES } from "../world/classes";
import { getLocation } from "../world/map";
import { RANKS } from "../world/ranks";
import { getSkillTemplate } from "../world/skills";

const proseVoice = z.enum(["literary", "lean", "lush"]);
const pacing = z.enum(["slow", "standard", "fast"]);

export const saves = {
  /* ── the shelf ───────────────────────────────────────────── */
  list: base.handler(async () => {
    const rows = await db.select().from(s.saves).orderBy(desc(s.saves.updatedAt));
    const out = [];
    for (const row of rows) {
      const [char] = await db.select().from(s.characters).where(eq(s.characters.saveId, row.id));
      const [latest] = await db
        .select()
        .from(s.scenes)
        .where(eq(s.scenes.saveId, row.id))
        .orderBy(desc(s.scenes.id))
        .limit(1);
      const [arc] = await db
        .select({ name: s.arcs.name, summary: s.arcs.summary, state: s.arcs.state })
        .from(s.arcs)
        .where(and(eq(s.arcs.saveId, row.id), ne(s.arcs.state, "closed")))
        .orderBy(desc(s.arcs.id))
        .limit(1);
      const openArc = arc ?? null;
      out.push({
        id: row.id,
        name: row.name,
        turn: row.turn,
        chapter: row.chapter,
        day: row.day,
        mode: row.mode,
        updatedAt: row.updatedAt,
        character: char
          ? {
              name: char.name,
              level: char.level,
              classId: char.classId,
              className: getClass(char.classId).name,
              standing: char.standing,
              locationId: char.locationId,
              locationName: getLocation(char.locationId)?.name ?? char.locationId,
            }
          : null,
        lastScene: latest ? { title: latest.title, type: latest.type, turn: latest.turn } : null,
        currentArc: openArc ? { name: openArc.name, summary: openArc.summary } : null,
      });
    }
    return out;
  }),

  /* ── character creation options ──────────────────────────── */
  options: base.handler(() => ({
    classes: CLASSES.map((c) => ({
      id: c.id,
      name: c.name,
      epithet: c.epithet,
      tagline: c.tagline,
      mainStats: c.mainStats,
      baseStats: c.baseStats,
      affinities: c.affinities,
      researchBonus: c.researchBonus,
      playstyle: c.playstyle,
      grindLoop: c.grindLoop,
      difficulty: c.difficulty,
      startingSkills: c.startingSkills.map((slug) => ({ slug, name: getSkillTemplate(slug)?.name ?? slug.replace(/-/g, " ") })),
      skillTable: c.skillTable.map((u) => ({ ...u, name: getSkillTemplate(u.slug)?.name ?? u.slug.replace(/-/g, " ") })),
    })),
    ranks: RANKS,
  })),

  /* ── create ──────────────────────────────────────────────── */
  create: base
    .input(
      z.object({
        name: z.string().min(1).max(48),
        pronouns: z.string().min(1).max(24).default("he/him"),
        classId: z.string(),
        appearance: z.string().max(600).default(""),
        saveName: z.string().max(80).optional(),
        pacing: pacing.default("standard"),
        proseVoice: proseVoice.default("literary"),
      }),
    )
    .handler(async ({ input }) => {
      if (!CLASSES.some((c) => c.id === input.classId)) throw new ORPCError("BAD_REQUEST", { message: "No such class" });
      const saveId = await createGame(input);
      return { saveId, opening: OPENING_SCENE };
    }),

  /* ── the whole session, one payload ──────────────────────── */
  session: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const cls = getClass(state.character.classId);
    const loc = getLocation(state.character.locationId);
    return {
      save: {
        id: state.save.id,
        name: state.save.name,
        turn: state.save.turn,
        chapter: state.save.chapter,
        day: state.save.day,
        season: state.save.season,
        mode: state.save.mode,
        pressure: state.save.pressure,
        pacing: state.save.pacing,
        proseVoice: state.save.proseVoice,
        directorModel: state.save.directorModel,
        narratorModel: state.save.narratorModel,
      },
      character: {
        id: state.character.id,
        name: state.character.name,
        pronouns: state.character.pronouns,
        classId: state.character.classId,
        className: cls.name,
        classEpithet: cls.epithet,
        appearance: state.character.appearance,
        portraitKey: state.character.portraitKey,
        covenantMark: state.character.covenantMark,
      },
      system: systemWindow(state),
      location: loc
        ? {
            id: loc.id,
            name: loc.name,
            region: loc.region,
            kind: loc.kind,
            danger: loc.danger,
            description: loc.description,
            services: loc.services ?? [],
            minLevel: loc.minLevel,
          }
        : null,
      skills: state.skills.map(skillView).sort((a, b) => b.power - a.power),
      inventory: state.inventory.map(inventoryView),
      threads: state.threads.map((t) => threadView(state, t)),
      npcs: state.npcs.filter((n) => n.met).map((n) => npcView(state, n)),
      arcs: arcViews(state),
      guns: state.guns.filter((g) => !g.fired && !g.retired).map((g) => ({ id: g.id, fact: g.fact, turn: g.introducedTurn })),
      rumours: state.rumors.slice().sort((a, b) => b.id - a.id).slice(0, 30).map((r) => ({ id: r.id, text: r.text, isTrue: r.isTrue, spread: r.spread })),
      recentScenes: state.scenes
        .slice()
        .sort((a, b) => a.id - b.id)
        .slice(-14)
        .map((sc) => ({
          id: sc.id,
          turn: sc.turn,
          chapter: sc.chapter,
          type: sc.type,
          title: sc.title,
          locationId: sc.locationId,
          locationName: getLocation(sc.locationId)?.name ?? sc.locationId,
          playerInput: sc.playerInput,
          prose: sc.prose,
        })),
    };
  }),

  /* ── settings ────────────────────────────────────────────── */
  updateSettings: base
    .input(
      z.object({
        saveId: z.number(),
        pacing: pacing.optional(),
        proseVoice: proseVoice.optional(),
        directorModel: z.string().max(80).optional(),
        narratorModel: z.string().max(80).optional(),
        name: z.string().max(80).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { saveId, ...patch } = input;
      await db.update(s.saves).set({ ...patch, updatedAt: new Date() }).where(eq(s.saves.id, saveId));
      const [row] = await db.select().from(s.saves).where(eq(s.saves.id, saveId));
      return row;
    }),

  delete: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const id = input.saveId;
    const [char] = await db.select().from(s.characters).where(eq(s.characters.saveId, id));
    if (char) {
      await db.delete(s.characterSkills).where(eq(s.characterSkills.charId, char.id));
      await db.delete(s.researchLog).where(eq(s.researchLog.charId, char.id));
    }
    await db.delete(s.characters).where(eq(s.characters.saveId, id));
    await db.delete(s.inventory).where(eq(s.inventory.saveId, id));
    await db.delete(s.prices).where(eq(s.prices.saveId, id));
    await db.delete(s.transactions).where(eq(s.transactions.saveId, id));
    await db.delete(s.mapReveal).where(eq(s.mapReveal.saveId, id));
    await db.delete(s.bestiary).where(eq(s.bestiary.saveId, id));
    await db.delete(s.loreUnlocked).where(eq(s.loreUnlocked.saveId, id));
    await db.delete(s.npcs).where(eq(s.npcs.saveId, id));
    await db.delete(s.npcFacts).where(eq(s.npcFacts.saveId, id));
    await db.delete(s.npcBeliefs).where(eq(s.npcBeliefs.saveId, id));
    await db.delete(s.npcRelations).where(eq(s.npcRelations.saveId, id));
    await db.delete(s.npcGoals).where(eq(s.npcGoals.saveId, id));
    await db.delete(s.npcSecrets).where(eq(s.npcSecrets.saveId, id));
    await db.delete(s.threads).where(eq(s.threads.saveId, id));
    await db.delete(s.scenes).where(eq(s.scenes.saveId, id));
    await db.delete(s.events).where(eq(s.events.saveId, id));
    await db.delete(s.arcs).where(eq(s.arcs.saveId, id));
    await db.delete(s.clocks).where(eq(s.clocks.saveId, id));
    await db.delete(s.unfiredGuns).where(eq(s.unfiredGuns.saveId, id));
    await db.delete(s.rumors).where(eq(s.rumors.saveId, id));
    await db.delete(s.rumorBeliefs).where(eq(s.rumorBeliefs.saveId, id));
    await db.delete(s.portraits).where(eq(s.portraits.saveId, id));
    await db.delete(s.saves).where(eq(s.saves.id, id));
    return { ok: true };
  }),
};
