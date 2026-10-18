import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudio } from "../../hooks/useAudio";

const source = { bookId: "gn", chapter: 1, url: "https://example.com/gn1.mp3" };

beforeEach(() => {
  (player.load as any).mockClear();
  player.state.status = "idle";
  player.state.currentTime = 0;
  player.state.source = null;
  player.state.error = null;
  (db.audioPosition.where("x") as any)
    .equals(1)
    .and(1)
    .first.mockResolvedValue(null);
});

afterEach(() => {
  vi.useRealTimers();
});

vi.mock("../../lib/audio", () => {
  const load = vi.fn(() => Promise.resolve(undefined));
  const toggle = vi.fn();
  const skip = vi.fn();
  const stop = vi.fn();
  const subscribe = vi.fn(() => () => {});
  const state = {
    status: "idle" as const,
    currentTime: 0,
    duration: 0,
    source: null as { bookId: string; chapter: number; url: string } | null,
    error: null as string | null,
  };
  return { player: { load, toggle, skip, stop, subscribe, state } };
});

vi.mock("../../db", () => {
  const first = vi.fn(() => Promise.resolve(null));
  const and = vi.fn(() => ({ first }));
  const equals = vi.fn(() => ({ and }));
  const where = vi.fn(() => ({ equals }));
  return {
    db: {
      audioPosition: {
        where,
        add: vi.fn(() => Promise.resolve(1)),
        update: vi.fn(() => Promise.resolve(1)),
      },
    },
  };
});

import { player } from "../../lib/audio";
import { db } from "../../db";

describe("useAudio", () => {
  it("loads from saved position 0 when none stored", async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.loadSource(source);
    });

    expect(player.load).toHaveBeenCalledWith(source, 0);
  });

  it("resumes from saved position", async () => {
    (db.audioPosition.where(source.bookId) as any)
      .equals(source.chapter)
      .and(source.chapter)
      .first.mockResolvedValueOnce({
        id: 1,
        bookId: source.bookId,
        chapter: source.chapter,
        time: 42,
        duration: 100,
        updatedAt: Date.now(),
      });

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.loadSource(source);
    });

    expect(player.load).toHaveBeenCalledWith(source, 42);
  });

  it("exposes playback controls", async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.loadSource(source);
    });

    expect(typeof result.current.playPause).toBe("function");
    expect(typeof result.current.skipBack).toBe("function");
    expect(typeof result.current.skipForward).toBe("function");
    expect(typeof result.current.stop).toBe("function");
  });
});
