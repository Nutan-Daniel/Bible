import { useCallback, useEffect, useState } from "react";
import devotionalsData from "../data/devotionals.json";
import type { Devotional, DevotionalsData } from "../types/devotional";

let cache: DevotionalsData | null = null;

export function resetDevotionalCache(): void {
  cache = null;
}

export async function loadDevotionals(): Promise<DevotionalsData> {
  if (cache) return cache;
  cache = devotionalsData as unknown as DevotionalsData;
  return cache;
}

export function devotionalForDate(
  data: DevotionalsData,
  date: Date = new Date(),
): Devotional | undefined {
  const iso = date.toISOString().slice(0, 10);
  return data.devotionals.find((d) => d.date === iso);
}

export function useDevotionals() {
  const [data, setData] = useState<DevotionalsData | null>(null);
  const [today, setToday] = useState<Devotional | undefined>(undefined);

  const refresh = useCallback(async () => {
    const d = await loadDevotionals();
    setData(d);
    setToday(devotionalForDate(d));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const d = await loadDevotionals();
      if (mounted) {
        setData(d);
        setToday(devotionalForDate(d));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getDevotional = useCallback(
    (date: Date) => {
      if (!data) return undefined;
      return devotionalForDate(data, date);
    },
    [data],
  );

  return { data, today, loading: data === null, refresh, getDevotional };
}
