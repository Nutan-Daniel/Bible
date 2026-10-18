import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  NotebookPen,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { loadBible, getBook, getChapter } from "../lib/bible";
import {
  getTranslationMeta,
  getAvailableTranslations,
} from "../lib/translation";
import { loadCrossRefs, getCrossRefs } from "../lib/crossrefs";
import type { CrossRef } from "../types/crossref";
import { useBookmarks } from "../hooks/useBookmarks";
import { useHighlights } from "../hooks/useHighlights";
import { useNotes } from "../hooks/useNotes";
import { useSettings } from "../hooks/useSettings";
import type { BibleData, Book, TranslationId } from "../types/bible";
import type { CrossRefBook } from "../types/crossref";
import type { AudioSource } from "../types/audio";
import {
  highlightColorClasses,
  highlightColors,
  type HighlightColor,
} from "../types/bible";
import { useAudio } from "../hooks/useAudio";
import AudioPlayerComponent from "../components/AudioPlayer";
import { db } from "../db";

export default function Reader() {
  const params = useParams();
  const navigate = useNavigate();
  const { settings, update: updateSettings } = useSettings();
  const [data, setData] = useState<BibleData | null>(null);
  const [crossRefBook, setCrossRefBook] = useState<CrossRefBook | null>(null);
  const [translationId, setTranslationId] = useState<TranslationId>(
    settings.defaultTranslation,
  );
  const [bookId, setBookId] = useState(params.bookId ?? "gn");
  const [chapterNum, setChapterNum] = useState(Number(params.chapter ?? 1));
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [crossRefOpen, setCrossRefOpen] = useState(false);
  const [crossRefVerse, setCrossRefVerse] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"books" | "chapters">("books");
  const [noteText, setNoteText] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [existingNoteId, setExistingNoteId] = useState<number | null>(null);
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { loadSource } = useAudio();

  if (settings.defaultTranslation !== translationId) {
    setTranslationId(settings.defaultTranslation);
    setBookId("gn");
    setChapterNum(1);
    setSelectedVerse(null);
    setCrossRefOpen(false);
  }
  const {
    bookmarks,
    add: addBookmark,
    remove: removeBookmark,
  } = useBookmarks(translationId);
  const {
    highlights,
    add: addHighlight,
    remove: removeHighlight,
  } = useHighlights(translationId);
  const {
    forVerse,
    save: saveNote,
    remove: removeNote,
  } = useNotes(translationId);

  const [highlightColor, setHighlightColor] =
    useState<HighlightColor>("yellow");

  useEffect(() => {
    loadBible(translationId).then(setData);
  }, [translationId]);

  useEffect(() => {
    loadCrossRefs(bookId).then(setCrossRefBook);
  }, [bookId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) {
        if (params.bookId) setBookId(params.bookId);
        if (params.chapter) setChapterNum(Number(params.chapter));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.bookId, params.chapter]);

  useEffect(() => {
    if (!data) return;
    void db.position.add({
      bookId,
      chapter: chapterNum,
      translationId,
      updatedAt: Date.now(),
    });
  }, [data, bookId, chapterNum, translationId]);

  useEffect(() => {
    navigate(`/read/${bookId}/${chapterNum}`, { replace: true });
  }, [bookId, chapterNum, navigate]);

  useEffect(() => {
    if (audioSource) loadSource(audioSource);
  }, [audioSource, loadSource]);

  const book = data ? getBook(data, bookId) : undefined;
  const chapter = book ? getChapter(book, chapterNum) : undefined;

  const isBookmarked = (v: number) =>
    bookmarks.some(
      (b) => b.bookId === bookId && b.chapter === chapterNum && b.verse === v,
    );

  const toggleBookmark = async (v: number) => {
    const existing = bookmarks.find(
      (b) => b.bookId === bookId && b.chapter === chapterNum && b.verse === v,
    );
    if (existing?.id != null) await removeBookmark(existing.id);
    else
      await addBookmark({
        bookId,
        chapter: chapterNum,
        verse: v,
        label: `${book?.name} ${chapterNum}:${v}`,
      });
    setAnnouncement(`Bookmarked ${book?.name} ${chapterNum}:${v}`);
  };

  const isHighlighted = (v: number) =>
    highlights.some(
      (h) => h.bookId === bookId && h.chapter === chapterNum && h.verse === v,
    );

  const toggleHighlight = async (v: number) => {
    const existing = highlights.find(
      (h) => h.bookId === bookId && h.chapter === chapterNum && h.verse === v,
    );
    if (existing?.id != null) await removeHighlight(existing.id);
    else
      await addHighlight({
        bookId,
        chapter: chapterNum,
        verse: v,
        color: highlightColor,
        translationId,
      });
    setAnnouncement(`Highlighted ${book?.name} ${chapterNum}:${v}`);
  };

  const openNote = async (v: number) => {
    setSelectedVerse(v);
    const n = await forVerse(bookId, chapterNum, v);
    setExistingNoteId(n?.id ?? null);
    setNoteText(n?.text ?? "");
    setNoteOpen(true);
  };

  const saveNoteHandler = async () => {
    if (selectedVerse == null) return;
    if (noteText.trim() === "") {
      if (existingNoteId != null) await removeNote(existingNoteId);
    } else {
      await saveNote({
        bookId,
        chapter: chapterNum,
        verse: selectedVerse,
        text: noteText,
      });
    }
    setNoteOpen(false);
  };

  const copyVerse = async (v: number) => {
    const text = chapter?.verses.find((x) => x.number === v)?.text;
    if (text)
      await navigator.clipboard?.writeText(
        `${book?.name} ${chapterNum}:${v} — ${text}`,
      );
    setAnnouncement(`Copied ${book?.name} ${chapterNum}:${v}`);
  };

  const fontSizeClass = (size: string): string => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const goPrev = () => {
    if (!data || !book) return;
    if (chapterNum > 1) setChapterNum((c) => c - 1);
    else {
      const idx = data.books.findIndex((b) => b.id === bookId);
      if (idx > 0) {
        const prev = data.books[idx - 1];
        setBookId(prev.id);
        setChapterNum(prev.chapters.length);
      }
    }
  };

  const goNext = () => {
    if (!data || !book) return;
    if (chapterNum < book.chapters.length) setChapterNum((c) => c + 1);
    else {
      const idx = data.books.findIndex((b) => b.id === bookId);
      if (idx < data.books.length - 1) {
        const next = data.books[idx + 1];
        setBookId(next.id);
        setChapterNum(1);
      }
    }
  };

  const switchTranslation = useCallback(
    async (id: TranslationId) => {
      setTranslationId(id);
      await updateSettings({ defaultTranslation: id });
      setBookId("gn");
      setChapterNum(1);
      setSelectedVerse(null);
      setCrossRefOpen(false);
    },
    [updateSettings],
  );

  const handleVerseClick = (v: number) => {
    const refs = getCrossRefs(crossRefBook, chapterNum, v);
    if (refs && refs.length > 0) {
      setSelectedVerse(v);
      setCrossRefVerse(v);
      setCrossRefOpen(true);
    } else {
      setSelectedVerse(selectedVerse === v ? null : v);
      setCrossRefOpen(false);
    }
  };

  const goToCrossRef = (ref: CrossRef) => {
    setCrossRefOpen(false);
    setSelectedVerse(null);
    navigate(`/read/${ref.bookId}/${ref.chapter}#v${ref.verse}`, {
      replace: true,
    });
    setAnnouncement(
      `Navigated to ${ref.bookId.toUpperCase()} ${ref.chapter}:${ref.verse}`,
    );
  };

  if (!data) return <div className="p-6 text-center">Loading…</div>;

  return (
    <div className="space-y-4">
      {settings.ariaLiveEnabled && (
        <div className="sr-only" aria-live="polite">
          {announcement}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={goPrev}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Previous chapter"
        >
          <ChevronLeft />
        </button>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            onClick={() => {
              setPickerMode("books");
              setPickerOpen(true);
            }}
            className="flex-1 text-center font-semibold rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {book?.name} {chapterNum}
          </button>
          <select
            value={translationId}
            onChange={(e) => switchTranslation(e.target.value as TranslationId)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-sm"
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
        <button
          onClick={goNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Next chapter"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">
          Audio source URL:
        </label>
        <input
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio/gn1.mp3"
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-xs flex-1"
        />
        <button
          onClick={() => {
            if (!audioUrl) {
              setAudioSource(null);
              return;
            }
            setAudioSource({ bookId, chapter: chapterNum, url: audioUrl });
          }}
          className="px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Set
        </button>
      </div>

      <article
        className={`font-${settings.fontFamily} ${fontSizeClass(settings.fontSize)}`}
        style={{ lineHeight: settings.lineSpacing }}
      >
        {chapter?.verses.map((v) => {
          const selected = selectedVerse === v.number;
          const bookmarked = isBookmarked(v.number);
          const highlighted = isHighlighted(v.number);
          const refs = getCrossRefs(crossRefBook, chapterNum, v.number);
          const hasRefs = refs ? refs.length > 0 : false;
          const highlightClass =
            highlighted && highlightColorClasses[highlightColor];
          return (
            <p
              key={v.number}
              onClick={() => handleVerseClick(v.number)}
              className={`mb-2 cursor-pointer rounded-lg px-2 py-1 transition ${highlightClass ? highlightClass : ""} ${selected ? "bg-indigo-100 dark:bg-indigo-900/40" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <sup className="text-xs text-gray-500 mr-1">{v.number}</sup>
              {v.text}
              {hasRefs && (
                <span className="ml-1 text-indigo-500" title="Cross-references">
                  *
                </span>
              )}
              {bookmarked && <span className="ml-1 text-amber-500">★</span>}
              {highlighted && (
                <span className="ml-1 text-xs opacity-60">
                  {highlightColor}
                </span>
              )}
            </p>
          );
        })}
      </article>

      {selectedVerse != null && crossRefOpen && crossRefVerse != null && (
        <div className="sticky bottom-36 left-0 right-0 mx-auto max-w-3xl rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Cross-references — {book?.name} {chapterNum}:{crossRefVerse}
            </h4>
            <button
              onClick={() => setCrossRefOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close cross-references"
            >
              <X size={16} />
            </button>
          </div>
          <ul className="space-y-1">
            {getCrossRefs(crossRefBook, chapterNum, crossRefVerse)?.map(
              (ref) => (
                <li
                  key={`${ref.bookId}:${ref.chapter}:${ref.verse}`}
                  onClick={() => goToCrossRef(ref)}
                  className="px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer text-sm flex items-center justify-between gap-2"
                >
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {ref.bookId.toUpperCase()} {ref.chapter}:{ref.verse}
                  </span>
                  <LinkIcon size={14} className="text-gray-400" />
                </li>
              ),
            )}
          </ul>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Tap a reference to open it
          </p>
        </div>
      )}

      {selectedVerse != null && !crossRefOpen && (
        <div className="sticky bottom-20 left-0 right-0 mx-auto max-w-3xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-3 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => toggleBookmark(selectedVerse)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isBookmarked(selectedVerse) ? "Unbookmark" : "Bookmark"}
          </button>
          <div className="relative">
            <button
              onClick={() => setHighlightPickerOpen(!highlightPickerOpen)}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              <span
                className={`inline-block w-3 h-3 rounded-full ${highlightColorClasses[highlightColor]}`}
              />
              Highlight
            </button>
            {highlightPickerOpen && (
              <div className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800 shadow-lg">
                {highlightColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setHighlightColor(c);
                      toggleHighlight(selectedVerse);
                      setHighlightPickerOpen(false);
                    }}
                    className={`w-8 h-8 rounded-full ${highlightColorClasses[c]} ${isHighlighted(selectedVerse) && highlightColor === c ? "ring-2 ring-indigo-500" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => openNote(selectedVerse)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
          >
            <NotebookPen size={16} /> Note
          </button>
          <button
            onClick={() => copyVerse(selectedVerse)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
          >
            <Copy size={16} /> Copy
          </button>
          <button
            onClick={() => setSelectedVerse(null)}
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {noteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setNoteOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2">
              Note — {book?.name} {chapterNum}:{selectedVerse}
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-2"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setNoteOpen(false)}
                className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveNoteHandler}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-auto bg-white dark:bg-gray-900 rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {pickerMode === "books" ? (
              <>
                <h3 className="font-semibold mb-3">Choose book</h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.books.map((b: Book) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBookId(b.id);
                        setPickerMode("chapters");
                      }}
                      className={`text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${b.id === bookId ? "bg-indigo-100 dark:bg-indigo-900/40" : ""}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setPickerMode("books")}
                    className="text-indigo-600 dark:text-indigo-400"
                  >
                    ← Books
                  </button>
                  <h3 className="font-semibold">{book?.name} — chapter</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {book?.chapters.map((c) => (
                    <button
                      key={c.number}
                      onClick={() => {
                        setChapterNum(c.number);
                        setPickerOpen(false);
                      }}
                      className={`px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${c.number === chapterNum ? "bg-indigo-600 text-white" : ""}`}
                    >
                      {c.number}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {audioSource && <AudioPlayerComponent source={audioSource} />}
    </div>
  );
}
