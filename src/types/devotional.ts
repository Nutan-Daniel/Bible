export type DevotionalId = string;

export interface Devotional {
  id: DevotionalId;
  date: string; // ISO YYYY-MM-DD
  title: string;
  scripture: string; // e.g. "John 3:16"
  scriptureText?: string;
  content: string;
  verseOfTheDay?: boolean;
}

export interface DevotionalsData {
  devotionals: Devotional[];
}
