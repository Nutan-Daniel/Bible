import type {
  BibleData,
  Book,
  Chapter,
  Verse,
  TranslationId,
} from "../types/bible";
import { loadTranslation } from "./translation";

export async function loadBible(id: TranslationId = "web"): Promise<BibleData> {
  return loadTranslation(id);
}

export function resetBibleCache(): void {
  // cache lives in translation.ts
}

export function getBook(data: BibleData, id: string): Book | undefined {
  return data.books.find((b) => b.id === id);
}

export function getChapter(book: Book, number: number): Chapter | undefined {
  return book.chapters.find((c) => c.number === number);
}

export interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  translationId: TranslationId;
}

export function searchVerses(data: BibleData, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  for (const book of data.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(q)) {
          results.push({
            bookId: book.id,
            bookName: book.name,
            chapter: chapter.number,
            verse: verse.number,
            text: verse.text,
            translationId: book.translationId,
          });
        }
      }
    }
  }
  return results;
}

export function totalVerses(data: BibleData): number {
  let n = 0;
  for (const b of data.books) for (const c of b.chapters) n += c.verses.length;
  return n;
}

export function verseOfTheDay(
  data: BibleData,
  date: Date = new Date(),
): { book: Book; chapter: Chapter; verse: Verse } {
  const all: { book: Book; chapter: Chapter; verse: Verse }[] = [];
  for (const book of data.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        all.push({ book, chapter, verse });
      }
    }
  }
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  const idx = ((day % all.length) + all.length) % all.length;
  return all[idx];
}
