/**
 * ILVARIS — the six global arcs, and the miner that finds mini-arcs.
 *
 * Global arcs are structural: they have stages, clocks, and a scar that is left
 * whether or not the player engages. Mini-arcs are not written here at all —
 * they are *mined* from the world state each turn by the Chorister, using the
 * queries below. The list at the bottom is a menu of shapes, not a script.
 */

export interface ArcStage {
  at: number;
  beat: string;
}

export interface GlobalArc {
  id: string;
  name: string;
  /** chapter window, for pacing */
  chapters: [number, number];
  premise: string;
  /** what the arc is *about*, for the director's tone decisions */
  theme: string;
  stages: ArcStage[];
  /** clocks the arc runs; they tick whether or not the player engages */
  clocks: { name: string; maxTicks: number; consequence: string }[];
  /** what the world looks like if the player never touches it */
  scarIfIgnored: string;
  /** what triggers the arc to open */
  opensWhen: string;
  /** the three ways out — the doctrine requires three */
  exits: string[];
}

export const GLOBAL_ARCS: GlobalArc[] = [
  {
    id: "first-commission",
    name: "The First Commission",
    chapters: [1, 4],
    premise:
      "Enrollment, the blank page, the Registry's audit, and the discovery that the player's Commission cannot be read aloud. Ends at the first Verdict: the Archivist must decide whether an unfiled student may remain.",
    theme: "Being filed. What it costs to be legible, and what it costs not to be.",
    stages: [
      { at: 0, beat: "The player is issued a Codex. The first page will not take ink." },
      { at: 1, beat: "Regent Voss notices. The file is opened. It is four lines long." },
      { at: 2, beat: "Captain Hale of the Registry arrives to audit. He is polite about it." },
      { at: 3, beat: "The blank page is read aloud in the Registry Hall. Nothing comes out. Twice." },
      { at: 4, beat: "The Verdict: filed under a false role, expelled into the Hollow's underclass, or make an enemy of the Registry." },
    ],
    clocks: [
      { name: "The Registry's patience", maxTicks: 8, consequence: "An auditor is assigned to shadow the player permanently." },
    ],
    scarIfIgnored:
      "The player is filed as Property of the Athenaeum and loses legal personhood for the rest of the story. They can still act — they simply cannot be a witness, own anything, or be believed.",
    opensWhen: "Session one.",
    exits: ["Accept a false filing", "Refuse and take the underclass", "Subvert the audit with a truth nobody asked for"],
  },
  {
    id: "ink-famine",
    name: "The Ink Famine",
    chapters: [5, 9],
    premise:
      "The Mercery corners the supply. Practical classes are cancelled. Then a second, cheaper ink appears on the black market — abundant, and harvested from people. Someone is rendering Collateral out of human beings.",
    theme: "The price of power, and who is being charged for it.",
    stages: [
      { at: 0, beat: "Ink prices triple in a week. The academy rations. Second-years riot politely." },
      { at: 1, beat: "Black ink appears at half price. It works better than it should." },
      { at: 2, beat: "A student is found drained in the margin ditch — Stain 40, no ink, still breathing." },
      { at: 3, beat: "The trail runs through Nadia's family, the Accord, and a rendering house under Carrow." },
      { at: 4, beat: "Bessa Cobb decides whether to talk about the third-night carts." },
      { at: 5, beat: "The house is exposed, or bought, or burned. All three change the market." },
    ],
    clocks: [
      { name: "The rendering house's production", maxTicks: 10, consequence: "Rendered ink becomes the standard supply. Murder becomes the cheapest way to cast." },
      { name: "Nadia's engagement", maxTicks: 12, consequence: "The dowry is paid. The war in the north begins with Mercery money." },
    ],
    scarIfIgnored:
      "Rationing becomes permanent, the academy shrinks by half, and the cheapest way to cast magic in Ilvaris is murder.",
    opensWhen: "The player reaches level 6 or visits the merchant quarter.",
    exits: ["Expose the house", "Take the house's money and say nothing", "Turn the market against the Mercery with the truth"],
  },
  {
    id: "sixth-thread",
    name: "The Sixth Thread",
    chapters: [7, 14],
    premise:
      "One of the Six will be revised before the Fourth Binding. The Ledger will not say which. The Registry will not admit it knows. Six fates must be untangled, and saving one may be what dooms another.",
    theme: "Resolution. A thread must be cut cleanly; it must not be left to snap.",
    stages: [
      { at: 0, beat: "The Thread Locket grows warm. One of the Six is being looked at." },
      { at: 1, beat: "A Registry clerk files a Commission for a revision with no name in the field." },
      { at: 2, beat: "Two of the Six discover they have been cast in roles that require the same thing." },
      { at: 3, beat: "The Archivist admits, privately, that he has seen this before and failed." },
      { at: 4, beat: "The player learns which one. It is not the one they assumed." },
      { at: 5, beat: "A thread is resolved. It does not have to be love." },
    ],
    clocks: [
      { name: "The revision order", maxTicks: 14, consequence: "One of the Six is erased, and the player is the only person who remembers her." },
    ],
    scarIfIgnored:
      "One of the Six is revised. The player remembers her. That makes the player the only person in Ilvaris who can be accused of inventing her — and the Registry has a statute for that.",
    opensWhen: "The player has met three of the Six and reached level 10.",
    exits: ["Resolve the thread in love", "Resolve it in enmity or severance", "Refuse the choice and take the revision into yourself"],
  },
  {
    id: "quiet-hands-war",
    name: "The Quiet Hands War",
    chapters: [10, 16],
    premise:
      "Imperative grammar is used on the Crown. A coup written in compulsion: nobles signing away armies with serene smiles. The Accord's argument becomes a real question the player must answer with their actions.",
    theme: "What a free will is worth, and who is allowed to take one.",
    stages: [
      { at: 0, beat: "Three Crown lords sign away their levies in one afternoon, cheerfully." },
      { at: 1, beat: "Regent Bell's statute passes the lower house. It makes compulsion capital." },
      { at: 2, beat: "The Accord's academy cell is exposed. Tove Ashgrove's left glove comes off." },
      { at: 3, beat: "The player is offered compulsion — the power, or its removal." },
      { at: 4, beat: "The Unwritten burn the Registry's compulsion records. With the people in the building." },
      { at: 5, beat: "The Crown is compelled, or the law is, or nothing is and the war starts anyway." },
    ],
    clocks: [
      { name: "The statute", maxTicks: 12, consequence: "Compulsion becomes a capital crime. Every Quiet Hand in Ilvaris is retroactively a murderer." },
      { name: "The coup", maxTicks: 16, consequence: "The Crown falls to a government everyone agrees with, and nobody can tell whether they agree." },
    ],
    scarIfIgnored:
      "The coup succeeds. The player wakes up in a country where everyone agrees with the government, and cannot tell whether they agree too.",
    opensWhen: "Tove Ashgrove's trust reaches 30, or the player learns Imperative grammar.",
    exits: ["Stop the coup", "Help it, and take a place in it", "Break the statute by proving compulsion can be refused"],
  },
  {
    id: "stratum-below",
    name: "The Stratum Below",
    chapters: [12, 18],
    premise:
      "Descent to the Seventh Stratum, where a previous draft's civilisation still lives — people who were overwritten and know it, keeping meticulous records of the world that replaced them. Most of the world bible becomes known here, in-world, at cost.",
    theme: "What is owed to a draft that was replaced.",
    stages: [
      { at: 0, beat: "A stair in a hillside goes down eleven hundred steps and arrives somewhere that is not underground." },
      { at: 1, beat: "The Registry's true archive. Every draft of every fact." },
      { at: 2, beat: "The Errata Wastes: corrected villages whose roads still lead to them." },
      { at: 3, beat: "The Culled Courts, who have a file on the player already and will not say from where." },
      { at: 4, beat: "The Palimpsest: a civilisation scraped off and written over, still polite, still here." },
      { at: 5, beat: "They ask the player for something, and it is not unreasonable, and it costs the current draft." },
    ],
    clocks: [
      { name: "The Palimpsest's patience", maxTicks: 18, consequence: "The survivors find their own way up, and they are not grateful to the draft that replaced them." },
    ],
    scarIfIgnored:
      "The Palimpsest's survivors ascend into the Hollow. They are not hostile. They simply want their houses back, and the houses have people in them.",
    opensWhen: "The player finds the Long Footnote stair, or reaches level 14.",
    exits: ["Give them what they ask", "Refuse and seal the stair", "Bring them up and make room"],
  },
  {
    id: "ninth-draft",
    name: "The Ninth Draft",
    chapters: [19, 99],
    premise:
      "The Culled apex has been writing. It has authored a version of Ilvaris where the revisions stop — by revising everything that can object. The Chorister, for the first time in nine hundred years, needs help: it cannot write against itself.",
    theme: "Whether the story is worth the world, or the world worth the story.",
    stages: [
      { at: 0, beat: "Facts begin correcting themselves. Two people remember different histories of the same street." },
      { at: 1, beat: "The Chorister speaks to the player directly, for the first time, and it sounds tired." },
      { at: 2, beat: "The Ninth Draft offers terms. The terms are good. That is the problem." },
      { at: 3, beat: "The binding floor. A debt nine hundred years old comes due." },
      { at: 4, beat: "Three losses, one of which must be taken." },
    ],
    clocks: [
      { name: "The rewriting", maxTicks: 20, consequence: "The world is revised wholesale. Everyone the player knows agrees with it." },
    ],
    scarIfIgnored: "There is no ignoring it. It arrives.",
    opensWhen: "The player reaches the Binding Floor, or chapter 19.",
    exits: [
      "Burn the Ledger and live in an unwritten world",
      "Take the pen and become the new author",
      "Accept the draft and pay the Sixth Thread's price in full",
    ],
  },
];

export function getGlobalArc(id: string) {
  return GLOBAL_ARCS.find((a) => a.id === id);
}

/**
 * The miner. These are the queries the Chorister runs against world state to
 * find tension that already exists. Ordered by priority — earlier entries make
 * better arcs and should be preferred when several are available.
 */
export const MINER_QUERIES = [
  {
    id: "unresolved_debt",
    label: "Unresolved debts",
    rule: "Player Ledger Debt > 0, or any unpaid favour, IOU, or bribe on the record.",
    yields: "A debt collector, a favour called in at the worst moment, an obligation that is not money.",
  },
  {
    id: "unfired_gun",
    label: "Unfired guns",
    rule: "Any fact introduced to the world but never used: a name dropped, a locked door, a promise made.",
    yields: "The dropped detail returns as the mechanism of the next arc.",
  },
  {
    id: "false_rumor",
    label: "Rumours in flight",
    rule: "Beliefs held by NPCs that are false and could become true.",
    yields: "The lie the player told in chapter three becomes municipal fact.",
  },
  {
    id: "colliding_commissions",
    label: "Colliding Commissions",
    rule: "Two NPCs cast in roles that require the same thing.",
    yields: "A duel, a theft, or a sacrifice that both parties believe they must make.",
  },
  {
    id: "relationship_pressure",
    label: "Relationship pressure",
    rule: "A bond at trust 60+ with an unmet need; a grudge at 50+ with an opportunity; a secret held past its expiry.",
    yields: "A confession, a betrayal, or an offer that cannot be refused without cost.",
  },
  {
    id: "clock_expiry",
    label: "Clock expiry",
    rule: "Any world clock within 3 ticks of firing.",
    yields: "The arc's consequence arrives early and badly.",
  },
  {
    id: "price_shock",
    label: "Price shocks",
    rule: "A good whose price moved more than 40% this week.",
    yields: "A riot, a corner, a smuggling route, or a very good deal.",
  },
  {
    id: "loose_stain",
    label: "Loose Stain",
    rule: "Marginalia activity near a high-Stain character.",
    yields: "An infestation with a human cause. Someone is dumping unpaid debts.",
  },
  {
    id: "refusal",
    label: "The player's last refusal",
    rule: "An arc the player declined, still unresolved.",
    yields: "It comes back, changed, wearing a different face. Refusal is not deletion.",
  },
] as const;

/** Shapes for mined mini-arcs — templates the director fills with real facts. */
export const MINI_ARC_SHAPES = [
  { id: "debt-collector", name: "The Debt Collector", shape: "A Quiet Hand calls in a favour the player did not know they owed." },
  { id: "rumor-true", name: "The Rumour That Came True", shape: "A lie the player told becomes municipal fact and has consequences." },
  { id: "two-duels", name: "Two Duels, One Hour", shape: "The player has promised the same evening to two people who hate each other." },
  { id: "under-the-dorms", name: "Under the Dorms", shape: "A Blot infestation with a human cause: someone is dumping unpaid debts into the cellar." },
  { id: "the-paperwork", name: "The Girl in the Paperwork", shape: "Wren finds a form that says she never existed, in her own handwriting." },
  { id: "forgotten-room", name: "A Room the Ledger Forgot", shape: "A door that only appears when the player is alone." },
  { id: "the-offer", name: "The Offer", shape: "Someone offers the player exactly what they want, and the price is only slightly wrong." },
  { id: "the-witness", name: "The Witness", shape: "A stranger watched the player do something they believe nobody saw." },
  { id: "the-hungry-hour", name: "The Hungry Hour", shape: "The market is one bad day from a riot, and the player is holding the grain." },
  { id: "a-duel-for-something-else", name: "A Duel for Something Else", shape: "A challenge is issued over a pretext; the real stake is a secret." },
  { id: "the-return", name: "The Return", shape: "An arc the player refused comes back wearing a different face." },
  { id: "solo-descent", name: "The Descent", shape: "The floor gives way, or the party leaves, and the player is alone in the dark with a way out that is further down." },
] as const;
