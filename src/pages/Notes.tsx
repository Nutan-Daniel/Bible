import { Link } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { useSettings } from "../hooks/useSettings";
import type { TranslationId } from "../types/bible";

export default function NotesPage() {
  const { settings } = useSettings();
  const { notes, remove } = useNotes(
    settings.defaultTranslation as TranslationId,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notes</h2>
      {notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n.id}
            className="rounded-lg border border-gray-200 dark:border-gray-800 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/read/${n.bookId}/${n.chapter}#v${n.verse}`}
                className="text-indigo-600 dark:text-indigo-400"
              >
                {n.bookId} {n.chapter}:{n.verse}
              </Link>
              <button
                onClick={() => n.id != null && remove(n.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{n.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
