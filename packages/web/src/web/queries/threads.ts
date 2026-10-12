import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useThreads(saveId: number | null) {
  return useQuery(orpc.threads.get.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}

export function usePerson(saveId: number | null, npcId: string | null) {
  return useQuery(
    orpc.threads.person.queryOptions({
      input: { saveId: saveId ?? 0, npcId: npcId ?? "" },
      enabled: !!saveId && !!npcId,
    }),
  );
}

export function useFates(saveId: number | null) {
  return useQuery(orpc.threads.fates.queryOptions({ input: { saveId: saveId ?? 0 }, enabled: !!saveId }));
}
