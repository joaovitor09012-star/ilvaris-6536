import { useState } from "react";
import { Coins, TrendingDown, TrendingUp } from "lucide-react";
import { Loading, Panel, PanelHead, RankChip, SectionHeader, Empty, KeyValue, Tag } from "../components/ui-kit";
import { useLedger, useBuy, useSell, useRepay } from "../queries/ledger";
import { cn } from "../lib/utils";

export default function LedgerPage({ saveId }: { saveId: number }) {
  const ledger = useLedger(saveId);
  const buy = useBuy(saveId);
  const sell = useSell(saveId);
  const repay = useRepay(saveId);
  const [tab, setTab] = useState<"market" | "inventory" | "history" | "prices">("market");
  const [note, setNote] = useState<string | null>(null);

  if (ledger.isLoading) return <Loading label="Counting" />;
  if (!ledger.data) return <Empty>The ledger will not open.</Empty>;
  const d = ledger.data;
  const hasShop = d.at.services.some((s) => s === "shop" || s === "ink" || s === "inn");

  const act = (fn: () => void) => {
    setNote(null);
    fn();
  };

  return (
    <div>
      <SectionHeader
        label="The Ledger"
        title="Money, and what it costs"
        subtitle="Two currencies that are secretly the same substance: coin, and ink. Prices move with the world, and the world keeps honest books."
        right={
          <div className="text-right">
            <div className="mono text-[18px] text-gold">{d.coinLabel}</div>
            <div className="micro mt-0.5">at {d.at.name}</div>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
        <Stat k="Purse" v={d.coinLabel} />
        <Stat k="Covenant debt" v={d.debt > 0 ? d.debt.toLocaleString() : "none"} />
        <Stat k="Stain" v={String(d.stain)} />
        <Stat k="Carrying" v={`${d.carrying} items`} />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["market", "inventory", "history", "prices"] as const).map((t) => (
          <button key={t} className={cn("chip", tab === t && "chip-on")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {(buy.isError || sell.isError || repay.isError) && (
        <p className="mb-4 text-[13px] text-rule">
          {((buy.error ?? sell.error ?? repay.error) as Error).message}
        </p>
      )}
      {note && <p className="mb-4 text-[13px] text-gold">{note}</p>}

      {tab === "market" && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_300px]">
          <Panel className="overflow-hidden">
            <PanelHead title="Market" meta={`${d.market.length} lines at ${d.at.name}`} right={d.shock !== 0 ? <Tag color={d.shock > 0 ? "#b23327" : "#7d9b7a"}>shock {d.shock > 0 ? "+" : ""}{Math.round(d.shock * 100)}%</Tag> : undefined} />
            <div className="divide-y divide-line-soft">
              {d.market.map((g) => (
                <div key={g.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] text-paper">{g.name}</div>
                    <div className="micro mt-0.5">
                      {g.category} · vol {g.volatility.toFixed(1)}
                    </div>
                  </div>
                  <div className="w-[92px] flex-none text-right">
                    <div className="mono text-[13px]">{g.priceLabel}</div>
                    {g.driftPct !== 0 && (
                      <div className="micro flex items-center justify-end gap-1" style={{ color: g.driftPct > 0 ? "#b23327" : "#7d9b7a" }}>
                        {g.driftPct > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {g.driftPct > 0 ? "+" : ""}
                        {g.driftPct}%
                      </div>
                    )}
                  </div>
                  <div className="flex flex-none gap-1.5">
                    <button
                      className="btn btn-sm"
                      disabled={!hasShop || buy.isPending}
                      onClick={() =>
                        act(() =>
                          buy.mutate(
                            { saveId, goodId: g.id, qty: 1 },
                            { onSuccess: () => setNote(`Bought ${g.name}.`) },
                          ),
                        )
                      }
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-4">
            {d.marketEvents.length > 0 && (
              <Panel className="overflow-hidden">
                <PanelHead title="World events" meta="moving prices now" />
                <ul className="divide-y divide-line-soft">
                  {d.marketEvents.map((e) => (
                    <li key={e.key} className="px-3.5 py-2.5 text-[13px] leading-snug text-paper-2">
                      {e.label}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <Panel className="overflow-hidden">
              <PanelHead title="Bounty board" meta="per kill, by rank" />
              <div className="p-3.5">
                {d.bountyTable.map((b) => (
                  <div key={b.rank} className="flex items-center justify-between border-b border-line-soft py-1.5 last:border-0">
                    <RankChip rank={b.rank} />
                    <span className="mono text-[12px] text-paper-2">{b.label}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <PanelHead title="Wages" meta="per day" />
              <div className="p-3.5">
                {Object.entries(d.wages).map(([k, v]) => (
                  <KeyValue key={k} k={k.replace(/_/g, " ")} v={`${v} shards`} mono />
                ))}
                <KeyValue k="Binding purse" v={d.bindingPurseLabel} mono />
              </div>
            </Panel>

            {d.debt > 0 && (
              <Panel inset className="overflow-hidden">
                <PanelHead title="Covenant debt" meta="the plot engine" />
                <div className="p-3.5">
                  <p className="text-[13.5px] leading-relaxed text-paper-2">
                    Power generates arcs, and nothing here is free. Paying down debt is always allowed and
                    always expensive.
                  </p>
                  <button
                    className="btn btn-sm mt-3 w-full"
                    disabled={repay.isPending}
                    onClick={() =>
                      act(() =>
                        repay.mutate(
                          { saveId, amount: Math.min(d.coin, d.debt) },
                          { onSuccess: (r) => setNote(`Repaid ${r.repaidLabel}.`) },
                        ),
                      )
                    }
                  >
                    <Coins className="size-3" /> Repay {Math.min(d.coin, d.debt).toLocaleString()}
                  </button>
                </div>
              </Panel>
            )}
          </div>
        </div>
      )}

      {tab === "inventory" && (
        <Panel className="overflow-hidden">
          <PanelHead title="What you carry" meta={`${d.inventory.length} kinds · ${d.carrying} items`} />
          {d.inventory.length === 0 ? (
            <Empty className="m-4">You carry nothing.</Empty>
          ) : (
            <div className="tile-grid p-4">
              {d.inventory.map((i) => (
                <div key={i.id} className="tile p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[14px] leading-tight text-paper">{i.name}</span>
                    <RankChip rank={i.rank} />
                  </div>
                  <div className="micro mt-1.5">
                    {i.type} · ×{i.qty} · cond {i.condition}
                  </div>
                  {i.description && <p className="mt-2 text-[13px] leading-snug text-paper-3">{i.description}</p>}
                  {hasShop && (
                    <button
                      className="btn btn-sm mt-2.5 w-full"
                      disabled={sell.isPending}
                      onClick={() =>
                        act(() =>
                          sell.mutate(
                            { saveId, itemId: i.itemId, qty: 1 },
                            { onSuccess: (r) => setNote(`Sold one ${i.name} for ${r.earnedLabel}.`) },
                          ),
                        )
                      }
                    >
                      Sell one
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === "history" && (
        <Panel className="overflow-hidden">
          <PanelHead title="Transactions" meta="newest first" />
          {d.transactions.length === 0 ? (
            <Empty className="m-4">No money has moved yet.</Empty>
          ) : (
            <div className="divide-y divide-line-soft">
              {d.transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="micro w-[54px] flex-none">T{t.turn}</span>
                  <Tag color={t.kind === "buy" ? "#b23327" : t.kind === "sell" ? "#7d9b7a" : "#c9a227"}>{t.kind}</Tag>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-paper-2">
                    {t.qty}× {t.name}
                    {t.counterparty && <span className="text-paper-3"> · {t.counterparty}</span>}
                  </span>
                  <span className="mono flex-none text-[12px] text-paper">{t.totalLabel}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === "prices" && (
        <Panel className="overflow-hidden">
          <PanelHead title="Price book" meta="base values, everywhere" />
          <div className="divide-y divide-line-soft">
            {d.market.map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-2">
                <span className="min-w-0 flex-1 truncate text-[13.5px] text-paper-2">{g.name}</span>
                <span className="mono text-[12px] text-paper-3">{g.basePrice.toLocaleString()}</span>
                <span className="mono w-[92px] text-right text-[12px] text-paper">{g.priceLabel}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "market" && d.catalogue.length > 0 && (
        <div className="mt-8">
          <div className="label-col mb-1.5">On the shelves here</div>
          <div className="rule-dim" />
          <div className="tile-grid mt-4">
            {d.catalogue.map((i) => (
              <div key={i.id} className="tile p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[14px] leading-tight text-paper">{i.name}</span>
                  <RankChip rank={i.rank} />
                </div>
                <div className="micro mt-1.5">
                  {i.type} · {i.priceLabel}
                </div>
                <p className="mt-2 text-[13px] leading-snug text-paper-3">{i.description}</p>
                {i.effect && <p className="mt-1.5 text-[12.5px] leading-snug text-gold">{i.effect}</p>}
                <button
                  className="btn btn-sm mt-2.5 w-full"
                  disabled={buy.isPending}
                  onClick={() =>
                    act(() =>
                      buy.mutate(
                        { saveId, goodId: i.id, qty: 1 },
                        { onSuccess: () => setNote(`Bought ${i.name}.`) },
                      ),
                    )
                  }
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-line pt-2">
      <div className="micro">{k}</div>
      <div className="mono mt-1 text-[14px] text-paper">{v}</div>
    </div>
  );
}
