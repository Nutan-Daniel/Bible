import {
  getAvailableTranslations,
  getTranslationMeta,
} from "../lib/translation";
import type { TranslationId } from "../types/bible";
import { useSettings } from "../hooks/useSettings";
import InstallPrompt from "../components/InstallPrompt";

export default function Settings() {
  const { settings, update } = useSettings();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          Default translation
        </label>
        <select
          value={settings.defaultTranslation}
          onChange={(e) =>
            update({ defaultTranslation: e.target.value as TranslationId })
          }
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 w-full"
        >
          {getAvailableTranslations().map((id) => {
            const m = getTranslationMeta(id);
            return (
              <option key={id} value={id}>
                {m.abbrev} — {m.name}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Font size</label>
        <div className="flex gap-2">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update({ fontSize: s })}
              className={`px-3 py-1.5 rounded-lg ${settings.fontSize === s ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Font family</label>
        <div className="flex gap-2">
          {(["serif", "sans"] as const).map((f) => (
            <button
              key={f}
              onClick={() => update({ fontFamily: f })}
              className={`px-3 py-1.5 rounded-lg ${settings.fontFamily === f ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className={`px-3 py-1.5 rounded-lg ${settings.theme === t ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Line spacing: {settings.lineSpacing.toFixed(1)}
        </label>
        <input
          type="range"
          min={1.2}
          max={2.2}
          step={0.1}
          value={settings.lineSpacing}
          onChange={(e) => update({ lineSpacing: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Daily verse notification
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              update({ notificationsEnabled: !settings.notificationsEnabled })
            }
            className={`px-3 py-1.5 rounded-lg ${settings.notificationsEnabled ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            {settings.notificationsEnabled ? "On" : "Off"}
          </button>
          <input
            type="time"
            value={settings.notificationTime}
            onChange={(e) => update({ notificationTime: e.target.value })}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm disabled:opacity-50"
            disabled={!settings.notificationsEnabled}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Receive a daily verse reminder.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Screen reader announcements
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              update({ ariaLiveEnabled: !settings.ariaLiveEnabled })
            }
            className={`px-3 py-1.5 rounded-lg ${settings.ariaLiveEnabled ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            {settings.ariaLiveEnabled ? "On" : "Off"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Announce changes like bookmarks and highlights.
        </p>
      </div>

      <InstallPrompt />
    </div>
  );
}
