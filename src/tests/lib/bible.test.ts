import { describe, expect, it } from "vitest";
import {
  getBook,
  getChapter,
  loadBible,
  resetBibleCache,
  searchVerses,
  totalVerses,
  verseOfTheDay,
} from "../../lib/bible";

describe("bible loader", () => {
  it("loads all 66 books", async () => {
    const data = await loadBible();
    expect(data.books).toHaveLength(66);
    expect(data.books[0].id).toBe("gn");
    expect(data.books[0].testament).toBe("OT");
    expect(data.books[65].testament).toBe("NT");
  });

  it("resolves book and chapter", async () => {
    const data = await loadBible();
    const book = getBook(data, "gn");
    expect(book?.name).toBe("Genesis");
    const ch = getChapter(book!, 1);
    expect(ch?.number).toBe(1);
    expect(ch?.verses[0].number).toBe(1);
    expect(ch?.verses[0].text).toContain("beginning");
  });

  it("counts total verses", async () => {
    const data = await loadBible();
    expect(totalVerses(data)).toBe(31098);
  });

  it("searches verses", async () => {
    const data = await loadBible();
    const results = searchVerses(data, "beginning");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({
      bookId: "gn",
      chapter: 1,
      verse: 1,
    });
  });

  it("verse of the day is deterministic by date", async () => {
    const data = await loadBible();
    const a = verseOfTheDay(data, new Date(2026, 0, 1));
    const b = verseOfTheDay(data, new Date(2026, 0, 1));
    expect(b).toEqual(a);
    const c = verseOfTheDay(data, new Date(2026, 0, 2));
    expect(c).not.toEqual(a);
  });

  it("resetBibleCache allows reload", async () => {
    await loadBible();
    resetBibleCache();
    const data = await loadBible();
    expect(data.books).toHaveLength(66);
  });
});
