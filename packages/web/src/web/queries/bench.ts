import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useBench(saveId: number | null) {
  return useQuery(orpc.bench.get.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useBenchPreview(
  saveId: number | null,
  selection: { vectorId: string; shapeId: string; modifiers: string[] },
  enabled: boolean,
) {
  return useQuery(
    orpc.bench.preview.queryOptions({
      input: { saveId: saveId ?? 0, ...selection },
      enabled: !!saveId && enabled && !!selection.vectorId && !!selection.shapeId,
      staleTime: 0,
    }),
  );
}

export function useRunResearch(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.bench.run.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.bench.key() });
        qc.invalidateQueries({ queryKey: orpc.codex.key() });
        qc.invalidateQueries({ queryKey: orpc.saves.key() });
      },
    }),
  );
}

export function useBenchIndex(saveId: number | null) {
  return useQuery(orpc.bench.index.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useSkillLibrary() {
  return useQuery(orpc.bench.library.queryOptions({ staleTime: Infinity }));
}
