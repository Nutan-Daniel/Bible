import { useCallback, useEffect, useState } from "react";
import { db, type Bookmark } from "../db";
import type { TranslationId } from "../types/bible";

export function useBookmarks(translationId: TranslationId) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await db.bookmarks
      .where("translationId")
      .equals(translationId)
      .sortBy("createdAt");
    setBookmarks(all.reverse());
    setLoading(false);
  }, [translationId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await db.bookmarks
        .where("translationId")
        .equals(translationId)
        .sortBy("createdAt");
      if (mounted) {
        setBookmarks(all.reverse());
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [translationId]);

  const add = useCallback(
    async (b: Omit<Bookmark, "id" | "createdAt" | "translationId">) => {
      await db.bookmarks.add({ ...b, translationId, createdAt: Date.now() });
      await refresh();
    },
    [translationId, refresh],
  );

  const remove = useCallback(
    async (id: number) => {
      await db.bookmarks.delete(id);
      await refresh();
    },
    [refresh],
  );

  return { bookmarks, loading, add, remove, refresh };
}
