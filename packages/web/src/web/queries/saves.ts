import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSaves() {
  return useQuery(orpc.saves.list.queryOptions({ staleTime: 5_000 }));
}

export function useCreationOptions() {
  return useQuery(orpc.saves.options.queryOptions({ staleTime: Infinity }));
}

export function useSession(saveId: number | null) {
  return useQuery(
    orpc.saves.session.queryOptions({
      input: { saveId: saveId ?? 0 },
      enabled: saveId !== null && saveId > 0,
      staleTime: 0,
    }),
  );
}

export function useCreateSave() {
  return useMutation(orpc.saves.create.mutationOptions());
}

export function useUpdateSettings(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.saves.updateSettings.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.saves.key() }),
    }),
  );
}

export function useDeleteSave() {
  const qc = useQueryClient();
  return useMutation(
    orpc.saves.delete.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.saves.key() }),
    }),
  );
}
