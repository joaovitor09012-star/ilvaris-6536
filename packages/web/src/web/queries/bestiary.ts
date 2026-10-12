import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useBestiary(saveId: number | null) {
  return useQuery(orpc.bestiary.get.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useStudy(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.bestiary.study.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.bestiary.key() });
        qc.invalidateQueries({ queryKey: orpc.saves.key() });
      },
    }),
  );
}
