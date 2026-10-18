import { Link } from "react-router-dom";
import { useBookmarks } from "../hooks/useBookmarks";
import { useSettings } from "../hooks/useSettings";
import type { TranslationId } from "../types/bible";

export default function Bookmarks() {
  const { settings } = useSettings();
  const { bookmarks, remove } = useBookmarks(
    settings.defaultTranslation as TranslationId,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bookmarks</h2>
      {bookmarks.length === 0 && (
        <p className="text-gray-500">No bookmarks yet.</p>
      )}
      <ul className="space-y-2">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between gap-2"
          >
            <Link
              to={`/read/${b.bookId}/${b.chapter}#v${b.verse}`}
              className="text-indigo-600 dark:text-indigo-400"
            >
              {b.label}
            </Link>
            <button
              onClick={() => b.id != null && remove(b.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
