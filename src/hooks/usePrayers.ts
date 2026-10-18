import { useCallback, useEffect, useState } from "react";
import { db } from "../db";
import type { Prayer, PrayerFilter, PrayerStatus } from "../types/prayer";

export function usePrayers(filter: PrayerFilter = "all") {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await db.prayers.orderBy("createdAt").reverse().toArray();
    let filtered = all;
    if (filter !== "all") {
      filtered = all.filter((p) => p.status === filter);
    }
    setPrayers(filtered);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await db.prayers.orderBy("createdAt").reverse().toArray();
      if (mounted) {
        let filtered = all;
        if (filter !== "all") {
          filtered = all.filter((p) => p.status === filter);
        }
        setPrayers(filtered);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filter]);

  const add = useCallback(
    async (p: Omit<Prayer, "id" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      await db.prayers.add({ ...p, createdAt: now, updatedAt: now });
      await refresh();
    },
    [refresh],
  );

  const update = useCallback(
    async (id: number, changes: Partial<Prayer>) => {
      await db.prayers.update(id, { ...changes, updatedAt: Date.now() });
      await refresh();
    },
    [refresh],
  );

  const setStatus = useCallback(
    async (id: number, status: PrayerStatus) => {
      const changes: Partial<Prayer> = { status };
      if (status === "answered") {
        changes.answeredAt = Date.now();
      }
      await db.prayers.update(id, { ...changes, updatedAt: Date.now() });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: number) => {
      await db.prayers.delete(id);
      await refresh();
    },
    [refresh],
  );

  return { prayers, loading, add, update, setStatus, remove, refresh };
}
