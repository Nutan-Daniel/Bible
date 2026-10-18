import { db } from "../db";
import type {
  SyncData,
  ExportOptions,
  SyncResult,
  RemoteSyncConfig,
} from "../types/sync";

const DEFAULT_OPTIONS: Required<ExportOptions> = {
  includeBookmarks: true,
  includeNotes: true,
  includeSettings: true,
  includePlans: true,
  includePrayers: true,
  includeAudioPosition: true,
  includePositions: true,
};

export function mergeOptions(opts?: ExportOptions): Required<ExportOptions> {
  return { ...DEFAULT_OPTIONS, ...opts };
}

export async function exportData(opts?: ExportOptions): Promise<SyncData> {
  const options = mergeOptions(opts);
  const data: SyncData = {
    exportedAt: Date.now(),
    version: 1,
  };

  if (options.includeBookmarks) {
    data.bookmarks = await db.bookmarks.toArray();
  }
  if (options.includeNotes) {
    data.notes = await db.notes.toArray();
  }
  if (options.includeSettings) {
    data.settings = await db.settings.toCollection().first();
  }
  if (options.includePlans) {
    data.plans = await db.plans.toArray();
  }
  if (options.includePrayers) {
    data.prayers = await db.prayers.toArray();
  }
  if (options.includeAudioPosition) {
    data.audioPosition = await db.audioPosition.toArray();
  }
  if (options.includePositions) {
    data.positions = await db.position.toArray();
  }

  return data;
}

export function serializeData(data: SyncData): string {
  return JSON.stringify(data, null, 2);
}

export async function importData(data: SyncData): Promise<SyncResult> {
  try {
    if (data.bookmarks) {
      await db.bookmarks.clear();
      await db.bookmarks.bulkAdd(data.bookmarks);
    }
    if (data.notes) {
      await db.notes.clear();
      await db.notes.bulkAdd(data.notes);
    }
    if (data.settings) {
      await db.settings.clear();
      await db.settings.add(data.settings);
    }
    if (data.plans) {
      await db.plans.clear();
      await db.plans.bulkAdd(data.plans);
    }
    if (data.prayers) {
      await db.prayers.clear();
      await db.prayers.bulkAdd(data.prayers);
    }
    if (data.audioPosition) {
      await db.audioPosition.clear();
      await db.audioPosition.bulkAdd(data.audioPosition);
    }
    if (data.positions) {
      await db.position.clear();
      await db.position.bulkAdd(data.positions);
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Import failed",
    };
  }
}

export function parseSerializedData(text: string): SyncData {
  return JSON.parse(text) as SyncData;
}

export function downloadExport(data: SyncData, filename?: string): void {
  const json = serializeData(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ||
    `bible-reader-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export async function importRemote(
  _config: RemoteSyncConfig,
): Promise<SyncResult> {
  // Placeholder for optional user-owned remote sync endpoint.
  return {
    ok: false,
    error: "Remote sync is not configured. Set endpoint in Settings.",
  };
}

export function getDefaultSyncConfig(): RemoteSyncConfig {
  return { endpoint: undefined, token: undefined, enabled: false };
}
