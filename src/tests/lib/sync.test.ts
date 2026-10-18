import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  exportData,
  importData,
  parseSerializedData,
  serializeData,
} from "../../lib/sync";

const bookmarks = [
  {
    id: 1,
    bookId: "gn",
    chapter: 1,
    verse: 1,
    translationId: "web",
    label: "Gn 1:1",
    createdAt: 1,
  },
];
const notes = [
  {
    id: 1,
    bookId: "gn",
    chapter: 1,
    verse: 1,
    translationId: "web",
    text: "A note",
    updatedAt: 1,
  },
];
const settings = {
  id: 1,
  fontSize: "md",
  fontFamily: "serif",
  theme: "system",
  lineSpacing: 1.6,
  defaultTranslation: "web",
  activePlanId: null,
};
const plans = [
  { id: 1, planId: "gospels30", startedAt: 1, completed: "[]", updatedAt: 1 },
];
const prayers = [
  {
    id: 1,
    title: "Prayer",
    content: "c",
    status: "active",
    createdAt: 1,
    updatedAt: 1,
  },
];
const audioPosition = [
  { id: 1, bookId: "gn", chapter: 1, time: 10, duration: 100, updatedAt: 1 },
];
const positions = [
  { id: 1, translationId: "web", bookId: "gn", chapter: 1, updatedAt: 1 },
];

const seedData = {
  exportedAt: 1,
  version: 1,
  bookmarks,
  notes,
  settings,
  plans,
  prayers,
  audioPosition,
  positions,
};

vi.mock("../../db", () => {
  const bm = [
    {
      id: 1,
      bookId: "gn",
      chapter: 1,
      verse: 1,
      translationId: "web",
      label: "Gn 1:1",
      createdAt: 1,
    },
  ];
  const nt = [
    {
      id: 1,
      bookId: "gn",
      chapter: 1,
      verse: 1,
      translationId: "web",
      text: "A note",
      updatedAt: 1,
    },
  ];
  const st = [
    {
      id: 1,
      fontSize: "md",
      fontFamily: "serif",
      theme: "system",
      lineSpacing: 1.6,
      defaultTranslation: "web",
      activePlanId: null,
    },
  ];
  const pl = [
    { id: 1, planId: "gospels30", startedAt: 1, completed: "[]", updatedAt: 1 },
  ];
  const pr = [
    {
      id: 1,
      title: "Prayer",
      content: "c",
      status: "active",
      createdAt: 1,
      updatedAt: 1,
    },
  ];
  const ap = [
    { id: 1, bookId: "gn", chapter: 1, time: 10, duration: 100, updatedAt: 1 },
  ];
  const po = [
    { id: 1, translationId: "web", bookId: "gn", chapter: 1, updatedAt: 1 },
  ];

  const store: any = {
    bookmarks: bm,
    notes: nt,
    settings: st,
    plans: pl,
    prayers: pr,
    audioPosition: ap,
    position: po,
  };

  const makeTable = (key: string) => ({
    toArray: vi.fn(() => Promise.resolve([...store[key]])),
    toCollection: vi.fn(() => ({
      first: vi.fn(() => Promise.resolve(store[key][0])),
    })),
    clear: vi.fn(() => Promise.resolve()),
    add: vi.fn(async (item: any) => {
      store[key] = [...store[key], item];
      return 1;
    }),
    bulkAdd: vi.fn(async (items: any[]) => {
      store[key] = [...items];
      return items.length;
    }),
  });

  const tables: Record<string, any> = {};
  for (const key of [
    "bookmarks",
    "notes",
    "settings",
    "plans",
    "prayers",
    "audioPosition",
    "position",
  ]) {
    tables[key] = makeTable(key);
  }
  return { db: tables };
});

import { db } from "../../db";

beforeEach(async () => {
  vi.resetAllMocks();
  await importData(seedData);
});

describe("sync export/import", () => {
  it("exports all data to JSON", async () => {
    const data = await exportData();
    expect(data.version).toBe(1);
    expect(data.bookmarks).toEqual(bookmarks);
    expect(data.notes).toEqual(notes);
    expect(data.settings).toEqual(settings);
    expect(data.plans).toEqual(plans);
    expect(data.prayers).toEqual(prayers);
    expect(data.audioPosition).toEqual(audioPosition);
    expect(data.positions).toEqual(positions);
    expect(typeof data.exportedAt).toBe("number");
  });

  it("serializes and parses round-trip", () => {
    const data = { exportedAt: 1, version: 1, bookmarks };
    const text = serializeData(data);
    expect(parseSerializedData(text)).toEqual(data);
  });

  it("imports data back into db", async () => {
    const newBookmarks = [
      {
        id: 9,
        bookId: "jn",
        chapter: 3,
        verse: 16,
        translationId: "web",
        label: "Jn 3:16",
        createdAt: 2,
      },
    ];

    const result = await importData({
      exportedAt: 2,
      version: 1,
      bookmarks: newBookmarks,
    });
    expect(result.ok).toBe(true);

    const stored = await db.bookmarks.toArray();
    expect(stored).toEqual(newBookmarks);
  });

  it("parse throws on invalid JSON", () => {
    expect(() => parseSerializedData("not json")).toThrow();
  });
});
