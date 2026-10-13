import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame } from "../game/state";
import { threadView, npcView, isFateRevealed } from "../game/view";
import { THREADS, NPCS, getNpcTemplate } from "../world/npcs";
import { getLocation } from "../world/map";

/**
 * THE LEDGER OF PEOPLE.
 *
 * The Six Threads are the game's spine, but they are not a checklist: love,
 * enmity, severance and refusal all close a thread. What the player sees here is
 * only ever what the world has let them see — an NPC's private beliefs and
 * secrets are never sent, because the player has no way to know them.
 */
export const threads = {
  get: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const met = state.npcs.filter((n) => n.met);
    const threads = state.threads.map((t) => threadView(state, t));

    return {
      threads,
      met: met.map((n) => npcView(state, n)),
      /** people the player has heard of but never met — names only, and how they heard */
      rumoured: NPCS.filter((t) => !state.npcs.find((n) => n.npcId === t.id)?.met).map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        faction: t.faction,
        station: t.station,
        isThread: t.isThread,
        home: t.home,
        homeName: getLocation(t.home)?.name ?? t.home,
      })),
      counts: {
        open: threads.filter((t) => t.state === "open").length,
        fraying: threads.filter((t) => t.state === "fraying").length,
        resolved: threads.filter((t) => t.state === "resolved").length,
        severed: threads.filter((t) => t.state === "severed").length,
        revised: threads.filter((t) => t.state === "revised").length,
        met: met.length,
        cast: NPCS.length,
      },
      castSize: NPCS.length,
      threadCount: THREADS.length,
    };
  }),

  /** One person in full: what they have let slip, and what they are owed. */
  person: base
    .input(z.object({ saveId: z.number(), npcId: z.string() }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const row = state.npcs.find((n) => n.npcId === input.npcId);
      if (!row) throw new ORPCError("NOT_FOUND", { message: "No such person in this world." });
      const t = getNpcTemplate(input.npcId);
      const thread = state.threads.find((x) => x.npcId === input.npcId);
      return {
        ...npcView(state, row),
        goals: state.goals
          .filter((g) => g.npcId === input.npcId && !g.done)
          .map((g) => ({ goal: g.goal, horizon: g.horizon, done: g.done })),
        /** only goals they have stated aloud to the player */
        statedGoals: t?.goals.filter((g) => g.horizon === "short").map((g) => g.goal) ?? [],
        /** their register, so the narrator can be held to it */
        voice: t?.voice ?? row.voiceNote,
        thread: thread ? threadView(state, thread) : null,
        whereTheyAre: t?.home ?? "",
        whereTheyAreName: getLocation(t?.home ?? "")?.name ?? t?.home ?? "",
      };
    }),

  /** Rename an NPC's private register, or mark them revised — a Registry event, not a player one. */
  revise: base
    .input(
      z.object({
        saveId: z.number(),
        npcId: z.string(),
        voiceNote: z.string().max(400).optional(),
        alive: z.boolean().optional(),
        revised: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const row = state.npcs.find((n) => n.npcId === input.npcId);
      if (!row) throw new ORPCError("NOT_FOUND", { message: "No such person." });
      const patch: Partial<typeof s.npcs.$inferInsert> = {};
      if (input.voiceNote !== undefined) patch.voiceNote = input.voiceNote;
      if (input.alive !== undefined) patch.alive = input.alive;
      if (input.revised !== undefined) patch.revised = input.revised;
      if (Object.keys(patch).length) await db.update(s.npcs).set(patch).where(eq(s.npcs.id, row.id));
      return { ok: true };
    }),

  /** The Threads' fated endings, as written before play. Revealed only once the thread closes. */
  fates: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    return state.threads.map((t) => {
      const revealed = isFateRevealed(t);
      return {
        npcId: t.npcId,
        name: t.name,
        role: t.role,
        state: t.state,
        fate: revealed ? t.fate : "— not yet written into you",
        resolution: t.resolution,
      };
    });
  }),
};
