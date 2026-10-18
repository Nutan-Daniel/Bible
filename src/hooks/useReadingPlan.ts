import { useCallback, useState } from "react";
import { db } from "../db";
import plansData from "../data/plans.json";
import type { Plan } from "../types/plan";

export interface PlanDayAssignment {
  day: number;
  bookId: string;
  chapter: number;
  totalChapters: number;
  chapterIndex: number;
}

export interface PlanProgressInfo {
  plan: Plan;
  started: boolean;
  startedAt: number | null;
  day: number | null;
  assignment: PlanDayAssignment | null;
  completedCount: number;
  totalChapters: number;
  progress: number;
  streak: number;
  completedKeys: Set<string>;
  isChapterComplete: (bookId: string, chapter: number) => boolean;
}

export function useReadingPlan() {
  const [info, setInfo] = useState<PlanProgressInfo | null>(null);

  const loadPlan = useCallback(async (planId: string) => {
    const plan = plansData.plans.find((p) => p.id === planId);
    if (!plan) return;

    const existing = await db.plans.where("planId").equals(planId).first();
    const startedAt = existing ? existing.startedAt : Date.now();

    if (!existing) {
      await db.plans.add({
        planId,
        startedAt,
        completed: "[]",
        updatedAt: startedAt,
      });
    }

    const row = await db.plans.where("planId").equals(planId).first();
    if (!row) return;

    const completed = new Set<string>(JSON.parse(row.completed ?? "[]"));
    const chapterList: { bookId: string; chapter: number }[] = [];
    for (const b of plan.books) {
      for (let c = 1; c <= b.chapters; c++) {
        chapterList.push({ bookId: b.bookId, chapter: c });
      }
    }
    const totalChapters = chapterList.length;
    const days = plan.days;

    const start = new Date(startedAt);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = Math.floor((today.getTime() - start.getTime()) / 86400000);
    const chapterIndex = Math.min(
      Math.floor((Math.max(day, 0) * totalChapters) / days),
      totalChapters - 1,
    );
    const assignment: PlanDayAssignment = {
      day: Math.max(day, 0),
      bookId: chapterList[chapterIndex].bookId,
      chapter: chapterList[chapterIndex].chapter,
      totalChapters,
      chapterIndex,
    };

    const completedCount = [...completed].filter((k) => {
      const [bid, ch] = k.split(":");
      return chapterList.some(
        (c) => c.bookId === bid && c.chapter === Number(ch),
      );
    }).length;

    const progress = totalChapters ? completedCount / totalChapters : 0;

    const completedKeys = new Set<string>(completed);

    const isChapterComplete = (bookId: string, chapter: number) =>
      completed.has(`${bookId}:${chapter}`);

    // streak: consecutive days ending today with >=1 completion
    const dayCompletions = new Set<string>();
    for (const k of completed) {
      const [bid, ch] = k.split(":");
      const ci = chapterList.findIndex(
        (c) => c.bookId === bid && c.chapter === Number(ch),
      );
      if (ci >= 0)
        dayCompletions.add(Math.floor((ci * days) / totalChapters).toString());
    }
    let streak = 0;
    for (let d = day; d >= 0; d--) {
      if (dayCompletions.has(d.toString())) streak++;
      else break;
    }

    setInfo({
      plan,
      started: true,
      startedAt,
      day: Math.max(day, 0),
      assignment,
      completedCount,
      totalChapters,
      progress,
      streak,
      completedKeys,
      isChapterComplete,
    });
  }, []);

  const markComplete = useCallback(
    async (planId: string, bookId: string, chapter: number) => {
      const row = await db.plans.where("planId").equals(planId).first();
      if (!row) return;
      const completed = new Set<string>(JSON.parse(row.completed ?? "[]"));
      completed.add(`${bookId}:${chapter}`);
      await db.plans.update(row.id!, {
        completed: JSON.stringify([...completed]),
        updatedAt: Date.now(),
      });
      await loadPlan(planId);
    },
    [loadPlan],
  );

  const markIncomplete = useCallback(
    async (planId: string, bookId: string, chapter: number) => {
      const row = await db.plans.where("planId").equals(planId).first();
      if (!row) return;
      const completed = new Set<string>(JSON.parse(row.completed ?? "[]"));
      completed.delete(`${bookId}:${chapter}`);
      await db.plans.update(row.id!, {
        completed: JSON.stringify([...completed]),
        updatedAt: Date.now(),
      });
      await loadPlan(planId);
    },
    [loadPlan],
  );

  return { info, loadPlan, markComplete, markIncomplete };
}
