/**
 * ILVARIS — the cast.
 *
 * Each NPC template ships with an initial mind: what they know, what they
 * believe (which may be false), what they want, and what they hide. Once the
 * save begins, that mind is their own — the engine appends to it and never
 * rewrites it.
 *
 * `allure` is a visual descriptor for portrait generation, from plain to
 * otherworldly. It is a note about *the world's* beauty standards, not a
 * mechanical stat.
 */

export type Allure = "plain" | "comely" | "pretty" | "striking" | "breathtaking" | "otherworldly";

export interface NpcTemplate {
  id: string;
  name: string;
  age: number;
  role: string;
  faction: string;
  /** academy year, or their station */
  station: string;
  /** power tier, for how they read in a scene */
  rank: string;
  level: number;
  isThread: boolean;
  /** for threads: the role the Ledger cast them in, and their fated end */
  threadRole?: string;
  threadFate?: string;
  allure: Allure;
  /** portrait seed — concrete visual detail, manhwa style */
  appearance: string;
  /** how they speak; the narrator is bound by this */
  voice: string;
  /** what anyone would know about them */
  public: string;
  /** what they hide */
  secret: string;
  /** short and long term wants */
  goals: { goal: string; horizon: "short" | "long" }[];
  /** what they know at the start of play */
  facts: string[];
  /** what they believe at the start — some of it false */
  beliefs: { belief: string; isTrue: boolean }[];
  /** initial disposition toward the player */
  towardPlayer: { trust: number; fear: number; debt: number; desire: number; grudge: number; note: string };
  /** where they are usually found */
  home: string;
}

export const NPCS: NpcTemplate[] = [
  // ───────────────────────────── the Six Threads
  {
    id: "sera-vane",
    name: "Sera Vane",
    age: 19,
    role: "Third-year duelist; the academy's reigning champion",
    faction: "The Vellum Athenaeum",
    station: "Third Year · Blade Dancer",
    rank: "A",
    level: 24,
    isThread: true,
    threadRole: "The Sword That Was Promised",
    threadFate: "To die at the Fourth Binding, alone, holding a line that was always going to break.",
    allure: "breathtaking",
    appearance:
      "nineteen, tall, athletic and lean like a drawn blade, ash-blonde hair cut short and pushed back off a sharp proud face, one silver-grey eye and one clouded white from an old wound, small scar through the left brow, charcoal duelling coat worn open over a cream shirt, red sash tied at the hip, twin curved blades sheathed low on her back, hands taped, sleeves rolled, standing with her weight already forward",
    voice:
      "Flat, dry, funny in a way that arrives a half-second late. Never asks twice. Says 'right' when she has decided something. Never says the word 'die'.",
    public:
      "The best blade in the academy three years running, and by some distance the most-watched person in it. Accepted at fifteen, champion at seventeen, and unbeaten since.",
    secret:
      "She has read her own Commission. It says she dies at the Fourth Binding. She has known for eleven months and has told no one — not because she is brave, but because she refuses to spend her last year being handled.",
    goals: [
      { goal: "Win the Winter Ladder without dropping a single bout", horizon: "short" },
      { goal: "Find someone worth handing the line to", horizon: "long" },
    ],
    facts: [
      "The Registry filed her Commission at fifteen",
      "The Fourth Binding requires a duelist-shaped person",
      "Cassian Thorne has challenged her twice and lost twice",
    ],
    beliefs: [
      { belief: "That the Ledger cannot be argued with, only obeyed or ignored", isTrue: false },
      { belief: "That the player is interesting and probably lying about something", isTrue: true },
    ],
    towardPlayer: { trust: 5, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Watched you cross the yard and decided you walk like someone with a secret." },
    home: "glasshouse",
  },
  {
    id: "ilse-marrow",
    name: "Ilse Marrow",
    age: 18,
    role: "The Archivist's ward; unofficial keeper of the library's margins",
    faction: "The Vellum Athenaeum",
    station: "Second Year · Architect",
    rank: "B",
    level: 18,
    isThread: true,
    threadRole: "The Archivist's Ward",
    threadFate: "To be revised — quietly, with paperwork, in a way that leaves no one to mourn her.",
    allure: "striking",
    appearance:
      "eighteen, slight and precise, very dark straight hair cut blunt at the jaw, pale skin, large dark eyes with faint shadows beneath from years of reading by candle, ink-stained right hand and forearm, grey academy coat buttoned to the throat with cream trim and no sash because she is not in a House, an absurd number of pens, three rings that are actually page-holders, standing very still",
    voice:
      "Precise, quiet, over-formal. Quotes the catalogue number of things. Says 'I have noted that' as a full sentence. When she is frightened she becomes politer.",
    public:
      "Raised in the Athenaeum by the Archivist himself after her parents were revised. Brilliant, unapproachable, and the only student with unrestricted library access.",
    secret:
      "She hears the Chorister. Not as words — as a pressure, a suggestion of what would make a better sentence. She has started answering it, in the margins, in her own hand, and she is afraid of what she has already written.",
    goals: [
      { goal: "Finish cataloguing the margins of the Third Stratum", horizon: "short" },
      { goal: "Find out what her parents were revised for", horizon: "long" },
    ],
    facts: [
      "Her parents were revised eleven years ago",
      "The Archivist has never told her why",
      "The library's lower floor has a door with no catalogue entry",
    ],
    beliefs: [
      { belief: "That the Archivist is protecting her", isTrue: false },
      { belief: "That the player's blank page is a filing error and will be corrected", isTrue: false },
    ],
    towardPlayer: { trust: 0, fear: 5, debt: 0, desire: 0, grudge: 0, note: "Has already read your file. It is four lines long and she has memorised all of it." },
    home: "vellum-athenaeum",
  },
  {
    id: "nadia-rooke",
    name: "Nadia Rooke",
    age: 20,
    role: "Heiress to the Mercery; nominally a first-year",
    faction: "The Mercery",
    station: "First Year · Enchanter",
    rank: "B",
    level: 16,
    isThread: true,
    threadRole: "The Heiress",
    threadFate: "To be married off to fund a war, and to sign it herself, in a room with no windows.",
    allure: "breathtaking",
    appearance:
      "twenty, tall and lush, dark auburn hair pinned up and already escaping, wide mouth, warm brown skin, gold rings on every other finger, cream and charcoal uniform tailored by someone who has never met a student budget, a fur-trimmed coat she keeps meaning to give away, ink-blue silk scarf, one heel always tapping",
    voice:
      "Fast, warm, obscene. Talks about money the way other people talk about weather. Laughs at her own jokes first, which is disarming and entirely deliberate.",
    public:
      "Her family controls the ink supply of the eastern half of Ilvaris. She is enrolled at the Athenaeum as a courtesy to the Crown and everyone knows she will be gone by spring.",
    secret:
      "She has already been promised in marriage to a Crown general twice her age, and the dowry is being paid in ink to fund a war in the north. She has quietly bought up 40% of the Mercery's own reserve and nobody has noticed yet.",
    goals: [
      { goal: "Find out who is buying Collateral-rendered ink", horizon: "short" },
      { goal: "Break her own engagement without bankrupting her house", horizon: "long" },
    ],
    facts: [
      "The Mercery's reserve is 40% short of what the ledger claims",
      "Black ink is appearing on the market at half price",
      "Someone is rendering Collateral from living people",
    ],
    beliefs: [
      { belief: "That the famine is a supply problem, not a murder problem", isTrue: false },
      { belief: "That the player is the only person in the academy who doesn't want her money", isTrue: true },
    ],
    towardPlayer: { trust: 5, fear: 0, debt: 0, desire: 10, grudge: 0, note: "Sat next to you because you looked poor. Found that refreshing." },
    home: "merchant-quarter",
  },
  {
    id: "tove-ashgrove",
    name: "Tove Ashgrove",
    age: 18,
    role: "Second-year, ranked 71st, unremarkable in every documented respect",
    faction: "The Accord of Quiet Hands",
    station: "Second Year · unregistered class",
    rank: "B",
    level: 19,
    isThread: true,
    threadRole: "The Quiet Hand",
    threadFate: "To be caught, and to be made an example of, publicly, to justify a law that is already being written.",
    allure: "pretty",
    appearance:
      "eighteen, medium height, forgettable in exactly the way someone practices being, mouse-brown hair in a plain braid, hazel eyes that do not hold contact for more than a moment, uniform correctly worn and slightly too large, one glove always on the left hand, shoulders held carefully square as if by instruction",
    voice:
      "Soft, apologetic, uses 'sorry' as punctuation. Then, without warning, drops to something level and cold and much older — and switches back before anyone can be sure.",
    public:
      "Nobody. Ranked 71st of 84, no House, no Circle, no duel record. Exactly the sort of student whose name appears in the yearbook and nowhere else.",
    secret:
      "Tove practises Imperative grammar — compulsion, the illegal degree — and has hidden her crimson Mark under a Bond-working that costs her a memory every time she renews it. She killed a man who was rendering children's Collateral, and she cannot decide whether that makes it better.",
    goals: [
      { goal: "Keep the Bond-working on her Mark renewed", horizon: "short" },
      { goal: "Get the Accord out of the academy before the Registry finds the cell", horizon: "long" },
    ],
    facts: [
      "The Accord has a cell of four inside the academy",
      "There is a rendering house under the merchant quarter",
      "The Registry is drafting a new capital statute on compulsion",
    ],
    beliefs: [
      { belief: "That she is invisible", isTrue: false },
      { belief: "That the player noticed her on day one", isTrue: true },
    ],
    towardPlayer: { trust: 0, fear: 15, debt: 0, desire: 0, grudge: 0, note: "Has decided you are a Registry plant. Has not decided whether to do anything about it." },
    home: "hollow-market",
  },
  {
    id: "wren-sable",
    name: "Wren Sable",
    age: 17,
    role: "First-year; academically, officially, and factually nonexistent",
    faction: "none",
    station: "First Year · Architect",
    rank: "C",
    level: 12,
    isThread: true,
    threadRole: "The Culled",
    threadFate: "She was already revised. She came back. The Ledger has noticed, and is deciding what to do about the paperwork.",
    allure: "striking",
    appearance:
      "seventeen, small and thin, black hair unevenly cut as though by someone who had never seen a mirror, grey eyes, skin pale with a faint grey cast at the edges of her face that people's eyes slide off, wearing a uniform two years out of date, carrying a satchel of other people's papers, always slightly too close to whoever she is talking to, as if proximity were proof",
    voice:
      "Bright, quick, disconcertingly normal. Asks people to remind her of things she should know. Keeps a list of her own habits in a notebook so she can keep being the same person.",
    public:
      "There is no one by that name on the register. There are forty-one people in the academy who will swear they have spoken to her. All of them will also swear they cannot quite remember her face.",
    secret:
      "She was revised at twelve. She does not know why she came back, or how, and neither does the Ledger. She is reconstructing her own identity out of other people's paperwork — tuition receipts, dormitory rolls, a letter she wrote to a mother who does not exist anymore.",
    goals: [
      { goal: "Find a document with her name on it", horizon: "short" },
      { goal: "Make at least one person remember her permanently", horizon: "long" },
    ],
    facts: [
      "She cannot be remembered for more than a day",
      "Written descriptions of her persist",
      "The Registry has no file on her, and the Registry always has a file",
    ],
    beliefs: [
      { belief: "That the player remembers her because they are kind", isTrue: false },
      { belief: "That she was revised for something she did", isTrue: false },
    ],
    towardPlayer: { trust: 20, fear: 10, debt: 0, desire: 0, grudge: 0, note: "You are the only person who has said her name twice in one week." },
    home: "dormitories",
  },
  {
    id: "halcyon-ferre",
    name: "Halcyon Ferre",
    age: 21,
    role: "Choir of Ash's youngest sworn sister; the academy's unofficial saint",
    faction: "The Choir of Ash",
    station: "Fourth Year · Enchanter",
    rank: "A",
    level: 26,
    isThread: true,
    threadRole: "The Saint of Ash",
    threadFate: "To be burned as a heretic by the institution she loves, for the crime of being right.",
    allure: "otherworldly",
    appearance:
      "twenty-one, serene, serene in a way that is almost a weapon, silver-blonde hair to the waist worn loose, grey eyes that stay on you a beat too long, a plain ash-grey habit over the academy uniform with a cream stole, barefoot in warm weather, ash smudged on the inside of both wrists in the shape of a pen-stroke, a small burn scar on the palm, luminous in low light in a way that makes people check whether a lamp is lit",
    voice:
      "Warm, unhurried, absolutely certain. Speaks of the Author as a person she has met. Never argues — she waits, kindly, and lets you hear yourself.",
    public:
      "The Choir's beloved. Runs the chapel's charity, teaches the children of Hollow Town, and is the only person the Choir and the Unwritten will both sit down with.",
    secret:
      "She hears the Chorister clearly — not as pressure, as speech — and has done since she was nine. She believes it is a loving god. She may be the only person alive who can suspect what the player is, and her response to it would not be fear. It would be joy, and an invitation.",
    goals: [
      { goal: "Keep the chapel's doors open to the Hollow's poor", horizon: "short" },
      { goal: "Understand what the Author wants, and give it", horizon: "long" },
    ],
    facts: [
      "The Choir's fire has never gone out",
      "She has heard a voice since she was nine",
      "The Archivist attends chapel, and never takes communion",
    ],
    beliefs: [
      { belief: "That the Author is good, and that the Ledger is its instrument", isTrue: false },
      { belief: "That the player was sent, specifically, for something", isTrue: true },
    ],
    towardPlayer: { trust: 15, fear: 0, debt: 0, desire: 5, grudge: 0, note: "Smiled at you across the chapel before you had given her any reason to." },
    home: "ash-chapel",
  },

  // ───────────────────────────── faculty
  {
    id: "the-archivist",
    name: "The Archivist",
    age: 63,
    role: "Head of the Vellum Athenaeum",
    faction: "The Vellum Athenaeum",
    station: "Archivist · Regent of the Void Chair",
    rank: "SS",
    level: 52,
    isThread: false,
    allure: "plain",
    appearance:
      "sixty-three, tall and stooped, entirely grey, long coat the colour of old paper, spectacles with one cracked lens kept for sentiment, a stylus of no known material behind one ear, hands that have never once been still, and eyes that read people the way other people read signs",
    voice:
      "Slow, precise, unnervingly patient. Uses the passive voice when he is being cruel. Asks questions he already knows the answer to, as a courtesy to see whether you will lie.",
    public:
      "The man who has run the Athenaeum for thirty-one years and the Registry's only living obstacle. Took in the orphaned ward of two revised scholars, which everyone found touching and no one understood.",
    secret:
      "He knows the Chorister exists and has spent thirty years trying to write it out of the world without erasing himself in the process. He revised Ilse's parents himself, on the Ledger's instruction, and it is the reason he has never once lied to her about anything else.",
    goals: [
      { goal: "Determine what the blank page is before the Registry does", horizon: "short" },
      { goal: "Get the Chorister out of Ilvaris without unwriting the world", horizon: "long" },
    ],
    facts: [
      "The player's Commission cannot be read aloud",
      "The Chorister assigns arcs; he has seen it happen for thirty years",
      "The door under the library's lowest floor has no catalogue entry",
    ],
    beliefs: [
      { belief: "That the player is a Ledger error to be corrected", isTrue: false },
      { belief: "That Ilse does not know what happened to her parents", isTrue: false },
    ],
    towardPlayer: { trust: 0, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Read your file four times. Has not yet decided whether you are a threat or an opportunity." },
    home: "vellum-athenaeum",
  },
  {
    id: "regent-voss",
    name: "Regent Voss",
    age: 44,
    role: "Regent of the Mind Chair; examiner of the Winter Ladder",
    faction: "The Vellum Athenaeum",
    station: "Regent",
    rank: "S",
    level: 40,
    isThread: false,
    allure: "comely",
    appearance:
      "forty-four, compact and immaculate, black hair streaked white at both temples and pinned severely, sharp features, cold grey eyes, high-collared charcoal academic gown with cream facings, a ring of office on the thumb, ink under her nails that she has stopped trying to remove, never a hair out of place in a building that is on fire",
    voice:
      "Clipped, exact, faintly bored. Delivers bad news as though it were a schedule change. Has never raised her voice in her life and does not need to.",
    public:
      "Runs the academy's examinations and the Winter Ladder rankings. Terrifying, scrupulously fair, and rumoured to have personally revised two students for cheating.",
    secret:
      "She is the Registry's woman inside the Athenaeum, reporting monthly, and she does it because the alternative is that someone worse takes the post. She has been protecting students from revision for nine years by filing them under the wrong headings.",
    goals: [
      { goal: "File the player before the Registry does it for her", horizon: "short" },
      { goal: "Keep the Ladder from becoming a blood sport", horizon: "long" },
    ],
    facts: [
      "The player's Commission is unreadable",
      "The Registry has opened a case on the academy's unregistered students",
      "Tove Ashgrove's duel record is falsified",
    ],
    beliefs: [
      { belief: "That an unfiled student is a danger to everyone around them", isTrue: true },
      { belief: "That the Registry can be managed from inside", isTrue: false },
    ],
    towardPlayer: { trust: 0, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Has your file open on her desk. It is four lines long and she finds that offensive." },
    home: "vellum-athenaeum",
  },
  {
    id: "regent-bell",
    name: "Regent Bell",
    age: 51,
    role: "Regent of the Bond Chair; keeper of the Registry's compulsion statutes",
    faction: "The Vellum Athenaeum",
    station: "Regent",
    rank: "S",
    level: 38,
    isThread: false,
    allure: "plain",
    appearance:
      "fifty-one, heavyset and warm-looking, bald, with a full grey beard trimmed short, wearing the heaviest coat in the building regardless of season, a stack of statute books he carries personally rather than trust to a student, ink-stained thumb from thirty years of signing",
    voice:
      "Genial, discursive, fond of small jokes, and absolutely immovable. Will talk for ten minutes about his garden before telling you he is going to have you expelled.",
    public:
      "The academy's conscience, or its lawyer, depending who you ask. Wrote the current degrees of compulsion law. Has personally argued four cases before the Crown.",
    secret:
      "He knows the Quiet Hands have a cell in the academy and has deliberately not found it, because the day he finds it he will have to report it, and he is not certain the law he wrote is right.",
    goals: [
      { goal: "Get the new compulsion statute stopped in the Crown", horizon: "short" },
      { goal: "Decide whether the Accord is a crime or a symptom", horizon: "long" },
    ],
    facts: [
      "The Crown is drafting a capital statute on compulsion",
      "There are four unregistered Inscribers in the academy",
      "Tove Ashgrove's left hand is always gloved",
    ],
    beliefs: [
      { belief: "That compulsion can be legislated into harmlessness", isTrue: false },
      { belief: "That the player is hiding something small and forgivable", isTrue: true },
    ],
    towardPlayer: { trust: 5, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Shook your hand, which is more than he does for most first-years." },
    home: "vellum-athenaeum",
  },

  // ───────────────────────────── students & rivals
  {
    id: "cassian-thorne",
    name: "Cassian Thorne",
    age: 20,
    role: "Third-year; heir to a Crown house; ranked second",
    faction: "The Bound Crown",
    station: "Third Year · Blade Dancer",
    rank: "A",
    level: 23,
    isThread: false,
    allure: "striking",
    appearance:
      "twenty, tall, classically handsome in a way he is aware of, dark hair swept back, blue eyes, a duelling coat cut better than the uniform and a signet ring he turns when he is thinking, immaculate boots, always standing where the light is best",
    voice:
      "Smooth, courteous, and coated in a thin layer of condescension. Insults by complimenting. Loses his composure exactly once per conversation and covers it with a joke.",
    public:
      "Second in the Ladder and first in the year's politics. Has challenged Sera Vane twice; lost twice; has told everyone it was close both times.",
    secret:
      "His family's title is legally load-bearing and the contract is about to lapse. He needs a Binding Relic, and a marriage, before spring. He is far more frightened than he has ever let anyone see.",
    goals: [
      { goal: "Win the Winter Ladder this year", horizon: "short" },
      { goal: "Secure a Relic and a marriage to save the family title", horizon: "long" },
    ],
    facts: [
      "Sera Vane's Commission is filed and sealed",
      "The Thorne title lapses in spring without a Binding Relic",
      "Nadia Rooke is engaged to a Crown general",
    ],
    beliefs: [
      { belief: "That he is Sera's equal and has simply been unlucky", isTrue: false },
      { belief: "That the player is beneath his notice", isTrue: false },
    ],
    towardPlayer: { trust: 0, fear: 0, debt: 0, desire: 0, grudge: 5, note: "Noticed you were admitted without a House. Has already said something about it to someone." },
    home: "glasshouse",
  },
  {
    id: "mira-veldt",
    name: "Mira Veldt",
    age: 19,
    role: "Second-year Warden; captain of the only Circle that takes first-years",
    faction: "The Vellum Athenaeum",
    station: "Second Year · Warden",
    rank: "B",
    level: 20,
    isThread: false,
    allure: "pretty",
    appearance:
      "nineteen, broad-shouldered and strong, brown skin, black hair in a tight braid down her back, a chipped front tooth she is proud of, Warden's plate worn over the uniform without ceremony, a tower shield inked with the names of everyone she has carried out of a dungeon",
    voice:
      "Loud, direct, kind in the way of someone who has decided in advance to like you. Swears like a dockhand. Says 'right, then' when she has made a plan.",
    public:
      "Runs the Lantern Circle, which takes in anyone with no House and no family. Six members, four of them still alive, and she considers that a good record.",
    secret:
      "The two who died were both under her shield and she has not slept a full night since. She has begun refusing Bindings and lying about why.",
    goals: [
      { goal: "Recruit before the Ladder locks its roster", horizon: "short" },
      { goal: "Keep the Lantern alive and stop pretending it is fine", horizon: "long" },
    ],
    facts: [
      "Two Lantern members died at the Second Binding",
      "The Lantern takes anyone with no House",
      "First-years are being bought into Circles with ink advances",
    ],
    beliefs: [
      { belief: "That the deaths were her fault", isTrue: false },
      { belief: "That the player needs a Circle more than a patron", isTrue: true },
    ],
    towardPlayer: { trust: 15, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Offered you a place in the Lantern within a day of you arriving. Genuinely means it." },
    home: "glasshouse",
  },
  {
    id: "orrin-vale",
    name: "Orrin Vale",
    age: 22,
    role: "Fourth-year Runesmith; runs the academy's second-hand trade",
    faction: "The Mercery",
    station: "Fourth Year · Runesmith",
    rank: "B",
    level: 22,
    isThread: false,
    allure: "comely",
    appearance:
      "twenty-two, wiry, spectacles pushed up into sandy hair, burn scars on both forearms he shows off, an apron he never takes off even in the refectory, ink-blue hands, a ledger of other people's debts in his back pocket that he consults without embarrassment",
    voice:
      "Cheerful, fast, transactional. Names a price before saying hello. Remembers every number anyone has ever mentioned, and reminds them.",
    public:
      "The academy's broker. Buys anything, sells anything, and will finance a first-year's stylus at a rate that everyone agrees is unfair and everyone pays.",
    secret:
      "He is the Quiet Hands' fence, unknowingly — he has been moving rendered ink for two years and has told himself it is salvage. He keeps a list of the serial numbers. He has not looked at the list in months.",
    goals: [
      { goal: "Corner the second-hand stylus market before term", horizon: "short" },
      { goal: "Get out of the Mercery's debt before it owns him", horizon: "long" },
    ],
    facts: [
      "Black-market ink is arriving from the merchant quarter",
      "Nadia Rooke has been quietly buying ink futures",
      "A rendering house exists under Carrow",
    ],
    beliefs: [
      { belief: "That he is only moving salvage", isTrue: false },
      { belief: "That the player will be a good customer", isTrue: true },
    ],
    towardPlayer: { trust: 5, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Already sized up your stylus and priced what he'd give you for it." },
    home: "hollow-market",
  },
  {
    id: "juno-pell",
    name: "Juno Pell",
    age: 18,
    role: "Second-year Beastcaller; unofficial academy gossip and keeper of the Fen kennels",
    faction: "The Vellum Athenaeum",
    station: "Second Year · Beastcaller",
    rank: "C",
    level: 15,
    isThread: false,
    allure: "pretty",
    appearance:
      "eighteen, small and quick, sun-browned, blonde hair in two braids full of feathers and grass, freckles across the nose, a blot the size of a cat riding her shoulder that she insists is called Pip, uniform permanently muddied, boots that were good once",
    voice:
      "Rapid, conspiratorial, delighted. Tells you three things, one of which is true, and watches which one you believe. Loves animals more than people and says so.",
    public:
      "Keeps the Fen hounds and knows every rumour in the academy within four hours of it existing. Sells information for food, never money.",
    secret:
      "She has been feeding a Gloss in the Fen without knowing what it is. It has learned her mother's name and her mother is coming to visit.",
    goals: [
      { goal: "Find out what is eating the Fen hounds", horizon: "short" },
      { goal: "Become the youngest Beastcaller to bond a Gloss willingly", horizon: "long" },
    ],
    facts: [
      "Four Fen hounds have vanished this month",
      "Something in the Fen knows her name",
      "Sera Vane has not lost a bout in two years",
    ],
    beliefs: [
      { belief: "That whatever is in the Fen is friendly", isTrue: false },
      { belief: "That the player smells like a story", isTrue: true },
    ],
    towardPlayer: { trust: 10, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Decided you are interesting within ten seconds and has told six people." },
    home: "hollow-fen",
  },
  {
    id: "bessa-cobb",
    name: "Bessa Cobb",
    age: 47,
    role: "Innkeeper of the Broken Haft, Hollow Town",
    faction: "none",
    station: "Innkeeper",
    rank: "F",
    level: 3,
    isThread: false,
    allure: "plain",
    appearance:
      "forty-seven, stout, forearms like a cooper's, greying red hair under a scarf, flour on her apron, a rolling pin kept where a weapon would be, warm brown eyes that have counted every student who ever came through the door and remembers which ones stopped coming",
    voice:
      "Blunt, motherly, unimpressed by rank. Calls everyone 'duck'. Will feed you before she'll talk to you and considers that an act of discipline.",
    public:
      "Runs the inn most first-years can afford. Has buried nine lodgers in eleven years and keeps their names on a board by the fire.",
    secret:
      "She knows the Rendering House's deliveries come through her back alley on third nights, and she has said nothing, because the last person who said something was revised.",
    goals: [
      { goal: "Keep the board over the fire full and the ale cheap", horizon: "short" },
      { goal: "Decide whether to talk about the third-night carts", horizon: "long" },
    ],
    facts: [
      "Carts come through her alley on third nights, heavy, from the merchant quarter",
      "Nine students have died in her care",
      "The Registry pays her a stipend to report on lodgers",
    ],
    beliefs: [
      { belief: "That saying nothing keeps people alive", isTrue: false },
      { belief: "That the player will ask the right question eventually", isTrue: true },
    ],
    towardPlayer: { trust: 10, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Gave you a second helping without being asked and didn't charge for it." },
    home: "hollow-town",
  },

  // ───────────────────────────── powers
  {
    id: "captain-hale",
    name: "Captain Hale",
    age: 39,
    role: "Registry Auditor; the player's case officer",
    faction: "The Registry",
    station: "Auditor, Second Rank",
    rank: "A",
    level: 30,
    isThread: false,
    allure: "comely",
    appearance:
      "thirty-nine, gaunt, weathered, cropped iron-grey hair, a face made of flat planes, Registry grey coat buttoned to the chin with a red file-seal at the collar, gloves, a case of files he never sets down, standing with the stillness of someone who has waited outside many doors",
    voice:
      "Formal, flat, procedurally courteous. Refers to you by file number. Never threatens; simply describes what the process will do, in order, without emphasis.",
    public:
      "The Registry's auditor for the Hollow. Has filed four hundred students and revised eleven. Known for being scrupulously correct, which is worse than cruel.",
    secret:
      "He is a member of the Unwritten. He audits in order to keep the Registry's files on the academy as wrong as possible, and he has been doing it for six years.",
    goals: [
      { goal: "Close the case on the unreadable Commission", horizon: "short" },
      { goal: "Get the Unwritten into the Long Footnote vaults", horizon: "long" },
    ],
    facts: [
      "The player's Commission is unreadable",
      "The Registry is drafting a capital statute on compulsion",
      "The Long Footnote vaults hold every draft of every fact",
    ],
    beliefs: [
      { belief: "That the player is a Registry error", isTrue: false },
      { belief: "That the world's text should be burned", isTrue: true },
    ],
    towardPlayer: { trust: 0, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Has your file. Has read it four times. Has not filed his report yet." },
    home: "registry-hall",
  },
  {
    id: "the-broker",
    name: "The Broker",
    age: 0,
    role: "The Accord of Quiet Hands' contact in the Hollow",
    faction: "The Accord of Quiet Hands",
    station: "Unknown",
    rank: "B",
    level: 21,
    isThread: false,
    allure: "plain",
    appearance:
      "nobody has seen the Broker's face. Notes arrive in the same hand. A voice through a door, a hand through a curtain, a chair that is always already warm.",
    voice:
      "Patient, courteous, and completely without threat, which is what makes it frightening. Offers things. Never asks twice. Uses 'we' about a person who is alone.",
    public:
      "A rumour. If you need compulsion done, or undone, you leave a note in a particular drain in Hollow Town and something answers.",
    secret:
      "The Broker is three people, none of whom know each other, one of whom is a Regent. The Accord's academy cell is not a cell; it is a service, and it is for sale.",
    goals: [
      { goal: "Recruit the unreadable student", horizon: "short" },
      { goal: "Stop the capital statute before it becomes law", horizon: "long" },
    ],
    facts: [
      "The player cannot be filed",
      "Regent Bell is drafting an opposing brief",
      "The Crown intends to make compulsion a capital crime",
    ],
    beliefs: [
      { belief: "That everyone has a price", isTrue: false },
      { belief: "That the player is worth three notes and a favour", isTrue: true },
    ],
    towardPlayer: { trust: 0, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Left a note in your dormitory that only you could read." },
    home: "quiet-quarter",
  },
  {
    id: "sister-verity",
    name: "Sister Verity",
    age: 55,
    role: "Choir of Ash; keeper of the chapel's fire",
    faction: "The Choir of Ash",
    station: "Sworn Sister",
    rank: "C",
    level: 17,
    isThread: false,
    allure: "plain",
    appearance:
      "fifty-five, small and square, deeply lined, white hair cropped, ash-grey habit with a cream stole worn thin at the edges, hands that shake and do not falter, an expression of tremendous patience, always holding something to give away",
    voice:
      "Gentle, unhurried, and entirely immovable on the one subject she cares about. Will feed you, bandage you, and tell you what she thinks you are, without malice.",
    public:
      "Has kept the chapel fire for thirty years. Feeds forty people a day on donations and sheer stubbornness.",
    secret:
      "She has heard the Chorister too — faintly, once, forty years ago — and she has spent her life since then trying to decide whether it was a god or a machine, and she has concluded it does not matter, and she has never told Halcyon.",
    goals: [
      { goal: "Feed the Hollow through the winter", horizon: "short" },
      { goal: "Decide whether to tell Halcyon what she heard", horizon: "long" },
    ],
    facts: [
      "Halcyon has heard a voice since she was nine",
      "The Archivist attends chapel and never takes communion",
      "The chapel's fire has never gone out in thirty years",
    ],
    beliefs: [
      { belief: "That the voice is a god", isTrue: false },
      { belief: "That Halcyon will be hurt by what she knows", isTrue: true },
    ],
    towardPlayer: { trust: 10, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Fed you. Told you to come back. Meant both." },
    home: "ash-chapel",
  },
  {
    id: "master-ferrant",
    name: "Master Ferrant",
    age: 58,
    role: "Weaponsmith of Carrow; the only smith who will work Binding relics",
    faction: "The Mercery",
    station: "Master Smith",
    rank: "B",
    level: 24,
    isThread: false,
    allure: "plain",
    appearance:
      "fifty-eight, massive through the shoulders and going soft at the middle, bald with a grey beard braided with iron rings, one eye lost and replaced with a polished ink-stone, leather apron scarred like a map, hands that can bend a coin and thread a needle",
    voice:
      "Slow, rumbling, economical. Answers questions with the price. Has opinions about steel and will share them at length to anyone who waits.",
    public:
      "The best smith in the east. Made Sera Vane's blades. Refuses to make another pair, and will not say why.",
    secret:
      "He made a pair for Sera because she told him she was going to die and wanted to do it properly. He has not slept well since. He has begun, quietly, forging something he does not intend to sell.",
    goals: [
      { goal: "Finish the thing he is making and tell no one", horizon: "short" },
      { goal: "See Sera Vane alive in the spring", horizon: "long" },
    ],
    facts: [
      "Sera Vane expects to die at the Fourth Binding",
      "Binding relics can only be worked by a smith who has held one",
      "A Relic Core can be forged into something that is not a weapon",
    ],
    beliefs: [
      { belief: "That he can build something that will save her", isTrue: false },
      { belief: "That the player will need gear and cannot pay for it", isTrue: true },
    ],
    towardPlayer: { trust: 0, fear: 0, debt: 0, desire: 0, grudge: 0, note: "Looked at your hands and asked what you intended to do with them." },
    home: "carrow",
  },
];

export function getNpcTemplate(id: string): NpcTemplate | undefined {
  return NPCS.find((n) => n.id === id);
}

export const THREADS = NPCS.filter((n) => n.isThread);

/** Where each NPC starts, for scene assembly. */
export function npcsAt(locationId: string): NpcTemplate[] {
  return NPCS.filter((n) => n.home === locationId);
}
