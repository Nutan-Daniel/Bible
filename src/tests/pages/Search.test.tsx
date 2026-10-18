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
          id: "jn",
          name: "John",
          testament: "NT",
          translationId: "web",
          chapters: [
            {
              number: 3,
              verses: [{ number: 16, text: "For God so loved the world." }],
            },
          ],
        },
      ],
    }),
  ),
  searchVerses: vi.fn((data: any, query: string) => {
    const q = query.toLowerCase();
    const out: any[] = [];
    for (const b of data.books)
      for (const c of b.chapters)
        for (const v of c.verses)
          if (v.text.toLowerCase().includes(q))
            out.push({
              bookId: b.id,
              bookName: b.name,
              chapter: c.number,
              verse: v.number,
              text: v.text,
              translationId: b.translationId,
            });
    return out;
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
    settings: {
      toCollection: vi.fn(() => ({
        first: vi.fn(() => Promise.resolve(null)),
      })),
      add: vi.fn(() => Promise.resolve(1)),
      update: vi.fn(() => Promise.resolve(1)),
    },
  },
}));

import SearchPage from "../../pages/Search";

describe("Search", () => {
  it("returns grouped results for a query", async () => {
    render(
      <MemoryRouter initialEntries={["/search"]}>
        <SearchPage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("Search verses…");
    fireEvent.change(input, { target: { value: "loved" } });
    await screen.findByText("John 3:16");
    expect(screen.getByText("loved")).toBeInTheDocument();
  });
});
