import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReadingPlan } from "../../hooks/useReadingPlan";

const fixedNow = new Date("2026-01-01T12:00:00Z").getTime();

beforeEach(() => {
  vi.setSystemTime(fixedNow);
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

vi.mock("../../data/plans.json", () => ({
  default: {
    plans: [
      {
        id: "gospels30",
        name: "Gospels in 30 Days",
        description: "Read the Gospels in 30 days.",
        days: 30,
        books: [
          { bookId: "mt", chapters: 28 },
          { bookId: "mc", chapters: 16 },
          { bookId: "lc", chapters: 24 },
          { bookId: "jo", chapters: 21 },
        ],
      },
    ],
  },
}));

vi.mock("../../db", () => {
  let row: {
    id?: number;
    planId: string;
    startedAt: number;
    completed: string;
    updatedAt: number;
  } | null = null;
  return {
    db: {
      plans: {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            first: vi.fn(async () => row),
          })),
        })),
        add: vi.fn(async (o: any) => {
          row = { id: 1, ...o };
          return 1;
        }),
        update: vi.fn(async (id: number, changes: any) => {
          if (row && row.id === id) row = { ...row, ...changes };
          return 1;
        }),
      },
    },
  };
});

describe("useReadingPlan", () => {
  it("starts a plan and computes day-0 assignment", async () => {
    const { result } = renderHook(() => useReadingPlan());

    await act(async () => {
      await result.current.loadPlan("gospels30");
    });

    expect(result.current.info?.started).toBe(true);
    expect(result.current.info?.plan.name).toBe("Gospels in 30 Days");
    expect(result.current.info?.day).toBe(0);
    expect(result.current.info?.assignment).toEqual({
      day: 0,
      bookId: "mt",
      chapter: 1,
      totalChapters: 89,
      chapterIndex: 0,
    });
    expect(result.current.info?.progress).toBe(0);
    expect(result.current.info?.streak).toBe(0);
  });

  it("marks a chapter complete and updates progress", async () => {
    const { result } = renderHook(() => useReadingPlan());

    await act(async () => {
      await result.current.loadPlan("gospels30");
    });

    await act(async () => {
      await result.current.markComplete("gospels30", "mt", 1);
    });

    expect(result.current.info?.completedCount).toBe(1);
    expect(result.current.info?.progress).toBeCloseTo(1 / 89, 2);
    expect(result.current.info?.isChapterComplete("mt", 1)).toBe(true);

    await act(async () => {
      await result.current.markIncomplete("gospels30", "mt", 1);
    });

    expect(result.current.info?.completedCount).toBe(0);
    expect(result.current.info?.isChapterComplete("mt", 1)).toBe(false);
  });
});
