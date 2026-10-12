import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { registerHttpRoutes } from "./http";
import { ping } from "./routes/ping";
import { saves } from "./routes/saves";
import { codex } from "./routes/codex";
import { strata } from "./routes/strata";
import { ledger } from "./routes/ledger";
import { threads } from "./routes/threads";
import { bestiary } from "./routes/bestiary";
import { world } from "./routes/world";
import { bench } from "./routes/bench";
import { chronicle } from "./routes/chronicle";
import { media } from "./routes/media";
import { bible } from "./routes/bible";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the clients
// (web: src/web/lib/api.ts, mobile: lib/api.ts).
// Keep each routes/ file under 500 lines (`bun run lint` enforces this);
// split into more feature files as they grow.
// Patterns and examples: skills/app/references/api.md
export const router = {
  ping,
  saves,
  codex,
  strata,
  ledger,
  threads,
  bestiary,
  world,
  bench,
  chronicle,
  media,
  bible,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);
// Rare plain-HTTP endpoints (webhooks, streaming, the Better Auth handler)
// register here with full paths, e.g. app.post("/api/webhooks/example", ...)
registerHttpRoutes(app);

export default app;
