import type { CrossRefData, CrossRefBook, CrossRef } from "../types/crossref";

// crossrefs.json uses a few abbrevs that don't match web.json/kjv.json.
// Map them to the canon abbrevs used by the reader routes.
const ABBREV_MAP: Record<string, string> = {
  jn: "jo",
  pr: "pv",
  rn: "rm",
  at: "atos",
  ep: "ef",
  "1j": "1jo",
};

const norm = (id: string): string => ABBREV_MAP[id] ?? id;

let cache: Map<string, CrossRefBook | null> = new Map();

export function resetCrossRefCache(): void {
  cache = new Map();
}

export async function loadCrossRefs(
  bookId: string,
): Promise<CrossRefBook | null> {
  const cached = cache.get(bookId);
  if (cached !== undefined) return cached;
  try {
    const mod = await import("../data/crossrefs.json");
    const data: CrossRefData = mod.default;
    const key = Object.keys(data).find((k) => norm(k) === bookId) ?? bookId;
    const raw = data[key] ?? null;
    if (!raw) {
      cache.set(bookId, null);
      return null;
    }
    const book: CrossRefBook = {
      bookId,
      chapters: raw.chapters.map((c) => ({
        chapter: c.chapter,
        verses: c.verses.map((v) => ({
          verse: v.verse,
          refs: v.refs.map((r) => ({
            bookId: norm(r.bookId),
            chapter: r.chapter,
            verse: r.verse,
          })),
        })),
      })),
    };
    cache.set(bookId, book);
    return book;
  } catch {
    cache.set(bookId, null);
    return null;
  }
}

export function getCrossRefs(
  book: CrossRefBook | null,
  chapter: number,
  verse: number,
): CrossRef[] | null {
  if (!book) return null;
  const ch = book.chapters.find((c) => c.chapter === chapter);
  if (!ch) return null;
  const v = ch.verses.find((v) => v.verse === verse);
  return v ? v.refs : null;
}
