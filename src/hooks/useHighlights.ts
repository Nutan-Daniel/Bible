import { useCallback, useEffect, useState } from "react";
import { db } from "../db";
import type { Highlight } from "../types/bible";

export function useHighlights(translationId: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await db.highlights
        .where("translationId")
        .equals(translationId)
        .toArray();
      if (mounted) {
        setHighlights(all);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [translationId]);

  const add = useCallback(
    async (h: Omit<Highlight, "id" | "createdAt">) => {
      await db.highlights.add({ ...h, createdAt: Date.now() });
      const all = await db.highlights
        .where("translationId")
        .equals(translationId)
        .toArray();
      setHighlights(all);
    },
    [translationId],
  );

  const remove = useCallback(
    async (id: number) => {
      await db.highlights.delete(id);
      const all = await db.highlights
        .where("translationId")
        .equals(translationId)
        .toArray();
      setHighlights(all);
    },
    [translationId],
  );

  return { highlights, loading, add, remove };
}
