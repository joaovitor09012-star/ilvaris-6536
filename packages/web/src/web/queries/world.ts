import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useLore(saveId: number | null) {
  return useQuery(orpc.world.lore.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useArcBoard(saveId: number | null) {
  return useQuery(orpc.world.arcs.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useAtlas(saveId: number | null) {
  return useQuery(orpc.world.atlas.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useBuyLore(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.world.buyLore.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.world.key() });
        qc.invalidateQueries({ queryKey: orpc.saves.key() });
      },
    }),
  );
}
