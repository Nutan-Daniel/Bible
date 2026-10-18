import { useCallback, useEffect, useState } from "react";
import { db, type ReadingPosition } from "../db";
import type { TranslationId } from "../types/bible";

export function usePosition(translationId: TranslationId) {
  const [position, setPosition] = useState<ReadingPosition | null>(null);

  const refresh = useCallback(async () => {
    const all = await db.position
      .where("translationId")
      .equals(translationId)
      .sortBy("updatedAt");
    setPosition(all[all.length - 1] ?? null);
  }, [translationId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await db.position
        .where("translationId")
        .equals(translationId)
        .sortBy("updatedAt");
      if (mounted) {
        setPosition(all[all.length - 1] ?? null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [translationId]);

  const save = useCallback(
    async (p: Omit<ReadingPosition, "id" | "updatedAt" | "translationId">) => {
      await db.position.add({ ...p, translationId, updatedAt: Date.now() });
      await refresh();
    },
    [translationId, refresh],
  );

  return { position, save, refresh };
}
