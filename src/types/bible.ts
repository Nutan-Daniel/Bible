export type TranslationId = "web" | "kjv";

export interface Verse {
  number: number;
  text: string;
}

export interface Chapter {
  number: number;
  verses: Verse[];
}

export interface Book {
  id: string;
  name: string;
  testament: "OT" | "NT";
  translationId: TranslationId;
  chapters: Chapter[];
}

export interface BibleData {
  translationId: TranslationId;
  books: Book[];
}

export interface Highlight {
  id?: number;
  translationId: TranslationId;
  bookId: string;
  chapter: number;
  verse: number;
  color: string;
  createdAt: number;
}

export type HighlightColor = "yellow" | "green" | "blue" | "orange" | "purple";

export const highlightColors: HighlightColor[] = [
  "yellow",
  "green",
  "blue",
  "orange",
  "purple",
];

export const highlightColorClasses: Record<HighlightColor, string> = {
  yellow: "bg-yellow-200 dark:bg-yellow-900/30",
  green: "bg-green-200 dark:bg-green-900/30",
  blue: "bg-blue-200 dark:bg-blue-900/30",
  orange: "bg-orange-200 dark:bg-orange-900/30",
  purple: "bg-purple-200 dark:bg-purple-900/30",
};

export const highlightColorLabels: Record<HighlightColor, string> = {
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  orange: "Orange",
  purple: "Purple",
};
