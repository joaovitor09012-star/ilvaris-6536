import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * ILVARIS — persistence layer.
 *
 * Design rule: static world content (classes, skill vectors, item templates,
 * monsters, the map, NPC templates, lore, arcs) lives as read-only TypeScript
 * modules under `src/api/world/`. The database stores only *state*: what this
 * save has done to the world. Every row is therefore a scar.
 */

// ─────────────────────────────────────────────────────────────── saves

export const saves = sqliteTable("saves", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // Legacy columns, no longer read: content follows the player's own register and the absolute
  // limits in narratorSystem always hold. Kept so existing databases need no destructive migration.
  contentMode: text("content_mode").notNull().default("explicit"),
  pureMode: integer("pure_mode", { mode: "boolean" }).notNull().default(true),
  pacing: text("pacing").notNull().default("standard"),
  proseVoice: text("prose_voice").notNull().default("literary"),
  directorModel: text("director_model").notNull().default("anthropic/claude-haiku-4.5"),
  narratorModel: text("narrator_model").notNull().default("anthropic/claude-sonnet-5"),
  turn: integer("turn").notNull().default(0),
  chapter: integer("chapter").notNull().default(1),
  day: integer("day").notNull().default(1),
  season: text("season").notNull().default("autumn"),
  /** exploration | expedition | solo_descent | duel | tournament | recovery */
  mode: text("mode").notNull().default("exploration"),
  pressure: integer("pressure").notNull().default(0),
  breathStreak: integer("breath_streak").notNull().default(0),
  pressureStreak: integer("pressure_streak").notNull().default(0),
  flags: text("flags", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────────────────────── the player

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  name: text("name").notNull(),
  pronouns: text("pronouns").notNull().default("he/him"),
  classId: text("class_id").notNull(),
  /** free-form appearance text, also the seed for the portrait prompt */
  appearance: text("appearance").notNull().default(""),
  portraitKey: text("portrait_key"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  xpNext: integer("xp_next").notNull().default(100),
  depth: integer("depth").notNull().default(0),

  str: integer("str").notNull().default(5),
  agi: integer("agi").notNull().default(5),
  vit: integer("vit").notNull().default(5),
  int: integer("int").notNull().default(5),
  wis: integer("wis").notNull().default(5),
  cha: integer("cha").notNull().default(5),
  luk: integer("luk").notNull().default(5),
  freePoints: integer("free_points").notNull().default(0),

  hp: integer("hp").notNull().default(40),
  hpMax: integer("hp_max").notNull().default(40),
  ink: integer("ink").notNull().default(10),
  inkMax: integer("ink_max").notNull().default(10),

  coin: integer("coin").notNull().default(40), // in shards
  debt: integer("debt").notNull().default(0),
  stain: integer("stain").notNull().default(0),
  standing: text("standing").notNull().default("Provisional"),
  declaredThread: text("declared_thread"),
  locationId: text("location_id").notNull().default("vellum-gate"),
  /** Marks the player has earned: none | orange | crimson */
  covenantMark: text("covenant_mark").notNull().default("none"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const characterSkills = sqliteTable("character_skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  charId: integer("char_id").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  rank: text("rank").notNull().default("F"),
  vector: text("vector").notNull().default("mana"),
  shape: text("shape").notNull().default("bolt"),
  modifiers: text("modifiers", { mode: "json" }).$type<string[]>().notNull().default([]),
  costInk: integer("cost_ink").notNull().default(2),
  power: integer("power").notNull().default(10),
  recoil: integer("recoil").notNull().default(0),
  mastery: integer("mastery").notNull().default(0),
  /** class | research | study | prize | item | drop | fate */
  source: text("source").notNull().default("research"),
  description: text("description").notNull().default(""),
  equipped: integer("equipped", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const researchLog = sqliteTable("research_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  charId: integer("char_id").notNull(),
  vector: text("vector").notNull(),
  shape: text("shape").notNull(),
  modifiers: text("modifiers", { mode: "json" }).$type<string[]>().notNull().default([]),
  success: integer("success", { mode: "boolean" }).notNull().default(false),
  resultName: text("result_name"),
  resultRank: text("result_rank"),
  note: text("note").notNull().default(""),
  turn: integer("turn").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────────────────────── economy

export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  itemId: text("item_id").notNull(),
  qty: integer("qty").notNull().default(1),
  condition: integer("condition").notNull().default(100),
  acquiredTurn: integer("acquired_turn").notNull().default(0),
});

export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  goodId: text("good_id").notNull(),
  turn: integer("turn").notNull(),
  price: integer("price").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  turn: integer("turn").notNull(),
  kind: text("kind").notNull(), // buy | sell | wage | bounty | tithe | gift | fine
  goodId: text("good_id").notNull(),
  qty: integer("qty").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0),
  total: integer("total").notNull().default(0),
  counterparty: text("counterparty").notNull().default(""),
  note: text("note").notNull().default(""),
});

// ─────────────────────────────────────────────────────────────── world state

export const mapReveal = sqliteTable("map_reveal", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  locationId: text("location_id").notNull(),
  visited: integer("visited", { mode: "boolean" }).notNull().default(false),
  discoveredTurn: integer("discovered_turn").notNull().default(0),
  cleared: integer("cleared", { mode: "boolean" }).notNull().default(false),
});

export const bestiary = sqliteTable("bestiary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  monsterId: text("monster_id").notNull(),
  kills: integer("kills").notNull().default(0),
  firstSeenTurn: integer("first_seen_turn").notNull().default(0),
  studied: integer("studied", { mode: "boolean" }).notNull().default(false),
  /** registrar-invented creatures live here, so the world can grow beyond the templates */
  custom: text("custom", { mode: "json" }).$type<{
    name: string;
    rank: string;
    level: number;
    hp: number;
    damage: number;
    armour: number;
    lore: string;
  } | null>(),
});

export const loreUnlocked = sqliteTable("lore_unlocked", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  loreId: text("lore_id").notNull(),
  turn: integer("turn").notNull().default(0),
});

// ─────────────────────────────────────────────────────────────── NPCs

export const npcs = sqliteTable("npcs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  npcId: text("npc_id").notNull(),
  name: text("name").notNull(),
  met: integer("met", { mode: "boolean" }).notNull().default(false),
  alive: integer("alive", { mode: "boolean" }).notNull().default(true),
  revised: integer("revised", { mode: "boolean" }).notNull().default(false),
  portraitKey: text("portrait_key"),
  /** their own register, evolved by play */
  voiceNote: text("voice_note").notNull().default(""),
  lastSeenTurn: integer("last_seen_turn").notNull().default(0),
});

export const npcFacts = sqliteTable("npc_facts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  npcId: text("npc_id").notNull(),
  fact: text("fact").notNull(),
  /** saw | told_by_player | told_by_npc | read | inferred */
  source: text("source").notNull().default("saw"),
  confidence: integer("confidence").notNull().default(80),
  turn: integer("turn").notNull().default(0),
});

export const npcBeliefs = sqliteTable("npc_beliefs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  npcId: text("npc_id").notNull(),
  belief: text("belief").notNull(),
  isTrue: integer("is_true", { mode: "boolean" }).notNull().default(true),
  confidence: integer("confidence").notNull().default(60),
  turn: integer("turn").notNull().default(0),
});

export const npcRelations = sqliteTable("npc_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  npcId: text("npc_id").notNull(),
  targetId: text("target_id").notNull().default("player"),
  trust: integer("trust").notNull().default(0),
  fear: integer("fear").notNull().default(0),
  debt: integer("debt").notNull().default(0),
  desire: integer("desire").notNull().default(0),
  grudge: integer("grudge").notNull().default(0),
  note: text("note").notNull().default(""),
});

export const npcGoals = sqliteTable("npc_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  npcId: text("npc_id").notNull(),
  goal: text("goal").notNull(),
  horizon: text("horizon").notNull().default("short"),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
});

export const npcSecrets = sqliteTable("npc_secrets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  npcId: text("npc_id").notNull(),
  secret: text("secret").notNull(),
  revealCondition: text("reveal_condition").notNull().default(""),
  revealed: integer("revealed", { mode: "boolean" }).notNull().default(false),
});

// ─────────────────────────────────────────────────────────────── narrative

export const threads = sqliteTable("threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  threadId: text("thread_id").notNull(),
  npcId: text("npc_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  fate: text("fate").notNull(),
  /** open | fraying | resolved | severed | revised */
  state: text("state").notNull().default("open"),
  progress: integer("progress").notNull().default(0),
  resolution: text("resolution"),
});

export const scenes = sqliteTable("scenes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  turn: integer("turn").notNull(),
  chapter: integer("chapter").notNull().default(1),
  /** Pressure | Breath | Turn | Reveal | Consequence */
  type: text("type").notNull().default("Breath"),
  locationId: text("location_id").notNull(),
  playerInput: text("player_input").notNull().default(""),
  prose: text("prose").notNull(),
  title: text("title").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/** The causality backbone. Every event cites the event that caused it. */
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  turn: integer("turn").notNull().default(0),
  kind: text("kind").notNull().default("beat"),
  description: text("description").notNull(),
  causeEventId: integer("cause_event_id"),
  locationId: text("location_id"),
  npcId: text("npc_id"),
  weight: integer("weight").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const arcs = sqliteTable("arcs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  arcId: text("arc_id").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("mini"), // global | mini
  /** dormant | open | advancing | closed */
  state: text("state").notNull().default("open"),
  pressure: integer("pressure").notNull().default(0),
  summary: text("summary").notNull().default(""),
  scar: text("scar").notNull().default(""),
  enteredTurn: integer("entered_turn").notNull().default(0),
  closedTurn: integer("closed_turn"),
});

export const clocks = sqliteTable("clocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  arcId: text("arc_id").notNull().default("world"),
  name: text("name").notNull(),
  ticks: integer("ticks").notNull().default(0),
  maxTicks: integer("max_ticks").notNull().default(6),
  consequence: text("consequence").notNull(),
  /** running | fired | defused */
  status: text("status").notNull().default("running"),
});

export const unfiredGuns = sqliteTable("unfired_guns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  fact: text("fact").notNull(),
  introducedTurn: integer("introduced_turn").notNull().default(0),
  fired: integer("fired", { mode: "boolean" }).notNull().default(false),
  retired: integer("retired", { mode: "boolean" }).notNull().default(false),
});

export const rumors = sqliteTable("rumors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  text: text("text").notNull(),
  isTrue: integer("is_true", { mode: "boolean" }).notNull().default(true),
  spread: integer("spread").notNull().default(1),
  createdAtTurn: integer("created_at_turn").notNull().default(0),
});

export const rumorBeliefs = sqliteTable("rumor_beliefs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  rumorId: integer("rumor_id").notNull(),
  npcId: text("npc_id").notNull(),
  believes: integer("believes", { mode: "boolean" }).notNull().default(true),
});

// ─────────────────────────────────────────────────────────────── media

export const portraits = sqliteTable("portraits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id"),
  ownerType: text("owner_type").notNull(), // npc | character
  ownerId: text("owner_id").notNull(),
  style: text("style").notNull().default("manhwa"),
  prompt: text("prompt").notNull(),
  key: text("key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
