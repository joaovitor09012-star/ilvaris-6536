import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { generateImage } from "../agent/image";
import { portraitPrompt } from "../agent/prompts";
import { putObject, mediaUrl } from "../lib/s3";
import { getNpcTemplate } from "../world/npcs";
import { getClass } from "../world/classes";
import { loadGame } from "../game/state";

/**
 * PORTRAITS.
 *
 * Every face is drawn in the same hand: 2D Korean manhwa, cel-shaded, one
 * dramatic light. Images go straight to object storage and the client only ever
 * receives a stable `/api/media/...` path — never base64, never a presigned URL
 * that expires mid-session.
 */
export const media = {
  /** Generate (or regenerate) a portrait for a member of the cast. */
  npcPortrait: base
    .input(
      z.object({
        saveId: z.number(),
        npcId: z.string(),
        mood: z.string().max(120).optional(),
        regenerate: z.boolean().default(false),
      }),
    )
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const npcRow = state.npcs.find((n) => n.npcId === input.npcId);
      if (!npcRow) throw new ORPCError("NOT_FOUND", { message: "No such person in this world." });
      if (!npcRow.met) throw new ORPCError("FORBIDDEN", { message: "You have not met them yet." });

      if (!input.regenerate && npcRow.portraitKey) {
        return { key: npcRow.portraitKey, url: mediaUrl(npcRow.portraitKey), cached: true };
      }

      const t = getNpcTemplate(input.npcId);
      if (!t) throw new ORPCError("NOT_FOUND", { message: "No such person." });

      const prompt = portraitPrompt({
        name: t.name,
        role: `${t.role}. ${t.station}. ${t.faction}.`,
        appearance: t.appearance,
        allure: t.allure,
        mood: input.mood,
      });

      const key = await render(prompt, `portraits/${input.saveId}/npc/${input.npcId}`);
      await db.update(s.npcs).set({ portraitKey: key }).where(eq(s.npcs.id, npcRow.id));
      await db.insert(s.portraits).values({
        saveId: input.saveId,
        ownerType: "npc",
        ownerId: input.npcId,
        prompt,
        key,
      });
      return { key, url: mediaUrl(key), cached: false };
    }),

  /** The player's own portrait, drawn from the appearance seed they wrote at creation. */
  playerPortrait: base
    .input(z.object({ saveId: z.number(), mood: z.string().max(120).optional(), regenerate: z.boolean().default(false) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const char = state.character;
      if (!input.regenerate && char.portraitKey) {
        return { key: char.portraitKey, url: mediaUrl(char.portraitKey), cached: true };
      }
      const cls = getClass(char.classId);
      const prompt = portraitPrompt({
        name: char.name,
        role: `${cls.name} — ${cls.epithet}. A student of the Vellum Athenaeum.`,
        appearance: char.appearance || cls.portraitSeed,
        allure: "pretty",
        mood: input.mood,
      });
      const key = await render(prompt, `portraits/${input.saveId}/player`);
      await db.update(s.characters).set({ portraitKey: key }).where(eq(s.characters.id, char.id));
      await db.insert(s.portraits).values({
        saveId: input.saveId,
        ownerType: "character",
        ownerId: String(char.id),
        prompt,
        key,
      });
      return { key, url: mediaUrl(key), cached: false };
    }),

  /** Every plate this save has generated. */
  gallery: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const rows = await db.select().from(s.portraits).where(eq(s.portraits.saveId, input.saveId));
    return rows
      .sort((a, b) => b.id - a.id)
      .map((r) => ({
        id: r.id,
        ownerType: r.ownerType,
        ownerId: r.ownerId,
        key: r.key,
        url: mediaUrl(r.key),
        createdAt: r.createdAt,
        name:
          r.ownerType === "npc"
            ? getNpcTemplate(r.ownerId)?.name ?? r.ownerId
            : "You",
      }));
  }),

  /** A plate of a place. Used on the Strata screen and in chapter dividers. */
  placePlate: base
    .input(z.object({ saveId: z.number(), locationId: z.string() }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const known = state.mapReveal.some((r) => r.locationId === input.locationId);
      if (!known) throw new ORPCError("FORBIDDEN", { message: "You have not been there." });

      const [existing] = await db
        .select()
        .from(s.portraits)
        .where(and(eq(s.portraits.ownerType, "place"), eq(s.portraits.ownerId, `${input.saveId}:${input.locationId}`)));
      if (existing) return { key: existing.key, url: mediaUrl(existing.key), cached: true };

      const { getLocation } = await import("../world/map");
      const loc = getLocation(input.locationId);
      if (!loc) throw new ORPCError("NOT_FOUND", { message: "No such place." });
      const prompt = `Layered flat-vector landscape plate, in the manner of a screen-printed poster: charcoal and cream, thin red rule at the horizon, hard-edged silhouettes, no gradients except atmospheric haze, no text, no watermark. Subject: ${loc.name}, ${loc.region}. ${loc.description}`;
      const key = await render(prompt, `plates/${input.saveId}/${input.locationId}`);
      await db.insert(s.portraits).values({
        saveId: input.saveId,
        ownerType: "place",
        ownerId: `${input.saveId}:${input.locationId}`,
        prompt,
        key,
      });
      return { key, url: mediaUrl(key), cached: false };
    }),
};

/** One image model call, straight into storage. */
async function render(prompt: string, prefix: string): Promise<string> {
  const { bytes, mediaType } = await generateImage(prompt);
  const ext = mediaType.includes("jpeg") ? "jpg" : mediaType.includes("webp") ? "webp" : "png";
  const key = `${prefix}-${Date.now()}.${ext}`;
  await putObject(key, bytes, mediaType);
  return key;
}
