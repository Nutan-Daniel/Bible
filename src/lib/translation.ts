import type { BibleData, TranslationId } from "../types/bible";

const translationPaths: Record<
  TranslationId,
  () => Promise<{ default: unknown }>
> = {
  web: () => import("../data/web.json"),
  kjv: () => import("../data/kjv.json"),
};

const translationMeta: Record<TranslationId, { name: string; abbrev: string }> =
  {
    web: { name: "World English Bible", abbrev: "WEB" },
    kjv: { name: "King James Version", abbrev: "KJV" },
  };

let cache: Map<TranslationId, BibleData> = new Map();

export function getTranslationMeta(id: TranslationId) {
  return translationMeta[id];
}

export function getAvailableTranslations(): TranslationId[] {
  return Object.keys(translationPaths) as TranslationId[];
}

export function resetTranslationCache(): void {
  cache = new Map();
}

export async function loadTranslation(id: TranslationId): Promise<BibleData> {
  const cached = cache.get(id);
  if (cached) return cached;
  const mod = await translationPaths[id]();
  const data = mod.default as unknown as BibleData;
  data.translationId = id;
  for (const book of data.books) {
    book.translationId = id;
  }
  cache.set(id, data);
  return data;
}

export async function loadDefaultTranslation(): Promise<BibleData> {
  return loadTranslation("web");
}
