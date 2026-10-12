import { rankFromPower, type Rank } from "./ranks";

/**
 * ILVARIS — mana, and the research bench.
 *
 * Mana is not an element. It is a *substance that holds instruction* — the same
 * ink the Ledger writes in. A working is composed of three parts:
 *
 *   1. VECTOR   — what the ink is made of (fire, flesh, bond…)
 *   2. SHAPE    — how it is delivered (bolt, aura, domain…)
 *   3. MODIFIERS — up to three further instructions (pierce, echo, drain…)
 *
 * The player experiments freely. Every combination is legal; most are useless;
 * a few are discoveries nobody in Ilvaris has written before. Every attempt —
 * success or failure — is recorded in the Research Journal, so failure teaches.
 */

export interface Vector {
  id: string;
  name: string;
  /** base power contribution */
  weight: number;
  inkMult: number;
  recoil: number;
  /** 0–1: how hard it is to hold this vector steady */
  volatility: number;
  blurb: string;
  flavour: string;
}

export const VECTORS: Vector[] = [
  { id: "mana", name: "Raw Mana", weight: 10, inkMult: 1, recoil: 0, volatility: 0.1, blurb: "Unshaped instruction. Cheap, honest, weak.", flavour: "The ink before the sentence." },
  { id: "fire", name: "Fire", weight: 14, inkMult: 1.1, recoil: 2, volatility: 0.25, blurb: "Heat and appetite. Fast, loud, greedy for fuel.", flavour: "The world's oldest declarative." },
  { id: "water", name: "Water", weight: 12, inkMult: 1.05, recoil: 1, volatility: 0.15, blurb: "Flow, weight, cold, and the patience to wear stone down.", flavour: "Nothing is stronger; nothing is slower." },
  { id: "earth", name: "Earth", weight: 15, inkMult: 1.15, recoil: 2, volatility: 0.1, blurb: "Structure and refusal. Walls, walls, and more walls.", flavour: "The most obedient vector." },
  { id: "air", name: "Air", weight: 11, inkMult: 1, recoil: 1, volatility: 0.3, blurb: "Speed, distance, breath. Hard to aim, impossible to contain.", flavour: "It is already everywhere." },
  { id: "light", name: "Light", weight: 13, inkMult: 1.2, recoil: 2, volatility: 0.2, blurb: "Revelation. Sees through, burns clean, cannot lie.", flavour: "The Interrogative's favourite." },
  { id: "shadow", name: "Shadow", weight: 13, inkMult: 1.1, recoil: 2, volatility: 0.35, blurb: "Absence, concealment, and the space behind a person.", flavour: "Not the opposite of light. Its editor." },
  { id: "flesh", name: "Flesh", weight: 16, inkMult: 1.3, recoil: 3, volatility: 0.4, blurb: "Bodies: mending them, growing them, ending them from inside.", flavour: "The only vector that argues back." },
  { id: "mind", name: "Mind", weight: 15, inkMult: 1.35, recoil: 3, volatility: 0.45, blurb: "Perception, memory, fear, sleep. Invisible and irreversible.", flavour: "A wound nobody can point at." },
  { id: "bond", name: "Bond", weight: 14, inkMult: 1.25, recoil: 2, volatility: 0.3, blurb: "Oaths, promises, debts, and what people owe each other.", flavour: "The vector that makes armies." },
  { id: "void", name: "Void", weight: 22, inkMult: 1.8, recoil: 6, volatility: 0.7, blurb: "Unwriting. The grammar of erasure. Forbidden after one lecture.", flavour: "What the Ledger uses when it gives up on you." },
];

export interface Shape {
  id: string;
  name: string;
  powerMult: number;
  inkMult: number;
  /** how many targets / how wide */
  scope: string;
  blurb: string;
}

export const SHAPES: Shape[] = [
  { id: "touch", name: "Touch", powerMult: 1.0, inkMult: 0.7, scope: "one, adjacent", blurb: "Cheapest shape. Requires contact." },
  { id: "bolt", name: "Bolt", powerMult: 1.2, inkMult: 1.0, scope: "one, at range", blurb: "The workhorse. Point and mean it." },
  { id: "edge", name: "Edge", powerMult: 1.15, inkMult: 0.9, scope: "one, melee", blurb: "A cutting line held in the hand." },
  { id: "aura", name: "Aura", powerMult: 1.1, inkMult: 1.3, scope: "self, sustained", blurb: "Worn, not thrown. Lasts while you pay." },
  { id: "chain", name: "Chain", powerMult: 1.25, inkMult: 1.6, scope: "up to five, linked", blurb: "Jumps between targets. Loses force each hop." },
  { id: "wall", name: "Wall", powerMult: 1.3, inkMult: 1.5, scope: "a line, static", blurb: "Held against a direction." },
  { id: "field", name: "Field", powerMult: 1.35, inkMult: 1.9, scope: "an area, sustained", blurb: "A zone that keeps obeying." },
  { id: "self", name: "Self", powerMult: 1.05, inkMult: 0.8, scope: "you", blurb: "Written into your own body. The fastest shape." },
  { id: "domain", name: "Domain", powerMult: 1.7, inkMult: 3.2, scope: "a place, until broken", blurb: "You become the local law. Enormous Debt." },
  { id: "summon", name: "Summon", powerMult: 1.5, inkMult: 2.4, scope: "a made thing", blurb: "Give the ink a body and let it work." },
];

export interface Modifier {
  id: string;
  name: string;
  powerMult: number;
  inkAdd: number;
  recoil: number;
  blurb: string;
}

export const MODIFIERS: Modifier[] = [
  { id: "pierce", name: "Pierce", powerMult: 1.2, inkAdd: 1, recoil: 1, blurb: "Ignores armour, wards, and excuses." },
  { id: "split", name: "Split", powerMult: 0.85, inkAdd: 1, recoil: 0, blurb: "Two instances at reduced force. Doubles the field." },
  { id: "echo", name: "Echo", powerMult: 1.15, inkAdd: 2, recoil: 1, blurb: "Fires again one breath later, from the same place." },
  { id: "drain", name: "Drain", powerMult: 1.1, inkAdd: 2, recoil: 2, blurb: "Returns a fraction of what it takes as ink. Grinding fuel." },
  { id: "delay", name: "Delay", powerMult: 1.3, inkAdd: 1, recoil: 1, blurb: "Set it, walk away, decide later." },
  { id: "bind", name: "Bind", powerMult: 1.1, inkAdd: 2, recoil: 2, blurb: "Holds the target. Bond grammar, mildly illegal at scale." },
  { id: "quiet", name: "Quiet", powerMult: 0.9, inkAdd: 1, recoil: 0, blurb: "No sound, no light, no record. The Nightblade's favourite word." },
  { id: "rend", name: "Rend", powerMult: 1.35, inkAdd: 2, recoil: 3, blurb: "Leaves a wound that will not close by ordinary means." },
  { id: "siphon", name: "Siphon", powerMult: 1.05, inkAdd: 3, recoil: 3, blurb: "Takes the target's ink as your own. Drawing — a crime." },
  { id: "sanctify", name: "Sanctify", powerMult: 1.25, inkAdd: 2, recoil: 2, blurb: "Harmless to the innocent, ruinous to the Stain-marked." },
  { id: "witness", name: "Witness", powerMult: 1.15, inkAdd: 1, recoil: 1, blurb: "Refunds ink when others watch. The academy's whole culture in one word." },
  { id: "recurse", name: "Recurse", powerMult: 1.45, inkAdd: 4, recoil: 4, blurb: "The working repeats while it holds. Very expensive, very cruel." },
];

const VEC = new Map(VECTORS.map((v) => [v.id, v]));
const SHP = new Map(SHAPES.map((s) => [s.id, s]));
const MOD = new Map(MODIFIERS.map((m) => [m.id, m]));

export function vector(id: string): Vector {
  return VEC.get(id) ?? VECTORS[0];
}
export function shape(id: string): Shape {
  return SHP.get(id) ?? SHAPES[1];
}
export function modifier(id: string): Modifier | undefined {
  return MOD.get(id);
}

// ─────────────────────────────────────────────── naming

const NOUNS: Record<string, string[]> = {
  mana: ["Word", "Line", "Statement", "Margin", "Utterance"],
  fire: ["Ember", "Cinder", "Furnace", "Tallow", "Blaze"],
  water: ["Tide", "Cistern", "Undertow", "Rain", "Well"],
  earth: ["Bulwark", "Root", "Pillar", "Barrow", "Weight"],
  air: ["Breath", "Gale", "Whisper", "Gap", "Exhale"],
  light: ["Lantern", "Verdict", "Noon", "Glare", "Candour"],
  shadow: ["Absence", "Shade", "Hollow", "Backlight", "Silhouette"],
  flesh: ["Sinew", "Graft", "Marrow", "Pulse", "Second Skin"],
  mind: ["Reverie", "Suggestion", "Nightmare", "Quiet Word", "Fold"],
  bond: ["Oath", "Promise", "Ledger", "Debt", "Handshake"],
  void: ["Erasure", "Blank", "Revision", "Deletion", "Unwriting"],
};

const SHAPE_WORDS: Record<string, string> = {
  touch: "Touch",
  bolt: "Lance",
  edge: "Edge",
  aura: "Mantle",
  chain: "Chain",
  wall: "Wall",
  field: "Field",
  self: "Sigil",
  domain: "Dominion",
  summon: "Familiar",
};

const MOD_WORDS: Record<string, string> = {
  pierce: "Piercing",
  split: "Twin",
  echo: "Echoing",
  drain: "Thirsting",
  delay: "Patient",
  bind: "Binding",
  quiet: "Silent",
  rend: "Rending",
  siphon: "Siphoning",
  sanctify: "Hallowed",
  witness: "Witnessed",
  recurse: "Recursive",
};

export function composeName(vectorId: string, shapeId: string, modifiers: string[]): string {
  const nouns = NOUNS[vectorId] ?? NOUNS.mana;
  // The name is a property of the composition, not of the moment it was cast:
  // the same vector, shape and modifiers always read as the same working, so
  // the bench cannot promise one name and the record another.
  const seed = `${vectorId}|${shapeId}|${modifiers.join(",")}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const noun = nouns[Math.abs(h) % nouns.length];
  const shp = SHAPE_WORDS[shapeId] ?? "Working";
  const pre = modifiers
    .map((m) => MOD_WORDS[m])
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
  return pre ? `${pre} ${noun} ${shp}` : `${noun} ${shp}`;
}

// ─────────────────────────────────────────────── composition

export interface ComposedSkill {
  name: string;
  power: number;
  rank: Rank;
  costInk: number;
  recoil: number;
  debt: number;
  successChance: number;
  description: string;
  tags: string[];
}

export interface ComposeInput {
  vectorId: string;
  shapeId: string;
  modifiers: string[];
  /** player's int + wis, averaged and normalised */
  insight: number;
  level: number;
  /** prior attempts logged with these exact components (0+) */
  familiarity: number;
  /** class research bonus */
  researchBonus: number;
  /** stable or risky? the Ledger likes some people */
  fortune: number;
}

/**
 * Deterministic power maths; the roll is returned as a chance so the bench can
 * show the player their odds before they spend the ink. Science, not slot machine.
 */
export function composeSkill(input: ComposeInput): ComposedSkill {
  const v = vector(input.vectorId);
  const s = shape(input.shapeId);
  const mods = input.modifiers.map((m) => modifier(m)).filter(Boolean) as Modifier[];

  const modPower = mods.reduce((acc, m) => acc * m.powerMult, 1);
  const modInk = mods.reduce((acc, m) => acc + m.inkAdd, 0);
  const modRecoil = mods.reduce((acc, m) => acc + m.recoil, 0);

  const levelScale = 1 + input.level * 0.085;
  const insightScale = 1 + input.insight * 0.03;

  const power = Math.round(
    v.weight * s.powerMult * modPower * levelScale * insightScale * (1 + input.familiarity * 0.06),
  );

  const costInk = Math.max(1, Math.round((v.weight / 6 + s.inkMult * 2 + modInk) * 10) / 10);
  const recoil = v.recoil + modRecoil;
  const debt = power > 400 ? Math.round((power - 400) / 60) : 0;

  // difficulty rises with volatility and with how much is being asked at once
  const difficulty = v.volatility * 0.55 + mods.length * 0.06 + (power / 5000);
  const competence =
    0.32 +
    input.insight * 0.022 +
    input.level * 0.012 +
    input.familiarity * 0.09 +
    (input.researchBonus - 1) * 0.7 +
    input.fortune * 0.004;

  const successChance = Math.max(0.05, Math.min(0.96, competence - difficulty + 0.18));

  const desc = `${s.name} shaped from ${v.name.toLowerCase()}. ${s.blurb} ${
    mods.length ? `Modified: ${mods.map((m) => m.blurb).join(" ")}` : "No modifiers."
  }`;

  const tags = [v.id, s.id, ...mods.map((m) => m.id)];

  return {
    name: composeName(input.vectorId, input.shapeId, input.modifiers),
    power,
    rank: rankFromPower(power),
    costInk,
    recoil,
    debt,
    successChance,
    description: desc,
    tags,
  };
}

// ─────────────────────────────────────────────── the skill library

export interface SkillTemplate {
  slug: string;
  name: string;
  rank: Rank;
  vector: string;
  shape: string;
  costInk: number;
  power: number;
  recoil: number;
  description: string;
  /** which class unlocks it, if any */
  fromClass?: string;
  /** how a player can otherwise obtain it */
  obtain: string;
}

export const SKILL_LIBRARY: SkillTemplate[] = [
  // Necromancer
  { slug: "raise-whisper", name: "Raise Whisper", rank: "F", vector: "void", shape: "touch", costInk: 2, power: 18, recoil: 1, description: "Wake a corpse enough to answer three questions. It resents the interruption.", fromClass: "necromancer", obtain: "Class" },
  { slug: "grave-touch", name: "Grave Touch", rank: "E", vector: "flesh", shape: "touch", costInk: 3, power: 42, recoil: 2, description: "Your hands carry the cold of the unwritten. Wounds dealt by them close badly.", fromClass: "necromancer", obtain: "Class" },
  { slug: "corpse-lantern", name: "Corpse Lantern", rank: "D", vector: "void", shape: "summon", costInk: 5, power: 120, recoil: 3, description: "A hovering light that follows the nearest thing the Ledger has given up on.", fromClass: "necromancer", obtain: "Class" },
  { slug: "the-second-name", name: "The Second Name", rank: "C", vector: "void", shape: "aura", costInk: 7, power: 260, recoil: 4, description: "You hold two names. The first can be killed; the second must be found.", fromClass: "necromancer", obtain: "Class" },
  { slug: "culled-retinue", name: "Culled Retinue", rank: "B", vector: "void", shape: "summon", costInk: 10, power: 480, recoil: 6, description: "Raise the revised as servants. They obey, and they remember being people.", fromClass: "necromancer", obtain: "Class" },
  { slug: "erase-wound", name: "Erase Wound", rank: "A", vector: "void", shape: "touch", costInk: 14, power: 860, recoil: 8, description: "Unwrite a wound — or a limb. The world fills the gap with whatever is nearest.", fromClass: "necromancer", obtain: "Class" },
  { slug: "the-ninth-word", name: "The Ninth Word", rank: "S", vector: "void", shape: "domain", costInk: 24, power: 1500, recoil: 12, description: "For the length of a breath, this place has no author but you.", fromClass: "necromancer", obtain: "Class" },

  // Blade Dancer
  { slug: "passage-cut", name: "Passage Cut", rank: "F", vector: "matter", shape: "edge", costInk: 2, power: 22, recoil: 0, description: "The academy's first taught technique: strike, step, hand off. In one motion.", fromClass: "blade-dancer", obtain: "Class" },
  { slug: "quick-step", name: "Quick Step", rank: "F", vector: "air", shape: "self", costInk: 1, power: 16, recoil: 0, description: "Six feet of nothing, instantly. Everyone learns it. Nobody masters it.", fromClass: "blade-dancer", obtain: "Class" },
  { slug: "switch-stance", name: "Switch Stance", rank: "D", vector: "matter", shape: "aura", costInk: 5, power: 118, recoil: 1, description: "Pass the initiative to an ally mid-swing. The technique that makes Circles work.", fromClass: "blade-dancer", obtain: "Class" },
  { slug: "seam-of-steel", name: "Seam of Steel", rank: "C", vector: "matter", shape: "edge", costInk: 7, power: 250, recoil: 2, description: "Find the line where a thing was joined, and cut along it.", fromClass: "blade-dancer", obtain: "Class" },
  { slug: "hundredth-breath", name: "Hundredth Breath", rank: "B", vector: "air", shape: "aura", costInk: 10, power: 470, recoil: 3, description: "One hundred cuts in the time of one. You will be very tired afterwards.", fromClass: "blade-dancer", obtain: "Class" },
  { slug: "unbroken-line", name: "Unbroken Line", rank: "A", vector: "matter", shape: "domain", costInk: 15, power: 840, recoil: 5, description: "Draw a line on the ground. Nothing that crosses it finishes crossing it.", fromClass: "blade-dancer", obtain: "Class" },
  { slug: "the-last-verse", name: "The Last Verse", rank: "S", vector: "light", shape: "edge", costInk: 22, power: 1450, recoil: 9, description: "A single cut that ends the sentence. Sera Vane has read the description of this one many times.", fromClass: "blade-dancer", obtain: "Class" },

  // Architect
  { slug: "inscribe-line", name: "Inscribe Line", rank: "F", vector: "mana", shape: "touch", costInk: 1, power: 12, recoil: 0, description: "Write a line of true instruction in the air. The first thing anyone learns.", fromClass: "architect", obtain: "Class" },
  { slug: "read-margin", name: "Read Margin", rank: "F", vector: "light", shape: "self", costInk: 2, power: 20, recoil: 0, description: "See the annotations the world left on a thing. Its history, and its errors.", fromClass: "architect", obtain: "Class" },
  { slug: "structural-ward", name: "Structural Ward", rank: "D", vector: "earth", shape: "wall", costInk: 6, power: 130, recoil: 1, description: "A ward that holds because it is correctly written, not because it is strong.", fromClass: "architect", obtain: "Class" },
  { slug: "the-clean-edit", name: "The Clean Edit", rank: "C", vector: "mana", shape: "field", costInk: 8, power: 255, recoil: 2, description: "Rewrite a failing thing as it fails. Repairs armour, wards, and occasionally arguments.", fromClass: "architect", obtain: "Class" },
  { slug: "lattice-field", name: "Lattice Field", rank: "B", vector: "mana", shape: "field", costInk: 11, power: 490, recoil: 3, description: "A grid of instruction over an area. Any working inside it must first be approved.", fromClass: "architect", obtain: "Class" },
  { slug: "authoring-hand", name: "Authoring Hand", rank: "A", vector: "mana", shape: "aura", costInk: 15, power: 850, recoil: 5, description: "For as long as you hold it, you may write one new instruction per breath.", fromClass: "architect", obtain: "Class" },
  { slug: "the-second-draft", name: "The Second Draft", rank: "S", vector: "light", shape: "domain", costInk: 25, power: 1520, recoil: 10, description: "Everything in this place is rewritten to your preference. The first draft is kept, somewhere, and resents you.", fromClass: "architect", obtain: "Class" },

  // Warden
  { slug: "stand-fast", name: "Stand Fast", rank: "F", vector: "earth", shape: "self", costInk: 1, power: 20, recoil: 0, description: "Root yourself. Nothing moves you this round.", fromClass: "warden", obtain: "Class" },
  { slug: "bulwark-mark", name: "Bulwark Mark", rank: "E", vector: "bond", shape: "touch", costInk: 3, power: 45, recoil: 1, description: "Mark an ally. While the mark holds, you take a share of what hits them.", fromClass: "warden", obtain: "Class" },
  { slug: "anchor-oath", name: "Anchor Oath", rank: "D", vector: "bond", shape: "aura", costInk: 5, power: 125, recoil: 2, description: "A promise that your line will not break. The Ledger enforces it. You will feel it enforce.", fromClass: "warden", obtain: "Class" },
  { slug: "the-wall-that-answers", name: "The Wall That Answers", rank: "C", vector: "earth", shape: "wall", costInk: 7, power: 265, recoil: 2, description: "Your shield returns what it takes, in kind and in quantity.", fromClass: "warden", obtain: "Class" },
  { slug: "share-the-bill", name: "Share the Bill", rank: "B", vector: "bond", shape: "field", costInk: 10, power: 465, recoil: 4, description: "Split incoming harm evenly across everyone inside. Nobody dies of one blow again.", fromClass: "warden", obtain: "Class" },
  { slug: "unmoved", name: "Unmoved", rank: "A", vector: "earth", shape: "self", costInk: 14, power: 830, recoil: 5, description: "You cannot be moved, compelled, frightened, or revised while it holds.", fromClass: "warden", obtain: "Class" },
  { slug: "the-last-door", name: "The Last Door", rank: "S", vector: "bond", shape: "wall", costInk: 22, power: 1480, recoil: 9, description: "A door that only opens for those you name. It has never been forced. It has been argued with.", fromClass: "warden", obtain: "Class" },

  // Nightblade
  { slug: "quiet-foot", name: "Quiet Foot", rank: "F", vector: "shadow", shape: "self", costInk: 1, power: 18, recoil: 0, description: "Your steps leave no record. The floorboards forget you.", fromClass: "nightblade", obtain: "Class" },
  { slug: "find-seam", name: "Find Seam", rank: "E", vector: "mind", shape: "self", costInk: 3, power: 40, recoil: 1, description: "See the one place a thing is held together. Everything is held together badly.", fromClass: "nightblade", obtain: "Class" },
  { slug: "unrecorded-step", name: "Unrecorded Step", rank: "D", vector: "shadow", shape: "self", costInk: 5, power: 122, recoil: 2, description: "Move somewhere you were not seen going. Even the narrator loses you briefly.", fromClass: "nightblade", obtain: "Class" },
  { slug: "borrowed-face", name: "Borrowed Face", rank: "C", vector: "mind", shape: "aura", costInk: 8, power: 248, recoil: 3, description: "Wear someone else's description. Convincing until you speak at length.", fromClass: "nightblade", obtain: "Class" },
  { slug: "the-quiet-account", name: "The Quiet Account", rank: "B", vector: "shadow", shape: "edge", costInk: 10, power: 475, recoil: 4, description: "A debt collected in silence. The target's allies do not learn it happened for a full day.", fromClass: "nightblade", obtain: "Class" },
  { slug: "nothing-to-declare", name: "Nothing to Declare", rank: "A", vector: "mind", shape: "self", costInk: 14, power: 825, recoil: 6, description: "For one hour you have no rank, no class, no stain, no name. Even you forget the details.", fromClass: "nightblade", obtain: "Class" },
  { slug: "the-missing-page", name: "The Missing Page", rank: "S", vector: "void", shape: "touch", costInk: 23, power: 1460, recoil: 10, description: "Remove a person from the record without killing them. They will not be looked for.", fromClass: "nightblade", obtain: "Class" },

  // Enchanter
  { slug: "kind-word", name: "Kind Word", rank: "F", vector: "bond", shape: "touch", costInk: 1, power: 16, recoil: 0, description: "Say the true, useful thing. Presence rises; hostility softens by one degree.", fromClass: "enchanter", obtain: "Class" },
  { slug: "reading-the-room", name: "Reading the Room", rank: "F", vector: "mind", shape: "self", costInk: 2, power: 22, recoil: 0, description: "You see who wants what in a room, without being told. The most useful skill in the academy.", fromClass: "enchanter", obtain: "Class" },
  { slug: "the-open-door", name: "The Open Door", rank: "D", vector: "bond", shape: "touch", costInk: 5, power: 124, recoil: 1, description: "Ask for something a person already wanted to give. Refusal becomes awkward rather than impossible.", fromClass: "enchanter", obtain: "Class" },
  { slug: "borrowed-courage", name: "Borrowed Courage", rank: "C", vector: "mind", shape: "aura", costInk: 7, power: 252, recoil: 2, description: "Lend someone your nerve. They act; you carry the fear afterwards.", fromClass: "enchanter", obtain: "Class" },
  { slug: "what-you-actually-want", name: "What You Actually Want", rank: "B", vector: "mind", shape: "bolt", costInk: 10, power: 468, recoil: 4, description: "Name a person's real desire aloud. It lands like a blade, and heals like one too.", fromClass: "enchanter", obtain: "Class" },
  { slug: "the-written-promise", name: "The Written Promise", rank: "A", vector: "bond", shape: "touch", costInk: 14, power: 840, recoil: 5, description: "Both parties write it. Both parties are held. Love and law are the same grammar.", fromClass: "enchanter", obtain: "Class" },
  { slug: "beloved-by-the-draft", name: "Beloved by the Draft", rank: "S", vector: "bond", shape: "domain", costInk: 24, power: 1500, recoil: 9, description: "In this place you are the thing everyone has been waiting for. True while you are believed.", fromClass: "enchanter", obtain: "Class" },

  // Beastcaller
  { slug: "call-beast", name: "Call Beast", rank: "F", vector: "air", shape: "summon", costInk: 2, power: 19, recoil: 0, description: "Whistle. Something nearby decides you are worth investigating.", fromClass: "beastcaller", obtain: "Class" },
  { slug: "read-track", name: "Read Track", rank: "F", vector: "mind", shape: "self", costInk: 2, power: 20, recoil: 0, description: "The ground tells you what passed, how long ago, and whether it was frightened.", fromClass: "beastcaller", obtain: "Class" },
  { slug: "the-trusting-hand", name: "The Trusting Hand", rank: "D", vector: "flesh", shape: "touch", costInk: 5, power: 128, recoil: 2, description: "Offer your hand to something that should bite it. Sometimes it works.", fromClass: "beastcaller", obtain: "Class" },
  { slug: "borrow-the-fang", name: "Borrow the Fang", rank: "C", vector: "flesh", shape: "self", costInk: 7, power: 258, recoil: 3, description: "Take a trait from a beast you have tamed — its bite, its eyes, its patience.", fromClass: "beastcaller", obtain: "Class" },
  { slug: "the-second-heart", name: "The Second Heart", rank: "B", vector: "flesh", shape: "summon", costInk: 11, power: 485, recoil: 4, description: "Bind a beast's life to yours. It will not die while you stand. You will feel every wound.", fromClass: "beastcaller", obtain: "Class" },
  { slug: "gloss-bond", name: "Gloss Bond", rank: "A", vector: "mind", shape: "touch", costInk: 15, power: 835, recoil: 6, description: "Bind a Gloss — a creature that wears faces. It will wear one for you, indefinitely.", fromClass: "beastcaller", obtain: "Class" },
  { slug: "the-wild-choir", name: "The Wild Choir", rank: "S", vector: "air", shape: "domain", costInk: 23, power: 1470, recoil: 9, description: "Every animal within a mile answers at once. The Fen has not heard this in four hundred years.", fromClass: "beastcaller", obtain: "Class" },

  // Runesmith
  { slug: "temper-edge", name: "Temper Edge", rank: "F", vector: "fire", shape: "touch", costInk: 2, power: 20, recoil: 0, description: "Harden a blade's intent. +1 effective rank to a weapon for a day.", fromClass: "runesmith", obtain: "Class" },
  { slug: "mark-of-use", name: "Mark of Use", rank: "F", vector: "bond", shape: "touch", costInk: 2, power: 18, recoil: 0, description: "Know a thing's history by touching it. Who made it, who broke it, who lied about it.", fromClass: "runesmith", obtain: "Class" },
  { slug: "bind-rank", name: "Bind Rank", rank: "D", vector: "matter", shape: "touch", costInk: 6, power: 126, recoil: 1, description: "Permanently raise an item's rank by one letter, up to your own rank. Costs materials.", fromClass: "runesmith", obtain: "Class" },
  { slug: "the-honest-weight", name: "The Honest Weight", rank: "C", vector: "earth", shape: "aura", costInk: 8, power: 254, recoil: 2, description: "Your gear cannot be stolen, dropped, or lied about. It returns to your hand.", fromClass: "runesmith", obtain: "Class" },
  { slug: "forge-the-name", name: "Forge the Name", rank: "B", vector: "fire", shape: "summon", costInk: 11, power: 478, recoil: 4, description: "Name a weapon aloud while forging it. The name becomes a property it will always have.", fromClass: "runesmith", obtain: "Class" },
  { slug: "relic-sense", name: "Relic Sense", rank: "A", vector: "light", shape: "self", costInk: 14, power: 828, recoil: 4, description: "Feel where a Binding's Relic is, and what rule it carries.", fromClass: "runesmith", obtain: "Class" },
  { slug: "the-hand-that-made-it", name: "The Hand That Made It", rank: "S", vector: "bond", shape: "touch", costInk: 22, power: 1490, recoil: 8, description: "Touch anything made and become, briefly, its author. It obeys only you.", fromClass: "runesmith", obtain: "Class" },

  // General / discoverable
  { slug: "ink-sense", name: "Ink Sense", rank: "F", vector: "mana", shape: "self", costInk: 1, power: 14, recoil: 0, description: "Feel the ink in a room: how much, whose, and how frightened.", obtain: "Study: First Principles, week one" },
  { slug: "lesser-mend", name: "Lesser Mend", rank: "E", vector: "flesh", shape: "touch", costInk: 3, power: 44, recoil: 1, description: "Close a wound. Not cleanly. It will ache in weather for the rest of your life.", obtain: "Study: Flesh Chair, or buy from a temple" },
  { slug: "the-second-look", name: "The Second Look", rank: "E", vector: "mind", shape: "self", costInk: 3, power: 46, recoil: 1, description: "Re-examine a memory you hold. It may not be the one you think it is.", obtain: "Study: Mind Chair" },
  { slug: "counter-word", name: "Counter-Word", rank: "D", vector: "mana", shape: "bolt", costInk: 5, power: 119, recoil: 1, description: "Speak against an incoming working. Cancels it if your Insight exceeds the caster's.", obtain: "Study: the Registry's public lectures" },
  { slug: "passage-drill", name: "Passage Drill", rank: "D", vector: "bond", shape: "aura", costInk: 5, power: 116, recoil: 1, description: "Practised handoff. Your Circle's switches land 40% faster.", obtain: "Prize: Inter-House Games" },
  { slug: "witness-rite", name: "Witness Rite", rank: "D", vector: "bond", shape: "field", costInk: 6, power: 121, recoil: 1, description: "Declare a thing done before witnesses. The Ledger records it as true.", obtain: "Prize: any public victory" },
  { slug: "stain-read", name: "Stain Read", rank: "C", vector: "light", shape: "self", costInk: 7, power: 246, recoil: 2, description: "See how much a person has paid in Collateral, and roughly for what.", obtain: "Study: Bond Chair, third term" },
  { slug: "marginalia-lure", name: "Marginalia Lure", rank: "C", vector: "mind", shape: "field", costInk: 8, power: 249, recoil: 3, description: "Loose ends draw marginalia. Make one deliberately. It is exactly as dangerous as it sounds.", obtain: "Drop: Annotation, studied" },
  { slug: "quiet-clause", name: "Quiet Clause", rank: "B", vector: "shadow", shape: "aura", costInk: 10, power: 466, recoil: 4, description: "An agreement nobody can report. The Accord of Quiet Hands pays a great deal for this.", obtain: "Faction: the Accord of Quiet Hands" },
  { slug: "subjunctive-turn", name: "Subjunctive Turn", rank: "B", vector: "light", shape: "bolt", costInk: 12, power: 492, recoil: 4, description: "Declare what might be. If enough witnesses accept it, it becomes what is.", obtain: "Study: Subjunctive Chair, fourth term" },
  { slug: "gloss-copy", name: "Gloss Copy", rank: "A", vector: "mind", shape: "summon", costInk: 16, power: 845, recoil: 6, description: "Make a copy of yourself out of someone's memory of you. It believes it is you.", obtain: "Drop: Gloss, studied" },
  { slug: "erratum-edge", name: "Erratum Edge", rank: "A", vector: "void", shape: "edge", costInk: 17, power: 858, recoil: 8, description: "A blade made from an uncorrected error. Cuts things that are correct.", obtain: "Drop: Erratum" },
  { slug: "the-blank-page", name: "The Blank Page", rank: "S", vector: "void", shape: "self", costInk: 20, power: 1420, recoil: 0, description: "For one scene, nothing can predict, record, or bind you. Not even the Chorister.", obtain: "Fate: the blank page remembers itself" },
  { slug: "author-of-one-thing", name: "Author of One Thing", rank: "SS", vector: "void", shape: "domain", costInk: 30, power: 2600, recoil: 14, description: "Choose one fact in this place. It is now whatever you write it as. The Ledger will send the bill.", obtain: "Fate: arc VI" },
  { slug: "the-ninth-draft", name: "The Ninth Draft", rank: "SSS", vector: "void", shape: "domain", costInk: 45, power: 4600, recoil: 20, description: "Write a new page of the world. There is no precedent, and no way back.", obtain: "Fate: endgame" },
];

export function getSkillTemplate(slug: string): SkillTemplate | undefined {
  return SKILL_LIBRARY.find((s) => s.slug === slug);
}

/** Familiarity for the research bench: how many prior attempts share these parts. */
export function familiarityFor(
  log: { vector: string; shape: string; modifiers: string[] }[],
  vectorId: string,
  shapeId: string,
  modifiers: string[],
): number {
  const key = [vectorId, shapeId, [...modifiers].sort().join(",")].join("|");
  return log.filter(
    (l) => [l.vector, l.shape, [...(l.modifiers ?? [])].sort().join(",")].join("|") === key,
  ).length;
}
