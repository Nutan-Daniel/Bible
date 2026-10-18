import { useAudio } from "../hooks/useAudio";
import { player } from "../lib/audio";
import type { AudioSource } from "../types/audio";
import { Play, Pause, SkipBack, SkipForward, VolumeX } from "lucide-react";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function cls(cond: boolean, a: string, b: string): string {
  return cond ? a : b;
}

interface AudioPlayerProps {
  source: AudioSource | null;
  onLoad?: (source: AudioSource) => void;
}

export default function AudioPlayerComponent({
  source,
  onLoad,
}: AudioPlayerProps) {
  const { state, loadSource, playPause, skipBack, skipForward, stop } =
    useAudio();

  const hasSource = source != null;
  const isLoaded = state.source != null && state.source.url === source?.url;

  const handleLoad = () => {
    if (!source) return;
    loadSource(source);
    onLoad?.(source);
  };

  const isPlaying = state.status === "playing";

  if (!hasSource) return null;

  const loadBtnClass = cls(
    isLoaded && state.status !== "error",
    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    "bg-indigo-600 text-white hover:bg-indigo-700",
  );
  const playBtnClass = cls(
    !isLoaded || state.status === "error",
    "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
    "bg-indigo-600 text-white hover:bg-indigo-700",
  );
  const skipBtnClass = cls(
    !isLoaded || state.status === "error",
    "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
    "bg-indigo-600 text-white hover:bg-indigo-700",
  );
  const stopBtnClass = cls(
    !isLoaded || state.status === "idle",
    "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
    "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  );
  const rangeClass = cls(
    !isLoaded || state.status === "error",
    "opacity-50",
    "",
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {source.bookId.toUpperCase()} {source.chapter}
        </span>
        {state.error && (
          <span className="text-xs text-red-500">{state.error}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLoad}
          disabled={isLoaded && state.status !== "error"}
          className={`px-3 py-1.5 rounded-lg text-sm ${loadBtnClass}`}
        >
          {isLoaded && state.status !== "error" ? "Loaded" : "Load audio"}
        </button>

        <button
          onClick={playPause}
          disabled={!isLoaded || state.status === "error"}
          className={`px-3 py-1.5 rounded-lg text-sm ${playBtnClass}`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={skipBack}
          disabled={!isLoaded || state.status === "error"}
          className={`px-2 py-1.5 rounded-lg text-sm ${skipBtnClass}`}
          title="Skip back 15s"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={skipForward}
          disabled={!isLoaded || state.status === "error"}
          className={`px-2 py-1.5 rounded-lg text-sm ${skipBtnClass}`}
          title="Skip forward 15s"
        >
          <SkipForward size={18} />
        </button>

        <button
          onClick={stop}
          disabled={!isLoaded || state.status === "idle"}
          className={`px-2 py-1.5 rounded-lg text-sm ${stopBtnClass}`}
        >
          <VolumeX size={18} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <span className="text-xs text-gray-500">
          {formatTime(state.currentTime)}
        </span>
        <span className="text-xs text-gray-500">/</span>
        <span className="text-xs text-gray-500">
          {formatTime(state.duration)}
        </span>
      </div>

      <div className="mt-1">
        <input
          type="range"
          min="0"
          max={state.duration || 100}
          value={state.currentTime}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (state.source && v >= 0) {
              player.skip(v - state.currentTime);
            }
          }}
          disabled={!isLoaded || state.status === "error"}
          className={`w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer ${rangeClass}`}
        />
      </div>

      <p className="mt-2 text-xs text-gray-500 text-center">{state.status}</p>
    </div>
  );
}
