import { Download } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallPrompt() {
  const { canInstall, installed, install, installError } = useInstallPrompt();

  if (installed) return null;

  const isSecureOrLocalhost =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-4">
      <div className="flex flex-col">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Install Bible Reader
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Install for offline reading
        </p>
        {installError && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            {installError}
          </p>
        )}
        {!canInstall && !isSecureOrLocalhost && (
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
            Install requires HTTPS (or localhost).
          </p>
        )}
      </div>
      {canInstall && (
        <button
          onClick={install}
          className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
        >
          <Download size={16} /> Install
        </button>
      )}
    </div>
  );
}
