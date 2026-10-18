import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadBible, searchVerses } from "../lib/bible";
import { getTranslationMeta } from "../lib/translation";
import type { BibleData, TranslationId } from "../types/bible";
import { useSettings } from "../hooks/useSettings";

export default function SearchPage() {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<BibleData | null>(null);

  useEffect(() => {
    loadBible(settings.defaultTranslation as TranslationId).then(setData);
  }, [settings.defaultTranslation]);

  const results = useMemo(
    () => (data ? searchVerses(data, query) : []),
    [data, query],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const r of results) {
      if (!map.has(r.bookId)) map.set(r.bookId, []);
      map.get(r.bookId)!.push(r);
    }
    return [...map.entries()];
  }, [results]);

  function highlight(text: string, q: string) {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-700">{match}</mark>
        {after}
      </>
    );
  }

  const meta = getTranslationMeta(settings.defaultTranslation as TranslationId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Translation:
        </span>
        <span className="text-sm font-medium">{meta.abbrev}</span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search verses…"
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3"
      />
      <p className="text-sm text-gray-500" aria-live="polite">
        {results.length} results
      </p>
      {query && results.length === 0 && (
        <p className="text-sm text-gray-500">No results found.</p>
      )}
      <div className="space-y-6">
        {grouped.map(([bookId, rs]) => (
          <section key={bookId}>
            <h3 className="font-semibold mb-2">{rs[0].bookName}</h3>
            <ul className="space-y-2">
              {rs.slice(0, 50).map((r) => (
                <li
                  key={`${r.chapter}-${r.verse}`}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 p-3"
                >
                  <Link
                    to={`/read/${r.bookId}/${r.chapter}#v${r.verse}`}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    {r.bookName} {r.chapter}:{r.verse}
                  </Link>
                  <p className="mt-1 text-sm">{highlight(r.text, query)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
