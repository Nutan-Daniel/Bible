import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadBible, verseOfTheDay } from "../lib/bible";
import { usePosition } from "../hooks/usePosition";
import { useReadingPlan } from "../hooks/useReadingPlan";
import { useDevotionals } from "../hooks/useDevotionals";
import { useSettings } from "../hooks/useSettings";
import { useNotifications } from "../hooks/useNotifications";
import type { Book, TranslationId } from "../types/bible";

export default function Home() {
  const { settings } = useSettings();
  const { position } = usePosition(
    settings.defaultTranslation as TranslationId,
  );
  const { info, loadPlan } = useReadingPlan();
  const { today } = useDevotionals();
  const [votd, setVotd] = useState<{
    book: Book;
    chapter: { number: number };
    verse: { number: number; text: string };
  } | null>(null);
  const continueHref = position
    ? `/read/${position.bookId}/${position.chapter}`
    : "/read";

  useEffect(() => {
    loadBible(settings.defaultTranslation as TranslationId).then((data) => {
      setVotd(verseOfTheDay(data));
    });
  }, [settings.defaultTranslation]);

  useEffect(() => {
    if (settings.activePlanId) {
      loadPlan(settings.activePlanId);
    }
  }, [settings.activePlanId, loadPlan]);

  useNotifications(
    settings,
    votd?.verse.text ?? "",
    votd ? `${votd.book.name} ${votd.chapter.number}:${votd.verse.number}` : "",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="opacity-90 mt-1">Read the World English Bible offline.</p>
        <Link
          to={continueHref}
          className="inline-block mt-4 rounded-lg bg-white/20 px-4 py-2 font-medium hover:bg-white/30"
        >
          Continue reading
        </Link>
      </section>

      {info && info.started && info.assignment && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">
            Today’s reading — {info.plan.name}
          </h2>
          <p className="mt-1 text-lg font-medium">
            {info.assignment.bookId} {info.assignment.chapter}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Day {(info.day ?? 0) + 1} of {info.plan.days} ·{" "}
            {Math.round(info.progress * 100)}% complete ·{info.streak}-day
            streak
          </p>
          <Link
            to={`/plan/${info.plan.id}`}
            className="mt-3 inline-block text-indigo-600 dark:text-indigo-400"
          >
            Open reading plan →
          </Link>
        </section>
      )}

      {votd && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">
            Verse of the day
          </h2>
          <p className="mt-3 text-lg leading-relaxed" aria-live="polite">
            “{votd.verse.text}”
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {votd.book.name} {votd.chapter.number}:{votd.verse.number}
          </p>
          <Link
            to={`/read/${votd.book.id}/${votd.chapter.number}#v${votd.verse.number}`}
            className="mt-3 inline-block text-indigo-600 dark:text-indigo-400"
          >
            Read chapter →
          </Link>
        </section>
      )}

      {today && (
        <section className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-6">
          <h2 className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Today&rsquo;s devotional
          </h2>
          <p className="mt-1 text-lg font-medium">{today.title}</p>
          <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            {today.scripture}
          </p>
          <p className="mt-3">{today.content}</p>
          <Link
            to="/devotionals"
            className="mt-3 inline-block text-indigo-600 dark:text-indigo-400"
          >
            View all devotionals →
          </Link>
        </section>
      )}

      {position && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">
            Last position
          </h2>
          <p className="mt-2">
            {position.bookId} {position.chapter}
            {position.verse ? `:${position.verse}` : ""}
          </p>
        </section>
      )}
    </div>
  );
}
