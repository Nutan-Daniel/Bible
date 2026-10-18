import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { loadBible, getBook, getChapter } from "../lib/bible";
import { useReadingPlan } from "../hooks/useReadingPlan";
import { useSettings } from "../hooks/useSettings";
import type { BibleData, TranslationId } from "../types/bible";

export default function PlanPage() {
  const { planId } = useParams();
  const { settings } = useSettings();
  const { info, loadPlan, markComplete, markIncomplete } = useReadingPlan();
  const [data, setData] = useState<BibleData | null>(null);
  const [chapterVerses, setChapterVerses] = useState<
    { number: number; text: string }[]
  >([]);

  const translationId = settings.defaultTranslation as TranslationId;

  useEffect(() => {
    let mounted = true;
    if (planId && !info?.started) {
      (async () => {
        if (mounted) await loadPlan(planId);
      })();
    }
    return () => {
      mounted = false;
    };
  }, [planId, loadPlan, info?.started]);

  useEffect(() => {
    loadBible(translationId).then(setData);
  }, [translationId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (data && info?.started && info.assignment && mounted) {
        const book = getBook(data, info.assignment.bookId);
        const chapter = book
          ? getChapter(book, info.assignment.chapter)
          : undefined;
        setChapterVerses(chapter ? chapter.verses : []);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [data, info]);

  if (!info?.started || !info.assignment) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reading Plan</h2>
        <p className="text-gray-500">No reading plan started.</p>
        <Link to="/plans" className="text-indigo-600 dark:text-indigo-400">
          Browse plans →
        </Link>
      </div>
    );
  }

  const assignment = info.assignment;
  const completed = info.completedCount ?? 0;

  const isComplete = info.isChapterComplete(
    assignment.bookId,
    assignment.chapter,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{info.plan.name}</h2>
          <p className="text-gray-500">{info.plan.description}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          Day {(info.day ?? 0) + 1} of {info.plan.days}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <p className="text-sm font-medium text-gray-500 mb-2">
          Today’s reading
        </p>
        <p className="text-lg font-semibold">
          {assignment.bookId} {assignment.chapter}
        </p>
        <div className="mt-2 leading-relaxed">
          {chapterVerses.map((v) => (
            <p key={v.number} className="mb-2">
              <sup className="text-xs text-gray-500 mr-1">{v.number}</sup>
              {v.text}
            </p>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() =>
              info.plan.id &&
              markComplete?.(
                info.plan.id,
                assignment.bookId,
                assignment.chapter,
              )
            }
            disabled={isComplete}
            className={`px-3 py-1.5 rounded-lg ${isComplete ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
          >
            {isComplete ? "Marked complete" : "Mark complete"}
          </button>
          <button
            onClick={() =>
              info.plan.id &&
              markIncomplete?.(
                info.plan.id,
                assignment.bookId,
                assignment.chapter,
              )
            }
            disabled={!isComplete}
            className="px-3 py-1.5 rounded-lg text-red-500 hover:underline"
          >
            Undo
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${Math.round(info.progress * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {completed} of {info.totalChapters} chapters · {info.streak}-day
          streak
        </p>
        <Link
          to="/plans"
          className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Change plan
        </Link>
      </div>
    </div>
  );
}
