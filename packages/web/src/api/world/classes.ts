import type { StatKey } from "./ranks";

/**
 * ILVARIS — the eight classes.
 *
 * Progression law (fixed, engine-enforced):
 *   • Every level: +1 to each of the class's two main stats, and +3 free points
 *     the player distributes wherever they like.
 *   • Class skills unlock on the level table below.
 *   • Additional skills come from research, study, prizes, drops, and fate.
 */

export interface ClassSkillUnlock {
  level: number;
  slug: string;
}

export interface CharClass {
  id: string;
  name: string;
  epithet: string;
  tagline: string;
  mainStats: [StatKey, StatKey];
  /** starting stat block before the class bonus */
  baseStats: Record<StatKey, number>;
  /** vectors this class reads most naturally */
  affinities: string[];
  /** research bonus multiplier for its own vectors */
  researchBonus: number;
  startingSkills: string[];
  skillTable: ClassSkillUnlock[];
  playstyle: string;
  /** what grinding looks like for this class */
  grindLoop: string;
  difficulty: "Forgiving" | "Standard" | "Demanding" | "Punishing";
  /** seed for the class portrait */
  portraitSeed: string;
}

const BASE: Record<StatKey, number> = { str: 5, agi: 5, vit: 5, int: 5, wis: 5, cha: 5, luk: 5 };

export const CLASSES: CharClass[] = [
  {
    id: "necromancer",
    name: "Necromancer",
    epithet: "Reader of the Culled",
    tagline: "The dead were revised. You are the only one who can hear them complain.",
    mainStats: ["int", "vit"],
    baseStats: { ...BASE, int: 8, vit: 7 },
    affinities: ["void", "flesh", "shadow"],
    researchBonus: 1.15,
    startingSkills: ["raise-whisper", "grave-touch"],
    skillTable: [
      { level: 3, slug: "corpse-lantern" },
      { level: 5, slug: "the-second-name" },
      { level: 8, slug: "culled-retinue" },
      { level: 12, slug: "erase-wound" },
      { level: 16, slug: "the-ninth-word" },
    ],
    playstyle:
      "Slow to start, then exponential. Your minions grind for you, and every monster you kill is a candidate. Highest ceiling in the game, and the highest Stain.",
    grindLoop: "Farm marginalia in the warrens, harvest bodies, raise a retinue, descend.",
    difficulty: "Demanding",
    portraitSeed:
      "young scholar in a high-collared charcoal coat, ink-stained fingers, a floating open grimoire at one shoulder, faint grey figures standing behind in the dark",
  },
  {
    id: "blade-dancer",
    name: "Blade Dancer",
    epithet: "The Passage",
    tagline: "Two blades, one motion, no gap between them.",
    mainStats: ["str", "agi"],
    baseStats: { ...BASE, str: 8, agi: 8 },
    affinities: ["matter", "mana"],
    researchBonus: 1.0,
    startingSkills: ["passage-cut", "quick-step"],
    skillTable: [
      { level: 3, slug: "switch-stance" },
      { level: 5, slug: "seam-of-steel" },
      { level: 8, slug: "hundredth-breath" },
      { level: 12, slug: "unbroken-line" },
      { level: 16, slug: "the-last-verse" },
    ],
    playstyle:
      "Front-loaded power and a clean skill curve. Duel and tournament arcs are yours. Weak to Mind workings — you solve problems by closing distance.",
    grindLoop: "Duel ladder, arena purses, monster bounties on the fen road.",
    difficulty: "Forgiving",
    portraitSeed:
      "athletic young swordswoman-and-swordsman silhouette, twin curved blades, cream-and-charcoal academy uniform with a red sash, wind moving the coat, flat vector manhwa style",
  },
  {
    id: "architect",
    name: "Architect",
    epithet: "Inscriber of First Principles",
    tagline: "Everyone else casts spells. You write them.",
    mainStats: ["int", "wis"],
    baseStats: { ...BASE, int: 9, wis: 8 },
    affinities: ["mana", "light", "matter"],
    researchBonus: 1.4,
    startingSkills: ["inscribe-line", "read-margin"],
    skillTable: [
      { level: 3, slug: "structural-ward" },
      { level: 5, slug: "the-clean-edit" },
      { level: 8, slug: "lattice-field" },
      { level: 12, slug: "authoring-hand" },
      { level: 16, slug: "the-second-draft" },
    ],
    playstyle:
      "The research class. Cheapest experimentation, fastest discovery, most skill slots. Fragile in a straight fight until it has written something cruel.",
    grindLoop: "Research bench, study halls, sell discoveries to the Mercery, teach for coin.",
    difficulty: "Standard",
    portraitSeed:
      "scholar with spectacles and a quill of light, surrounded by rotating geometric glyph rings, dark charcoal robes with cream trim, flat vector manhwa style",
  },
  {
    id: "warden",
    name: "Warden",
    epithet: "The Held Line",
    tagline: "Everything behind you lives. That is the whole job.",
    mainStats: ["vit", "str"],
    baseStats: { ...BASE, vit: 9, str: 7 },
    affinities: ["matter", "bond"],
    researchBonus: 0.95,
    startingSkills: ["stand-fast", "bulwark-mark"],
    skillTable: [
      { level: 3, slug: "anchor-oath" },
      { level: 5, slug: "the-wall-that-answers" },
      { level: 8, slug: "share-the-bill" },
      { level: 12, slug: "unmoved" },
      { level: 16, slug: "the-last-door" },
    ],
    playstyle:
      "Enormous HP and ink, lowest damage. Required in every Binding raid. Circles will pay you in favours forever.",
    grindLoop: "Escort contracts, expedition tanking, bounty boards for things too big to solo.",
    difficulty: "Forgiving",
    portraitSeed:
      "broad-shouldered student in heavy academy plate over a charcoal coat, tower shield with an inked sigil, cream banner behind, flat vector manhwa style",
  },
  {
    id: "nightblade",
    name: "Nightblade",
    epithet: "The Unread",
    tagline: "If the Ledger didn't record it, it didn't happen.",
    mainStats: ["agi", "luk"],
    baseStats: { ...BASE, agi: 8, luk: 8 },
    affinities: ["shadow", "mind"],
    researchBonus: 1.05,
    startingSkills: ["quiet-foot", "find-seam"],
    skillTable: [
      { level: 3, slug: "unrecorded-step" },
      { level: 5, slug: "borrowed-face" },
      { level: 8, slug: "the-quiet-account" },
      { level: 12, slug: "nothing-to-declare" },
      { level: 16, slug: "the-missing-page" },
    ],
    playstyle:
      "Critical-hit gambling, theft, infiltration. The best class for the Quiet Hands arc and the worst for making friends you don't intend to keep.",
    grindLoop: "Night bounties, theft, the black market, and monsters that never see you.",
    difficulty: "Standard",
    portraitSeed:
      "slender hooded figure in charcoal, one visible eye, a thin dagger of black ink, cream fog behind, flat vector manhwa style",
  },
  {
    id: "enchanter",
    name: "Enchanter",
    epithet: "Speaker to Want",
    tagline: "Every person is a page with a sentence they want written.",
    mainStats: ["cha", "wis"],
    baseStats: { ...BASE, cha: 9, wis: 7 },
    affinities: ["bond", "mind", "light"],
    researchBonus: 1.2,
    startingSkills: ["kind-word", "reading-the-room"],
    skillTable: [
      { level: 3, slug: "the-open-door" },
      { level: 5, slug: "borrowed-courage" },
      { level: 8, slug: "what-you-actually-want" },
      { level: 12, slug: "the-written-promise" },
      { level: 16, slug: "beloved-by-the-draft" },
    ],
    playstyle:
      "Social magic as a real combat tree. Opens every heroine route faster, defuses fights, and can end a duel without drawing. Legal — until it isn't.",
    grindLoop: "Academy society, salons, patronage, favours traded at a profit, and every conversation is a fight you win quietly.",
    difficulty: "Standard",
    portraitSeed:
      "elegant young noble in cream-and-charcoal uniform with gold thread, holding a fan of inked cards, warm light, flat vector manhwa style",
  },
  {
    id: "beastcaller",
    name: "Beastcaller",
    epithet: "Friend of Marginalia",
    tagline: "The world's mistakes are animals too.",
    mainStats: ["wis", "vit"],
    baseStats: { ...BASE, wis: 8, vit: 7 },
    affinities: ["flesh", "air", "mind"],
    researchBonus: 1.1,
    startingSkills: ["call-beast", "read-track"],
    skillTable: [
      { level: 3, slug: "the-trusting-hand" },
      { level: 5, slug: "borrow-the-fang" },
      { level: 8, slug: "the-second-heart" },
      { level: 12, slug: "gloss-bond" },
      { level: 16, slug: "the-wild-choir" },
    ],
    playstyle:
      "You gain skills by taming what you kill — monsters teach you their tricks. Enormous breadth, no single overwhelming trick.",
    grindLoop: "Track and tame in the Fen, sell breeding stock, run monster-led expeditions.",
    difficulty: "Standard",
    portraitSeed:
      "windswept student with an ink-black wolf at their side and a blot perched on one shoulder, charcoal field coat, cream moor behind, flat vector manhwa style",
  },
  {
    id: "runesmith",
    name: "Runesmith",
    epithet: "Binder of Things",
    tagline: "Power is in the object. Hold the object.",
    mainStats: ["int", "str"],
    baseStats: { ...BASE, int: 8, str: 7 },
    affinities: ["matter", "bond", "fire"],
    researchBonus: 1.15,
    startingSkills: ["temper-edge", "mark-of-use"],
    skillTable: [
      { level: 3, slug: "bind-rank" },
      { level: 5, slug: "the-honest-weight" },
      { level: 8, slug: "forge-the-name" },
      { level: 12, slug: "relic-sense" },
      { level: 16, slug: "the-hand-that-made-it" },
    ],
    playstyle:
      "The only class that can raise an item's rank. You make the gear everyone else fights over, which makes you both rich and a target.",
    grindLoop: "Mining and salvage runs, crafting commissions, upgrading other players' — sorry, other students' — gear at a markup.",
    difficulty: "Standard",
    portraitSeed:
      "soot-marked young smith with an inked hammer and a glowing rune-band on one forearm, charcoal apron over academy uniform, cream forge-light, flat vector manhwa style",
  },
];

export function getClass(id: string): CharClass {
  const c = CLASSES.find((x) => x.id === id);
  if (!c) throw new Error(`No such class: ${id}`);
  return c;
}

export const STAT_GAIN_PER_LEVEL = { main: 1, free: 3 } as const;

/** Class skills unlocked at or below a level. */
export function unlockedClassSkills(classId: string, level: number): string[] {
  const c = getClass(classId);
  return c.skillTable.filter((s) => s.level <= level).map((s) => s.slug);
}
