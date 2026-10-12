import { z } from "zod";
import { base } from "../__core/app";
import { loadGame } from "../game/state";
import { LOCATIONS, LINKS, neighboursOf, getLocation } from "../world/map";
import { monstersAt } from "../world/monsters";
import { npcsAt } from "../world/npcs";
import { getItem } from "../world/items";

/**
 * THE STRATA — the map, and the fog over it.
 *
 * Nothing unrevealed is ever sent to the client. A location the player has not
 * heard of does not exist yet, and the API refuses to describe it. A road is
 * drawn only once both of its ends are known.
 */
export const strata = {
  map: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const revealed = new Map(state.mapReveal.map((r) => [r.locationId, r]));
    const here = state.character.locationId;

    const nodes = LOCATIONS.filter((l) => revealed.has(l.id)).map((l) => {
      const r = revealed.get(l.id)!;
      const monsters = monstersAt(l.id, state.character.depth);
      return {
        id: l.id,
        name: l.name,
        layer: l.layer,
        x: l.x,
        y: l.y,
        region: l.region,
        kind: l.kind,
        minLevel: l.minLevel,
        danger: l.danger,
        description: l.description,
        services: l.services ?? [],
        visited: r.visited,
        cleared: r.cleared,
        discoveredTurn: r.discoveredTurn,
        here: l.id === here,
        adjacent: l.id !== here && neighboursOf(here).some((n) => n.loc.id === l.id),
        monsters: monsters.map((m) => ({ id: m.id, name: m.name, rank: m.rank, level: m.level, engagement: m.engagement })),
      };
    });

    const known = new Set(nodes.map((n) => n.id));
    const links = LINKS.filter((k) => known.has(k.from) && known.has(k.to)).map((k) => ({
      from: k.from,
      to: k.to,
      kind: k.kind,
      steps: k.steps,
      danger: k.danger,
      secret: k.secret ?? false,
    }));

    return {
      nodes,
      links,
      here,
      depth: state.character.depth,
      layers: ["surface", "depths"] as const,
      counts: {
        known: nodes.length,
        total: LOCATIONS.length,
        visited: nodes.filter((n) => n.visited).length,
      },
    };
  }),

  /** What is at a place the player has actually been or been told about. */
  location: base
    .input(z.object({ saveId: z.number(), locationId: z.string() }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const known = state.mapReveal.some((r) => r.locationId === input.locationId);
      const loc = getLocation(input.locationId);
      if (!known || !loc) return { known: false as const };
      const monsters = monstersAt(loc.id, state.character.depth);
      const people = npcsAt(loc.id);
      return {
        known: true as const,
        location: {
          id: loc.id,
          name: loc.name,
          layer: loc.layer,
          region: loc.region,
          kind: loc.kind,
          danger: loc.danger,
          minLevel: loc.minLevel,
          description: loc.description,
          services: loc.services ?? [],
        },
        monsters: monsters.map((m) => ({
          id: m.id,
          name: m.name,
          rank: m.rank,
          level: m.level,
          hp: m.hp,
          damage: m.damage,
          armour: m.armour,
          engagement: m.engagement,
          traits: m.traits,
          lore: m.lore,
          drops: m.drops.map((d) => ({ name: getItem(d.itemId)?.name ?? d.itemId, chance: d.chance, rank: getItem(d.itemId)?.rank ?? "F" })),
        })),
        people: people.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          rank: p.rank,
          allure: p.allure,
          met: state.npcs.find((n) => n.npcId === p.id)?.met ?? false,
          isThread: p.isThread,
        })),
        routes: neighboursOf(loc.id).map((n) => ({
          to: n.loc.id,
          name: n.loc.name,
          kind: n.link.kind ?? "road",
          days: n.link.steps ?? 1,
          hazard: n.link.danger ?? 0,
          known: state.mapReveal.some((r) => r.locationId === n.loc.id),
          danger: n.loc.danger,
          minLevel: n.loc.minLevel,
        })),
      };
    }),

  /** The full atlas, for the "what exists" ledger page — regions and counts only, never coordinates. */
  regions: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const known = new Set(state.mapReveal.map((r) => r.locationId));
    const byRegion = new Map<string, { region: string; total: number; known: number; visited: number; minDanger: number }>();
    for (const l of LOCATIONS) {
      const row = byRegion.get(l.region) ?? { region: l.region, total: 0, known: 0, visited: 0, minDanger: 9 };
      row.total += 1;
      if (known.has(l.id)) {
        row.known += 1;
        if (state.mapReveal.find((r) => r.locationId === l.id)?.visited) row.visited += 1;
        row.minDanger = Math.min(row.minDanger, l.danger);
      }
      byRegion.set(l.region, row);
    }
    return [...byRegion.values()].sort((a, b) => b.known - a.known);
  }),
};
