import { Route, Switch, Redirect } from "wouter";
import { Provider } from "./components/provider";
import { Shell } from "./components/shell";
import { useActiveSave } from "./lib/session";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

import TitlePage from "./pages/title";
import CreatePage from "./pages/create";
import DeskPage from "./pages/desk";
import CodexPage from "./pages/codex";
import LedgerPage from "./pages/ledger";
import ThreadsPage from "./pages/threads";
import StrataPage from "./pages/strata";
import BestiaryPage from "./pages/bestiary";
import WorldPage from "./pages/world";
import TimelinePage from "./pages/timeline";
import BenchPage from "./pages/bench";
import SettingsPage from "./pages/settings";
import BiblePage from "./pages/bible";

function InWorld({ children }: { children: (saveId: number) => React.ReactNode }) {
  const [saveId] = useActiveSave();
  if (saveId === null) return <Redirect to="/" />;
  return <Shell saveId={saveId}>{children(saveId)}</Shell>;
}

/** Pages that work with or without an open save, still inside the binding. */
function Bound({ children, bleed = false }: { children: React.ReactNode; bleed?: boolean }) {
  const [saveId] = useActiveSave();
  return (
    <Shell saveId={saveId} bleed={bleed}>
      {children}
    </Shell>
  );
}

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/">
          {() => (
            <Bound bleed>
              <TitlePage />
            </Bound>
          )}
        </Route>
        <Route path="/new">
          {() => (
            <Bound bleed>
              <CreatePage />
            </Bound>
          )}
        </Route>
        <Route path="/bible">
          {() => (
            <Bound>
              <BiblePage />
            </Bound>
          )}
        </Route>
        <Route path="/desk">{() => <InWorld>{(id) => <DeskPage saveId={id} />}</InWorld>}</Route>
        <Route path="/codex">{() => <InWorld>{(id) => <CodexPage saveId={id} />}</InWorld>}</Route>
        <Route path="/ledger">{() => <InWorld>{(id) => <LedgerPage saveId={id} />}</InWorld>}</Route>
        <Route path="/threads">{() => <InWorld>{(id) => <ThreadsPage saveId={id} />}</InWorld>}</Route>
        <Route path="/strata">{() => <InWorld>{(id) => <StrataPage saveId={id} />}</InWorld>}</Route>
        <Route path="/bestiary">{() => <InWorld>{(id) => <BestiaryPage saveId={id} />}</InWorld>}</Route>
        <Route path="/world">{() => <InWorld>{(id) => <WorldPage saveId={id} />}</InWorld>}</Route>
        <Route path="/timeline">{() => <InWorld>{(id) => <TimelinePage saveId={id} />}</InWorld>}</Route>
        <Route path="/bench">{() => <InWorld>{(id) => <BenchPage saveId={id} />}</InWorld>}</Route>
        <Route path="/settings">{() => <InWorld>{(id) => <SettingsPage saveId={id} />}</InWorld>}</Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
