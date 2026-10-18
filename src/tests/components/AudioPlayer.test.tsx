import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AudioPlayerComponent from "../../components/AudioPlayer";
import { player } from "../../lib/audio";
import { db } from "../../db";

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

describe("AudioPlayerComponent", () => {
  it("renders source label and load button", () => {
    render(<AudioPlayerComponent source={source} />);
    expect(screen.getByText("GN 1")).toBeInTheDocument();
    expect(screen.getByText("Load audio")).toBeInTheDocument();
  });

  it("calls player.load when Load audio is clicked", async () => {
    render(<AudioPlayerComponent source={source} />);
    fireEvent.click(screen.getByText("Load audio"));
    await vi.waitFor(() => {
      expect(player.load).toHaveBeenCalledWith(source, 0);
    });
  });

  it("renders nothing when no source", () => {
    const { container } = render(<AudioPlayerComponent source={null} />);
    expect(container.children.length).toBe(0);
  });
});
