import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { Search, FileText, Eye, Download, X, Loader2 } from "lucide-react";
import Fuse, { type FuseResult, type FuseResultMatch } from "fuse.js";

const useDialogEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface SearchItem {
  name: string;
  id: string;
  path: string;
}

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * SPOTLIGHT SEARCH MODAL ISLAND
 * Provides fuzzy search across all educational resources with full keyboard navigation,
 * Drive preview iframe modal, and direct download links.
 */
export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewFile, setPreviewFile] = useState<SearchItem | null>(null);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const closePreviewRef = useRef<HTMLButtonElement>(null);
  const hasLoadedRef = useRef(false);
  const hasAttemptedRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // A failed request stays paused until the student explicitly retries.
  const loadIndex = useCallback(async () => {
    if (hasLoadedRef.current || requestInFlightRef.current) return;
    hasAttemptedRef.current = true;
    requestInFlightRef.current = true;
    setIsLoadingIndex(true);
    setLoadError(null);
    try {
      const response = await fetch("/data/search-index.json");
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data: SearchItem[] = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid search index");
      hasLoadedRef.current = true;
      setAllItems(data);
    } catch (err) {
      console.error("Failed to load search-index.json:", err);
      setLoadError("Unable to load search index. Please try again.");
    } finally {
      requestInFlightRef.current = false;
      setIsLoadingIndex(false);
    }
  }, []);

  useEffect(() => {
    if (open && !hasAttemptedRef.current) void loadIndex();
  }, [open, loadIndex]);

  // Memoized Fuse.js search engine
  const fuse = useMemo(() => {
    if (allItems.length === 0) return null;
    return new Fuse(allItems, {
      keys: ["name", "path"],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true,
    });
  }, [allItems]);

  // Debounced search evaluation
  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }
    const timer = setTimeout(() => {
      setResults(fuse.search(query).slice(0, 20));
      setSelectedIndex(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, fuse]);

  // Remember the opener once, and return focus when the entire search closes.
  useDialogEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
    setPreviewFile(null);
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  // Attach before paint so Escape and focus work immediately after opening.
  useDialogEffect(() => {
    if (!open) return;
    const dialog = previewFile ? previewDialogRef.current : searchDialogRef.current;
    if (!dialog) return;
    const initialFocus = previewFile ? closePreviewRef.current : inputRef.current;
    initialFocus?.focus({ preventScroll: true });

    const focusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
    )).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (previewFile) setPreviewFile(null);
        else onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusableElements();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const keepFocusInDialog = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        (initialFocus || dialog).focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", handleDialogKeyDown, true);
    document.addEventListener("focusin", keepFocusInDialog, true);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown, true);
      document.removeEventListener("focusin", keepFocusInDialog, true);
    };
  }, [open, previewFile]);

  // Result navigation only belongs to the search input; result buttons retain Enter.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        setPreviewFile(results[selectedIndex].item);
      }
    },
    [results, selectedIndex]
  );

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  const previewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;
  const downloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          if (previewFile) setPreviewFile(null);
          else onClose();
        }}
        aria-hidden="true"
      />

      {/* Main Search Panel */}
      {!previewFile && (
        <div
          ref={searchDialogRef}
          className="fixed z-[110] top-[12%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[94%] max-w-xl animate-scale-in"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Search files"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              {isLoadingIndex ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoadingIndex ? "Loading index..." : "Search files (e.g. Physics, 2024, Specimen)..."}
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
                aria-label="Search study files"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent sm:hidden"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error state */}
            {loadError && (
              <div className="p-4 text-center text-sm text-destructive bg-destructive/10" role="alert">
                <p>{loadError}</p>
                <button type="button" onClick={() => void loadIndex()} className="mt-2 rounded-lg border border-current px-3 py-1.5 font-medium hover:bg-destructive/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                  Retry search
                </button>
              </div>
            )}

            {/* Results List */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
              {results.length === 0 && query.trim() && !isLoadingIndex && !loadError && (
                <div className="text-center text-muted-foreground text-sm py-10">
                  <p>No files found matching "{query}"</p>
                  <p className="text-xs mt-1">Try a different keyword or subject name</p>
                </div>
              )}
              {results.length === 0 && !query.trim() && (
                <div className="text-center text-muted-foreground text-sm py-10">
                  <p>Start typing to search across 6,500+ study files…</p>
                  <p className="text-xs mt-1">Use ↑↓ arrows to navigate and Enter to preview</p>
                </div>
              )}

              {results.map((result, i) => (
                <div
                  key={result.item.id || `${result.item.path}-${i}`}
                  className={`group flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-100 ${
                    i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setPreviewFile(result.item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      <HighlightText
                        text={result.item.name}
                        matches={result.matches?.filter((m) => m.key === "name")}
                      />
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      <HighlightText
                        text={result.item.path}
                        matches={result.matches?.filter((m) => m.key === "path")}
                      />
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(result.item);
                      }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Preview"
                      aria-label={`Preview ${result.item.name}`}
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                    </button>
                    <a
                      href={downloadUrl(result.item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Download"
                      aria-label={`Download ${result.item.name}`}
                    >
                      <Download className="h-3.5 w-3.5 text-primary" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer summary bar */}
            {results.length > 0 && (
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-border text-xs text-muted-foreground bg-muted/30">
                <span>↑↓ navigate · Enter to preview · Esc to close</span>
                <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF / File Preview Modal */}
      {previewFile && (
        <div
          ref={previewDialogRef}
          className="fixed inset-[3%] z-[120] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={previewFile.name}
        >
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <h3 className="text-sm font-medium text-foreground truncate flex-1">{previewFile.name}</h3>
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[240px]">
              {previewFile.path}
            </span>
            <a
              href={downloadUrl(previewFile.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title="Download file"
              aria-label="Download file"
            >
              <Download className="h-4 w-4 text-primary" />
            </a>
            <button
              ref={closePreviewRef}
              type="button"
              onClick={() => setPreviewFile(null)}
              className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95"
              title="Close preview"
              aria-label="Close preview"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <iframe
            src={previewUrl(previewFile.id)}
            className="flex-1 w-full border-0"
            title={previewFile.name}
            loading="lazy"
            allow="autoplay"
          />
        </div>
      )}
    </>
  );
};

/**
 * Highlight matched characters from Fuse.js
 */
const HighlightText: React.FC<{
  text: string;
  matches?: readonly FuseResultMatch[];
}> = ({ text, matches }) => {
  if (!matches || matches.length === 0) return <>{text}</>;

  const indices: [number, number][] = [];
  matches.forEach((m) => {
    m.indices.forEach(([start, end]) => indices.push([start, end]));
  });
  indices.sort((a, b) => a[0] - b[0]);

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  indices.forEach(([start, end], i) => {
    if (start > lastEnd) {
      parts.push(<span key={`text-${i}`}>{text.slice(lastEnd, start)}</span>);
    }
    parts.push(
      <mark key={`mark-${i}`} className="bg-primary/20 text-foreground font-semibold rounded-sm px-0.5">
        {text.slice(start, end + 1)}
      </mark>
    );
    lastEnd = end + 1;
  });

  if (lastEnd < text.length) {
    parts.push(<span key="tail">{text.slice(lastEnd)}</span>);
  }

  return <>{parts}</>;
};

export default SearchModal;
