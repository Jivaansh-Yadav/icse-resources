import { useState, useRef } from "react";
import { ArrowLeft, Folder, FileText, Eye, Download, X } from "lucide-react";

// ---------------------
// TYPE: folder/file tree node
// ---------------------
interface FileNode {
  name: string;
  type: "folder" | "file";
  id?: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  data: FileNode;
  onClose: () => void;
}

// =============================================
// FILE EXPLORER — a simple modal to browse folders and preview/download files
// =============================================
const FileExplorer = ({ data, onClose }: FileExplorerProps) => {
  const [path, setPath] = useState<FileNode[]>([data]);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  // Slide animation direction: "left" = entering folder, "right" = going back
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Current folder is the last item in the path
  const current = path[path.length - 1];

  // Trigger slide animation then update path
  const animateTransition = (dir: "left" | "right", cb: () => void) => {
    setSlideDir(dir);
    setAnimating(true);
    // Wait for exit animation
    setTimeout(() => {
      cb();
      setSlideDir(null);
      // Small delay then enter
      requestAnimationFrame(() => {
        setSlideDir(dir === "left" ? "enter-left" as any : "enter-right" as any);
        setAnimating(false);
        setTimeout(() => setSlideDir(null), 200);
      });
    }, 150);
  };

  // Navigate into a subfolder
  const navigateInto = (folder: FileNode) => {
    animateTransition("left", () => setPath((p) => [...p, folder]));
  };

  // Go back one level
  const goBack = () => {
    if (path.length > 1) {
      animateTransition("right", () => setPath((p) => p.slice(0, -1)));
    }
  };

  // Google Drive download link
  // EDIT: Change this if you use a different file host
  const downloadUrl = (id: string) =>
    `https://drive.google.com/uc?export=download&id=${id}`;

  // Slide animation class
  const getSlideClass = () => {
    if (slideDir === "left") return "slide-exit-left";
    if (slideDir === "right") return "slide-exit-right";
    if ((slideDir as string) === "enter-left") return "slide-enter-left";
    if ((slideDir as string) === "enter-right") return "slide-enter-right";
    return "";
  };

  return (
    <>
      {/* ---- Dark backdrop (click to close) ---- */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* ---- Main modal ---- */}
      <div className="fixed inset-[4%] z-50 flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in">

        {/* ---- Header: back button, title, close ---- */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          {path.length > 1 && (
            <button onClick={goBack} className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-foreground truncate flex-1">{current.name}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* ---- File / folder list with slide animation ---- */}
        <div className="flex-1 overflow-y-auto p-4">
          <div ref={contentRef} className={`flex flex-col gap-2 ${getSlideClass()}`}>
            {current.children?.map((item) => (
              <div
                key={item.name}
                className="group flex items-center gap-3 rounded-xl px-4 py-3
                           border border-border bg-card shadow-sm
                           hover:shadow-md hover:border-primary/20 hover:bg-accent/40
                           transition-all duration-200 cursor-pointer"
                onClick={() => item.type === "folder" ? navigateInto(item) : setPreviewFile(item)}
              >
                {/* Folder or file icon */}
                {item.type === "folder" ? (
                  <Folder className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                )}

                {/* File/folder name */}
                <span className="flex-1 text-sm text-foreground truncate">{item.name}</span>

                {/* Preview & Download buttons — always visible on mobile, hover on desktop */}
                {item.type === "file" && item.id && (
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewFile(item); }}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </button>
                    <a
                      href={downloadUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-primary" />
                    </a>
                  </div>
                )}
              </div>
            ))}

            {/* Empty folder message */}
            {(!current.children || current.children.length === 0) && (
              <p className="text-center text-muted-foreground text-sm py-12">This folder is empty</p>
            )}
          </div>
        </div>
      </div>

      {/* ==================== PDF PREVIEW ==================== */}
      {previewFile && previewFile.id && (
        <>
          {/* Preview backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setPreviewFile(null)}
          />
          {/* Preview modal */}
          <div className="fixed inset-[3%] z-[70] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-scale-in">
            {/* Preview header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <h3 className="text-sm font-medium text-foreground truncate flex-1">{previewFile.name}</h3>
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
            {/* Google Drive PDF iframe */}
            {/* EDIT: Change the src pattern if using a different file host */}
            <iframe
              src={`https://drive.google.com/file/d/${previewFile.id}/preview`}
              className="flex-1 w-full border-0"
              title={previewFile.name}
              loading="lazy"
              allow="autoplay"
            />
          </div>
        </>
      )}
    </>
  );
};

export default FileExplorer;
