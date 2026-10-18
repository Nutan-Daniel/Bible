import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDevotionals } from "../../hooks/useDevotionals";
import { usePrayers } from "../../hooks/usePrayers";

const fixedNow = new Date("2026-10-17T12:00:00Z").getTime();

beforeEach(() => {
  vi.setSystemTime(fixedNow);
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

vi.mock("../../data/devotionals.json", () => ({
  default: {
    devotionals: [
      {
        id: "d1",
        date: "2026-10-01",
        title: "Trust in the Lord",
        scripture: "Proverbs 3:5-6",
        content: "Trust in the Lord with all your heart.",
        verseOfTheDay: false,
      },
      {
        id: "d8",
        date: "2026-10-17",
        title: "The Lord is Near",
        scripture: "Psalm 145:18",
        content: "The Lord is near to all who call on him.",
        verseOfTheDay: false,
      },
    ],
  },
}));

vi.mock("../../db", () => {
  let rows: any[] = [];
  return {
    db: {
      prayers: {
        toArray: vi.fn(async () => [...rows]),
        orderBy: vi.fn(() => ({
          reverse: vi.fn(() => ({
            toArray: vi.fn(async () => [...rows]),
          })),
        })),
        add: vi.fn(async (o: any) => {
          const id = rows.length + 1;
          rows.push({ id, ...o });
          return id;
        }),
        update: vi.fn(async (id: number, changes: any) => {
          const idx = rows.findIndex((r) => r.id === id);
          if (idx >= 0) rows[idx] = { ...rows[idx], ...changes };
          return 1;
        }),
        delete: vi.fn(async (id: number) => {
          rows = rows.filter((r) => r.id !== id);
          return 1;
        }),
      },
    },
  };
});

describe("useDevotionals", () => {
  it("returns today's devotional for 2026-10-17", async () => {
    const { result } = renderHook(() => useDevotionals());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.today?.id).toBe("d8");
    expect(result.current.today?.title).toBe("The Lord is Near");
  });

  it("getDevotional returns the devotional for a given date", async () => {
    const { result } = renderHook(() => useDevotionals());

    await act(async () => {
      await result.current.refresh();
    });

    const d = result.current.getDevotional(new Date("2026-10-01"));
    expect(d?.id).toBe("d1");
    expect(d?.title).toBe("Trust in the Lord");
  });
});

describe("usePrayers", () => {
  it("adds, updates status, and removes prayers", async () => {
    const { result } = renderHook(() => usePrayers("all"));

    await act(async () => {
      await result.current.add({
        title: "Healing",
        content: "Please heal my friend.",
        status: "active",
      });
    });

    expect(result.current.prayers.length).toBe(1);
    expect(result.current.prayers[0].title).toBe("Healing");
    expect(result.current.prayers[0].status).toBe("active");

    await act(async () => {
      await result.current.setStatus(result.current.prayers[0].id!, "answered");
    });

    expect(result.current.prayers[0].status).toBe("answered");
    expect(result.current.prayers[0].answeredAt).toBeDefined();

    await act(async () => {
      await result.current.remove(result.current.prayers[0].id!);
    });

    expect(result.current.prayers.length).toBe(0);
  });

  it("filters by status", async () => {
    const { result } = renderHook(() => usePrayers("active"));

    await act(async () => {
      await result.current.add({
        title: "Active one",
        content: "active",
        status: "active",
      });
      await result.current.add({
        title: "Answered one",
        content: "answered",
        status: "answered",
      });
    });

    expect(result.current.prayers.length).toBe(1);
    expect(result.current.prayers[0].title).toBe("Active one");
  });
});
