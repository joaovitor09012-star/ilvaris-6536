import { eq } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";
import { getClass } from "../world/classes";
import { getSkillTemplate } from "../world/skills";
import { NPCS, THREADS } from "../world/npcs";
import { STARTING_KNOWN } from "../world/map";
import { LORE } from "../world/lore";
import { GLOBAL_ARCS } from "../world/arcs";
import { GOODS } from "../world/economy";

export interface NewGameInput {
  name: string;
  pronouns: string;
  classId: string;
  appearance: string;
  saveName?: string;
  pacing?: "slow" | "standard" | "fast";
  proseVoice?: "literary" | "lean" | "lush";
}

/** Build a fresh world. Every save gets its own copy of every mind. */
export async function createGame(input: NewGameInput): Promise<number> {
  const cls = getClass(input.classId);

  const [save] = await db
    .insert(s.saves)
    .values({
      name: input.saveName ?? `${input.name} of the Hollow`,
      pacing: input.pacing ?? "standard",
      proseVoice: input.proseVoice ?? "literary",
      turn: 0,
      chapter: 1,
      day: 1,
    })
    .returning();

  const saveId = save.id;

  const [char] = await db
    .insert(s.characters)
    .values({
      saveId,
      name: input.name,
      pronouns: input.pronouns,
      classId: cls.id,
      appearance: input.appearance || cls.portraitSeed,
      level: 1,
      xp: 0,
      xpNext: 100,
      str: cls.baseStats.str,
      agi: cls.baseStats.agi,
      vit: cls.baseStats.vit,
      int: cls.baseStats.int,
      wis: cls.baseStats.wis,
      cha: cls.baseStats.cha,
      luk: cls.baseStats.luk,
      freePoints: 0,
      hp: 30 + cls.baseStats.vit * 2,
      hpMax: 30 + cls.baseStats.vit * 2,
      ink: 6 + Math.round(cls.baseStats.int / 2),
      inkMax: 6 + Math.round(cls.baseStats.int / 2),
      coin: 40,
      standing: "Provisional",
      locationId: "vellum-gate",
    })
    .returning();

  // starting skills
  for (const slug of cls.startingSkills) {
    const tpl = getSkillTemplate(slug);
    if (!tpl) continue;
    await db.insert(s.characterSkills).values({
      charId: char.id,
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
  }

  // the issued kit
  for (const itemId of ["apprentice-stylus", "codex-blank", "student-coat", "registry-token", "barley-loaf"]) {
    await db.insert(s.inventory).values({ saveId, itemId, qty: itemId === "barley-loaf" ? 3 : 1 });
  }

  // ── every NPC gets a mind of their own
  for (const t of NPCS) {
    await db.insert(s.npcs).values({
      saveId,
      npcId: t.id,
      name: t.name,
      met: false,
      voiceNote: t.voice,
    });
    for (const fact of t.facts) {
      await db.insert(s.npcFacts).values({ saveId, npcId: t.id, fact, source: "saw", confidence: 85 });
    }
    for (const b of t.beliefs) {
      await db.insert(s.npcBeliefs).values({
        saveId,
        npcId: t.id,
        belief: b.belief,
        isTrue: b.isTrue,
        confidence: 70,
      });
    }
    await db.insert(s.npcRelations).values({
      saveId,
      npcId: t.id,
      targetId: "player",
      trust: t.towardPlayer.trust,
      fear: t.towardPlayer.fear,
      debt: t.towardPlayer.debt,
      desire: t.towardPlayer.desire,
      grudge: t.towardPlayer.grudge,
      note: t.towardPlayer.note,
    });
    for (const g of t.goals) {
      await db.insert(s.npcGoals).values({ saveId, npcId: t.id, goal: g.goal, horizon: g.horizon });
    }
    await db.insert(s.npcSecrets).values({
      saveId,
      npcId: t.id,
      secret: t.secret,
      revealCondition: "revealed when the Chorister decides the scene has earned it",
    });
  }

  // ── the Six
  for (const t of THREADS) {
    await db.insert(s.threads).values({
      saveId,
      threadId: t.id,
      npcId: t.id,
      name: t.name,
      role: t.threadRole ?? "",
      fate: t.threadFate ?? "",
      state: "open",
      progress: 0,
    });
  }

  // ── the map, fogged
  for (const id of STARTING_KNOWN) {
    await db.insert(s.mapReveal).values({ saveId, locationId: id, visited: false, discoveredTurn: 0 });
  }
  await db
    .update(s.mapReveal)
    .set({ visited: true })
    .where(eq(s.mapReveal.locationId, "vellum-gate"));

  // ── the bible, fogged
  for (const entry of LORE.filter((l) => l.unlock.kind === "start")) {
    await db.insert(s.loreUnlocked).values({ saveId, loreId: entry.id, turn: 0 });
  }

  // ── opening arc and its clock
  const opening = GLOBAL_ARCS[0];
  await db.insert(s.arcs).values({
    saveId,
    arcId: opening.id,
    name: opening.name,
    kind: "global",
    state: "open",
    pressure: 20,
    summary: opening.premise,
    enteredTurn: 0,
  });
  for (const c of opening.clocks) {
    await db.insert(s.clocks).values({
      saveId,
      arcId: opening.id,
      name: c.name,
      ticks: 0,
      maxTicks: c.maxTicks,
      consequence: c.consequence,
      status: "running",
    });
  }

  // ── opening unfired guns
  const guns = [
    "Your scholarship was paid by someone who has not come forward",
    "The Archivist read your file four times",
    "A note was slipped under your dormitory door before you arrived",
    "Captain Hale has not filed his report on you yet",
  ];
  for (const g of guns) {
    await db.insert(s.unfiredGuns).values({ saveId, fact: g, introducedTurn: 0 });
  }

  // ── opening events (the causal record begins)
  await db.insert(s.events).values([
    {
      saveId,
      turn: 0,
      kind: "beat",
      description: "The player was admitted to the Vellum Athenaeum on a scholarship nobody can account for",
      weight: 3,
    },
    {
      saveId,
      turn: 0,
      kind: "discovery",
      description: "The player's Codex was issued with a blank first page — no Commission written",
      weight: 3,
    },
  ]);

  // ── the opening scene, written before the first turn so the player has
  //    somewhere to stand and the Chronicle has a first page
  await db.insert(s.scenes).values({
    saveId,
    turn: 0,
    chapter: 1,
    type: "Breath",
    locationId: "registry-hall",
    playerInput: "",
    title: "The Blank Page",
    prose: OPENING_SCENE,
  });

  // ── baseline market
  for (const g of GOODS) {
    await db.insert(s.prices).values({ saveId, goodId: g.id, turn: 0, price: g.basePrice });
  }

  return saveId;
}

/** The opening scene, written before the first turn so the player has somewhere to stand. */
export const OPENING_SCENE = `The gate of the Vellum Athenaeum is black iron and cream stone, inked on both faces with the first-year primer, and it has never been shut in nine hundred years. You walk through it at a quarter past seven in the morning with forty shards in your coat and no idea who paid for your tuition.

The clerk at the Registry desk is a thin man with a stamp and no curiosity. He asks your name, writes it, asks your class, writes that too, and then slides a grey leather Codex across the counter and tells you to open it.

You open it.

The first page is blank. Not unwritten-in-yet — blank, the way a page is blank before the printer has decided what goes on it. The clerk looks at it. He looks at it for a while. Then he asks you to step to one side of the counter, and he calls for someone, and the someone he calls for is not a clerk.

Behind you, across the yard, two hundred students are going about their morning and none of them are looking at you. Above the eastern roofs the sun is coming up over the margin hills, and the light is the colour of weak tea.

The blank page is still blank. It is the only page in the building that will not take ink.`;
