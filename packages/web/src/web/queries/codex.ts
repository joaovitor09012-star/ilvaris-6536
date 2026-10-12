import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useCodex(saveId: number | null) {
  return useQuery(
    orpc.codex.get.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }),
  );
}

export function useAllocate(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.codex.allocate.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.codex.key() });
        qc.invalidateQueries({ queryKey: orpc.saves.key() });
      },
    }),
  );
}

export function useEquipSkill(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.codex.equip.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.codex.key() }),
    }),
  );
}

export function useUpdateCharacter(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.codex.update.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.codex.key() });
        qc.invalidateQueries({ queryKey: orpc.saves.key() });
      },
    }),
  );
}
