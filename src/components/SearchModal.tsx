import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, FileText, Eye, Download, X } from "lucide-react";
import Fuse, { type FuseResult, type FuseResultMatch } from "fuse.js";

// ---------------------
// TYPE: each item in search-index.json
// ---------------------
interface SearchItem {
  name: string;
  id: string;
  path: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

// =============================================
// SPOTLIGHT SEARCH MODAL
// Fuzzy search across all files with preview & download
// =============================================
const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewFile, setPreviewFile] = useState<SearchItem | null>(null);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // --- Load the flattened search index once ---
  useEffect(() => {
    fetch("/data/search-index.json")
      .then((r) => r.json())
      .then((data: SearchItem[]) => setAllItems(data));
  }, []);

  // --- Create the Fuse instance once (memoized) ---
  const fuse = useMemo(() => {
    if (allItems.length === 0) return null;
    return new Fuse(allItems, {
      keys: ["name", "path"],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true,
    });
  }, [allItems]);

  // --- Debounced search ---
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

  // --- Auto-focus input when modal opens ---
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setPreviewFile(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // --- Keyboard navigation ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        setPreviewFile(results[selectedIndex].item);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (previewFile) setPreviewFile(null);
        else onClose();
      }
    },
    [results, selectedIndex, previewFile, onClose]
  );

  // --- Scroll selected item into view ---
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // --- Global Ctrl+K / Cmd+K shortcut ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        // Opening is handled by parent
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  // Google Drive URLs
  const previewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;
  const downloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

  return (
    <>
      {/* ---- Backdrop ---- */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => { if (previewFile) setPreviewFile(null); else onClose(); }}
      />

      {/* ---- Search Panel ---- */}
      {!previewFile && (
        <div
          className="fixed z-[110] top-[15%] left-1/2 -translate-x-1/2 w-[92%] max-w-xl animate-scale-in"
          onKeyDown={handleKeyDown}
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

            {/* --- Search Input --- */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files..."
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
              />
              {/* Keyboard shortcut hint */}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono">
                ESC
              </kbd>
            </div>

            {/* --- Results List --- */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
              {results.length === 0 && query.trim() && (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No files found
                </p>
              )}
              {results.length === 0 && !query.trim() && (
                <p className="text-center text-muted-foreground text-sm py-10">
                  Start typing to search across all files…
                </p>
              )}

              {results.map((result, i) => (
                <div
                  key={result.item.id}
                  className={`group flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-100
                    ${i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"}`}
                  onClick={() => setPreviewFile(result.item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />

                  <div className="flex-1 min-w-0">
                    {/* File name with highlights */}
                    <p className="text-sm font-medium text-foreground truncate">
                      <HighlightText
                        text={result.item.name}
                        matches={result.matches?.filter((m) => m.key === "name")}
                      />
                    </p>
                    {/* Path with highlights */}
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      <HighlightText
                        text={result.item.path}
                        matches={result.matches?.filter((m) => m.key === "path")}
                      />
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewFile(result.item); }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Preview"
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
                    >
                      <Download className="h-3.5 w-3.5 text-primary" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Footer hint --- */}
            {results.length > 0 && (
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-border text-xs text-muted-foreground">
                <span>↑↓ navigate · Enter to preview · Esc to close</span>
                <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== PDF PREVIEW ==================== */}
      {previewFile && (
        <div className="fixed inset-[3%] z-[120] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <h3 className="text-sm font-medium text-foreground truncate flex-1">{previewFile.name}</h3>
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[200px]">{previewFile.path}</span>
            <a
              href={downloadUrl(previewFile.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4 text-primary" />
            </a>
            <button
              onClick={() => setPreviewFile(null)}
              className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95"
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

// =============================================
// HIGHLIGHT TEXT — marks matched characters from Fuse.js
// =============================================
const HighlightText = ({
  text,
  matches,
}: {
  text: string;
  matches?: readonly FuseResultMatch[];
}) => {
  if (!matches || matches.length === 0) return <>{text}</>;

  // Merge all match indices
  const indices: [number, number][] = [];
  matches.forEach((m) => {
    m.indices.forEach(([start, end]) => indices.push([start, end]));
  });
  // Sort by start position
  indices.sort((a, b) => a[0] - b[0]);

  const parts: JSX.Element[] = [];
  let lastEnd = 0;

  indices.forEach(([start, end], i) => {
    if (start > lastEnd) {
      parts.push(<span key={`t-${i}`}>{text.slice(lastEnd, start)}</span>);
    }
    parts.push(
      <mark key={`m-${i}`} className="bg-primary/20 text-foreground rounded-sm px-0.5">
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
