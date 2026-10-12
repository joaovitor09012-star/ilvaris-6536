import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useTimeline(saveId: number | null, limit = 160) {
  return useQuery(
    orpc.chronicle.timeline.queryOptions({ input: { saveId: saveId ?? 0, limit }, enabled: !!saveId }),
  );
}

export function useArcLedger(saveId: number | null) {
  return useQuery(orpc.chronicle.arcs.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useChapter(saveId: number | null, chapter: number | null) {
  return useQuery(
    orpc.chronicle.chapter.queryOptions({
      input: { saveId: saveId ?? 0, chapter: chapter ?? 1 },
      enabled: !!saveId && !!chapter,
    }),
  );
}
