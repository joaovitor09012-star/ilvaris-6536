import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as s from "../database/schema";
import { loadGame } from "../game/state";
import { inventoryView } from "../game/view";
import { GOODS, getGood, WAGES, bountyFor, BINDING_PURSE, driftPrice, MARKET_EVENTS } from "../world/economy";
import { getItem, formatCoin, ITEMS } from "../world/items";
import { getLocation } from "../world/map";
import { addEvent } from "../game/state";

/** Merchants buy at this fraction of list. The player is always the mark in a small market. */
const SELL_RATE = 0.5;

function shockOf(flags: Record<string, unknown> | null | undefined): { shock: number; active: { key: string; label: string }[] } {
  const active = Object.entries(flags ?? {})
    .filter(([k, v]) => v === true && MARKET_EVENTS[k])
    .map(([k]) => ({ key: k, label: MARKET_EVENTS[k].label }));
  const shock = active.reduce((a, k) => a + MARKET_EVENTS[k.key].shock, 0);
  return { shock, active };
}

export const ledger = {
  /** The Ledger screen: what the player owns, owes, and could get. */
  get: base.input(z.object({ saveId: z.number() })).handler(async ({ input }) => {
    const state = await loadGame(input.saveId);
    const char = state.character;
    const here = char.locationId;
    const { shock, active } = shockOf(state.save.flags);

    const market = GOODS.filter((g) => g.markets.length === 0 || g.markets.includes(here)).map((g) => {
      const row = state.prices.find((p) => p.goodId === g.id);
      const base = row?.price ?? g.basePrice;
      const price = driftPrice(base, g.volatility, shock, Math.random());
      return {
        id: g.id,
        name: g.name,
        category: g.category,
        basePrice: g.basePrice,
        price,
        priceLabel: formatCoin(price),
        lastPrice: base,
        driftPct: base > 0 ? Math.round(((price - base) / base) * 100) : 0,
        sellPrice: Math.round(price * SELL_RATE),
        volatility: g.volatility,
        itemId: getItem(g.id) ? g.id : null,
      };
    });

    const transactions = await db
      .select()
      .from(s.transactions)
      .where(eq(s.transactions.saveId, input.saveId))
      .orderBy(desc(s.transactions.id))
      .limit(80);

    return {
      coin: char.coin,
      coinLabel: formatCoin(char.coin),
      debt: char.debt,
      stain: char.stain,
      at: { id: here, name: getLocation(here)?.name ?? here, services: getLocation(here)?.services ?? [] },
      inventory: state.inventory.map(inventoryView).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)),
      carrying: state.inventory.reduce((a, i) => a + i.qty, 0),
      market,
      marketEvents: active,
      shock,
      transactions: transactions.map((t) => ({
        id: t.id,
        turn: t.turn,
        kind: t.kind,
        goodId: t.goodId,
        name: getGood(t.goodId)?.name ?? getItem(t.goodId)?.name ?? t.goodId,
        qty: t.qty,
        unitPrice: t.unitPrice,
        total: t.total,
        totalLabel: formatCoin(t.total),
        counterparty: t.counterparty,
        note: t.note,
      })),
      wages: WAGES,
      bountyTable: ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"].map((r) => ({ rank: r, payout: bountyFor(r), label: formatCoin(bountyFor(r)) })),
      bindingPurse: BINDING_PURSE,
      bindingPurseLabel: formatCoin(BINDING_PURSE),
      catalogue: ITEMS.filter((i) => i.tradeable && (getLocation(here)?.services ?? []).some((sv) => sv === "shop" || sv === "ink"))
        .slice(0, 40)
        .map((i) => ({ id: i.id, name: i.name, rank: i.rank, type: i.type, price: i.price, priceLabel: formatCoin(i.price), description: i.description, effect: i.effect ?? "" })),
    };
  }),

  /** Buy from the local market. Commodities and shop goods both land in the inventory. */
  buy: base
    .input(z.object({ saveId: z.number(), goodId: z.string(), qty: z.number().int().min(1).max(999) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const char = state.character;
      const here = char.locationId;
      const { shock } = shockOf(state.save.flags);

      const good = getGood(input.goodId);
      const item = getItem(input.goodId);
      if (!good && !item) throw new ORPCError("NOT_FOUND", { message: "Nothing by that name is sold here." });
      if (good && good.markets.length > 0 && !good.markets.includes(here))
        throw new ORPCError("BAD_REQUEST", { message: `${good.name} is not traded at ${getLocation(here)?.name ?? here}.` });

      const services = getLocation(here)?.services ?? [];
      if (!good && item && !services.some((sv) => sv === "shop" || sv === "ink"))
        throw new ORPCError("BAD_REQUEST", { message: "There is no shop here." });

      const unit = good
        ? driftPrice(state.prices.find((p) => p.goodId === good.id)?.price ?? good.basePrice, good.volatility, shock, Math.random())
        : item!.price;
      const total = unit * input.qty;
      if (total > char.coin)
        throw new ORPCError("BAD_REQUEST", {
          message: `That is ${formatCoin(total)}. You have ${formatCoin(char.coin)}.`,
        });

      await db.update(s.characters).set({ coin: char.coin - total }).where(eq(s.characters.id, char.id));

      const rows = await db.select().from(s.inventory).where(eq(s.inventory.saveId, input.saveId));
      const existing = rows.find((r) => r.itemId === input.goodId);
      if (existing) await db.update(s.inventory).set({ qty: existing.qty + input.qty }).where(eq(s.inventory.id, existing.id));
      else await db.insert(s.inventory).values({ saveId: input.saveId, itemId: input.goodId, qty: input.qty, acquiredTurn: state.save.turn });

      await db.insert(s.transactions).values({
        saveId: input.saveId,
        turn: state.save.turn,
        kind: "buy",
        goodId: input.goodId,
        qty: input.qty,
        unitPrice: unit,
        total,
        counterparty: getLocation(here)?.name ?? here,
        note: "",
      });
      await addEvent(input.saveId, state.save.turn, "economy", `Bought ${input.qty}× ${good?.name ?? item!.name} for ${formatCoin(total)}`, {
        locationId: here,
      });

      return { spent: total, spentLabel: formatCoin(total), coin: char.coin - total };
    }),

  /** Sell out of the inventory. Half list, always. */
  sell: base
    .input(z.object({ saveId: z.number(), itemId: z.string(), qty: z.number().int().min(1).max(999) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const char = state.character;
      const here = char.locationId;
      const services = getLocation(here)?.services ?? [];
      if (!services.some((sv) => sv === "shop" || sv === "inn"))
        throw new ORPCError("BAD_REQUEST", { message: "Nobody here is buying." });

      const rows = await db.select().from(s.inventory).where(eq(s.inventory.saveId, input.saveId));
      const row = rows.find((r) => r.itemId === input.itemId);
      if (!row || row.qty < input.qty) throw new ORPCError("BAD_REQUEST", { message: "You do not have that many." });

      const tpl = getItem(input.itemId);
      const good = getGood(input.itemId);
      if (tpl && !tpl.tradeable) throw new ORPCError("BAD_REQUEST", { message: "That cannot be sold." });

      const { shock } = shockOf(state.save.flags);
      const list = good ? driftPrice(state.prices.find((p) => p.goodId === good.id)?.price ?? good.basePrice, good.volatility, shock, Math.random()) : tpl?.price ?? 5;
      const unit = Math.max(1, Math.round(list * SELL_RATE));
      const total = unit * input.qty;

      if (row.qty === input.qty) await db.delete(s.inventory).where(eq(s.inventory.id, row.id));
      else await db.update(s.inventory).set({ qty: row.qty - input.qty }).where(eq(s.inventory.id, row.id));
      await db.update(s.characters).set({ coin: char.coin + total }).where(eq(s.characters.id, char.id));

      await db.insert(s.transactions).values({
        saveId: input.saveId,
        turn: state.save.turn,
        kind: "sell",
        goodId: input.itemId,
        qty: input.qty,
        unitPrice: unit,
        total,
        counterparty: getLocation(here)?.name ?? here,
        note: "",
      });
      await addEvent(input.saveId, state.save.turn, "economy", `Sold ${input.qty}× ${tpl?.name ?? input.itemId} for ${formatCoin(total)}`, { locationId: here });

      return { earned: total, earnedLabel: formatCoin(total), coin: char.coin + total };
    }),

  /** The price history of anything the player has touched. The world keeps honest books. */
  history: base
    .input(z.object({ saveId: z.number(), goodId: z.string() }))
    .handler(async ({ input }) => {
      const rows = await db
        .select()
        .from(s.prices)
        .where(and(eq(s.prices.saveId, input.saveId), eq(s.prices.goodId, input.goodId)))
        .orderBy(s.prices.turn);
      const good = getGood(input.goodId);
      return {
        goodId: input.goodId,
        name: good?.name ?? getItem(input.goodId)?.name ?? input.goodId,
        basePrice: good?.basePrice ?? getItem(input.goodId)?.price ?? 0,
        points: rows.map((r) => ({ turn: r.turn, price: r.price })),
      };
    }),

  /** Every item in the world, for the compendium page. Ranks are public knowledge. */
  catalogue: base.handler(() =>
    ITEMS.map((i) => ({ id: i.id, name: i.name, rank: i.rank, type: i.type, price: i.price, priceLabel: formatCoin(i.price), description: i.description, effect: i.effect ?? "", source: i.source, tradeable: i.tradeable })),
  ),

  /** Pay down debt. Debt is the plot engine; paying it is always allowed and always expensive. */
  repay: base
    .input(z.object({ saveId: z.number(), amount: z.number().int().min(1) }))
    .handler(async ({ input }) => {
      const state = await loadGame(input.saveId);
      const char = state.character;
      const amount = Math.min(input.amount, char.coin, char.debt);
      if (amount <= 0) throw new ORPCError("BAD_REQUEST", { message: "Nothing to repay." });
      await db.update(s.characters).set({ coin: char.coin - amount, debt: char.debt - amount }).where(eq(s.characters.id, char.id));
      await db.insert(s.transactions).values({
        saveId: input.saveId,
        turn: state.save.turn,
        kind: "tithe",
        goodId: "debt",
        qty: 1,
        unitPrice: amount,
        total: amount,
        counterparty: "The Registry",
        note: "Debt repayment",
      });
      await addEvent(input.saveId, state.save.turn, "economy", `Repaid ${formatCoin(amount)} of Covenant debt`, { locationId: char.locationId });
      return { repaid: amount, repaidLabel: formatCoin(amount), debt: char.debt - amount, coin: char.coin - amount };
    }),
};
