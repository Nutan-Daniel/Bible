import Dexie, { type Table } from "dexie";
import type { TranslationId } from "../types/bible";
import type { Prayer } from "../types/prayer";
import type { AudioPosition } from "../types/audio";
import type { Highlight } from "../types/bible";

export interface Bookmark {
  id?: number;
  translationId: TranslationId;
  bookId: string;
  chapter: number;
  verse: number;
  label: string;
  createdAt: number;
}

export interface Note {
  id?: number;
  translationId: TranslationId;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  updatedAt: number;
}

export type FontSize = "sm" | "md" | "lg" | "xl";
export type FontFamily = "serif" | "sans";
export type Theme = "light" | "dark" | "system";

export interface Settings {
  id?: number;
  fontSize: FontSize;
  fontFamily: FontFamily;
  theme: Theme;
  lineSpacing: number;
  defaultTranslation: TranslationId;
  activePlanId: string | null;
  notificationsEnabled: boolean;
  notificationTime: string;
  lastNotificationDate: string | null;
  ariaLiveEnabled: boolean;
}

export interface ReadingPosition {
  id?: number;
  translationId: TranslationId;
  bookId: string;
  chapter: number;
  verse?: number;
  updatedAt: number;
}

export interface PlanProgress {
  id?: number;
  planId: string;
  startedAt: number;
  completed: string;
  updatedAt: number;
}

class BibleDB extends Dexie {
  bookmarks!: Table<Bookmark, number>;
  notes!: Table<Note, number>;
  settings!: Table<Settings, number>;
  position!: Table<ReadingPosition, number>;
  plans!: Table<PlanProgress, number>;
  prayers!: Table<Prayer, number>;
  audioPosition!: Table<AudioPosition, number>;
  highlights!: Table<Highlight, number>;

  constructor() {
    super("bible-reader");
    this.version(5).stores({
      bookmarks: "++id, translationId, bookId, chapter, verse, createdAt",
      notes: "++id, [translationId+bookId+chapter+verse], updatedAt",
      settings: "++id",
      position: "++id, translationId, updatedAt",
      plans: "++id, planId, startedAt, updatedAt",
      prayers: "++id, status, createdAt, updatedAt",
      audioPosition: "++id, bookId, chapter, updatedAt",
      highlights: "++id, translationId, bookId, chapter, verse, createdAt",
    });
  }
}

export const db = new BibleDB();

export const defaultSettings: Settings = {
  fontSize: "md",
  fontFamily: "serif",
  theme: "system",
  lineSpacing: 1.6,
  defaultTranslation: "web",
  activePlanId: null,
  notificationsEnabled: false,
  notificationTime: "08:00",
  lastNotificationDate: null,
  ariaLiveEnabled: true,
};
