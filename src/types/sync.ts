export type SyncStatus = "idle" | "syncing" | "ok" | "error";

export interface ExportOptions {
  includeBookmarks?: boolean;
  includeNotes?: boolean;
  includeSettings?: boolean;
  includePlans?: boolean;
  includePrayers?: boolean;
  includeAudioPosition?: boolean;
  includePositions?: boolean;
}

export interface SyncData {
  exportedAt: number;
  version: number;
  bookmarks?: any[];
  notes?: any[];
  settings?: any;
  plans?: any[];
  prayers?: any[];
  audioPosition?: any[];
  positions?: any[];
}

export interface SyncResult {
  ok: boolean;
  error?: string;
}

export interface RemoteSyncConfig {
  endpoint?: string;
  token?: string;
  enabled: boolean;
}
