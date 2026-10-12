# ILVARIS — build scratchpad

## Scope (Phase 1 + approved additions)
- [ ] DB schema (~20 stateful tables)
- [ ] Static world data as TS modules (classes, skills/vectors, items, monsters, map, NPCs, economy, lore, arcs)
- [ ] Character creation with 8 classes, F–SSS ranks
- [ ] Turn loop: Chorister (direct) → Narrator (stream) → Registrar (extract)
- [ ] Streaming NDJSON protocol at POST /api/turn
- [ ] Fog-of-war world map + travel
- [ ] System Window: stats, level, XP, skills, ranks
- [ ] Research bench: vector+shape+modifiers → new skills, journal with failures
- [ ] Economy: market, inventory, transactions, price history
- [ ] Heroines/Threads with CHA-driven social state
- [ ] Bestiary (F–SSS), lore codex with fog of war
- [ ] Manhwa 2D portraits via gateway image model → S3 → proxy route
- [ ] Expeditions + solo descent (Arifureta-style) modes
- [ ] design.md
- [ ] build + deliver

## Key decisions
- Static world content = TS modules; DB only for per-save state.
- Player sees numbers (System Window); natives see intuition. Justified in-world: the blank page renders as UI.
- NPC context firewall enforced in code, in context.ts.
- events table carries causeEventId = causality backbone.
- Pace: 3-pressure law, breath after Bindings, chapters end on Turn.

## Ports
web 4200
