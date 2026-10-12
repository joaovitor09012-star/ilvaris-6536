import type { Rank } from "./ranks";

/**
 * ILVARIS — the bestiary. Ranked F to SSS.
 *
 * Marginalia are drafting errors with appetites. The Culled are absences that
 * walk. The rest is just wildlife, which kills more people than either.
 */

export interface MonsterTemplate {
  id: string;
  name: string;
  rank: Rank;
  level: number;
  hp: number;
  damage: number;
  armour: number;
  /** location ids where it is found */
  habitat: string[];
  traits: string[];
  drops: { itemId: string; chance: number }[];
  /** what a student knows before studying it */
  lore: string;
  /** what only a studied bestiary entry reveals */
  studied: string;
  /** soloable, needs a party, or needs a full raid */
  engagement: "Solo" | "Duo" | "Circle" | "Raid";
}

export const MONSTERS: MonsterTemplate[] = [
  // ── Tier 1: vermin
  { id: "blot", name: "Blot", rank: "F", level: 1, hp: 18, damage: 4, armour: 0, habitat: ["vellum-cellars", "hollow-market", "blot-warrens"], traits: ["Swarm (3d6)", "Feeds on loose ends"], drops: [{ itemId: "blot-ichor", chance: 0.5 }], lore: "A smudge the size of a fist, wet, that moves against the light. Breeds wherever too many people are keeping secrets.", studied: "Blots cannot cross a line of fresh ink. First-years are taught this on day two, and it has saved more lives than any weapon.", engagement: "Solo" },
  { id: "margin-mite", name: "Margin Mite", rank: "F", level: 2, hp: 12, damage: 3, armour: 1, habitat: ["vellum-cellars", "the-long-footnote", "drowned-library"], traits: ["Eats paper", "Harmless alone"], drops: [{ itemId: "blot-ichor", chance: 0.3 }], lore: "A grey speck with too many legs. Lives in the gutters of libraries.", studied: "They nest in unread books. A library with mites has a book nobody has opened in forty years — which is usually a book worth opening.", engagement: "Solo" },
  { id: "fen-hound", name: "Fen Hound", rank: "E", level: 4, hp: 40, damage: 9, armour: 2, habitat: ["hollow-fen", "fen-gate", "old-trade-road"], traits: ["Hunts in threes", "Tracks by sound"], drops: [{ itemId: "clean-bandage", chance: 0.2 }], lore: "A lean grey dog with no eyes and excellent ears. Ordinary wildlife. Ordinary wildlife kills most students who die.", studied: "They will not cross running water. The Fen villagers build their fences out of streams.", engagement: "Solo" },
  { id: "crag-lion", name: "Crag Lion", rank: "D", level: 8, hp: 95, damage: 18, armour: 5, habitat: ["crag-lions-rest", "annotation-ridge"], traits: ["Ambush", "Territorial"], drops: [{ itemId: "mend-salve", chance: 0.25 }], lore: "Muscle and patience. It has been on that ledge since before you were enrolled.", studied: "It attacks anything that enters the ledge, including things much larger than itself. This is not courage; it is a territory instinct, and it can be used.", engagement: "Solo" },
  { id: "river-eel", name: "River Eel", rank: "E", level: 5, hp: 34, damage: 12, armour: 0, habitat: ["river-quay", "hollow-fen"], traits: ["Grapples", "Drowns"], drops: [{ itemId: "hearth-stew", chance: 0.1 }], lore: "Six feet of muscle in water you were told was shallow.", studied: "They hunt by temperature. Go in cold and they ignore you.", engagement: "Solo" },

  // ── Tier 2: marginalia
  { id: "annotation", name: "Annotation", rank: "D", level: 7, hp: 80, damage: 16, armour: 4, habitat: ["blot-warrens", "margin-scar", "annotation-ridge"], traits: ["Hunts the Stain-marked", "Ambush"], drops: [{ itemId: "annotation-quill", chance: 0.4 }, { itemId: "blot-ichor", chance: 0.6 }], lore: "Scribbled limbs, one long line for a mouth, and a terrible sense of direction — it always arrives exactly where the loose ends are.", studied: "An Annotation can smell unpaid debts. It ignores anyone with zero Ledger Debt, which makes it the only creature in Ilvaris that finds poverty pleasant.", engagement: "Solo" },
  { id: "errant-line", name: "Errant Line", rank: "D", level: 9, hp: 70, damage: 20, armour: 2, habitat: ["margin-scar", "fen-of-first-draft"], traits: ["Ignores armour", "Cuts in straight lines"], drops: [{ itemId: "blot-ichor", chance: 0.4 }], lore: "A line of ink, six feet long, that has decided to be a blade.", studied: "It cannot turn. Stand still and it will overshoot. This is the single most-taught fact in the second-year combat course.", engagement: "Solo" },
  { id: "gloss", name: "Gloss", rank: "B", level: 15, hp: 260, damage: 34, armour: 8, habitat: ["margin-scar", "the-long-footnote", "carrow-backstreets"], traits: ["Wears a copied face", "Asks questions", "Social predator"], drops: [{ itemId: "gloss-veil", chance: 0.3 }], lore: "It looks like someone you know. Almost. It asks you questions to learn how that person talks, and then it goes to see their family.", studied: "A Gloss's copy is built from other people's memories. Ask it about a private event no one else witnessed and it will have nothing to say — a gap you can exploit, and a way to identify one in a crowd.", engagement: "Duo" },
  { id: "stain-wretch", name: "Stain Wretch", rank: "C", level: 13, hp: 190, damage: 26, armour: 6, habitat: ["blot-warrens", "errata-wastes"], traits: ["Feeds on Collateral", "Grows when wounded"], drops: [{ itemId: "stain-balm", chance: 0.2 }], lore: "A former Inscriber who paid too much Recoil and did not stop. It is still, technically, a person.", studied: "It cannot be killed by working on it — every working it absorbs makes it larger. Only ordinary steel ends it. This is why the Registry requires the sword drill even for pure scholars.", engagement: "Duo" },

  // ── Tier 3: serious
  { id: "errata", name: "Erratum", rank: "A", level: 22, hp: 620, damage: 62, armour: 14, habitat: ["errata-wastes", "binding-floor", "long-footnote-vault"], traits: ["Unwrites space", "Immune to Declarative", "Remembers being corrected"], drops: [{ itemId: "erratum-shard", chance: 0.5 }, { itemId: "master-stylus", chance: 0.02 }], lore: "A corrected passage that resented the correction. It can remove a doorway, a name, or the memory of having had an arm.", studied: "Errata can only unwrite things that are *written*. Improvised, unwitnessed, unrecorded actions are invisible to them — the whole reason the Nightblade discipline exists.", engagement: "Circle" },
  { id: "gloss-choir", name: "Gloss Choir", rank: "A", level: 25, hp: 700, damage: 55, armour: 10, habitat: ["carrow-backstreets", "quiet-quarter", "the-long-footnote"], traits: ["Three faces at once", "Speaks in your own voice"], drops: [{ itemId: "gloss-veil", chance: 0.8 }], lore: "Three Glosses that learned to share a copy. They are, by any measure, a family.", studied: "A Choir cannot maintain three faces if all three are asked to speak simultaneously. It will slip — and what it says when it slips is usually true, and usually about you.", engagement: "Circle" },
  { id: "culled-walker", name: "Culled Walker", rank: "B", level: 18, hp: 420, damage: 44, armour: 12, habitat: ["errata-wastes", "culled-court", "palimpsest-descent"], traits: ["Cannot be remembered", "Immune to Mind", "Patient"], drops: [{ itemId: "culled-absence", chance: 0.2 }], lore: "An absence shaped like a person. You will forget meeting it about nine seconds after you turn away.", studied: "Writing its description down *while* looking at it defeats the forgetting — but the description then becomes a thing the Ledger can find, and it will come for the paper.", engagement: "Circle" },
  { id: "palimpsest-echo", name: "Palimpsest Echo", rank: "A", level: 27, hp: 760, damage: 70, armour: 16, habitat: ["palimpsest", "palimpsest-descent"], traits: ["Copies your last working", "Speaks an older language"], drops: [{ itemId: "erratum-shard", chance: 0.35 }], lore: "A person from a draft that was overwritten. They remember a world that is not this one and they are extremely polite about it.", studied: "They mirror the last working used near them. Cast nothing twice and they have nothing to answer with.", engagement: "Circle" },

  // ── Tier 4: Binding-scale
  { id: "the-fourth-binding", name: "The Fourth Binding", rank: "S", level: 35, hp: 3200, damage: 120, armour: 24, habitat: ["binding-floor"], traits: ["Role-shaped", "Requires a duelist", "Cannot be fled"], drops: [{ itemId: "binding-relic-core", chance: 1 }, { itemId: "relic-blade", chance: 0.5 }], lore: "Not a monster. A role the world has decided must be played, grown into a shape that can play it. It is waiting for a duelist.", studied: "The Binding does not want to win. It wants the role *completed*. It fights to the exact strength of its opposite — which means bringing a weaker duelist makes it weaker. The Registry considers this a loophole. Sera Vane considers it an insult.", engagement: "Raid" },
  { id: "binding-of-the-fen", name: "Binding of the Fen", rank: "A", level: 24, hp: 1400, damage: 78, armour: 14, habitat: ["hollow-fen", "fen-of-first-draft"], traits: ["Drowns the field", "Summons Blots"], drops: [{ itemId: "binding-relic-core", chance: 1 }], lore: "The Fen's Binding: a role about grief that nobody has finished playing for two hundred years.", studied: "It can only be resolved by someone who has actually lost something and admits it. The Registry's raid parties keep failing this one.", engagement: "Circle" },
  { id: "the-ninth-draft", name: "The Ninth Draft", rank: "SSS", level: 60, hp: 12000, damage: 260, armour: 40, habitat: ["the-blank"], traits: ["Edits the world", "Cannot be surprised", "Writes your moves before you make them", "Unauthorised"], drops: [{ itemId: "the-ninth-draft", chance: 0 }], lore: "A Culled that learned to write. Eighty years of patient self-editing. It is not evil; it is unapproved.", studied: "It has one weakness and it is structural: it can only edit what it can read. You are the only thing in Ilvaris it has never managed to read.", engagement: "Raid" },
];

export function getMonster(id: string): MonsterTemplate | undefined {
  return MONSTERS.find((m) => m.id === id);
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * The Registrar writes free text, so it will sometimes file a creature under an
 * id of its own invention — "blot-small" for a Blot. Resolving that back onto
 * the canon is cheaper and safer than letting a phantom species into the book.
 * Returns null when the creature genuinely is new, which is legal: the world has
 * things in it that are not in the roster yet.
 */
export function resolveMonsterId(raw: string): string | null {
  if (!raw) return null;
  const key = slug(raw);
  if (!key) return null;

  const exact = MONSTERS.find((m) => m.id === key);
  if (exact) return exact.id;

  const byName = MONSTERS.find((m) => slug(m.name) === key);
  if (byName) return byName.id;

  /** "blot-small", "small-blot", "blot-swarm" → blot */
  const contained = MONSTERS.filter((m) => key === m.id || key.startsWith(`${m.id}-`) || key.endsWith(`-${m.id}`));
  if (contained.length === 1) return contained[0].id;

  /** last resort: a canon id that appears anywhere inside the raw id */
  const inside = MONSTERS.filter((m) => key.includes(m.id)).sort((a, b) => b.id.length - a.id.length);
  return inside[0]?.id ?? null;
}

/** Human-readable fallback for a creature the registrar invented but did not describe. */
export function titleFromSlug(raw: string): string {
  return slug(raw)
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** Monsters that can appear at a location, filtered by player depth. */
export function monstersAt(locationId: string, depth: number): MonsterTemplate[] {
  return MONSTERS.filter((m) => m.habitat.includes(locationId)).filter(
    (m) => m.level <= depth + 8,
  );
}
