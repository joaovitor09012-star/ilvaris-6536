import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useStrata(saveId: number | null) {
  return useQuery(orpc.strata.map.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function usePlace(saveId: number | null, locationId: string | null) {
  return useQuery(
    orpc.strata.location.queryOptions({
      input: { saveId: saveId ?? 0, locationId: locationId ?? "" },
      enabled: !!saveId && !!locationId,
    }),
  );
}

export function useRegions(saveId: number | null) {
  return useQuery(orpc.strata.regions.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}
