import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useBible() {
  return useQuery(orpc.bible.get.queryOptions({ staleTime: Infinity }));
}
