import { useCallback, useEffect, useState } from "react";
import { db, defaultSettings, type Settings } from "../db";

let current: Settings = defaultSettings;
const listeners = new Set<(s: Settings) => void>();
let initialized = false;

function notify(s: Settings): void {
  current = s;
  listeners.forEach((fn) => fn(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(current);

  useEffect(() => {
    listeners.add(setSettings);
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  const refresh = useCallback(async () => {
    if (initialized) return;
    const first = await db.settings.toCollection().first();
    if (first) {
      notify(first);
    } else {
      const id = await db.settings.add(defaultSettings);
      notify({ ...defaultSettings, id });
    }
    initialized = true;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const existing = await db.settings.toCollection().first();
    const id = existing?.id;
    const next = { ...current, ...patch };
    if (id != null) await db.settings.update(id, patch);
    else {
      const newId = await db.settings.add(next);
      next.id = newId;
    }
    notify(next);
  }, []);

  return { settings, loading: !initialized, update };
}
