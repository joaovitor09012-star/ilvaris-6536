import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";
import { base } from "../__core/app";
import { loadGame } from "../game/state";
import { eventViews, arcViews } from "../game/view";
import { getLocation } from "../world/map";

/**
 * THE CHRONICLE.
 *
 * Causality is the engine's spine: every event cites the event that caused it,
 * and this screen shows that chain. Nothing here was rolled on a random table —
 * if the ledger cannot name a cause, the director was not allowed to introduce
 * the event in the first place.
 */
export const chronicle = {
  timeline: base
    .input(z.object({ saveId: z.number(), limit: z.number().int().min(1).max(400).default(160) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const events = eventViews(state, input.limit);

      const byKind = new Map<string, number>();
      for (const e of state.events) byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + 1);

      return {
        events,
        chapters: groupByChapter(state),
        kinds: [...byKind.entries()].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count),
        counts: {
          events: state.events.length,
          scenes: state.scenes.length,
          turns: state.save.turn,
          chapter: state.save.chapter,
        },
        /** what the world is currently asking of the player */
        openThreads: state.threads.filter((t) => t.state === "open" || t.state === "fraying").map((t) => ({ name: t.name, state: t.state, progress: t.progress })),
      };
    }),

  /** The arc board: global arcs, mined mini-arcs, clocks, and guns that have not gone off. */
  arcs: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const rumorBeliefs = await db.select().from(s.rumorBeliefs).where(eq(s.rumorBeliefs.saveId, input.saveId));
    return {
      arcs: arcViews(state),
      clocks: state.clocks.map((k) => ({
        id: k.id,
        arcId: k.arcId,
        name: k.name,
        ticks: k.ticks,
        maxTicks: k.maxTicks,
        pct: Math.min(100, Math.round((k.ticks / k.maxTicks) * 100)),
        consequence: k.consequence,
        status: k.status,
      })),
      guns: state.guns.map((g) => ({
        id: g.id,
        fact: g.fact,
        introducedTurn: g.introducedTurn,
        fired: g.fired,
        retired: g.retired,
      })),
      rumours: state.rumors
        .slice()
        .sort((a, b) => b.id - a.id)
        .map((r) => ({
          id: r.id,
          text: r.text,
          isTrue: r.isTrue,
          spread: r.spread,
          turn: r.createdAtTurn,
          believedBy: rumorBeliefs
            .filter((b) => b.rumorId === r.id && b.believes)
            .map((b) => state.npcs.find((n) => n.npcId === b.npcId)?.name ?? b.npcId),
        })),
      pressure: {
        value: state.save.pressure,
        mode: state.save.mode,
        pressureStreak: state.save.pressureStreak,
        breathStreak: state.save.breathStreak,
      },
    };
  }),

  /** One chapter, in order, as a reader would meet it. */
  chapter: base
    .input(z.object({ saveId: z.number(), chapter: z.number().int().min(1) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const scenes = state.scenes
        .filter((sc) => sc.chapter === input.chapter)
        .sort((a, b) => a.turn - b.turn)
        .map((sc) => ({
          id: sc.id,
          turn: sc.turn,
          type: sc.type,
          title: sc.title,
          locationId: sc.locationId,
          locationName: getLocation(sc.locationId)?.name ?? sc.locationId,
          playerInput: sc.playerInput,
          prose: sc.prose,
          createdAt: sc.createdAt,
        }));
      const events = eventViews(state, 400).filter((e) => scenes.some((sc) => sc.turn === e.turn));
      return {
        chapter: input.chapter,
        scenes,
        events,
        words: scenes.reduce((a, sc) => a + sc.prose.split(/\s+/).length, 0),
      };
    }),
};

function groupByChapter(state: Awaited<ReturnType<typeof loadGame>>) {
  const byChapter = new Map<number, { chapter: number; scenes: number; turns: number[]; types: Record<string, number>; title: string; firstTurn: number }>();
  for (const sc of state.scenes) {
    const row = byChapter.get(sc.chapter) ?? {
      chapter: sc.chapter,
      scenes: 0,
      turns: [],
      types: {} as Record<string, number>,
      title: sc.title,
      firstTurn: sc.turn,
    };
    row.scenes += 1;
    row.turns.push(sc.turn);
    row.types[sc.type] = (row.types[sc.type] ?? 0) + 1;
    byChapter.set(sc.chapter, row);
  }
  return [...byChapter.values()].sort((a, b) => b.chapter - a.chapter).map((c) => ({
    ...c,
    turns: [...new Set(c.turns)].sort((a, b) => a - b),
  }));
}
