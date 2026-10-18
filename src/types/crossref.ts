export interface CrossRef {
  bookId: string;
  chapter: number;
  verse: number;
  text?: string;
}

export interface CrossRefVerse {
  verse: number;
  refs: CrossRef[];
}

export interface CrossRefChapter {
  chapter: number;
  verses: CrossRefVerse[];
}

export interface CrossRefBook {
  bookId: string;
  chapters: CrossRefChapter[];
}

export interface CrossRefData {
  [bookId: string]: CrossRefBook;
}
