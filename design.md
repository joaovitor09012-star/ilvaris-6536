# ILVARIS — Design

A single-player narrative simulation run by three AI agents. Web-first (desktop loads the same UI).

Visual direction: **the tooled grimoire.** Dark tooled-leather chrome, antique-gold ornament, a
parchment reading surface for the story, engraved Roman capitals, one crimson accent reserved for
the primary action. Characters and places are drawn as **Korean manhwa / anime** illustration
(Eminence in Shadow, Goblin Slayer, Academy Eroge). The chrome is a book binding; the scene is the
page inside it.

The interface stays diegetic: the player's Codex has a blank first page, and that page renders as
the System Window. Numbers are the player's alone — no native ever sees them.

## Brand & Colors

Tokens live in `packages/web/src/web/styles.css`. Token *names* are kept from the previous system
(`ink`, `paper`, `rule`, `gold`) so every page inherits the new palette; only values changed.

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#0c0a08` | Page background — black leather |
| `--ink-2` | `#13100d` | Nav rail, sunken surfaces, inputs |
| `--ink-3` | `#1a1511` | Panels and cards |
| `--ink-4` | `#251e17` | Hover, active rows, selected tiles |
| `--paper` | `#ecdfc2` | Primary text on leather — warm cream |
| `--paper-2` | `#bfae8c` | Secondary text |
| `--paper-3` | `#857559` | Muted labels, metadata |
| `--gold` | `#c9a45c` | Ornament, rules, active nav, section numerals' hairlines |
| `--gold-bright` | `#e8cf98` | Wordmark highlight, medallion numerals |
| `--gold-dim` | `#6e5631` | Panel borders at rest |
| `--rule` | `#a8262a` | Crimson — primary buttons, drop caps, section numerals, danger |
| `--rule-dim` | `#5a1618` | Crimson at rest, banner ribbons |
| `--vellum` | `#efe3c7` | Parchment surface (the scene page, the Bible reader) |
| `--vellum-ink` | `#2a1f15` | Text on parchment |

Inside `.parchment`, `--paper`, `--paper-2`, `--paper-3` are re-pointed to dark inks, so any
component dropped on the page reads correctly without bespoke colours.

Rank ramp (unchanged, mirrored in `world/ranks.ts` and `ui-kit.tsx`).

## Typography

Self-hosted in `packages/web/public/fonts/`.

- **Display — `Cinzel`** (400–700, variable). Engraved Roman capitals. Titles, section headers,
  nav labels, buttons, card names. Tracking 0.06–0.22em. Never for paragraphs.
- **Body — `EB Garamond`** (400–600 + italic, variable). All prose, lore, descriptions, inputs.
  Italic for arc names, quest names, taglines.
- **System — `IBM Plex Mono`**. Numbers only: stats, XP, prices, ledger values.

Scale: display 10/12/15/22/34/56/96px · body 15/17/19px at 1.65 · mono 11/12px.

## Ornament

- **Framed panel (`.panel`, `.frame`)** — 1px gold-dim border plus ornate gold corner brackets,
  drawn by a 9-slice SVG `border-image`. Squared corners. This is the default container.
- **Quiet panel (`.panel-quiet`, `.tile`)** — thin border, no brackets. Use for dense lists.
- **Gold rule (`.rule`)** — a hairline that fades at both ends, with an optional centred
  lozenge (`.rule-orn`). Replaces the old red rule.
- **Section numeral** — `01`, `02` in crimson Cinzel before a section title, then a gold rule
  running to a small italic caption on the right.
- **Medallion (`.medallion`)** — a gold-ringed disc with the level numeral.
- **Ribbon (`.ribbon`)** — a crimson or slate banner that hangs from the top edge of a card,
  carrying a class glyph.

## Layout

- **Vertical nav rail**, 208px, fixed left: wordmark + compass rose, icon + label links, divider,
  Settings and Help (re-opens the tour), "An interactive narrative" foot. Collapses to 64px icons
  under 1100px and to a top bar on mobile.
- Content max-width 1320px, 32px gutters.
- **Desk**: three columns — scene context (art + current arc) · parchment scene · System Window
  (medallion, portrait, bars, stats, active quest). Action chips + input bar pinned below the page.
- **Home**: full-bleed hero art with the engraved wordmark, then "SAVES" rule and portrait save
  cards (art banner, ribbon, LVL medallion, standing / location / turn rows, current-arc strip).
- **Enrollment**: 01 The Person · 02 The Class (art-topped class cards) · sticky The Commission.

## Imagery

All art in `packages/web/public/art/`, JPEG, pre-sized (hero 2400w, class portraits 640w).
Prompt skeleton for any new art, for consistency:

> Korean manhwa webtoon digital illustration, cel-shaded with soft gradient shading and crisp dark
> ink linework, dark-fantasy academy aesthetic, muted charcoal and aged-parchment palette with deep
> crimson and antique gold accents. … No text, no lettering, no watermark.

## Motion

One orchestrated load per page (`.rise`, staggered by `animationDelay`). Scene prose streams in for
real. Hovers are 140ms colour/border transitions; cards lift 2px. The tour spotlight animates its
cut-out between targets over 260ms. No springs, no bounce.

## Onboarding

A first-run **tour** on the Desk: a dimmed overlay with a spotlight cut-out around the current
region, an arrow pointing at it, a framed caption card with step count, Back / Next, and a
**Skip tour** button. Stored per save in `localStorage` (`ilvaris.tour.<saveId>`); re-opened from
**Help** in the rail. A shorter tour runs once on the Home screen (`ilvaris.tour.home`).

## Content

There is no content-mode or pure-mode setting. What a scene contains follows the player's own
register in play; the absolute limits in `narratorSystem` (adults only, nothing framed as involving
a child, no eroticised coercion) are always on and never exposed as an option.

## Anti-patterns

Rounded corners above 4px · purple · glassmorphism · emoji as icons · blue links · pure white ·
flat grey panels without ornament on primary surfaces · body text in Cinzel · prose in mono.
