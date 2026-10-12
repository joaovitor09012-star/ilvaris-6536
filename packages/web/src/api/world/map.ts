/**
 * ILVARIS — the world map, and the fog over it.
 *
 * Coordinates are in a 1400×1000 space. Two layers: the Surface (the Hollow and
 * the capital) and the Depths (Strata V–IX, reached by descending).
 *
 * Fog of war is absolute: a location the player has never heard of is not drawn
 * at all. A road is drawn only once walked. Everything on this map was earned.
 */

export type MapLayer = "surface" | "depths";

export interface LocationDef {
  id: string;
  name: string;
  layer: MapLayer;
  x: number;
  y: number;
  region: string;
  /** settlement | academy | wilds | dungeon | ruin | depths | sanctum */
  kind: string;
  /** recommended level */
  minLevel: number;
  danger: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  /** true if the player starts knowing about it */
  known?: boolean;
  /** only appears on the map once discovered by play, not by walking */
  secret?: boolean;
  /** shop, trainer, guild, temple, binding, descent, arena */
  services?: string[];
}

export const LOCATIONS: LocationDef[] = [
  // ── the Hollow
  { id: "vellum-gate", name: "The Vellum Gate", layer: "surface", x: 556, y: 476, region: "The Hollow", kind: "academy", minLevel: 1, danger: 0, description: "A gate of black iron and cream stone, inked on both faces with a first-year's primer. It has never been shut in nine hundred years.", known: true, services: ["map"] },
  { id: "vellum-athenaeum", name: "The Athenaeum", layer: "surface", x: 596, y: 414, region: "The Hollow", kind: "academy", minLevel: 1, danger: 0, description: "The great hall. Five Chairs around a central stair that goes down further than the building is tall.", known: true, services: ["trainer", "study", "library"] },
  { id: "vellum-cellars", name: "The Cellars", layer: "surface", x: 572, y: 516, region: "The Hollow", kind: "dungeon", minLevel: 1, danger: 1, description: "Under the Athenaeum. Storage, then boiler rooms, then places the faculty do not discuss. Blots breed here.", known: true, services: ["grind"] },
  { id: "glasshouse", name: "The Glasshouse", layer: "surface", x: 512, y: 430, region: "The Hollow", kind: "academy", minLevel: 3, danger: 1, description: "A greenhouse of iron and green glass, built for growing plants and used for duelling. The panes are warded; the students are not.", known: true, services: ["duel", "arena"] },
  { id: "dormitories", name: "First-Year Dormitories", layer: "surface", x: 640, y: 448, region: "The Hollow", kind: "settlement", minLevel: 1, danger: 0, description: "Two hundred narrow beds and one shared stove that is always somebody else's turn to feed.", known: true, services: ["rest"] },
  { id: "hollow-market", name: "The Hollow Market", layer: "surface", x: 492, y: 556, region: "The Hollow", kind: "settlement", minLevel: 1, danger: 0, description: "Stalls in the shadow of the academy wall. Ink, bread, blades, rumours, all at student prices.", known: true, services: ["shop", "ink"] },
  { id: "hollow-town", name: "Hollow Town", layer: "surface", x: 452, y: 584, region: "The Hollow", kind: "settlement", minLevel: 1, danger: 0, description: "The town that grew around the school. Brewers, tanners, and a great many people whose lives are financed by students dying.", known: true, services: ["inn", "shop"] },
  { id: "ash-chapel", name: "The Chapel of Ash", layer: "surface", x: 662, y: 540, region: "The Hollow", kind: "sanctum", minLevel: 1, danger: 0, description: "The Choir of Ash keep a fire here that has never gone out. They will feed anyone, and they will ask what you believe.", known: true, services: ["temple", "heal"] },
  { id: "registry-hall", name: "The Registry Hall", layer: "surface", x: 690, y: 496, region: "The Hollow", kind: "academy", minLevel: 1, danger: 0, description: "Where every student is filed, commissioned, audited, and — on rare and memorable occasions — revised.", known: true, services: ["commission"] },

  // ── the Fen
  { id: "blot-warrens", name: "The Blot Warrens", layer: "surface", x: 428, y: 468, region: "The Fen", kind: "wilds", minLevel: 2, danger: 2, description: "A collapsed row of tenements, hollow underneath, warm and wet and moving. The standard first-year grind.", known: true, services: ["grind"] },
  { id: "fen-gate", name: "Fen Gate", layer: "surface", x: 338, y: 422, region: "The Fen", kind: "settlement", minLevel: 4, danger: 1, description: "The last village before the water. Eighteen houses, one shrine, and a fence made of streams.", services: ["inn", "shop", "bounty"] },
  { id: "hollow-fen", name: "The Hollow Fen", layer: "surface", x: 376, y: 376, region: "The Fen", kind: "wilds", minLevel: 8, danger: 3, description: "Miles of standing water over a drowned county. Things walk out here that were never people.", services: ["grind", "expedition"] },
  { id: "crag-lions-rest", name: "Crag Lion's Rest", layer: "surface", x: 296, y: 300, region: "The Fen", kind: "wilds", minLevel: 7, danger: 3, description: "A limestone shelf above the water. One occupant, extremely territorial, and a very good view.", services: ["grind"] },
  { id: "fen-of-first-draft", name: "The Fen of First Draft", layer: "surface", x: 258, y: 238, region: "The Fen", kind: "ruin", minLevel: 14, danger: 4, description: "Where the water goes when it dies. Things here have too many versions of themselves, and they disagree.", secret: true, services: ["expedition", "binding"] },
  { id: "drowned-library", name: "The Drowned Library", layer: "surface", x: 342, y: 602, region: "The Fen", kind: "ruin", minLevel: 6, danger: 2, description: "A branch of the Athenaeum that sank. The books are fine. The librarians are not.", services: ["study", "grind"] },

  // ── the Margins
  { id: "margin-scar", name: "The Margin Scar", layer: "surface", x: 782, y: 420, region: "The Margins", kind: "wilds", minLevel: 10, danger: 3, description: "A hundred-yard gouge in the hillside where the world's text was cut and never mended. Ink runs in the ditch.", services: ["grind", "expedition"] },
  { id: "annotation-ridge", name: "Annotation Ridge", layer: "surface", x: 822, y: 358, region: "The Margins", kind: "wilds", minLevel: 9, danger: 3, description: "High ground covered in scribbled growth. Annotations nest in the crevices and come down when they smell a debt.", services: ["grind"] },

  // ── Carrow
  { id: "old-trade-road", name: "The Old Trade Road", layer: "surface", x: 700, y: 600, region: "Carrow", kind: "wilds", minLevel: 5, danger: 2, description: "The road between the Hollow and the capital. Well travelled, well robbed.", services: ["grind"] },
  { id: "river-quay", name: "River Quay", layer: "surface", x: 520, y: 622, region: "Carrow", kind: "settlement", minLevel: 5, danger: 1, description: "Barges, eels, and the cheapest passage to the capital that does not involve walking.", services: ["travel", "shop"] },
  { id: "carrow", name: "Carrow", layer: "surface", x: 902, y: 560, region: "Carrow", kind: "settlement", minLevel: 8, danger: 1, description: "The capital. Four hundred thousand people, one Ledger, and no privacy whatsoever.", services: ["shop", "inn", "arena", "trainer"] },
  { id: "carrow-backstreets", name: "Carrow Backstreets", layer: "surface", x: 878, y: 604, region: "Carrow", kind: "wilds", minLevel: 10, danger: 3, description: "Where the capital keeps what it does not want filed. Glosses do well here.", services: ["shop", "grind"] },
  { id: "merchant-quarter", name: "The Merchant Quarter", layer: "surface", x: 924, y: 516, region: "Carrow", kind: "settlement", minLevel: 8, danger: 1, description: "The Mercery's heart. Ink is priced here, and so, consequently, is everything.", services: ["shop", "ink"] },
  { id: "crown-quarter", name: "The Crown Quarter", layer: "surface", x: 962, y: 478, region: "Carrow", kind: "settlement", minLevel: 12, danger: 2, description: "Palaces built on a contract. Every stone of it is legally load-bearing.", services: ["quest"] },
  { id: "quiet-quarter", name: "The Quiet Quarter", layer: "surface", x: 848, y: 652, region: "Carrow", kind: "wilds", minLevel: 11, danger: 4, description: "A district where nobody raises their voice, because raising your voice is how you find out who owns you.", secret: true, services: ["shop", "quest"] },
  { id: "rendering-house", name: "The Rendering House", layer: "surface", x: 906, y: 704, region: "Carrow", kind: "ruin", minLevel: 13, danger: 5, description: "Under the merchant quarter. Where cheap ink comes from, and why it is cheap.", secret: true, services: ["expedition"] },

  // ── the Depths
  { id: "long-footnote-stair", name: "The Long Footnote Stair", layer: "surface", x: 238, y: 498, region: "The Depths", kind: "ruin", minLevel: 12, danger: 3, description: "A stair in a hillside that goes down eleven hundred steps and arrives somewhere that is not underground.", secret: true, services: ["descent"] },
  { id: "long-footnote-vault", name: "The Long Footnote Vaults", layer: "depths", x: 300, y: 210, region: "Stratum V", kind: "depths", minLevel: 15, danger: 3, description: "The Registry's true archive. Every draft of every fact, filed by a bureaucracy that has outlived its kingdom.", services: ["study", "grind", "expedition"] },
  { id: "errata-wastes", name: "The Errata Wastes", layer: "depths", x: 500, y: 180, region: "Stratum VI", kind: "depths", minLevel: 22, danger: 4, description: "A corrected landscape. Whole villages removed, their roads still leading to them.", services: ["grind", "expedition"] },
  { id: "culled-court", name: "The Culled Courts", layer: "depths", x: 700, y: 160, region: "Stratum VI", kind: "depths", minLevel: 26, danger: 4, description: "The erased, organised. They keep meticulous records of everyone who was ever removed, including themselves.", services: ["quest", "shop"] },
  { id: "palimpsest", name: "The Palimpsest", layer: "depths", x: 400, y: 344, region: "Stratum VII", kind: "depths", minLevel: 30, danger: 4, description: "A civilisation scraped off the page and written over. They are still here. They are extremely polite.", services: ["quest", "study"] },
  { id: "palimpsest-descent", name: "The Palimpsest Descent", layer: "depths", x: 560, y: 364, region: "Stratum VII", kind: "depths", minLevel: 32, danger: 5, description: "The way down from a world that was replaced. Narrow, and it remembers being wider.", services: ["descent", "grind"] },
  { id: "binding-floor", name: "The Binding Floor", layer: "depths", x: 700, y: 340, region: "Stratum VIII", kind: "depths", minLevel: 35, danger: 5, description: "Where the Ledger settles its heaviest debts. The floor is level because it was argued flat.", services: ["binding", "expedition"] },
  { id: "the-blank", name: "The Blank", layer: "depths", x: 862, y: 300, region: "Stratum IX", kind: "depths", minLevel: 50, danger: 5, description: "Nothing has been written here. Nothing. It is not dark; it is unwritten, which the eye reports as a kind of pain.", services: ["binding"] },
];

export interface LinkDef {
  from: string;
  to: string;
  kind: "road" | "path" | "passage" | "descent";
  /** travel takes this many scenes */
  steps: number;
  danger: number;
  /** hidden until discovered by play */
  secret?: boolean;
}

export const LINKS: LinkDef[] = [
  { from: "vellum-gate", to: "vellum-athenaeum", kind: "road", steps: 1, danger: 0 },
  { from: "vellum-gate", to: "dormitories", kind: "road", steps: 1, danger: 0 },
  { from: "vellum-gate", to: "hollow-market", kind: "road", steps: 1, danger: 0 },
  { from: "vellum-athenaeum", to: "glasshouse", kind: "road", steps: 1, danger: 0 },
  { from: "vellum-athenaeum", to: "vellum-cellars", kind: "passage", steps: 1, danger: 1 },
  { from: "vellum-athenaeum", to: "registry-hall", kind: "road", steps: 1, danger: 0 },
  { from: "vellum-athenaeum", to: "ash-chapel", kind: "road", steps: 1, danger: 0 },
  { from: "dormitories", to: "hollow-market", kind: "road", steps: 1, danger: 0 },
  { from: "hollow-market", to: "hollow-town", kind: "road", steps: 1, danger: 0 },
  { from: "hollow-town", to: "river-quay", kind: "road", steps: 1, danger: 1 },
  { from: "hollow-town", to: "blot-warrens", kind: "path", steps: 1, danger: 2 },
  { from: "blot-warrens", to: "fen-gate", kind: "road", steps: 1, danger: 2 },
  { from: "blot-warrens", to: "drowned-library", kind: "passage", steps: 1, danger: 2 },
  { from: "fen-gate", to: "hollow-fen", kind: "path", steps: 1, danger: 3 },
  { from: "fen-gate", to: "crag-lions-rest", kind: "path", steps: 1, danger: 3 },
  { from: "hollow-fen", to: "fen-of-first-draft", kind: "passage", steps: 2, danger: 4, secret: true },
  { from: "crag-lions-rest", to: "fen-of-first-draft", kind: "passage", steps: 2, danger: 4, secret: true },
  { from: "drowned-library", to: "long-footnote-stair", kind: "passage", steps: 1, danger: 3, secret: true },
  { from: "river-quay", to: "old-trade-road", kind: "road", steps: 1, danger: 2 },
  { from: "old-trade-road", to: "carrow", kind: "road", steps: 1, danger: 2 },
  { from: "old-trade-road", to: "margin-scar", kind: "path", steps: 1, danger: 3 },
  { from: "margin-scar", to: "annotation-ridge", kind: "path", steps: 1, danger: 3 },
  { from: "carrow", to: "carrow-backstreets", kind: "road", steps: 1, danger: 2 },
  { from: "carrow", to: "merchant-quarter", kind: "road", steps: 1, danger: 0 },
  { from: "merchant-quarter", to: "crown-quarter", kind: "road", steps: 1, danger: 1 },
  { from: "carrow-backstreets", to: "quiet-quarter", kind: "passage", steps: 1, danger: 4, secret: true },
  { from: "carrow-backstreets", to: "rendering-house", kind: "passage", steps: 1, danger: 5, secret: true },
  { from: "long-footnote-stair", to: "long-footnote-vault", kind: "descent", steps: 1, danger: 3 },
  { from: "long-footnote-vault", to: "errata-wastes", kind: "descent", steps: 2, danger: 4 },
  { from: "errata-wastes", to: "culled-court", kind: "descent", steps: 1, danger: 4 },
  { from: "culled-court", to: "palimpsest", kind: "descent", steps: 2, danger: 4 },
  { from: "palimpsest", to: "palimpsest-descent", kind: "descent", steps: 1, danger: 5 },
  { from: "palimpsest-descent", to: "binding-floor", kind: "descent", steps: 2, danger: 5 },
  { from: "binding-floor", to: "the-blank", kind: "descent", steps: 3, danger: 5, secret: true },
];

export function getLocation(id: string): LocationDef | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

export function neighboursOf(id: string): { loc: LocationDef; link: LinkDef }[] {
  const out: { loc: LocationDef; link: LinkDef }[] = [];
  for (const link of LINKS) {
    const otherId = link.from === id ? link.to : link.to === id ? link.from : null;
    if (!otherId) continue;
    const loc = getLocation(otherId);
    if (loc) out.push({ loc, link });
  }
  return out;
}

export const STARTING_KNOWN = LOCATIONS.filter((l) => l.known).map((l) => l.id);
