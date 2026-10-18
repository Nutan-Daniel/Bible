import { useState } from "react";
import {
  downloadExport,
  exportData,
  importData,
  importRemote,
  parseSerializedData,
  readFileAsText,
} from "../lib/sync";

export default function SyncPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [syncEndpoint, setSyncEndpoint] = useState("");

  const handleExport = async () => {
    setStatus("idle");
    setMessage("");
    try {
      const data = await exportData();
      downloadExport(data);
      setStatus("ok");
      setMessage("Backup exported successfully.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Export failed.");
    }
  };

  const handleImport = async (file: File) => {
    setStatus("idle");
    setMessage("");
    try {
      const text = await readFileAsText(file);
      const data = parseSerializedData(text);
      const result = await importData(data);
      if (result.ok) {
        setStatus("ok");
        setMessage("Backup restored successfully.");
      } else {
        setStatus("error");
        setMessage(result.error ?? "Import failed.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Import failed.");
    }
  };

  const handleRemoteSync = async () => {
    setStatus("idle");
    setMessage("");
    const config = { endpoint: syncEndpoint || undefined, enabled: true };
    const result = await importRemote(config);
    if (result.ok) {
      setStatus("ok");
      setMessage("Remote sync complete.");
    } else {
      setStatus("error");
      setMessage(result.error ?? "Remote sync failed.");
    }
  };

  const statusColor =
    status === "ok"
      ? "text-green-700 dark:text-green-400"
      : status === "error"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-600 dark:text-gray-400";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Backup & Sync</h2>
      <p className="text-gray-500">
        Export your bookmarks, notes, settings, reading plans, prayers, and
        reading positions to a JSON file. Import it back on any device.
      </p>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <h3 className="text-sm font-semibold">Local backup</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Export backup
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
              }}
              className="sr-only"
            />
            <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
              Import backup
            </button>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <h3 className="text-sm font-semibold">Remote sync (optional)</h3>
        <p className="text-sm text-gray-500">
          Point to your own sync endpoint to back up across devices.
        </p>
        <input
          value={syncEndpoint}
          onChange={(e) => setSyncEndpoint(e.target.value)}
          placeholder="https://your-sync-endpoint.example/sync"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 mb-2"
        />
        <button
          onClick={handleRemoteSync}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Sync now
        </button>
      </div>

      {message && (
        <div className={`rounded-lg p-3 text-sm ${statusColor}`}>{message}</div>
      )}
    </div>
  );
}
