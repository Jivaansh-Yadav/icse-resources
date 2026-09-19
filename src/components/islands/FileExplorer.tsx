import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Folder,
  FileText,
  Eye,
  Download,
  X,
  Search,
  ChevronRight,
  Loader2,
} from "lucide-react";

export interface FileNode {
  name: string;
  type: "folder" | "file";
  id?: string;
  children?: FileNode[];
}

export interface FileExplorerProps {
  data?: FileNode | null;
  dataType?: "study" | "cisce" | null;
  initialPath?: string;
  open?: boolean;
  onClose: () => void;
}

/**
 * FILE EXPLORER ISLAND
 * Provides hierarchical tree navigation, breadcrumbs, in-folder search,
 * slide transitions, and Google Drive preview/download.
 * Supports on-demand fetching of study-materials.json or cisce-resources.json.
 */
export const FileExplorer: React.FC<FileExplorerProps> = ({
  data: directData,
  dataType,
  initialPath,
  open = true,
  onClose,
}) => {
  const [rootData, setRootData] = useState<FileNode | null>(directData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [path, setPath] = useState<FileNode[]>([]);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Slide animation direction
  const [slideDir, setSlideDir] = useState<"left" | "right" | "enter-left" | "enter-right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync directData if provided
  useEffect(() => {
    if (directData) {
      setRootData(directData);
      setPath([directData]);
    }
  }, [directData]);

  // On-demand fetch if dataType provided and directData not provided
  useEffect(() => {
    if (!directData && dataType && open) {
      setLoading(true);
      setError(null);
      const url =
        dataType === "study"
          ? "/data/study-materials.json"
          : "/data/cisce-resources.json";

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load ${url}`);
          return res.json();
        })
        .then((fetched: FileNode) => {
          setRootData(fetched);
          setLoading(false);

          // Handle initialPath if given
          if (initialPath && fetched.children) {
            const segments = initialPath.split("/").filter(Boolean);
            const newPath: FileNode[] = [fetched];
            let curr = fetched;
            for (const seg of segments) {
              const match = curr.children?.find(
                (c) => c.name.toLowerCase() === seg.toLowerCase()
              );
              if (match) {
                newPath.push(match);
                curr = match;
              } else {
                break;
              }
            }
            setPath(newPath);
          } else {
            setPath([fetched]);
          }
        })
        .catch((err) => {
          console.error("FileExplorer data fetch error:", err);
          setError("Failed to load resource directory. Please try again.");
          setLoading(false);
        });
    }
  }, [directData, dataType, open, initialPath]);

  // Current folder is top of path stack
  const current = path.length > 0 ? path[path.length - 1] : rootData;

  // Slide transition helper
  const animateTransition = (dir: "left" | "right", cb: () => void) => {
    if (animating) return;
    setSlideDir(dir);
    setAnimating(true);
    setTimeout(() => {
      cb();
      setSlideDir(null);
      setFilterQuery("");
      requestAnimationFrame(() => {
        setSlideDir(dir === "left" ? "enter-left" : "enter-right");
        setAnimating(false);
        setTimeout(() => setSlideDir(null), 200);
      });
    }, 150);
  };

  // Navigate deeper into a folder
  const navigateInto = (folder: FileNode) => {
    animateTransition("left", () => setPath((p) => [...p, folder]));
  };

  // Navigate back one step
  const goBack = () => {
    if (path.length > 1) {
      animateTransition("right", () => setPath((p) => p.slice(0, -1)));
    }
  };

  // Jump directly to breadcrumb level
  const jumpToBreadcrumb = (index: number) => {
    if (index === path.length - 1 || animating) return;
    const dir = index < path.length - 1 ? "right" : "left";
    animateTransition(dir, () => setPath((p) => p.slice(0, index + 1)));
  };

  // Keyboard navigation for Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (previewFile) {
          setPreviewFile(null);
        } else {
          onClose();
        }
      }
    },
    [previewFile, onClose]
  );

  // Filtered children based on in-folder search
  const filteredChildren = useMemo(() => {
    if (!current?.children) return [];
    if (!filterQuery.trim()) return current.children;
    const q = filterQuery.toLowerCase().trim();
    return current.children.filter((child) => child.name.toLowerCase().includes(q));
  }, [current, filterQuery]);

  if (!open) return null;

  const downloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;
  const previewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

  const getSlideClass = () => {
    if (slideDir === "left") return "slide-exit-left";
    if (slideDir === "right") return "slide-exit-right";
    if (slideDir === "enter-left") return "slide-enter-left";
    if (slideDir === "enter-right") return "slide-enter-right";
    return "";
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1} className="outline-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          if (previewFile) setPreviewFile(null);
          else onClose();
        }}
        aria-hidden="true"
      />

      {/* Main Modal Window */}
      <div
        className="fixed inset-[2%] sm:inset-[4%] z-50 flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="File Explorer"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 sm:px-6 py-3.5 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {path.length > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-accent text-foreground transition-colors active:scale-95 shrink-0"
                aria-label="Back"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-sm font-medium">
              {path.map((node, idx) => {
                const isLast = idx === path.length - 1;
                return (
                  <React.Fragment key={`${node.name}-${idx}`}>
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <button
                      type="button"
                      onClick={() => jumpToBreadcrumb(idx)}
                      className={`truncate max-w-[120px] sm:max-w-[200px] px-1.5 py-0.5 rounded transition-colors ${
                        isLast
                          ? "text-foreground font-semibold cursor-default"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      title={node.name}
                    >
                      {node.name}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors active:scale-95 shrink-0"
            aria-label="Close explorer"
            title="Close explorer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* In-Folder Search Filter Bar */}
        {current && current.children && current.children.length > 0 && (
          <div className="px-4 sm:px-6 py-2 border-b border-border bg-card/30 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Filter in "${current.name}"...`}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Filter items"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground p-1"
                aria-label="Clear filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {filteredChildren.length} item{filteredChildren.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading resources directory…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-destructive font-medium mb-2">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Close Explorer
              </button>
            </div>
          )}

          {!loading && !error && current && (
            <div ref={contentRef} className={`flex flex-col gap-2.5 transition-all ${getSlideClass()}`}>
              {filteredChildren.map((item) => (
                <div
                  key={item.name}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/25 hover:bg-accent/40 transition-all duration-150 cursor-pointer"
                  onClick={() => (item.type === "folder" ? navigateInto(item) : setPreviewFile(item))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      item.type === "folder" ? navigateInto(item) : setPreviewFile(item);
                    }
                  }}
                >
                  {/* Icon */}
                  {item.type === "folder" ? (
                    <Folder className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}

                  {/* Name */}
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{item.name}</span>

                  {/* Sub-item count badge for folders */}
                  {item.type === "folder" && item.children && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60">
                      {item.children.length}
                    </span>
                  )}

                  {/* Actions for files */}
                  {item.type === "file" && item.id && (
                    <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(item);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        title="Preview"
                        aria-label={`Preview ${item.name}`}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </button>
                      <a
                        href={downloadUrl(item.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        title="Download"
                        aria-label={`Download ${item.name}`}
                      >
                        <Download className="h-4 w-4 text-primary" />
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {filteredChildren.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-16">
                  {filterQuery ? (
                    <p>No items matching "{filterQuery}" in this folder.</p>
                  ) : (
                    <p>This folder is empty.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Drive PDF Preview Modal */}
      {previewFile && previewFile.id && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setPreviewFile(null)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-[2%] sm:inset-[3%] z-[70] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-label={previewFile.name}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 sm:px-6 py-3.5 bg-card">
              <h3 className="text-sm font-medium text-foreground truncate flex-1">{previewFile.name}</h3>
              <a
                href={downloadUrl(previewFile.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Download"
                aria-label="Download"
              >
                <Download className="h-4 w-4 text-primary" />
              </a>
              <button
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
              className="flex-1 w-full border-0 bg-background"
              title={previewFile.name}
              loading="lazy"
              allow="autoplay"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FileExplorer;
