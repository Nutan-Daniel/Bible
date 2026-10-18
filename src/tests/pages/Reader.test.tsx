import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

beforeEach(() => {
  vi.resetAllMocks();
});

vi.mock("../../lib/bible", () => ({
  loadBible: vi.fn(() =>
    Promise.resolve({
      books: [
        {
          id: "gn",
          name: "Genesis",
          testament: "OT",
          translationId: "web",
          chapters: [
            {
              number: 1,
              verses: [
                { number: 1, text: "In the beginning was the Word." },
                { number: 2, text: "The earth was formless and empty." },
              ],
            },
            {
              number: 2,
              verses: [
                {
                  number: 1,
                  text: "Thus the heavens and the earth were finished.",
                },
              ],
            },
          ],
        },
      ],
    }),
  ),
  getBook: vi.fn((data: any, id: string) =>
    data.books.find((b: any) => b.id === id),
  ),
  getChapter: vi.fn((book: any, n: number) =>
    book.chapters.find((c: any) => c.number === n),
  ),
}));

vi.mock("../../lib/crossrefs", () => ({
  loadCrossRefs: vi.fn(() =>
    Promise.resolve({
      bookId: "gn",
      chapters: [
        {
          chapter: 1,
          verses: [
            {
              verse: 1,
              refs: [
                { bookId: "jn", chapter: 1, verse: 1 },
                { bookId: "cl", chapter: 1, verse: 16 },
              ],
            },
          ],
        },
      ],
    }),
  ),
  getCrossRefs: vi.fn((book: any, chapter: number, verse: number) => {
    if (!book) return null;
    const ch = book.chapters.find((c: any) => c.chapter === chapter);
    if (!ch) return null;
    const v = ch.verses.find((x: any) => x.verse === verse);
    return v ? v.refs : null;
  }),
}));

vi.mock("../../db", () => ({
  defaultSettings: {
    fontSize: "md",
    fontFamily: "serif",
    theme: "system",
    lineSpacing: 1.6,
    defaultTranslation: "web",
  },
  db: {
    bookmarks: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          sortBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
      add: vi.fn(() => Promise.resolve(1)),
      delete: vi.fn(() => Promise.resolve()),
    },
    notes: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          sortBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
      first: vi.fn(() => Promise.resolve(null)),
      add: vi.fn(() => Promise.resolve(1)),
      update: vi.fn(() => Promise.resolve(1)),
      delete: vi.fn(() => Promise.resolve()),
    },
    settings: {
      toCollection: vi.fn(() => ({
        first: vi.fn(() => Promise.resolve(null)),
      })),
      add: vi.fn(() => Promise.resolve(1)),
      update: vi.fn(() => Promise.resolve(1)),
    },
    position: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          sortBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
      add: vi.fn(() => Promise.resolve(1)),
    },
    highlights: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
      })),
      add: vi.fn(() => Promise.resolve(1)),
      delete: vi.fn(() => Promise.resolve()),
    },
  },
}));

import Reader from "../../pages/Reader";

describe("Reader", () => {
  it("renders chapter verses and allows verse selection", async () => {
    render(
      <MemoryRouter initialEntries={["/read/gn/1"]}>
        <Reader />
      </MemoryRouter>,
    );

    await screen.findByText("Genesis 1");
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(
      screen.getByText("In the beginning was the Word."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("The earth was formless and empty."));
    expect(screen.getByText("Bookmark")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("opens cross-reference popup for a verse with refs", async () => {
    render(
      <MemoryRouter initialEntries={["/read/gn/1"]}>
        <Reader />
      </MemoryRouter>,
    );

    await screen.findByText("Genesis 1");
    fireEvent.click(screen.getByText("In the beginning was the Word."));
    expect(screen.getByText("JN 1:1")).toBeInTheDocument();
    expect(screen.getByText("CL 1:16")).toBeInTheDocument();
  });

  it("navigates to next chapter", async () => {
    render(
      <MemoryRouter initialEntries={["/read/gn/1"]}>
        <Reader />
      </MemoryRouter>,
    );

    await screen.findByText("In the beginning was the Word.");
    const next = screen.getByLabelText("Next chapter");
    fireEvent.click(next);
    await screen.findByText("Thus the heavens and the earth were finished.");
    expect(
      screen.queryByText("In the beginning was the Word."),
    ).not.toBeInTheDocument();
  });
});
