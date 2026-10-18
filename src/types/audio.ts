export type AudioStatus =
  "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export interface AudioSource {
  bookId: string;
  chapter: number;
  url: string;
}

export interface AudioPosition {
  id?: number;
  bookId: string;
  chapter: number;
  verse?: number;
  time: number;
  duration: number;
  updatedAt: number;
}

export interface AudioPlayerState {
  status: AudioStatus;
  currentTime: number;
  duration: number;
  source: AudioSource | null;
  error: string | null;
}
