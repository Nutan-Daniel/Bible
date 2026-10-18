export interface PlanBook {
  bookId: string;
  chapters: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  days: number;
  books: PlanBook[];
}
