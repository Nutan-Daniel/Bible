import type { AudioSource, AudioPlayerState } from "../types/audio";

// External audio source registry. Register public-domain audio URLs here
// keyed by "bookId:chapter". Example usage:
//   registerAudioSource("gn", 1, "https://example.com/audio/gn1.mp3")
// The initial bundle stays under the 8 MB budget; audio loads on-demand from
// these URLs when the user sets a source in the Reader.
const externalSources: Record<string, string> = {};

export function getAudioSource(
  bookId: string,
  chapter: number,
): AudioSource | null {
  const key = `${bookId}:${chapter}`;
  const url = externalSources[key];
  if (!url) return null;
  return { bookId, chapter, url };
}

export function registerAudioSource(
  bookId: string,
  chapter: number,
  url: string,
): void {
  externalSources[`${bookId}:${chapter}`] = url;
}

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private listeners: Array<(state: Partial<AudioPlayerState>) => void> = [];
  private positionTimer: number | null = null;

  state: AudioPlayerState = {
    status: "idle",
    currentTime: 0,
    duration: 0,
    source: null,
    error: null,
  };

  constructor() {
    if (typeof window === "undefined") return;
    this.audio = new Audio();
    this.audio.preload = "metadata";
    this.audio.addEventListener("loadedmetadata", () => {
      if (!this.audio) return;
      this.state.duration = this.audio.duration || 0;
      this.state.status = "paused";
      this.notify({ status: "paused", duration: this.state.duration });
    });
    this.audio.addEventListener("play", () => {
      this.state.status = "playing";
      this.notify({ status: "playing" });
      this.startPositionTimer();
    });
    this.audio.addEventListener("pause", () => {
      this.state.status = "paused";
      this.notify({ status: "paused" });
      this.stopPositionTimer();
    });
    this.audio.addEventListener("ended", () => {
      this.state.status = "ended";
      this.notify({ status: "ended" });
      this.stopPositionTimer();
    });
    this.audio.addEventListener("error", () => {
      this.state.status = "error";
      this.state.error = this.audio?.error?.message ?? "Audio error";
      this.notify({ status: "error", error: this.state.error });
      this.stopPositionTimer();
    });
    this.audio.addEventListener("timeupdate", () => {
      if (!this.audio) return;
      this.state.currentTime = this.audio.currentTime;
      this.notify({ currentTime: this.audio.currentTime });
    });
  }

  private startPositionTimer(): void {
    this.stopPositionTimer();
    this.positionTimer = window.setInterval(() => {
      if (!this.audio) return;
      this.state.currentTime = this.audio.currentTime;
      this.notify({ currentTime: this.audio.currentTime });
    }, 1000);
  }

  private stopPositionTimer(): void {
    if (this.positionTimer !== null) {
      window.clearInterval(this.positionTimer);
      this.positionTimer = null;
    }
  }

  private notify(patch: Partial<AudioPlayerState>): void {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(patch);
  }

  subscribe(fn: (state: Partial<AudioPlayerState>) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  async load(source: AudioSource, startTime = 0): Promise<void> {
    if (!this.audio) {
      this.state.error = "Audio not available";
      this.notify({ status: "error", error: this.state.error });
      return;
    }
    this.stopPositionTimer();
    this.state.source = source;
    this.state.status = "loading";
    this.state.error = null;
    this.notify({ status: "loading", source, error: null });
    this.audio.src = source.url;
    try {
      await this.audio.play();
      this.audio.currentTime = startTime;
      this.state.status = "playing";
      this.state.currentTime = startTime;
      this.notify({ status: "playing", currentTime: startTime });
      this.startPositionTimer();
    } catch (err) {
      this.state.status = "error";
      this.state.error = err instanceof Error ? err.message : "Failed to play";
      this.notify({ status: "error", error: this.state.error });
    }
  }

  play(): void {
    if (!this.audio) return;
    this.audio.play().catch(() => {
      // Autoplay may be blocked; user gesture required.
    });
  }

  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  toggle(): void {
    if (!this.audio) return;
    if (this.state.status === "playing") this.pause();
    else this.play();
  }

  skip(seconds: number): void {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(0, this.audio.currentTime + seconds);
    this.state.currentTime = this.audio.currentTime;
    this.notify({ currentTime: this.state.currentTime });
  }

  stop(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.state.source = null;
    this.state.status = "idle";
    this.state.currentTime = 0;
    this.notify({ source: null, status: "idle", currentTime: 0 });
    this.stopPositionTimer();
  }

  destroy(): void {
    this.stop();
    this.listeners = [];
  }
}

export const player = new AudioPlayer();
