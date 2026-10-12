import type { TourStep } from "../components/tour";

export interface TourDef {
  /** storage name — `ilvaris.tour.<name>` */
  name: string;
  /** run automatically the first time this page is opened */
  auto: boolean;
  steps: TourStep[];
}

const K = ({ children }: { children: string }) => (
  <kbd className="mono rounded-[2px] border border-line-strong bg-ink px-1.5 py-px text-[12px] text-paper">{children}</kbd>
);

const HOME: TourDef = {
  name: "home",
  auto: true,
  steps: [
    {
      title: "Welcome to Ilvaris",
      body: (
        <>
          You wake inside a book that keeps writing itself. There are no menus of moves here — you write what your character
          does, and the world answers. This short guide shows you where everything is. Skip it whenever you like.
        </>
      ),
    },
    {
      target: "new-life",
      title: "Begin a new life",
      body: "Start here. You'll name your character, describe them in a few lines, and choose one of eight classes.",
      placement: "left",
    },
    {
      target: "saves",
      title: "Your saves",
      body: "Every life you start is kept on this shelf. Click a card to continue exactly where you stopped. The bin icon erases a life for good.",
      placement: "top",
    },
    {
      target: "rail-play",
      title: "The sections",
      body: "Once a save is open, these unlock: the Desk where you play, and the books that record what you've earned, who you've met and where you've been.",
    },
    {
      target: "rail-bible",
      title: "The World Bible",
      body: "The full reference for the world — magic, strata, factions, prices. Optional, and out-of-world: nobody in Ilvaris can read it.",
    },
    {
      target: "rail-help",
      title: "Help, any time",
      body: "Lost? Press Help to replay the guide for whichever page you're on.",
    },
  ],
};

const NEW: TourDef = {
  name: "new",
  auto: true,
  steps: [
    {
      target: "person",
      title: "01 · The person",
      body: "Give your character a name and pronouns. The appearance box is optional — concrete details work best, and they shape how others describe you.",
      placement: "bottom",
    },
    {
      target: "class",
      title: "02 · The class",
      body: "Eight ways into the same academy. Each class grows two main stats faster and opens with its own skills. Click a card to choose it.",
      placement: "top",
    },
    {
      target: "commission",
      title: "The Commission",
      body: "A summary of what you've picked — starting stats, skills and how the class levels. When it reads right, sign it and the first scene begins.",
      placement: "left",
    },
  ],
};

const DESK: TourDef = {
  name: "desk",
  auto: true,
  steps: [
    {
      title: "This is the Desk",
      body: (
        <>
          This is where you play. Each turn, you write what your character does and the story continues. There are no wrong
          moves and no fixed options — but everything has a consequence. Here's the layout.
        </>
      ),
    },
    {
      target: "scene",
      title: "The page",
      body: "The story so far. Every turn writes a new scene here. The newest scene is at the bottom; scroll up to re-read.",
    },
    {
      target: "input",
      title: "Write anything",
      body: (
        <>
          Type what you do, say or try — <em>"I ask the clerk who paid my tuition"</em>, <em>"I follow her without being seen"</em>.
          Press <b>Act</b> or <K>Ctrl</K> + <K>Enter</K>.
        </>
      ),
      placement: "top",
    },
    {
      target: "chips",
      title: "Quick actions",
      body: "Not sure what to do? These write a sensible action for you. They change with where you are — a market, a library, a cellar.",
      placement: "top",
    },
    {
      target: "context",
      title: "Where you are",
      body: "Chapter, turn, the place you're standing in and how dangerous it is — plus the arc the world is currently pushing.",
    },
    {
      target: "status",
      title: "Your numbers",
      body: "Level, HP, XP and Ink — the fuel for magic — then your stats and debts. Only you can see these. Nobody in the world knows they exist.",
      placement: "left",
    },
    {
      target: "quest",
      title: "What's in motion",
      body: "Open arcs and their clocks. When a clock fills, something happens whether or not you were there.",
      placement: "left",
    },
    {
      target: "rail-codex",
      title: "Codex · Ledger · Threads",
      body: "Codex holds your skills and stat points to spend. Ledger is your purse, pack and the market. Threads are the people you've met and what they think of you.",
    },
    {
      target: "rail-explore",
      title: "The wider world",
      body: "Strata is the map — it fills in as you travel. Bestiary records what you've fought, World holds the lore you've unlocked, and Timeline shows every event with its cause.",
    },
    {
      target: "rail-bench",
      title: "The Bench",
      body: "Design new spells by combining what they act on with the shape they take. Research costs Ink and time.",
    },
    {
      target: "rail-help",
      title: "You're ready",
      body: "Replay this guide any time from Help. Now write your first move.",
    },
  ],
};

/** One-card guides for the other pages — shown from Help, never automatically. */
const PAGE: Record<string, { title: string; body: string }> = {
  "/codex": { title: "The Codex", body: "Your character sheet. Spend free stat points, see every skill you know with its rank and Ink cost, and check your standing at the Athenaeum." },
  "/ledger": { title: "The Ledger", body: "Money, items and the market. Prices move with what happens in the world — a famine upstream shows up here first." },
  "/threads": { title: "Threads", body: "Everyone you've met. What you know about them, how they feel about you, and what's still unresolved. You can draw a portrait for anyone here." },
  "/strata": { title: "Strata", body: "The map, as far as you know it. New places appear when you walk to them, hear of them, or survive them. Zoom in on where you stand." },
  "/bestiary": { title: "Bestiary", body: "Every creature you've encountered or heard of, with what you've learned about how to fight it." },
  "/world": { title: "World", body: "Lore pages you've unlocked, the arcs moving across the world, and the atlas of what exists beyond your map." },
  "/timeline": { title: "Timeline", body: "Every event in your story, each linked to the event that caused it. Nothing here happens from nowhere." },
  "/bench": { title: "The Bench", body: "Compose a new instruction: pick a vector and a shape, add modifiers, preview the cost, then research it. Costs Ink and a turn." },
  "/bible": { title: "The World Bible", body: "The reference for the whole world. Use the contents list to jump between sections. This is outside the story — no character can read it." },
  "/settings": { title: "Settings", body: "Rename your save, pick how the narrator writes, set the pacing, and choose which models direct and narrate." },
};

export function tourFor(path: string): TourDef | null {
  if (path === "/") return HOME;
  if (path.startsWith("/new")) return NEW;
  if (path.startsWith("/desk")) return DESK;
  const key = Object.keys(PAGE).find((k) => path.startsWith(k));
  if (!key) return null;
  return {
    name: key.slice(1),
    auto: false,
    steps: [
      { target: "page", ...PAGE[key], placement: "bottom" },
      { target: "rail-help", title: "More help", body: "Open the Desk and press Help there for the full walkthrough of how to play." },
    ],
  };
}
