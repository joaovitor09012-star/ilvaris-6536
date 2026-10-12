import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame, revealLore, addEvent } from "../game/state";
import { LORE, getLore, LORE_CATEGORY_LABEL, type LoreCategory } from "../world/lore";
import { GLOBAL_ARCS, MINER_QUERIES, MINI_ARC_SHAPES } from "../world/arcs";
import { LOCATIONS } from "../world/map";

/**
 * THE WORLD — the bible, as fog of war.
 *
 * Every entry is gated. The player never sees an unread page's contents, and the
 * API never sends them: an entry that has not unlocked is returned as a title
 * and a condition, nothing more. This is the same discipline as the map.
 */
export const world = {
  lore: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const unlocked = new Map(state.lore.map((l) => [l.loreId, l.turn]));

    const entries = LORE.map((e) => {
      const turn = unlocked.get(e.id);
      const isOpen = turn !== undefined;
      return {
        id: e.id,
        category: e.category,
        categoryLabel: LORE_CATEGORY_LABEL[e.category],
        title: e.title,
        /** the body is only ever sent when the player has earned it */
        body: isOpen ? e.body : "",
        unlocked: isOpen,
        turn: turn ?? null,
        /** what would unlock it, phrased for the player */
        hint: isOpen ? "" : describeUnlock(e.unlock),
      };
    });

    const byCategory = new Map<LoreCategory, { open: number; total: number }>();
    for (const e of entries) {
      const row = byCategory.get(e.category) ?? { open: 0, total: 0 };
      row.total += 1;
      if (e.unlocked) row.open += 1;
      byCategory.set(e.category, row);
    }

    return {
      entries: entries.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title)),
      categories: [...byCategory.entries()].map(([category, counts]) => ({
        category,
        label: LORE_CATEGORY_LABEL[category],
        ...counts,
      })),
      counts: {
        open: entries.filter((e) => e.unlocked).length,
        total: entries.length,
      },
    };
  }),

  /** Read a page the player has unlocked. Reading is free; it is the unlocking that costs. */
  page: base
    .input(z.object({ saveId: z.number(), loreId: z.string() }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const open = state.lore.find((l) => l.loreId === input.loreId);
      if (!open) throw new ORPCError("FORBIDDEN", { message: "You have not learned this yet." });
      const e = getLore(input.loreId);
      if (!e) throw new ORPCError("NOT_FOUND", { message: "No such page." });
      return { id: e.id, category: e.category, title: e.title, body: e.body, turn: open.turn };
    }),

  /** The six global arcs — structural, and visible as soon as the player is inside one. */
  arcs: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const open = new Set(state.arcs.filter((a) => a.state !== "closed").map((a) => a.arcId));
    const closed = new Set(state.arcs.filter((a) => a.state === "closed").map((a) => a.arcId));
    return {
      global: GLOBAL_ARCS.map((g) => {
        const mine = state.arcs.find((a) => a.arcId === g.id);
        const known = open.has(g.id) || closed.has(g.id);
        return {
          id: g.id,
          name: g.name,
          chapters: g.chapters,
          /** the premise is only sent once the arc has touched the player */
          premise: known ? g.premise : "",
          theme: known ? g.theme : "",
          stages: known ? g.stages : [],
          clocks: known ? g.clocks : [],
          exits: known ? g.exits : [],
          scarIfIgnored: known ? g.scarIfIgnored : "",
          opensWhen: known ? g.opensWhen : "",
          state: mine?.state ?? "dormant",
          enteredTurn: mine?.enteredTurn ?? null,
          closedTurn: mine?.closedTurn ?? null,
        };
      }),
      running: state.arcs
        .filter((a) => a.state !== "closed")
        .map((a) => ({ id: a.id, arcId: a.arcId, name: a.name, kind: a.kind, state: a.state, pressure: a.pressure, summary: a.summary })),
      /** the miner's query list, shown to the player as "what the world is asking" */
      questions: MINER_QUERIES.map((q) => ({ id: q.id, label: q.label, rule: q.rule, yields: q.yields })),
      shapes: MINI_ARC_SHAPES.map((sh) => ({ id: sh.id, name: sh.name, shape: sh.shape })),
    };
  }),

  /** Geography as the player understands it — regions, not coordinates. */
  atlas: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const known = new Set(state.mapReveal.map((r) => r.locationId));
    const regions = new Map<string, { region: string; known: number; total: number; places: { id: string; name: string; known: boolean; danger: number }[] }>();
    for (const l of LOCATIONS) {
      const row = regions.get(l.region) ?? { region: l.region, known: 0, total: 0, places: [] };
      row.total += 1;
      if (known.has(l.id)) row.known += 1;
      row.places.push({ id: l.id, name: l.name, known: known.has(l.id), danger: l.danger });
      regions.set(l.region, row);
    }
    return [...regions.values()].map((r) => ({
      ...r,
      places: r.places.filter((p) => p.known),
    }));
  }),

  /** A tutor or a library can hand over a page — for a price. */
  buyLore: base
    .input(z.object({ saveId: z.number(), loreId: z.string(), price: z.number().int().min(0).max(10_000_000) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const e = getLore(input.loreId);
      if (!e) throw new ORPCError("NOT_FOUND", { message: "No such page." });
      if (state.lore.some((l) => l.loreId === input.loreId))
        throw new ORPCError("BAD_REQUEST", { message: "You already have that page." });
      if (state.character.coin < input.price)
        throw new ORPCError("BAD_REQUEST", { message: `That page costs ${input.price} shards.` });
      await db.update(s.characters).set({ coin: state.character.coin - input.price }).where(eq(s.characters.id, state.character.id));
      await revealLore(input.saveId, input.loreId, state.save.turn);
      await addEvent(input.saveId, state.save.turn, "study", `Acquired the page "${e.title}"`, { locationId: state.character.locationId });
      return { ok: true, title: e.title, body: e.body };
    }),
};

function describeUnlock(u: (typeof LORE)[number]["unlock"]): string {
  switch (u.kind) {
    case "start":
      return "known from the beginning";
    case "location":
      return `visit ${LOCATIONS.find((l) => l.id === u.id)?.name ?? u.id}`;
    case "npc":
      return "meet someone who knows";
    case "level":
      return `reach level ${u.value}`;
    case "research":
      return `work with ${u.vector}`;
    case "arc":
      return "follow that thread to its end";
    case "faction":
      return "earn a faction's confidence";
    case "story":
      return u.note;
    default:
      return "earned in play";
  }
}
