import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame, addEvent } from "../game/state";
import { bestiaryViews } from "../game/view";
import { MONSTERS, getMonster } from "../world/monsters";
import { RANKS, RANK_LABEL, RANK_COLOR, xpForRank, type Rank } from "../world/ranks";
import { getItem, formatCoin } from "../world/items";
import { bountyFor } from "../world/economy";
import { getLocation } from "../world/map";

/**
 * THE BESTIARY.
 *
 * F–SSS, and honest about it. What the player has killed they know; what they
 * have *studied* they understand. Studying costs a scene and buys the entry's
 * second half — the part that keeps people alive.
 */
export const bestiary = {
  get: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const rows = bestiaryViews(state);
    const here = state.character.locationId;

    const entries = rows.map((r) => ({
      ...r,
      rankLabel: RANK_LABEL[r.rank as Rank] ?? r.rank,
      rankColor: RANK_COLOR[r.rank as Rank] ?? "#8b8778",
      bounty: bountyFor(r.rank),
      bountyLabel: formatCoin(bountyFor(r.rank)),
      xpIfKilled: xpForRank(r.rank as Rank, state.character.level),
      drops: r.drops.map((d) => ({
        name: getItem(d.itemId)?.name ?? d.itemId,
        rank: getItem(d.itemId)?.rank ?? "F",
        chance: d.chance,
      })),
      here: r.habitat.includes(here),
    }));

    /** what is in the room the player is standing in, whether or not they have met it */
    const presentHere = MONSTERS.filter((m) => m.habitat.includes(here)).map((m) => ({
      id: m.id,
      name: m.name,
      rank: m.rank,
      level: m.level,
      engagement: m.engagement,
      known: rows.some((r) => r.monsterId === m.id),
    }));

    return {
      entries,
      presentHere,
      here: { id: here, name: getLocation(here)?.name ?? here },
      counts: {
        discovered: rows.length,
        total: MONSTERS.length,
        studied: rows.filter((r) => r.studied).length,
        kills: rows.reduce((a, r) => a + r.kills, 0),
        custom: rows.filter((r) => r.custom).length,
      },
      ranks: RANKS.map((r) => ({ rank: r, label: RANK_LABEL[r], color: RANK_COLOR[r], bounty: bountyFor(r), bountyLabel: formatCoin(bountyFor(r)) })),
    };
  }),

  /** Study a creature. Costs a scene's worth of ink, and halves what it can surprise you with. */
  study: base
    .input(z.object({ saveId: z.number(), monsterId: z.string() }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const char = state.character;
      const row = state.bestiary.find((b) => b.monsterId === input.monsterId);
      if (!row) throw new ORPCError("BAD_REQUEST", { message: "You have never seen that thing." });
      if (row.studied) throw new ORPCError("BAD_REQUEST", { message: "You have already studied it." });
      const cost = 1;
      if (char.ink < cost) throw new ORPCError("BAD_REQUEST", { message: "Not enough ink to make notes." });

      await db.update(s.bestiary).set({ studied: true }).where(eq(s.bestiary.id, row.id));
      await db.update(s.characters).set({ ink: char.ink - cost }).where(eq(s.characters.id, char.id));

      const t = getMonster(input.monsterId);
      const body = row.custom?.lore ?? t?.studied ?? t?.lore ?? "";
      await addEvent(input.saveId, state.save.turn, "study", `Studied ${t?.name ?? row.custom?.name ?? input.monsterId} in the field`, {
        locationId: char.locationId,
      });
      return { studied: true, name: t?.name ?? row.custom?.name ?? input.monsterId, body, ink: char.ink - cost };
    }),
};
