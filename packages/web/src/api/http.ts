import type { Hono } from "hono";
import { runTurn, type TurnEvent } from "./agent/pipeline";
import { getObjectBytes } from "./lib/s3";

/**
 * The two things that are not oRPC procedures.
 *
 *  • POST /api/turn  — the turn loop streams, so it cannot be a procedure.
 *                      Emits NDJSON: one JSON object per line, in order.
 *  • GET  /api/media — stable image proxy. Presigned URLs expire; this does not.
 */
export function registerHttpRoutes(app: Hono) {
  app.post("/api/turn", async (c) => {
    let body: { saveId?: number; input?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Body must be JSON." }, 400);
    }
    const saveId = Number(body.saveId);
    const input = typeof body.input === "string" ? body.input.trim() : "";
    if (!Number.isFinite(saveId)) return c.json({ error: "saveId is required." }, 400);
    if (!input) return c.json({ error: "Write an action first." }, 400);

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: TurnEvent) => {
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            /* client went away */
          }
        };
        try {
          for await (const event of runTurn(saveId, input)) send(event);
        } catch (err) {
          send({ t: "error", v: (err as Error).message || "The turn collapsed." });
        } finally {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  });

  app.get("/api/media/*", async (c) => {
    const raw = c.req.path;
    const key = decodeURIComponent(raw.replace(/^\/api\/media\//, ""));
    if (!key || key.includes("..")) return c.json({ error: "Bad key." }, 400);
    const object = await getObjectBytes(key);
    if (!object) return c.json({ error: "Not found." }, 404);
    return c.body(object.body as unknown as ArrayBuffer, 200, {
      "Content-Type": object.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  });

  return app;
}
