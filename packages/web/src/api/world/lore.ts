/**
 * ILVARIS — the world bible, as the player earns it.
 *
 * Nothing here is given at the start. Every entry unlocks through play: walking
 * somewhere, being told something, reading a margin, finishing an arc. The
 * World screen is fog of war like everything else — blank entries stay blank.
 */

export type LoreCategory =
  | "cosmology"
  | "magic"
  | "economy"
  | "factions"
  | "history"
  | "bestiary"
  | "people"
  | "places";

export interface LoreEntry {
  id: string;
  category: LoreCategory;
  title: string;
  body: string;
  /** how it unlocks; the engine matches these against play */
  unlock:
    | { kind: "start" }
    | { kind: "location"; id: string }
    | { kind: "npc"; id: string }
    | { kind: "level"; value: number }
    | { kind: "research"; vector: string }
    | { kind: "arc"; id: string }
    | { kind: "faction"; id: string }
    | { kind: "story"; note: string };
}

export const LORE: LoreEntry[] = [
  // ── cosmology
  {
    id: "the-ledger",
    category: "cosmology",
    title: "The Ledger",
    body: "Nine hundred years ago the scholars of the Third Stratum proved what the priests had only suspected: that beneath everything there is a record. It does not think. It does not want. It remembers what happened and decides what is true, and when a page is unbalanced it writes back.\n\nEverything else in this document is a consequence of that sentence.",
    unlock: { kind: "start" },
  },
  {
    id: "the-pattern",
    category: "cosmology",
    title: "The Pattern",
    body: "What farmers call it. Not a god — a grain. You do not argue with the Pattern; you plant when the ground is right and you accept that some years the ground is not right. In the villages, 'the Pattern' also means 'the reason my brother is dead', and it is said without bitterness, which is the part that unsettles scholars.",
    unlock: { kind: "location", id: "fen-gate" },
  },
  {
    id: "the-chorister",
    category: "cosmology",
    title: "The Chorister",
    body: "The Ledger does not merely record. Something inside it composes — reads the world each moment, finds the tension already present, and weaves it into arcs with beginnings, middles, and costs.\n\nThe Vellum does not teach this. The Choir of Ash calls it the Author and loves it. The Unwritten calls it the Cage and wants it burned. The Archivist has known about it for thirty years and has never written it down, because writing it down would tell it that he knows.\n\nIt cannot read you. That has never happened before.",
    unlock: { kind: "arc", id: "first-commission" },
  },
  {
    id: "revision",
    category: "cosmology",
    title: "Revision",
    body: "The Ledger does not execute. It edits.\n\nA person who fails their assigned role badly enough is revised: the world is rewritten so that they were never there. Their mother's memory closes over them like water. Their debts are reassigned. Their room is let to someone else by the end of the week. Nobody attends a funeral because there is nobody to have one.\n\nThere are forty-one people in the Hollow who will swear they have spoken to a girl named Wren Sable. None of them can remember her face.",
    unlock: { kind: "npc", id: "wren-sable" },
  },
  {
    id: "the-nine-strata",
    category: "cosmology",
    title: "The Nine Strata",
    body: "Ilvaris is layered, and the layers are drafts. Each Stratum is an earlier attempt at the same story, kept because deleting it would unbalance the whole.\n\nI. The Vellum Sky — ink-wet, unfinished.\nII. The Margins — annotated.\nIII. The Fen of First Draft — overwritten.\nIV. The Hollow — current, stable. You are here.\nV. The Long Footnote — dense, pedantic, the Registry's true archive.\nVI. The Errata — corrected, scarred, the Culled Courts.\nVII. The Palimpsest — a civilisation scraped off and written over. Still walking.\nVIII. The Binding Floor — where the heaviest debts are settled.\nIX. The Blank — unreadable.\n\nDescending requires a Binding: a role the world needs played to its end.",
    unlock: { kind: "location", id: "long-footnote-stair" },
  },

  // ── magic
  {
    id: "inscription",
    category: "magic",
    title: "Inscription",
    body: "Magic is writing. Reality is a text; a working is a sentence written over it. This is not a metaphor the scholars enjoy — it is the operational description, and it is why the academy's discipline is closer to grammar than to war.\n\nA working has three parts: a VECTOR (what the ink is made of), a SHAPE (how it is delivered), and MODIFIERS (further instructions). Every combination is legal. Most are useless. A few are discoveries.",
    unlock: { kind: "start" },
  },
  {
    id: "ink",
    category: "magic",
    title: "Ink, and Why It Returns",
    body: "A person's ink reserve is personal and finite. It returns with rest and food — and with WITNESS.\n\nBeing seen doing something meaningful returns ink. A duel before a crowd refills an Inscriber in minutes. A performance does the same. This single fact explains the Athenaeum's entire culture: it is full of show-offs because showing off is nutritious.\n\nThe third method is Transfer, and it is the crime of Drawing. Consent makes it love. Without consent it is the worst thing one person can do to another short of revision.",
    unlock: { kind: "research", vector: "mana" },
  },
  {
    id: "four-grammars",
    category: "magic",
    title: "The Four Grammars",
    body: "DECLARATIVE — direct imposition. Fire, walls, force. Heavy ink, heavy Recoil, no subtlety.\n\nINTERROGATIVE — questions. Divination, unraveling, truth. Light and quiet. Nobody trusts a questioner.\n\nIMPERATIVE — commands. Binding, oaths, compulsion of will. Legal to the third degree; above that, capital. This is the grammar the Accord of Quiet Hands practises, and the reason a statute is being drafted.\n\nSUBJUNCTIVE — the what-if. Illusion, possibility, temporary reality. The hardest, the most prestigious, and the most dangerous, because of one deep rule: an illusion believed by enough witnesses stops being an illusion.",
    unlock: { kind: "location", id: "vellum-athenaeum" },
  },
  {
    id: "recoil-collateral-stain",
    category: "magic",
    title: "Recoil, Collateral, Stain",
    body: "Every working costs more than ink. The difference is paid in Collateral: blood, years, memory, sensation — or another person's, which is the crime.\n\nUnpaid Recoil accumulates as Stain: a discolouration in a person's text, visible to the initiated. Low Stain is a scar. High Stain draws Marginalia, because Marginalia eat loose ends, and a Stain-heavy Inscriber is a walking loose end.",
    unlock: { kind: "level", value: 3 },
  },
  {
    id: "ledger-debt",
    category: "magic",
    title: "Debt",
    body: "Workings above a certain scale create Ledger Debt. It cannot be paid in coin. It is paid in story: something must happen that makes the imbalance true.\n\nThe Ledger will supply that event. Or the Chorister will build an arc out of it.\n\nThis is the most important thing a student can learn, and it is taught in the second term, and half of every year's casualties are people who understood it intellectually and not practically. Your power generates your plot. Nothing you do is free.",
    unlock: { kind: "level", value: 8 },
  },
  {
    id: "the-subjunctive-rule",
    category: "magic",
    title: "The Subjunctive Rule",
    body: "An illusion believed by enough witnesses becomes true.\n\nThis is how Relics are made. This is how gods have been made. This is, by the Archivist's private and unpublished suspicion, how the Ledger itself was made — by being believed in for long enough by enough people that it stopped being a hypothesis.\n\nIt is taught in the fourth term to students who have already learned to be careful, and it is the reason the Subjunctive Chair has the smallest class in the academy.",
    unlock: { kind: "location", id: "vellum-athenaeum" },
  },

  // ── economy
  {
    id: "coin-and-ink",
    category: "economy",
    title: "Coin and Ink",
    body: "One hundred shards make a mark. One hundred marks make a crown.\n\nRaw ink trades at two marks a dram, and it is consumable. A household's savings and a mage's ammunition are therefore the same asset class, which is why the Mercery is more powerful than the Crown, and why the Crown has spent forty years trying to marry into it.",
    unlock: { kind: "location", id: "hollow-market" },
  },
  {
    id: "the-tithe",
    category: "economy",
    title: "The Tithe",
    body: "Registered workings pay the Ledger eight percent of the ink they spend. This funds the roads, the Registry, and the fact that the world keeps existing in an orderly manner.\n\nUnregistered workings pay nothing, which is why the Tithe is enforced with such violence, and why the black market exists, and why the black market is so cheap.",
    unlock: { kind: "location", id: "registry-hall" },
  },
  {
    id: "bounties",
    category: "economy",
    title: "The Bounty Boards",
    body: "Monster bounties are set by rank: five shards for a Blot, forty for an Annotation, three marks for a Gloss, two crowns for an Erratum. A Binding purse is five hundred crowns, split among whoever claims it — which is why Circles fight over Bindings, and why the political arcs and the dungeon arcs in this world are the same arcs.",
    unlock: { kind: "location", id: "fen-gate" },
  },

  // ── factions
  {
    id: "faction-vellum",
    category: "factions",
    title: "The Vellum Athenaeum",
    body: "Five Chairs around a central stair. Flesh, Matter, Mind, Bond, Void. One lecture a year is given on the Void Chair, in the last term, with the door locked.\n\nThe Athenaeum's official position is that the Ledger is a discipline: teachable, gradeable, and due on Thursday. Its unofficial position is that it has been losing this argument for thirty years.",
    unlock: { kind: "start" },
  },
  {
    id: "faction-registry",
    category: "factions",
    title: "The Registry",
    body: "The human face of the Ledger: commissions, audits, and verdicts. Everyone is filed. Everyone is cast. The Registry's clerks are unfailingly polite and have never once been moved by an argument.\n\nIts auditors revise about eleven students a year. It is not considered a scandal.",
    unlock: { kind: "location", id: "registry-hall" },
  },
  {
    id: "faction-choir",
    category: "factions",
    title: "The Choir of Ash",
    body: "They believe the Author is a loving god and that the Ledger is its instrument. They keep a fire that has never gone out, feed forty people a day, and are the most dangerous room in the world, because they are right about the existence of the Author and wrong about everything else.",
    unlock: { kind: "location", id: "ash-chapel" },
  },
  {
    id: "faction-unwritten",
    category: "factions",
    title: "The Unwritten",
    body: "The text should be burned. They sabotage Relics, assassinate the cast, and burn archives. They are terrorists, and every argument they make is correct, which is the problem with them.",
    unlock: { kind: "arc", id: "quiet-hands-war" },
  },
  {
    id: "faction-quiet-hands",
    category: "factions",
    title: "The Accord of Quiet Hands",
    body: "They practise Imperative grammar — compulsion — and they argue that a will can only be free if it cannot be compelled, which is either a profound moral insight or the most convenient excuse in the history of crime.\n\nTheir offer is genuinely tempting. That is what makes them dangerous.",
    unlock: { kind: "npc", id: "tove-ashgrove" },
  },
  {
    id: "faction-mercery",
    category: "factions",
    title: "The Mercery",
    body: "Ink. Everything is ink. They control the supply, and therefore the price, and therefore the academy's practical classes, and therefore the war in the north.\n\nNadia Rooke is its only child and despises it. She is the only person in the academy who could bankrupt it by Tuesday.",
    unlock: { kind: "location", id: "merchant-quarter" },
  },
  {
    id: "faction-culled-courts",
    category: "factions",
    title: "The Culled Courts",
    body: "The erased, organised. They keep meticulous records of everyone who was ever removed, including themselves, cross-referenced by the date and the reason. They are patient in a way that only things with nothing left to lose can be patient.\n\nThey will deal. They will not forget, because remembering is the entire point of them.",
    unlock: { kind: "location", id: "culled-court" },
  },

  // ── history
  {
    id: "history-founding",
    category: "history",
    title: "The Founding of the Vellum",
    body: "The Athenaeum was built on the Fourth Stratum nine hundred years ago, on the site of a village that was revised to make room for it. The village's name survives in one place: a footnote in the Long Footnote vaults, in the hand of the first Archivist, which reads, in full: 'They were here. I am sorry. It was necessary.'",
    unlock: { kind: "location", id: "long-footnote-vault" },
  },
  {
    id: "history-the-second-binding",
    category: "history",
    title: "The Second Binding",
    body: "Cleared fourteen years ago by a Circle of nine. Four came back. The Relic is called The Line That Held and it is in the academy's keeping, which is to say in a cupboard on the third floor that nobody guards.\n\nTwo of the survivors were Mira Veldt's Lantern. She has not slept a full night since.",
    unlock: { kind: "npc", id: "mira-veldt" },
  },
  {
    id: "history-the-blank-page",
    category: "history",
    title: "The Blank Page",
    body: "Every Inscriber's Codex opens with a Commission: the role the Ledger has cast them in. The page is written at enrollment and cannot be altered afterwards.\n\nIn nine hundred years of records there is no account of a blank one. The Archivist has checked. He has checked four times.",
    unlock: { kind: "story", note: "read your own Commission" },
  },

  // ── bestiary
  {
    id: "marginalia",
    category: "bestiary",
    title: "Marginalia",
    body: "Not demons. Typos with teeth. They feed on loose ends: unfinished business, unpaid debts, unanswered questions. They breed wherever too many people are keeping secrets, which makes the academy's dormitories an ecosystem.\n\nBlots. Annotations. Glosses. Errata.",
    unlock: { kind: "location", id: "vellum-cellars" },
  },
  {
    id: "the-culled",
    category: "bestiary",
    title: "The Culled",
    body: "Things that were revised and did not stop. A Culled is an absence shaped like a person: a hole in the world that walks, remembers, and resents.\n\nThey cannot be remembered by anyone who knew them. You forget them about nine seconds after you turn away, which makes fighting one a nightmare of re-introductions.",
    unlock: { kind: "location", id: "errata-wastes" },
  },
  {
    id: "bindings",
    category: "bestiary",
    title: "Bindings",
    body: "A Stratum's Binding is not a monster. It is a role the world has decided must be played, grown into a shape that can play it.\n\nThe Fourth Binding is duelist-shaped. It is waiting. It does not want to win — it wants the role completed, which means it fights to the exact strength of its opposite. The Registry considers that a loophole. Sera Vane considers it an insult.",
    unlock: { kind: "npc", id: "sera-vane" },
  },

  // ── people
  {
    id: "people-the-six",
    category: "people",
    title: "The Six",
    body: "Six women are bound to unresolved roles in the coming Cycle. In the Ledger's original draft, each of them dies, and their deaths are the mechanism that balances the next Stratum.\n\nThey do not have to die. They have to be RESOLVED. Love, enmity, severance, sacrifice, refusal — the Ledger counts any of them, and it counts nothing less. A thread must be cut cleanly, not left to snap.",
    unlock: { kind: "story", note: "meet three of the Six" },
  },
  {
    id: "people-the-archivist",
    category: "people",
    title: "The Archivist",
    body: "Thirty-one years running the Athenaeum, and the Registry's only living obstacle. He took in the orphaned ward of two revised scholars, which everyone found touching and nobody understood.\n\nHe has never lied to Ilse Marrow. He has also never told her the truth, and he is aware that those are different things, and it keeps him awake.",
    unlock: { kind: "npc", id: "the-archivist" },
  },

  // ── places
  {
    id: "place-hollow",
    category: "places",
    title: "The Hollow",
    body: "A valley on the Fourth Stratum, and the town that grew around the academy that grew around the valley. Brewers, tanners, and a great many people whose lives are financed by students dying.\n\nOn the inn wall of the Broken Haft there is a board with nine names on it. Bessa Cobb adds them herself and refuses to take any of them down.",
    unlock: { kind: "start" },
  },
  {
    id: "place-margin-scar",
    category: "places",
    title: "The Margin Scar",
    body: "A hundred-yard gouge in the hillside where the world's text was cut and never mended. Ink runs in the ditch — actual ink, thin and cold and drinkable, which is how the black market started and why the Mercery has an office in a village of forty people.",
    unlock: { kind: "location", id: "margin-scar" },
  },
  {
    id: "place-rendering-house",
    category: "places",
    title: "The Rendering House",
    body: "Under the merchant quarter of Carrow. Carts go in on third nights, heavy, and come out light. What is rendered there is Collateral — taken from living people, in quantity, and sold as cheap ink.\n\nNobody in the Mercery will say the words 'rendering house' aloud. Everyone in the Mercery knows the address.",
    unlock: { kind: "location", id: "rendering-house" },
  },
];

export function getLore(id: string): LoreEntry | undefined {
  return LORE.find((l) => l.id === id);
}

export const LORE_CATEGORY_LABEL: Record<LoreCategory, string> = {
  cosmology: "Cosmology",
  magic: "Magic & Ink",
  economy: "Coin & Tithe",
  factions: "Powers",
  history: "History",
  bestiary: "Bestiary",
  people: "People",
  places: "Places",
};
