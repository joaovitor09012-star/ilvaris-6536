import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useNpcPortrait(saveId: number | null, npcId: string | null, enabled = true) {
  return useQuery(
    orpc.media.npcPortrait.queryOptions({
      input: { saveId: saveId ?? 0, npcId: npcId ?? "", regenerate: false },
      enabled: !!saveId && !!npcId && enabled,
      staleTime: Infinity,
      retry: 1,
    }),
  );
}

export function usePlayerPortrait(saveId: number | null, enabled = true) {
  return useQuery(
    orpc.media.playerPortrait.queryOptions({
      input: { saveId: saveId ?? 0, regenerate: false },
      enabled: !!saveId && enabled,
      staleTime: Infinity,
      retry: 1,
    }),
  );
}

export function usePlacePlate(saveId: number | null, locationId: string | null, enabled = true) {
  return useQuery(
    orpc.media.placePlate.queryOptions({
      input: { saveId: saveId ?? 0, locationId: locationId ?? "" },
      enabled: !!saveId && !!locationId && enabled,
      staleTime: Infinity,
      retry: 1,
    }),
  );
}

export function useGallery(saveId: number | null) {
  return useQuery(orpc.media.gallery.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function useRegeneratePortrait(_saveId: number | null) {
  const qc = useQueryClient();
  return useMutation(
    orpc.media.npcPortrait.mutationOptions({
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: orpc.media.key() });
        void qc.invalidateQueries({ queryKey: orpc.threads.key() });
      },
    }),
  );
}
