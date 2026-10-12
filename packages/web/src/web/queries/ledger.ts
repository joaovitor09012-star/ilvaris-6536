import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useLedger(saveId: number | null) {
  return useQuery(orpc.ledger.get.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useCatalogue() {
  return useQuery(orpc.ledger.catalogue.queryOptions({ staleTime: Infinity }));
}

export function usePriceHistory(saveId: number | null, goodId: string | null) {
  return useQuery(
    orpc.ledger.history.queryOptions({
      input: { saveId: saveId ?? 0, goodId: goodId ?? "" },
      enabled: !!saveId && !!goodId,
    }),
  );
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: orpc.ledger.key() });
  qc.invalidateQueries({ queryKey: orpc.saves.key() });
  qc.invalidateQueries({ queryKey: orpc.chronicle.key() });
}

export function useBuy(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(orpc.ledger.buy.mutationOptions({ onSuccess: () => invalidate(qc) }));
}

export function useSell(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(orpc.ledger.sell.mutationOptions({ onSuccess: () => invalidate(qc) }));
}

export function useRepay(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(orpc.ledger.repay.mutationOptions({ onSuccess: () => invalidate(qc) }));
}
