import { useDevotionals } from "../hooks/useDevotionals";
import { Link } from "react-router-dom";
import type { Devotional } from "../types/devotional";

export default function DevotionalsPage() {
  const { data, today } = useDevotionals();

  if (!data) return <div className="p-6 text-center">Loading…</div>;

  const sorted = [...data.devotionals].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Devotionals</h2>
      <p className="text-gray-500">Daily reflections anchored in scripture.</p>

      {today && (
        <section className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-6">
          <h3 className="text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2">
            Today&rsquo;s devotional
          </h3>
          <h2 className="text-xl font-bold">{today.title}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {today.scripture}
          </p>
          <p className="mt-3">{today.content}</p>
        </section>
      )}

      <div className="space-y-3">
        {sorted.map((d: Devotional) => {
          const isToday = today?.id === d.id;
          return (
            <div
              key={d.id}
              className={`rounded-xl border p-4 ${
                isToday
                  ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="text-sm text-gray-500">{d.date}</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    {d.scripture}
                  </p>
                </div>
                {isToday && (
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                    Today
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm">{d.content}</p>
            </div>
          );
        })}
      </div>

      <Link
        to="/prayer"
        className="inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
      >
        Open prayer journal &rarr;
      </Link>
    </div>
  );
}
