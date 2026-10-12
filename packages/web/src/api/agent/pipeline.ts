import { generateObject, streamText } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";
import { gateway, MODELS } from "./gateway";
import { CHORISTER_SYSTEM, narratorSystem, REGISTRAR_SYSTEM } from "./prompts";
import {
  buildDirectorContext,
  buildNarratorContext,
  buildRegistrarContext,
} from "./context";
import { loadGame, revealLocation, revealLore, addEvent, addUnfiredGun, renownOf, type GameState } from "../game/state";
import { deriveStanding, grantXp } from "../game/progress";
import { getGlobalArc, MINI_ARC_SHAPES } from "../world/arcs";
import { getLocation, LOCATIONS } from "../world/map";
import { getItem } from "../world/items";
import { getMonster, resolveMonsterId, titleFromSlug } from "../world/monsters";
import { getLore } from "../world/lore";

/* ─────────────────────────────────────────────────────────── schemas */

const DirectorSchema = z.object({
  sceneType: z.enum(["Pressure", "Breath", "Turn", "Reveal", "Consequence"]),
  title: z.string(),
  presentNpcIds: z.array(z.string()).default([]),
  locationId: z.string().nullable().default(null),
  directorNote: z.string(),
  offscreen: z
    .array(z.object({ npcId: z.string(), action: z.string(), cause: z.string() }))
    .default([]),
  clockTicks: z.array(z.object({ name: z.string(), delta: z.number(), cause: z.string() })).default([]),
  arcAction: z
    .object({
      op: z.enum(["open", "advance", "close", "none"]),
      name: z.string().default(""),
      kind: z.enum(["global", "mini"]).default("mini"),
      summary: z.string().default(""),
      cause: z.string().default(""),
      scar: z.string().default(""),
    })
    .default({ op: "none", name: "", kind: "mini", summary: "", cause: "", scar: "" }),
  newFacts: z.array(z.string()).default([]),
  newUnfiredGuns: z.array(z.string()).default([]),
  loreHints: z.array(z.string()).default([]),
  discoverLocations: z.array(z.string()).default([]),
  npcFacts: z
    .array(
      z.object({
        npcId: z.string(),
        fact: z.string(),
        source: z.string().default("saw"),
        confidence: z.number().default(80),
      }),
    )
    .default([]),
  npcBeliefs: z
    .array(z.object({ npcId: z.string(), belief: z.string(), isTrue: z.boolean(), confidence: z.number() }))
    .default([]),
  relationshipDeltas: z
    .array(
      z.object({
        npcId: z.string(),
        trust: z.number().default(0),
        fear: z.number().default(0),
        debt: z.number().default(0),
        desire: z.number().default(0),
        grudge: z.number().default(0),
        note: z.string().default(""),
      }),
    )
    .default([]),
  contentFlag: z.enum(["none", "sensual", "explicit", "violence"]).default("none"),
});

const RegistrarSchema = z.object({
  xp: z.number().default(0),
  coinDelta: z.number().default(0),
  inkDelta: z.number().default(0),
  hpDelta: z.number().default(0),
  debtDelta: z.number().default(0),
  stainDelta: z.number().default(0),
  depthDelta: z.number().default(0),
  itemsGained: z
    .array(
      z.object({
        itemId: z.string(),
        name: z.string().default(""),
        rank: z.string().default("F"),
        qty: z.number().default(1),
        description: z.string().default(""),
      }),
    )
    .default([]),
  itemsLost: z.array(z.object({ itemId: z.string(), qty: z.number().default(1) })).default([]),
  skillsLearned: z
    .array(
      z.object({
        name: z.string(),
        rank: z.string().default("F"),
        vector: z.string().default("mana"),
        shape: z.string().default("bolt"),
        power: z.number().default(20),
        costInk: z.number().default(2),
        recoil: z.number().default(0),
        description: z.string().default(""),
      }),
    )
    .default([]),
  skillsUsed: z.array(z.string()).default([]),
  monstersKilled: z.array(z.object({ monsterId: z.string(), count: z.number().default(1) })).default([]),
  newMonsters: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        rank: z.string().default("F"),
        level: z.number().default(1),
        hp: z.number().default(20),
        damage: z.number().default(5),
        armour: z.number().default(0),
        lore: z.string().default(""),
      }),
    )
    .default([]),
  locationChanged: z.string().nullable().default(null),
  events: z
    .array(
      z.object({
        kind: z.string().default("beat"),
        description: z.string(),
        weight: z.number().default(1),
      }),
    )
    .default([]),
  modeChange: z.string().nullable().default(null),
  summary: z.string().default(""),
});

/* ─────────────────────────────────────────────────────────── events */

export type TurnEvent =
  | { t: "phase"; v: string }
  | { t: "delta"; v: string }
  | { t: "decision"; v: { sceneType: string; title: string; directorNote: string; contentFlag: string; presentNpcIds: string[] } }
  | { t: "applied"; v: AppliedResult }
  | { t: "error"; v: string };

export interface AppliedResult {
  turn: number;
  chapter: number;
  sceneType: string;
  title: string;
  summary: string;
  xp: number;
  coinDelta: number;
  inkDelta: number;
  hpDelta: number;
  debtDelta: number;
  stainDelta: number;
  levelsGained: number;
  newSkills: string[];
  newSkillsLearned: { name: string; rank: string; description: string }[];
  itemsGained: { itemId: string; name: string; qty: number }[];
  itemsLost: { itemId: string; name: string; qty: number }[];
  monstersKilled: { monsterId: string; name: string; count: number }[];
  locationChanged: string | null;
  arcOpened: string | null;
  arcClosed: string | null;
  clocksFired: string[];
  loreUnlocked: string[];
  discovered: string[];
  offscreen: string[];
  pressure: number;
}

/* ─────────────────────────────────────────────────────────── the turn */

export async function* runTurn(saveId: number, playerInput: string): AsyncGenerator<TurnEvent> {
  const state = await loadGame(saveId);
  const save = state.save;

  /* ── 1. THE CHORISTER ─────────────────────────────────────── */
  yield { t: "phase", v: "The Chorister weighs the ledger" };

  let decision: z.infer<typeof DirectorSchema>;
  try {
    const { object } = await generateObject({
      model: gateway(save.directorModel || MODELS.director),
      schema: DirectorSchema,
      system: CHORISTER_SYSTEM,
      prompt: `${buildDirectorContext(state)}

══ THE PLAYER'S ACTION THIS TURN ══
"${playerInput}"

Decide the scene. JSON only.`,
    });
    decision = object;
  } catch (err) {
    yield { t: "error", v: `The Chorister could not be reached: ${(err as Error).message}` };
    return;
  }

  /* ── engine-enforced pacing law ───────────────────────────── */
  let sceneType = decision.sceneType;
  if (sceneType === "Pressure" && save.pressureStreak >= 3) {
    sceneType = "Breath";
    decision.directorNote +=
      "\n\n[ENGINE OVERRIDE: three consecutive Pressure scenes. This scene must breathe — a relationship, a market, a quiet moment, or training. Something must still change.]";
  }

  yield {
    t: "decision",
    v: {
      sceneType,
      title: decision.title,
      directorNote: decision.directorNote,
      contentFlag: decision.contentFlag,
      presentNpcIds: decision.presentNpcIds,
    },
  };

  /* ── 2. THE NARRATOR ──────────────────────────────────────── */
  yield { t: "phase", v: "The narrator writes" };

  const narratorCtx = buildNarratorContext(state, {
    sceneType,
    title: decision.title,
    directorNote: decision.directorNote,
    presentNpcIds: decision.presentNpcIds,
    locationId: decision.locationId,
    contentFlag: decision.contentFlag,
  });

  let prose = "";
  try {
    const result = streamText({
      model: gateway(save.narratorModel || MODELS.narrator),
      system: narratorSystem({
        proseVoice: save.proseVoice,
      }),
      prompt: narratorCtx,
      maxOutputTokens: 1400,
    });
    for await (const chunk of result.textStream) {
      prose += chunk;
      yield { t: "delta", v: chunk };
    }
  } catch (err) {
    yield { t: "error", v: `The narrator failed: ${(err as Error).message}` };
    return;
  }

  if (!prose.trim()) {
    prose = "(The scene would not resolve. The Chorister is redrafting.)";
  }

  /* ── 3. THE REGISTRAR ─────────────────────────────────────── */
  yield { t: "phase", v: "The registrar records" };

  let delta: z.infer<typeof RegistrarSchema>;
  try {
    const { object } = await generateObject({
      model: gateway(MODELS.registrar),
      schema: RegistrarSchema,
      system: REGISTRAR_SYSTEM,
      prompt: buildRegistrarContext(state, playerInput, prose),
    });
    delta = object;
  } catch {
    delta = {
      xp: 0,
      coinDelta: 0,
      inkDelta: 0,
      hpDelta: 0,
      debtDelta: 0,
      stainDelta: 0,
      depthDelta: 0,
      itemsGained: [],
      itemsLost: [],
      skillsLearned: [],
      skillsUsed: [],
      monstersKilled: [],
      newMonsters: [],
      locationChanged: null,
      events: [],
      modeChange: null,
      summary: "The registrar could not file this scene.",
    };
  }

  /* ── 4. APPLY ─────────────────────────────────────────────── */
  const applied = await applyTurn(saveId, state, {
    playerInput,
    prose,
    sceneType,
    title: decision.title,
    decision,
    delta,
  });

  yield { t: "applied", v: applied };
}

/* ─────────────────────────────────────────────────────────── apply */

export async function applyTurn(
  saveId: number,
  state: GameState,
  payload: {
    playerInput: string;
    prose: string;
    sceneType: string;
    title: string;
    decision: z.infer<typeof DirectorSchema>;
    delta: z.infer<typeof RegistrarSchema>;
  },
): Promise<AppliedResult> {
  const { decision, delta } = payload;
  const turn = state.save.turn + 1;
  const char = state.character;
  const charId = char.id;

  const result: AppliedResult = {
    turn,
    chapter: state.save.chapter,
    sceneType: payload.sceneType,
    title: payload.title,
    summary: delta.summary,
    xp: delta.xp,
    coinDelta: delta.coinDelta,
    inkDelta: delta.inkDelta,
    hpDelta: delta.hpDelta,
    debtDelta: delta.debtDelta,
    stainDelta: delta.stainDelta,
    levelsGained: 0,
    newSkills: [],
    newSkillsLearned: [],
    itemsGained: [],
    itemsLost: [],
    monstersKilled: [],
    locationChanged: null,
    arcOpened: null,
    arcClosed: null,
    clocksFired: [],
    loreUnlocked: [],
    discovered: [],
    offscreen: [],
    pressure: state.save.pressure,
  };

  /* location */
  let locationId = char.locationId;
  const target = delta.locationChanged ?? decision.locationId;
  if (target && LOCATIONS.some((l) => l.id === target)) {
    locationId = target;
    result.locationChanged = target;
    await revealLocation(saveId, target, turn, true);
  }

  /* the player's numbers */
  const patch: Partial<typeof s.characters.$inferInsert> = {
    coin: Math.max(0, char.coin + delta.coinDelta),
    ink: Math.max(0, Math.min(char.inkMax, char.ink + delta.inkDelta)),
    hp: Math.max(0, Math.min(char.hpMax, char.hp + delta.hpDelta)),
    debt: Math.max(0, char.debt + delta.debtDelta),
    stain: Math.max(0, char.stain + delta.stainDelta),
    depth: Math.max(0, char.depth + delta.depthDelta),
    locationId,
  };
  await db.update(s.characters).set(patch).where(eq(s.characters.id, charId));

  if (delta.xp > 0) {
    const lv = await grantXp(charId, delta.xp);
    result.levelsGained = lv.levelsGained;
    result.newSkills = lv.newSkills;
  }

  /* standing is derived, never hand-set: level, plus what the world has watched you do */
  const renown = renownOf(state);
  const standing = deriveStanding(char.level + result.levelsGained, renown);
  if (standing !== char.standing) {
    await db.update(s.characters).set({ standing }).where(eq(s.characters.id, charId));
  }

  /* items */
  for (const gained of delta.itemsGained) {
    const known = getItem(gained.itemId);
    const rows = await db.select().from(s.inventory).where(eq(s.inventory.saveId, saveId));
    const existing = rows.find((r) => r.itemId === gained.itemId);
    if (existing) {
      await db
        .update(s.inventory)
        .set({ qty: existing.qty + gained.qty })
        .where(eq(s.inventory.id, existing.id));
    } else {
      await db.insert(s.inventory).values({ saveId, itemId: gained.itemId, qty: gained.qty, acquiredTurn: turn });
    }
    result.itemsGained.push({
      itemId: gained.itemId,
      name: known?.name ?? (gained.name || gained.itemId),
      qty: gained.qty,
    });
  }
  for (const lost of delta.itemsLost) {
    const rows = await db.select().from(s.inventory).where(eq(s.inventory.saveId, saveId));
    const row = rows.find((r) => r.itemId === lost.itemId);
    if (!row) continue;
    if (row.qty <= lost.qty) await db.delete(s.inventory).where(eq(s.inventory.id, row.id));
    else await db.update(s.inventory).set({ qty: row.qty - lost.qty }).where(eq(s.inventory.id, row.id));
    result.itemsLost.push({ itemId: lost.itemId, name: getItem(lost.itemId)?.name ?? lost.itemId, qty: lost.qty });
  }

  /* skills learned in play */
  for (const sk of delta.skillsLearned) {
    await db.insert(s.characterSkills).values({
      charId,
      slug: `play-${sk.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: sk.name,
      rank: sk.rank,
      vector: sk.vector,
      shape: sk.shape,
      power: sk.power,
      costInk: sk.costInk,
      recoil: sk.recoil,
      description: sk.description,
      source: "study",
      mastery: 0,
    });
    result.newSkillsLearned.push({ name: sk.name, rank: sk.rank, description: sk.description });
  }

  /* monsters */
  for (const mk of delta.monstersKilled) {
    const rows = await db.select().from(s.bestiary).where(eq(s.bestiary.saveId, saveId));

    /**
     * The registrar writes free text and will occasionally file a variant id
     * ("blot-small") for a creature that is already in the canon. Resolve it back
     * rather than letting a phantom species into the book.
     */
    const described = delta.newMonsters.find((n) => n.id === mk.monsterId);
    const id = getMonster(mk.monsterId) ? mk.monsterId : resolveMonsterId(mk.monsterId) ?? mk.monsterId;

    const row = rows.find((r) => r.monsterId === id);
    if (row) {
      await db.update(s.bestiary).set({ kills: row.kills + mk.count }).where(eq(s.bestiary.id, row.id));
    } else {
      const t = getMonster(id);
      await db.insert(s.bestiary).values({
        saveId,
        monsterId: id,
        kills: mk.count,
        firstSeenTurn: turn,
        /** unresolved and undescribed: keep the entry honest rather than statless */
        custom: t
          ? null
          : {
              name: described?.name ?? titleFromSlug(id),
              rank: described?.rank ?? "F",
              level: described?.level ?? 1,
              hp: described?.hp ?? 10,
              damage: described?.damage ?? 2,
              armour: described?.armour ?? 0,
              lore: described?.lore ?? "",
            },
      });
    }
    result.monstersKilled.push({
      monsterId: id,
      name: getMonster(id)?.name ?? described?.name ?? titleFromSlug(id),
      count: mk.count,
    });
  }
  for (const nm of delta.newMonsters) {
    const rows = await db.select().from(s.bestiary).where(eq(s.bestiary.saveId, saveId));
    if (rows.some((r) => r.monsterId === nm.id)) continue;
    await db.insert(s.bestiary).values({
      saveId,
      monsterId: nm.id,
      kills: 0,
      firstSeenTurn: turn,
      custom: {
        name: nm.name,
        rank: nm.rank,
        level: nm.level,
        hp: nm.hp,
        damage: nm.damage,
        armour: nm.armour,
        lore: nm.lore,
      },
    });
  }

  /* events */
  for (const ev of delta.events) {
    await addEvent(saveId, turn, ev.kind, ev.description, { locationId, weight: ev.weight });
  }
  for (const fact of decision.newFacts) {
    await addEvent(saveId, turn, "world", fact, { locationId });
  }

  /* off-screen: NPCs act on their own goals, caused by existing facts */
  for (const off of decision.offscreen) {
    const npc = state.npcs.find((n) => n.npcId === off.npcId);
    await addEvent(saveId, turn, "offscreen", `${npc?.name ?? off.npcId}: ${off.action} — because ${off.cause}`, {
      npcId: off.npcId,
    });
    result.offscreen.push(`${npc?.name ?? off.npcId}: ${off.action}`);
  }

  /* clocks */
  const clockRows = await db.select().from(s.clocks).where(eq(s.clocks.saveId, saveId));
  for (const tick of decision.clockTicks) {
    const row = clockRows.find((k) => k.name === tick.name && k.status === "running");
    if (!row) continue;
    const ticks = row.ticks + tick.delta;
    if (ticks >= row.maxTicks) {
      await db.update(s.clocks).set({ ticks, status: "fired" }).where(eq(s.clocks.id, row.id));
      await addEvent(saveId, turn, "clock", `The clock "${row.name}" fired: ${row.consequence}`, { locationId });
      result.clocksFired.push(row.name);
      await db.insert(s.arcs).values({
        saveId,
        arcId: `clock-${row.id}`,
        name: row.name,
        kind: "mini",
        state: "open",
        pressure: 60,
        summary: row.consequence,
        scar: row.consequence,
        enteredTurn: turn,
      });
    } else {
      await db.update(s.clocks).set({ ticks }).where(eq(s.clocks.id, row.id));
    }
  }

  /* arcs */
  if (decision.arcAction.op === "open") {
    const global = getGlobalArc(decision.arcAction.name.toLowerCase().replace(/\s+/g, "-"));
    const name = global?.name ?? (decision.arcAction.name || "An unnamed arc");
    const already = (await db.select().from(s.arcs).where(eq(s.arcs.saveId, saveId))).some(
      (a) => a.name === name && a.state !== "closed",
    );
    if (!already) {
      await db.insert(s.arcs).values({
        saveId,
        arcId: global?.id ?? `mini-${Date.now()}`,
        name,
        kind: global ? "global" : "mini",
        state: "open",
        pressure: 40,
        summary: decision.arcAction.summary || global?.premise || "",
        scar: decision.arcAction.scar || global?.scarIfIgnored || "",
        enteredTurn: turn,
      });
      if (global) {
        for (const c of global.clocks) {
          await db.insert(s.clocks).values({
            saveId,
            arcId: global.id,
            name: c.name,
            ticks: 0,
            maxTicks: c.maxTicks,
            consequence: c.consequence,
          });
        }
      }
      result.arcOpened = name;
      await addEvent(saveId, turn, "arc", `Arc opened: ${name} — ${decision.arcAction.cause}`, { locationId });
    }
  } else if (decision.arcAction.op === "close") {
    const open = (await db.select().from(s.arcs).where(eq(s.arcs.saveId, saveId))).find(
      (a) => a.name === decision.arcAction.name && a.state !== "closed",
    );
    if (open) {
      await db.update(s.arcs).set({ state: "closed", closedTurn: turn }).where(eq(s.arcs.id, open.id));
      result.arcClosed = open.name;
      await addEvent(saveId, turn, "arc", `Arc closed: ${open.name}. Scar: ${decision.arcAction.scar || open.scar}`, {
        locationId,
      });
    }
  } else if (decision.arcAction.op === "advance") {
    const open = (await db.select().from(s.arcs).where(eq(s.arcs.saveId, saveId))).find(
      (a) => a.state !== "closed",
    );
    if (open) {
      await db
        .update(s.arcs)
        .set({ state: "advancing", pressure: Math.min(100, open.pressure + 10) })
        .where(eq(s.arcs.id, open.id));
    }
  }

  /* unfired guns */
  for (const gun of decision.newUnfiredGuns) await addUnfiredGun(saveId, gun, turn);

  /* lore */
  for (const hint of decision.loreHints) {
    if (!getLore(hint)) continue;
    await revealLore(saveId, hint, turn);
    result.loreUnlocked.push(hint);
  }

  /* map */
  for (const loc of decision.discoverLocations) {
    if (!LOCATIONS.some((l) => l.id === loc)) continue;
    await revealLocation(saveId, loc, turn, false);
    result.discovered.push(getLocation(loc)?.name ?? loc);
  }

  /* NPC minds — appended, never rewritten */
  for (const f of decision.npcFacts) {
    await db.insert(s.npcFacts).values({
      saveId,
      npcId: f.npcId,
      fact: f.fact,
      source: f.source,
      confidence: Math.round(f.confidence),
      turn,
    });
  }
  for (const b of decision.npcBeliefs) {
    await db.insert(s.npcBeliefs).values({
      saveId,
      npcId: b.npcId,
      belief: b.belief,
      isTrue: b.isTrue,
      confidence: Math.round(b.confidence),
      turn,
    });
  }
  for (const r of decision.relationshipDeltas) {
    const rows = await db.select().from(s.npcRelations).where(eq(s.npcRelations.saveId, saveId));
    const row = rows.find((x) => x.npcId === r.npcId && x.targetId === "player");
    if (!row) continue;
    await db
      .update(s.npcRelations)
      .set({
        trust: clamp(row.trust + r.trust),
        fear: clamp(row.fear + r.fear),
        debt: clamp(row.debt + r.debt),
        desire: clamp(row.desire + r.desire),
        grudge: clamp(row.grudge + r.grudge),
        note: r.note || row.note,
      })
      .where(eq(s.npcRelations.id, row.id));
  }

  /* mark met */
  for (const id of decision.presentNpcIds) {
    const row = state.npcs.find((n) => n.npcId === id);
    if (row) {
      await db
        .update(s.npcs)
        .set({ met: true, lastSeenTurn: turn })
        .where(eq(s.npcs.id, row.id));
    }
  }

  /* ── pacing, chapter, mode ── */
  const pressureDelta =
    payload.sceneType === "Pressure" || payload.sceneType === "Consequence"
      ? 12
      : payload.sceneType === "Turn"
        ? 8
        : -8;
  const pressure = Math.max(0, Math.min(100, state.save.pressure + pressureDelta));
  const pressureStreak =
    payload.sceneType === "Pressure" ? state.save.pressureStreak + 1 : 0;
  const breathStreak =
    payload.sceneType === "Breath" ? state.save.breathStreak + 1 : 0;

  const chapterScenes = state.scenes.filter((sc) => sc.chapter === state.save.chapter).length;
  let chapter = state.save.chapter;
  if (payload.sceneType === "Turn" && chapterScenes >= 4) chapter += 1;

  await db
    .update(s.saves)
    .set({
      turn,
      chapter,
      pressure,
      pressureStreak,
      breathStreak,
      mode: delta.modeChange ?? state.save.mode,
      day: state.save.day + 1,
      updatedAt: new Date(),
    })
    .where(eq(s.saves.id, saveId));

  result.chapter = chapter;
  result.pressure = pressure;

  /* the scene itself */
  await db.insert(s.scenes).values({
    saveId,
    turn,
    chapter,
    type: payload.sceneType,
    locationId,
    playerInput: payload.playerInput,
    prose: payload.prose,
    title: payload.title,
  });

  return result;
}

function clamp(n: number) {
  return Math.max(-100, Math.min(100, n));
}

/** Unused but kept: the mini-arc shapes the director draws on. */
export const MINI_ARC_MENU = MINI_ARC_SHAPES;
