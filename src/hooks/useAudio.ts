import { useCallback, useEffect, useRef, useState } from "react";
import { player } from "../lib/audio";
import { db } from "../db";
import type { AudioSource } from "../types/audio";
import type { AudioPlayerState } from "../types/audio";

export function useAudio() {
  const [state, setState] = useState<AudioPlayerState>(player.state);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = player.subscribe((patch) => {
      setState((prev) => ({ ...prev, ...patch }));
    });
    return () => {
      unsubRef.current?.();
    };
  }, []);

  const persistPosition = useCallback(
    async (
      source: AudioSource | null,
      currentTime: number,
      duration: number,
    ) => {
      if (!source) return;
      const existing = await db.audioPosition
        .where("bookId")
        .equals(source.bookId)
        .and((p) => p.chapter === source.chapter)
        .first();
      if (existing?.id != null) {
        await db.audioPosition.update(existing.id, {
          time: currentTime,
          duration,
          updatedAt: Date.now(),
        });
      } else {
        await db.audioPosition.add({
          bookId: source.bookId,
          chapter: source.chapter,
          time: currentTime,
          duration,
          updatedAt: Date.now(),
        });
      }
    },
    [],
  );

  const loadSource = useCallback(async (source: AudioSource) => {
    const saved = await db.audioPosition
      .where("bookId")
      .equals(source.bookId)
      .and((p) => p.chapter === source.chapter)
      .first();
    await player.load(source, saved?.time ?? 0);
  }, []);

  // Persist position periodically while playing.
  useEffect(() => {
    if (state.status !== "playing" || !state.source) return;
    const id = setInterval(async () => {
      if (!state.source) return;
      await persistPosition(state.source, state.currentTime, state.duration);
    }, 5000);
    return () => clearInterval(id);
  }, [
    state.status,
    state.source,
    state.currentTime,
    state.duration,
    persistPosition,
  ]);

  const playPause = useCallback(() => player.toggle(), []);
  const skipBack = useCallback(() => player.skip(-15), []);
  const skipForward = useCallback(() => player.skip(15), []);
  const stop = useCallback(() => player.stop(), []);

  return {
    state,
    loadSource,
    playPause,
    skipBack,
    skipForward,
    stop,
  };
}
