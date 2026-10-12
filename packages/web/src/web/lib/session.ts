import { useEffect, useState } from "react";

const KEY = "ilvaris.activeSave";

export function readSaveId(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeSaveId(id: number | null) {
  try {
    if (id === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(id));
  } catch {
    /* storage disabled */
  }
}

/** The active save, kept in sync with localStorage and with other tabs. */
export function useActiveSave() {
  const [saveId, setSaveId] = useState<number | null>(() => readSaveId());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSaveId(readSaveId());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const set = (id: number | null) => {
    writeSaveId(id);
    setSaveId(id);
  };

  return [saveId, set] as const;
}
