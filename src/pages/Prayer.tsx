import { useState } from "react";
import { usePrayers } from "../hooks/usePrayers";
import type { PrayerFilter, PrayerStatus } from "../types/prayer";

const statusLabel: Record<PrayerStatus, string> = {
  active: "Active",
  answered: "Answered",
  archived: "Archived",
};

const statusColor: Record<PrayerStatus, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  answered: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

export default function PrayerPage() {
  const { prayers, loading, add, setStatus, remove } = usePrayers("all");
  const [filter, setFilter] = useState<PrayerFilter>("all");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scripture, setScripture] = useState("");

  const addPrayer = async () => {
    if (!title.trim() || !content.trim()) return;
    await add({
      title,
      content,
      scripture: scripture.trim() || undefined,
      status: "active",
    });
    setTitle("");
    setContent("");
    setScripture("");
  };

  const filtered = prayers.filter(
    (p) => filter === "all" || p.status === filter,
  );

  if (loading) return <div className="p-6 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Prayer Journal</h2>
        <div className="flex gap-1">
          {(["all", "active", "answered", "archived"] as PrayerFilter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2 py-1 rounded-full ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {f}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold mb-3">New prayer</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 mb-2"
        />
        <input
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          placeholder="Scripture reference (optional)"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 mb-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Your prayer…"
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 mb-3"
        />
        <button
          onClick={addPrayer}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={!title.trim() || !content.trim()}
        >
          Save prayer
        </button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-gray-500">No prayers yet.</p>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{p.title}</h4>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${statusColor[p.status]}`}
                >
                  {statusLabel[p.status]}
                </span>
              </div>
              {p.scripture && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {p.scripture}
                </p>
              )}
              <p className="mt-1 text-sm whitespace-pre-wrap">{p.content}</p>
              <p className="mt-2 text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:ml-2">
              <button
                onClick={() =>
                  p.id != null &&
                  setStatus(p.id, p.status === "active" ? "answered" : "active")
                }
                className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400"
              >
                {p.status === "active" ? "Mark answered" : "Reopen"}
              </button>
              <button
                onClick={() => p.id != null && remove(p.id)}
                className="text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} of {prayers.length} prayers
      </p>
    </div>
  );
}
