import type { AppliedResult } from "../../api/agent/pipeline";

/**
 * The turn stream.
 *
 * POST /api/turn answers in NDJSON — one JSON object per line, in order:
 *   {t:"phase",   v:string}                       the Chorister, the narrator, the registrar
 *   {t:"decision",v:{...}}                        what the director decided before writing
 *   {t:"delta",   v:string}                       a token of prose
 *   {t:"applied", v:AppliedResult}                the ledger, after the fact
 *   {t:"error",   v:string}
 */
export type TurnStreamEvent =
  | { t: "phase"; v: string }
  | { t: "delta"; v: string }
  | { t: "decision"; v: { sceneType: string; title: string; directorNote: string; contentFlag: string; presentNpcIds: string[] } }
  | { t: "applied"; v: AppliedResult }
  | { t: "error"; v: string };

export interface TurnHandlers {
  onPhase?: (phase: string) => void;
  onDecision?: (d: Extract<TurnStreamEvent, { t: "decision" }>["v"]) => void;
  onDelta?: (chunk: string) => void;
  onApplied?: (result: AppliedResult) => void;
  onError?: (message: string) => void;
}

export async function streamTurn(
  saveId: number,
  input: string,
  handlers: TurnHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/turn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ saveId, input }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    let message = `The turn failed (${res.status}).`;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      if (text) message = text.slice(0, 200);
    }
    handlers.onError?.(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let index = buffer.indexOf("\n");
    while (index !== -1) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (line) {
        try {
          const event = JSON.parse(line) as TurnStreamEvent;
          switch (event.t) {
            case "phase":
              handlers.onPhase?.(event.v);
              break;
            case "decision":
              handlers.onDecision?.(event.v);
              break;
            case "delta":
              handlers.onDelta?.(event.v);
              break;
            case "applied":
              handlers.onApplied?.(event.v);
              break;
            case "error":
              handlers.onError?.(event.v);
              break;
          }
        } catch {
          /* a partial line — the rest arrives next chunk */
        }
      }
      index = buffer.indexOf("\n");
    }
  }
}
