import type { Rank } from "./ranks";

/**
 * ILVARIS — items. Ranked F to SSS. Price in shards (100 shards = 1 mark).
 */

export type ItemType =
  | "weapon"
  | "armour"
  | "accessory"
  | "consumable"
  | "material"
  | "relic"
  | "tool"
  | "ink";

export interface ItemTemplate {
  id: string;
  name: string;
  rank: Rank;
  type: ItemType;
  price: number;
  description: string;
  /** mechanical effect, read by the engine and the narrator */
  effect?: string;
  /** where it comes from */
  source: string;
  /** can be sold on the open market? */
  tradeable: boolean;
}

export const ITEMS: ItemTemplate[] = [
  // ── tools & ink
  { id: "apprentice-stylus", name: "Apprentice Stylus", rank: "F", type: "tool", price: 1200, description: "Pale birch, copper ferrule, worn smooth. Every first-year has one.", effect: "Required to inscribe. No bonus.", source: "Vellum stores", tradeable: true },
  { id: "journeyman-stylus", name: "Journeyman Stylus", rank: "D", type: "tool", price: 40000, description: "Blackthorn and silver, with a reservoir in the shaft. Holds four drams.", effect: "+2 effective Insight for research.", source: "Mercery", tradeable: true },
  { id: "master-stylus", name: "Master Stylus", rank: "A", type: "tool", price: 300000, description: "Nobody knows what it is made of. It is warm, and it writes slightly before you mean it.", effect: "+5 Insight, halves research failure cost.", source: "Registry vault / Binding relic", tradeable: true },
  { id: "ink-dram", name: "Ink, one dram", rank: "E", type: "ink", price: 200, description: "Raw instruction, bottled. Tastes of cold iron.", effect: "Restore 1 dram of ink.", source: "Mercery, everywhere", tradeable: true },
  { id: "ink-flask", name: "Ink Flask (five drams)", rank: "D", type: "ink", price: 950, description: "A stoppered brass flask. The Mercery's single best-selling object.", effect: "Restore 5 drams of ink.", source: "Mercery", tradeable: true },
  { id: "black-ink", name: "Black Ink", rank: "B", type: "ink", price: 4200, description: "Harvested, not drawn. Someone paid for this with something other than money.", effect: "Restore 5 drams and +3 to the next research roll.", source: "Black market", tradeable: true },
  { id: "candle-stub", name: "Library Candle-Stub", rank: "F", type: "consumable", price: 30, description: "Burns for an hour and smells of beeswax and other people's anxiety.", effect: "Study a lore entry without a tutor.", source: "Everywhere", tradeable: true },
  { id: "codex-blank", name: "Codex", rank: "F", type: "tool", price: 800, description: "Your status sheet, bound in grey leather. The first page is blank and will not take ink.", effect: "Your interface. Cannot be dropped.", source: "Issued at enrollment", tradeable: false },

  // ── consumables
  { id: "barley-loaf", name: "Barley Loaf", rank: "F", type: "consumable", price: 8, description: "Dense, warm, honest.", effect: "+4 HP.", source: "Any stall", tradeable: true },
  { id: "hearth-stew", name: "Hearth Stew", rank: "F", type: "consumable", price: 14, description: "Whatever the inn had. Always better than it sounds.", effect: "+10 HP, +1 ink.", source: "Taverns", tradeable: true },
  { id: "mend-salve", name: "Mend Salve", rank: "E", type: "consumable", price: 240, description: "Flesh vector, bottled by the temple. Smells of iron and mint.", effect: "Heal 25 HP.", source: "Temples, apothecaries", tradeable: true },
  { id: "clean-bandage", name: "Clean Bandage", rank: "F", type: "consumable", price: 40, description: "Cloth and a little wax. Stops bleeding; does not stop anything else.", effect: "Heal 8 HP, stop bleeding.", source: "Everywhere", tradeable: true },
  { id: "stain-balm", name: "Stain Balm", rank: "C", type: "consumable", price: 2600, description: "Reduces Stain by 1. The smell never leaves the jar, or the person.", effect: "−1 Stain.", source: "Bond Chair dispensary", tradeable: true },
  { id: "quiet-draught", name: "Quiet Draught", rank: "D", type: "consumable", price: 1800, description: "For the night before a duel. Sleep without dreams, which is not the same as rest.", effect: "Full ink on waking, −5 HP.", source: "Apothecaries", tradeable: true },
  { id: "witness-tonic", name: "Witness Tonic", rank: "C", type: "consumable", price: 2200, description: "Makes an audience look at you. Useful, and slightly shameful.", effect: "Triple ink regeneration this scene.", source: "Black market", tradeable: true },

  // ── weapons
  { id: "academy-sabre", name: "Academy Sabre", rank: "F", type: "weapon", price: 900, description: "Standard issue, unremarkable, entirely adequate.", effect: "+3 damage.", source: "Vellum armoury", tradeable: true },
  { id: "duelist-pair", name: "Duelist's Pair", rank: "D", type: "weapon", price: 22000, description: "Two curved blades, matched to a hair's weight. Sera Vane's preferred shape.", effect: "+14 damage, +1 initiative.", source: "Carrow weaponsmiths", tradeable: true },
  { id: "fen-spear", name: "Fen Spear", rank: "D", type: "weapon", price: 18000, description: "Eight feet of ashwood with a blot-iron head. Reach is a kind of armour.", effect: "+12 damage, strikes first against beasts.", source: "Fen villages", tradeable: true },
  { id: "tower-shield", name: "Tower Shield", rank: "C", type: "armour", price: 52000, description: "Door-sized. Inked on the inside with a Warden's promise.", effect: "+8 armour, allies behind you take 30% less.", source: "Vellum armoury", tradeable: true },
  { id: "corpse-lantern-mace", name: "Lantern-Mace", rank: "C", type: "weapon", price: 48000, description: "A mace with a cage at the head. Something inside it is still trying to speak.", effect: "+20 damage, +4 vs the Culled.", source: "Necromancer requisition", tradeable: true },
  { id: "nightblade-kris", name: "Unrecorded Kris", rank: "B", type: "weapon", price: 160000, description: "No smith will admit to making it. It does not appear in inventories.", effect: "+32 damage, ignores 25% armour, cannot be found on your person.", source: "Quiet Hands", tradeable: false },
  { id: "relic-blade", name: "Relic: The Line That Held", rank: "A", type: "relic", price: 0, description: "Taken from the Second Binding. A blade that remembers being the last thing between a town and the dark.", effect: "+55 damage, allies within ten paces cannot be flanked.", source: "Binding reward", tradeable: false },

  // ── armour
  { id: "student-coat", name: "Student's Coat", rank: "F", type: "armour", price: 300, description: "Charcoal wool, cream trim, red sash by year. Instantly identifiable.", effect: "+2 armour.", source: "Vellum stores", tradeable: true },
  { id: "inkweave-vest", name: "Inkweave Vest", rank: "D", type: "armour", price: 26000, description: "Woven with a thread of raw ink. Turns a blade and stains the wound grey.", effect: "+9 armour, −20% Recoil.", source: "Mercery", tradeable: true },
  { id: "warden-plate", name: "Warden's Plate", rank: "C", type: "armour", price: 70000, description: "Heavy, honest, and signed on the inside by whoever wore it last.", effect: "+18 armour, +20 HP.", source: "Vellum armoury", tradeable: true },
  { id: "culled-shroud", name: "Culled Shroud", rank: "B", type: "armour", price: 180000, description: "A garment worn by something that no longer exists. It fits you exactly.", effect: "+14 armour, attackers forget you for one round each fight.", source: "Errata drop", tradeable: false },
  { id: "relic-shroud", name: "Relic: The Quiet Coat", rank: "S", type: "relic", price: 0, description: "Rewritten from the Seventh Stratum. Wearing it, you are hard to describe.", effect: "+30 armour, no working can target you by name.", source: "Binding reward", tradeable: false },

  // ── accessories
  { id: "registry-token", name: "Registry Token", rank: "F", type: "accessory", price: 0, description: "A stamped disc with your file number. Provisional students get a blank one.", effect: "Legal personhood, in theory.", source: "Issued at enrollment", tradeable: false },
  { id: "bond-ring", name: "Bond Ring", rank: "D", type: "accessory", price: 30000, description: "Worn in pairs. While both are worn, each knows when the other is in danger.", effect: "+10% ink regeneration while near your bonded partner.", source: "Bond Chair", tradeable: true },
  { id: "fortune-knot", name: "Fortune Knot", rank: "C", type: "accessory", price: 58000, description: "A knot of ink-wet cord the Ledger has not noticed. Tied by someone who wanted you to live.", effect: "+4 Fortune.", source: "Gift, or the Quiet Hands", tradeable: true },
  { id: "stain-band", name: "Stain Band", rank: "B", type: "accessory", price: 150000, description: "Hides Stain from the sight of the initiated. Everyone who wears one is interesting.", effect: "Stain is invisible to others.", source: "Black market", tradeable: true },
  { id: "thread-locket", name: "Thread Locket", rank: "A", type: "accessory", price: 0, description: "Holds a strand of someone's fate. It grows warm when the Ledger looks at them.", effect: "Warns you one scene before a Thread moves toward its fate.", source: "Fate: any Thread at resolution 50+", tradeable: false },

  // ── materials
  { id: "blot-ichor", name: "Blot Ichor", rank: "F", type: "material", price: 20, description: "Wet grey sludge. Smells like a mistake.", effect: "Crafting reagent.", source: "Blots", tradeable: true },
  { id: "annotation-quill", name: "Annotation Quill", rank: "D", type: "material", price: 3000, description: "A spine, cleaned. Still points at whatever you last thought about.", effect: "Crafting reagent; +1 to stylus tier when bound.", source: "Annotations", tradeable: true },
  { id: "gloss-veil", name: "Gloss Veil", rank: "B", type: "material", price: 40000, description: "A face, dried and folded. It is still slightly warm.", effect: "Crafting reagent for face-work and identity items.", source: "Glosses", tradeable: true },
  { id: "erratum-shard", name: "Erratum Shard", rank: "A", type: "material", price: 220000, description: "A splinter of a corrected thing. It makes nearby text unreadable.", effect: "Crafting reagent for A-rank and above.", source: "Errata", tradeable: true },
  { id: "culled-absence", name: "Absence, Bottled", rank: "S", type: "material", price: 0, description: "A jar containing nothing, which is heavier than it should be.", effect: "Required for any Void working above A rank.", source: "The Culled Courts", tradeable: false },
  { id: "binding-relic-core", name: "Relic Core", rank: "A", type: "material", price: 0, description: "The rule a Binding was made of, extracted. Warm, and heavier than it looks.", effect: "Forging Relics. Nothing else uses it.", source: "Binding reward", tradeable: false },

  // ── found / story
  { id: "blank-first-page", name: "The Blank First Page", rank: "SSS", type: "relic", price: 0, description: "Torn from your own Codex. It has never taken a mark, from anyone, including the Ledger.", effect: "Unknown. The engine will decide.", source: "You", tradeable: false },
  { id: "soldiers-letter", name: "An Unsent Letter", rank: "F", type: "material", price: 0, description: "Addressed to a name the Registry has no record of. The ink is a woman's.", effect: "Story item. Someone wants this.", source: "Found in the Long Footnote", tradeable: false },
  { id: "ledger-fragment", name: "Ledger Fragment", rank: "SS", type: "relic", price: 0, description: "A page of the world's own text, cut out and hidden. Reading it aloud is a crime in six jurisdictions.", effect: "Reveals one hidden truth per use. Attracts the Registry.", source: "The Unwritten", tradeable: false },
];

export function getItem(id: string): ItemTemplate | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function formatCoin(shards: number): string {
  const c = Math.floor(shards / 10000);
  const m = Math.floor((shards % 10000) / 100);
  const s = shards % 100;
  const parts: string[] = [];
  if (c) parts.push(`${c}c`);
  if (m) parts.push(`${m}m`);
  if (s || !parts.length) parts.push(`${s}s`);
  return parts.join(" ");
}
