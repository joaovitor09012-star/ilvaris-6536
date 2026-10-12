import { and, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";

/** Everything the engine knows about one save, assembled in one place. */
export interface GameState {
  save: typeof s.saves.$inferSelect;
  character: typeof s.characters.$inferSelect;
  skills: (typeof s.characterSkills.$inferSelect)[];
  inventory: (typeof s.inventory.$inferSelect)[];
  npcs: (typeof s.npcs.$inferSelect)[];
  facts: (typeof s.npcFacts.$inferSelect)[];
  beliefs: (typeof s.npcBeliefs.$inferSelect)[];
  relations: (typeof s.npcRelations.$inferSelect)[];
  goals: (typeof s.npcGoals.$inferSelect)[];
  secrets: (typeof s.npcSecrets.$inferSelect)[];
  threads: (typeof s.threads.$inferSelect)[];
  arcs: (typeof s.arcs.$inferSelect)[];
  clocks: (typeof s.clocks.$inferSelect)[];
  guns: (typeof s.unfiredGuns.$inferSelect)[];
  rumors: (typeof s.rumors.$inferSelect)[];
  events: (typeof s.events.$inferSelect)[];
  scenes: (typeof s.scenes.$inferSelect)[];
  mapReveal: (typeof s.mapReveal.$inferSelect)[];
  bestiary: (typeof s.bestiary.$inferSelect)[];
  lore: (typeof s.loreUnlocked.$inferSelect)[];
  prices: (typeof s.prices.$inferSelect)[];
}

export async function loadGame(saveId: number): Promise<GameState> {
  const [save] = await db.select().from(s.saves).where(eq(s.saves.id, saveId));
  if (!save) throw new Error("No such save");
  const [character] = await db.select().from(s.characters).where(eq(s.characters.saveId, saveId));
  if (!character) throw new Error("No character in save");

  const [
    skills,
    inventory,
    npcs,
    facts,
    beliefs,
    relations,
    goals,
    secrets,
    threads,
    arcs,
    clocks,
    guns,
    rumors,
    events,
    scenes,
    mapReveal,
    bestiary,
    lore,
    prices,
  ] = await Promise.all([
    db.select().from(s.characterSkills).where(eq(s.characterSkills.charId, character.id)),
    db.select().from(s.inventory).where(eq(s.inventory.saveId, saveId)),
    db.select().from(s.npcs).where(eq(s.npcs.saveId, saveId)),
    db.select().from(s.npcFacts).where(eq(s.npcFacts.saveId, saveId)),
    db.select().from(s.npcBeliefs).where(eq(s.npcBeliefs.saveId, saveId)),
    db.select().from(s.npcRelations).where(eq(s.npcRelations.saveId, saveId)),
    db.select().from(s.npcGoals).where(eq(s.npcGoals.saveId, saveId)),
    db.select().from(s.npcSecrets).where(eq(s.npcSecrets.saveId, saveId)),
    db.select().from(s.threads).where(eq(s.threads.saveId, saveId)),
    db.select().from(s.arcs).where(eq(s.arcs.saveId, saveId)),
    db.select().from(s.clocks).where(eq(s.clocks.saveId, saveId)),
    db.select().from(s.unfiredGuns).where(eq(s.unfiredGuns.saveId, saveId)),
    db.select().from(s.rumors).where(eq(s.rumors.saveId, saveId)),
    db.select().from(s.events).where(eq(s.events.saveId, saveId)).orderBy(desc(s.events.id)).limit(80),
    db.select().from(s.scenes).where(eq(s.scenes.saveId, saveId)).orderBy(desc(s.scenes.id)).limit(24),
    db.select().from(s.mapReveal).where(eq(s.mapReveal.saveId, saveId)),
    db.select().from(s.bestiary).where(eq(s.bestiary.saveId, saveId)),
    db.select().from(s.loreUnlocked).where(eq(s.loreUnlocked.saveId, saveId)),
    db.select().from(s.prices).where(eq(s.prices.saveId, saveId)),
  ]);

  return {
    save,
    character,
    skills,
    inventory,
    npcs,
    facts,
    beliefs,
    relations,
    goals,
    secrets,
    threads,
    arcs,
    clocks,
    guns,
    rumors,
    events,
    scenes,
    mapReveal,
    bestiary,
    lore,
    prices,
  };
}

/* ─────────────────────────────────────────────────────── focused lookups */

/**
 * Renown — the part of standing that is not level. It is not a number the player
 * is given; it is a count of what the world has actually watched happen: threads
 * brought to an end, and arcs closed rather than left hanging.
 */
export function renownOf(state: GameState): number {
  const threads = state.threads.filter((t) => t.state === "resolved" || t.state === "severed").length;
  const arcs = state.arcs.filter((a) => a.state === "closed").length;
  return threads * 4 + arcs * 10;
}

export function npcMind(state: GameState, npcId: string) {
  return {
    facts: state.facts.filter((f) => f.npcId === npcId),
    beliefs: state.beliefs.filter((b) => b.npcId === npcId),
    relations: state.relations.filter((r) => r.npcId === npcId),
    goals: state.goals.filter((g) => g.npcId === npcId && !g.done),
    secrets: state.secrets.filter((x) => x.npcId === npcId),
  };
}

export async function revealLocation(saveId: number, locationId: string, turn: number, visited = false) {
  const [existing] = await db
    .select()
    .from(s.mapReveal)
    .where(and(eq(s.mapReveal.saveId, saveId), eq(s.mapReveal.locationId, locationId)));
  if (existing) {
    if (visited && !existing.visited) {
      await db.update(s.mapReveal).set({ visited: true }).where(eq(s.mapReveal.id, existing.id));
    }
    return;
  }
  await db.insert(s.mapReveal).values({ saveId, locationId, visited, discoveredTurn: turn });
}

export async function revealLore(saveId: number, loreId: string, turn: number) {
  const [existing] = await db
    .select()
    .from(s.loreUnlocked)
    .where(and(eq(s.loreUnlocked.saveId, saveId), eq(s.loreUnlocked.loreId, loreId)));
  if (existing) return;
  await db.insert(s.loreUnlocked).values({ saveId, loreId, turn });
}

export async function addEvent(
  saveId: number,
  turn: number,
  kind: string,
  description: string,
  opts: { causeEventId?: number; locationId?: string; npcId?: string; weight?: number } = {},
) {
  const [row] = await db
    .insert(s.events)
    .values({
      saveId,
      turn,
      kind,
      description,
      causeEventId: opts.causeEventId ?? null,
      locationId: opts.locationId ?? null,
      npcId: opts.npcId ?? null,
      weight: opts.weight ?? 1,
    })
    .returning();
  return row;
}

export async function addUnfiredGun(saveId: number, fact: string, turn: number) {
  await db.insert(s.unfiredGuns).values({ saveId, fact, introducedTurn: turn });
}
