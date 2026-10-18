import { useCallback, useEffect, useState } from "react";
import { db, type Note } from "../db";
import type { TranslationId } from "../types/bible";

export function useNotes(translationId: TranslationId) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await db.notes
      .where("translationId")
      .equals(translationId)
      .sortBy("updatedAt");
    setNotes(all.reverse());
    setLoading(false);
  }, [translationId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await db.notes
        .where("translationId")
        .equals(translationId)
        .sortBy("updatedAt");
      if (mounted) {
        setNotes(all.reverse());
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [translationId]);

  const forVerse = useCallback(
    async (bookId: string, chapter: number, verse: number) => {
      return db.notes
        .where("[translationId+bookId+chapter+verse]")
        .equals([translationId, bookId, chapter, verse])
        .first();
    },
    [translationId],
  );

  const save = useCallback(
    async (n: Omit<Note, "id" | "updatedAt" | "translationId">) => {
      const existing = await db.notes
        .where("[translationId+bookId+chapter+verse]")
        .equals([translationId, n.bookId, n.chapter, n.verse])
        .first();
      if (existing?.id != null) {
        await db.notes.update(existing.id, {
          text: n.text,
          updatedAt: Date.now(),
        });
      } else {
        await db.notes.add({ ...n, translationId, updatedAt: Date.now() });
      }
      await refresh();
    },
    [translationId, refresh],
  );

  const remove = useCallback(
    async (id: number) => {
      await db.notes.delete(id);
      await refresh();
    },
    [refresh],
  );

  return { notes, loading, forVerse, save, remove, refresh };
}
