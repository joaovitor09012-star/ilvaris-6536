import { useState } from "react";
import { Compass, MapPin } from "lucide-react";
import { Loading, Panel, PanelHead, SectionHeader, Empty, RankChip, Dot, Tag, KeyValue } from "../components/ui-kit";
import { useStrata, usePlace, useRegions } from "../queries/strata";
import { cn } from "../lib/utils";

const DANGER_COLOR = ["#6f8a72", "#7d9b7a", "#c9a227", "#d97b2b", "#b23327", "#8a1f18"];
const DANGER_LABEL = ["Held", "Quiet", "Watchful", "Dangerous", "Lethal", "Do not"];

/**
 * The map is drawn in world units, but nothing on it is sized in world units.
 * Everything — radii, rules, type — is multiplied by `u`, world units per
 * screen pixel at the fitted frame. So a mark is the same size on screen
 * whether the frame holds four places or forty, and opening the frame buys
 * space rather than shrinking the words.
 */
const REF_WIDTH = 1120;
const ASPECT = 1.6;
const ZOOMS = [
  { z: 1, label: "whole" },
  { z: 1.7, label: "near" },
  { z: 2.3, label: "close" },
] as const;

type Node = {
  id: string;
  name: string;
  layer: string;
  x: number;
  y: number;
  region: string;
  kind: string;
  minLevel: number;
  danger: number;
  description: string;
  services: string[];
  visited: boolean;
  cleared: boolean;
  discoveredTurn: number;
  here: boolean;
  adjacent: boolean;
  monsters: { id: string; name: string; rank: string; level: number; engagement: string }[];
};

type Link = { from: string; to: string; kind: string; steps: number; danger: number; secret: boolean };

type Frame = { cx: number; cy: number; bw: number; bh: number; u: number };

const nodeRadius = (n: Node) => (n.here ? 15 : n.visited ? 11 : 9);

/** The gutter a name hangs in, measured on screen rather than in world units. */
const PAD_CSS_X = 110;
const PAD_CSS_Y = 64;

/** The smallest frame that holds every known place with room for the words around it. */
function fitFrame(nodes: Node[]): Frame {
  if (nodes.length === 0) {
    return { cx: 0, cy: 0, bw: REF_WIDTH, bh: REF_WIDTH / ASPECT, u: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y);
  }
  // The frame is extent plus a gutter of PAD_CSS screen pixels on each side.
  // Solving bw = extent + 2·PAD/u against u = bw/REF_WIDTH gives these factors,
  // so the names have the same room whether the frame holds four places or forty.
  const kx = 1 / (1 - (2 * PAD_CSS_X) / REF_WIDTH);
  const ky = 1 / (1 - (2 * PAD_CSS_Y) / REF_WIDTH);
  let bw = Math.max((maxX - minX) * kx, 260);
  let bh = Math.max((maxY - minY) * ky, 170);
  if (bw / bh < ASPECT) bw = bh * ASPECT;
  else bh = bw / ASPECT;
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, bw, bh, u: bw / REF_WIDTH };
}

type Label = { key: string; x0: number; y0: number; x1: number; y1: number; rank: number };

/**
 * Names are placed greedily, best first. When the frame is tight the quiet
 * places go unnamed and wait for the reader to open the frame — which is a
 * truer map than a page of overlapping words.
 */
function placeLabels(items: Label[]): Set<string> {
  const sorted = [...items].sort((a, b) => a.rank - b.rank);
  const placed: Label[] = [];
  const out = new Set<string>();
  for (const it of sorted) {
    const clash = placed.some((p) => it.x0 < p.x1 && it.x1 > p.x0 && it.y0 < p.y1 && it.y1 > p.y0);
    if (clash) continue;
    placed.push(it);
    out.add(it.key);
  }
  return out;
}

export default function StrataPage({ saveId }: { saveId: number }) {
  const strata = useStrata(saveId);
  const regions = useRegions(saveId);
  const [layer, setLayer] = useState<"surface" | "depths">("surface");
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  if (strata.isLoading) return <Loading label="Unrolling the vellum" />;
  if (!strata.data) return <Empty>The map will not open. Nobody has told you where you are.</Empty>;
  const d = strata.data;

  const nodes = (d.nodes as Node[]).filter((n) => n.layer === layer);
  const ids = new Set(nodes.map((n) => n.id));
  const links = (d.links as Link[]).filter((k) => ids.has(k.from) && ids.has(k.to));
  const byId = new Map((d.nodes as Node[]).map((n) => [n.id, n]));

  const frame = fitFrame(nodes);
  const u = frame.u;
  const here = nodes.find((n) => n.here);
  const vw = frame.bw / zoom;
  const vh = frame.bh / zoom;
  const vx = (zoom > 1 && here ? here.x : frame.cx) - vw / 2;
  const vy = (zoom > 1 && here ? here.y : frame.cy) - vh / 2;

  // Measured off Oswald at the size the labels are drawn: ~1.97 world units per
  // character, plus a hair of padding so two names never quite touch.
  const charW = 7.5 * u;
  // The dots are obstacles, not labels: a name may not be laid over a mark.
  const dots: Label[] = nodes.map((n) => {
    const r = (nodeRadius(n) + 3) * u;
    return { key: `o:${n.id}`, rank: -1, x0: n.x - r, y0: n.y - r, x1: n.x + r, y1: n.y + r };
  });
  const nodeItems: Label[] = nodes.map((n) => {
    const r = nodeRadius(n) * u;
    const w = n.name.length * charW + 8 * u;
    const h = (n.adjacent ? 36 : 19) * u;
    const yc = n.y - r - 13 * u - h / 2;
    return {
      key: `n:${n.id}`,
      rank: n.id === selected ? 0 : n.here ? 1 : n.visited ? 2 : n.adjacent ? 3 : 4,
      x0: n.x - w / 2,
      y0: yc - h / 2,
      x1: n.x + w / 2,
      y1: yc + h / 2,
    };
  });
  const linkItems: Label[] = links.map((k) => {
    const a = byId.get(k.from)!;
    const b = byId.get(k.to)!;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const w = 11 * charW;
    const h = 17 * u;
    return { key: `l:${k.from}-${k.to}`, rank: 6, x0: mx - w / 2, y0: my - 6 * u - h, x1: mx + w / 2, y1: my - 6 * u };
  });
  const shown = placeLabels([...dots, ...nodeItems, ...linkItems]);
  const heldBack = nodes.filter((n) => !shown.has(`n:${n.id}`)).length;

  return (
    <div>
      <SectionHeader
        label="The Strata"
        title="What you have been told, and what you have walked"
        subtitle="There is no world map in Ilvaris. There is only the map you carry in your head. A place you have never heard of is not drawn here, and the ledger will not describe it — that is not a limitation of the page, it is the shape of your knowledge."
        right={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="micro">
              {d.counts.known} of {d.counts.total} places known
            </span>
            <span className="micro">{d.counts.visited} walked</span>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["surface", "depths"] as const).map((l) => (
          <button key={l} className={cn("chip", layer === l && "chip-on")} onClick={() => setLayer(l)}>
            {l}
            <span className="ml-1.5 text-paper-3">{d.nodes.filter((n) => n.layer === l).length}</span>
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-line" />
        {ZOOMS.map(({ z, label }) => (
          <button key={label} className={cn("chip", zoom === z && "chip-on")} onClick={() => setZoom(z)}>
            {label}
          </button>
        ))}
        <span className="micro ml-auto">
          Depth {d.depth} · every road costs scenes, not steps
        </span>
      </div>

      <Panel className="overflow-hidden">
        <PanelHead
          title={`The ${layer === "surface" ? "Surface" : "Descent"}`}
          meta={layer === "surface" ? "the Hollow, the Fen, the Margins" : "below the Athenaeum stair"}
          right={
            <span className="flex items-center gap-3">
              {heldBack > 0 && (
                <span className="micro">{heldBack} name{heldBack === 1 ? "" : "s"} held back — open the frame</span>
              )}
              <Compass className="size-3.5 text-paper-3" />
            </span>
          }
        />
        <div className="bg-[#1b1f23]">
          {nodes.length === 0 ? (
            <Empty className="m-4">You have not been told of anything down there. Yet.</Empty>
          ) : (
            <svg
              viewBox={`${vx} ${vy} ${vw} ${vh}`}
              className="block w-full"
              style={{ aspectRatio: `${ASPECT}`, maxHeight: 760 }}
            >
              <defs>
                <pattern id="grid" width={64 * u} height={64 * u} patternUnits="userSpaceOnUse">
                  <path d={`M${64 * u} 0H0V${64 * u}`} fill="none" stroke="#232a2f" strokeWidth={u} />
                </pattern>
              </defs>
              <rect x={vx} y={vy} width={vw} height={vh} fill="url(#grid)" />

              {links.map((k) => {
                const a = byId.get(k.from)!;
                const b = byId.get(k.to)!;
                const known = a.visited && b.visited;
                return (
                  <g key={`${k.from}-${k.to}`}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={k.secret ? "#b23327" : known ? "#5b6a72" : "#3a444b"}
                      strokeWidth={(k.secret ? 1.5 : 2) * u}
                      strokeDasharray={
                        k.secret ? `${7 * u} ${6 * u}` : k.kind === "passage" || k.kind === "descent" ? `${3 * u} ${5 * u}` : undefined
                      }
                      opacity={k.secret ? 0.7 : 0.85}
                    />
                    {k.steps > 1 && shown.has(`l:${k.from}-${k.to}`) && (
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 7 * u}
                        fill="#6d7580"
                        fontSize={10.5 * u}
                        textAnchor="middle"
                        style={{ fontFamily: "var(--font-display)" }}
                        letterSpacing={1.4 * u}
                      >
                        {k.steps} SCENES
                      </text>
                    )}
                  </g>
                );
              })}

              {nodes.map((n) => {
                const color = DANGER_COLOR[n.danger] ?? "#8b8778";
                const r = nodeRadius(n) * u;
                const on = selected === n.id;
                return (
                  <g key={n.id} onClick={() => setSelected(on ? null : n.id)} style={{ cursor: "pointer" }}>
                    {n.here && (
                      <circle cx={n.x} cy={n.y} r={26 * u} fill="none" stroke="#b23327" strokeWidth={1.5 * u} opacity="0.5">
                        <animate
                          attributeName="r"
                          values={`${22 * u};${36 * u};${22 * u}`}
                          dur="2.8s"
                          repeatCount="indefinite"
                        />
                        <animate attributeName="opacity" values="0.55;0.08;0.55" dur="2.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {on && (
                      <circle cx={n.x} cy={n.y} r={r + 12 * u} fill="none" stroke="#ede4d3" strokeWidth={1.2 * u} opacity="0.6" />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={n.visited ? color : "#1b1f23"}
                      stroke={color}
                      strokeWidth={2.5 * u}
                      opacity={n.visited ? 1 : 0.85}
                    />
                    {n.cleared && <circle cx={n.x} cy={n.y} r={r - 5 * u} fill="#ede4d3" opacity="0.55" />}
                    {shown.has(`n:${n.id}`) && (
                      <text
                        x={n.x}
                        y={n.y - r - 13 * u}
                        fill={n.here ? "#ede4d3" : n.visited ? "#c9c0b0" : "#8b8778"}
                        fontSize={13 * u}
                        textAnchor="middle"
                        style={{ fontFamily: "var(--font-display)" }}
                        fontWeight="500"
                        letterSpacing={1.1 * u}
                      >
                        {n.name.toUpperCase()}
                      </text>
                    )}
                    {n.adjacent && shown.has(`n:${n.id}`) && (
                      <text
                        x={n.x}
                        y={n.y + r + 16 * u}
                        fill="#6d7580"
                        fontSize={10 * u}
                        textAnchor="middle"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        within a scene
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-2.5">
          {DANGER_LABEL.map((l, i) => (
            <span key={l} className="flex items-center gap-1.5">
              <Dot color={DANGER_COLOR[i]} />
              <span className="micro">{l}</span>
            </span>
          ))}
          <span className="micro ml-auto">
            {d.nodes.filter((n) => n.layer === "depths").length > 0 ? "the descent is drawn" : "the descent is not yet drawn"}
          </span>
        </div>
      </Panel>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[1fr_330px]">
        <PlaceDetail saveId={saveId} locationId={selected} />

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHead title="Regions" meta="known / total" />
            {regions.isLoading ? (
              <Loading className="px-4 py-6" label="Counting" />
            ) : (
              <div className="divide-y divide-line-soft">
                {(regions.data ?? []).map((r) => (
                  <div key={r.region} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13.5px] text-paper-2">{r.region}</span>
                      <span className="mono text-[11px] text-paper-3">
                        {r.known}/{r.total}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="meter flex-1">
                        <i style={{ width: `${(r.known / Math.max(1, r.total)) * 100}%`, background: DANGER_COLOR[r.minDanger] ?? "#8b8778" }} />
                      </div>
                      <span className="micro w-[54px] flex-none text-right">{r.visited} walked</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Travelling" />
            <div className="space-y-2 p-4 text-[13px] leading-relaxed text-paper-3">
              <p>
                Say where you are going at the Desk. Travel takes scenes, and scenes cost time — the world moves
                while you walk.
              </p>
              <p>
                A road with <span className="text-paper-2">2 scenes</span> on it can be interrupted. You may
                arrive, or you may arrive somewhere else entirely, and that will be somebody's fault.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function PlaceDetail({ saveId, locationId }: { saveId: number; locationId: string | null }) {
  const place = usePlace(saveId, locationId);

  if (!locationId) {
    return (
      <Panel className="overflow-hidden">
        <PanelHead title="A place" meta="nothing selected" />
        <Empty className="m-4">
          <MapPin className="mx-auto mb-3 size-5 text-paper-3" />
          Touch a mark on the map. The ledger will tell you everything it has been told about it, and nothing it has not.
        </Empty>
      </Panel>
    );
  }

  if (place.isLoading) return <Loading label="Asking the ledger" />;
  const p = place.data;
  if (!p || !p.known) return <Empty>You do not actually know that place.</Empty>;

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden">
        <PanelHead
          title={p.location.name}
          meta={`${p.location.region} · ${p.location.kind}`}
          right={<RankChip rank={dangerRank(p.location.danger)} />}
        />
        <div className="p-4">
          <p className="text-[14.5px] leading-relaxed text-paper-2">{p.location.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.location.services.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6">
            <KeyValue k="Recommended" v={`level ${p.location.minLevel}`} mono />
            <KeyValue k="Danger" v={DANGER_LABEL[p.location.danger]} />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
        <Panel className="overflow-hidden">
          <PanelHead title="What lives here" meta={`${p.monsters.length}`} />
          {p.monsters.length === 0 ? (
            <Empty className="m-4">Nothing that wants you.</Empty>
          ) : (
            <div className="divide-y divide-line-soft">
              {p.monsters.map((m) => (
                <div key={m.id} className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <RankChip rank={m.rank} />
                    <span className="text-[14px] text-paper">{m.name}</span>
                    <span className="micro ml-auto">lv {m.level}</span>
                  </div>
                  <div className="micro mt-1.5">
                    {m.engagement} · {m.traits.join(" · ")}
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-paper-3">{m.lore}</p>
                  {m.drops.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {m.drops.map((dr) => (
                        <span key={dr.name} className="flex items-center gap-1.5">
                          <Dot color="#6d7580" />
                          <span className="micro">
                            {dr.name} {Math.round(dr.chance * 100)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="overflow-hidden">
            <PanelHead title="People here" meta={`${p.people.length}`} />
            {p.people.length === 0 ? (
              <Empty className="m-4">Nobody you would know by name.</Empty>
            ) : (
              <ul className="divide-y divide-line-soft">
                {p.people.map((n) => (
                  <li key={n.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Dot color={n.met ? "#7d9b7a" : "#8b8778"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] text-paper-2">{n.name}</span>
                        {n.isThread && <Tag color="#b23327">thread</Tag>}
                      </div>
                      <div className="micro mt-0.5">{n.role}</div>
                    </div>
                    <RankChip rank={n.rank} />
                    <span className="micro">{n.met ? "met" : "not met"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead title="Roads out" meta={`${p.routes.length}`} />
            <ul className="divide-y divide-line-soft">
              {p.routes.map((r) => (
                <li key={r.to} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="micro w-[74px] flex-none">{r.kind}</span>
                  <span className={cn("min-w-0 flex-1 truncate text-[13.5px]", r.known ? "text-paper-2" : "text-paper-3")}>
                    {r.known ? r.name : "somewhere you have not been told about"}
                  </span>
                  <span className="micro flex-none">{r.days} scene{r.days === 1 ? "" : "s"}</span>
                  {r.hazard > 0 && <Tag color="#d97b2b">hazard {r.hazard}</Tag>}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function dangerRank(d: number): string {
  return ["F", "F", "E", "D", "C", "B"][d] ?? "F";
}
