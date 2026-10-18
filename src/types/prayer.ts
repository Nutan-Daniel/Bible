export type PrayerStatus = "active" | "answered" | "archived";

export interface Prayer {
  id?: number;
  title: string;
  content: string;
  scripture?: string;
  status: PrayerStatus;
  createdAt: number;
  updatedAt: number;
  answeredAt?: number | null;
}

export type PrayerFilter = "all" | "active" | "answered" | "archived";
