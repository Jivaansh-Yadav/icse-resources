import React, { useState, useEffect, useCallback } from "react";
import { Brain, X, Maximize2, Minimize2, ExternalLink, Loader2 } from "lucide-react";

export interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

const QUIZ_URL = "https://shs-pyqp-project.vercel.app/resources";

/**
 * QUIZ MODAL ISLAND
 * Embeds interactive ICSE quizzes web application with iframe loading indicator,
 * fullscreen toggling, external link shortcut, and keyboard navigation.
 */
export const QuizModal: React.FC<QuizModalProps> = ({ open, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state whenever modal opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  // Global Escape key listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        className={`fixed z-[110] transition-all duration-200 flex items-center justify-center p-2 sm:p-4 ${
          isFullscreen
            ? "inset-0 p-0"
            : "inset-[2%] sm:inset-[4%] max-w-7xl max-h-[95vh] mx-auto my-auto"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Interactive Quizzes"
      >
        <div className="relative w-full h-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/90 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <Brain className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-foreground leading-none">
                  Interactive Quizzes
                </h3>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Practice questions and test your preparation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Open in new tab link */}
              <a
                href={QUIZ_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Open quizzes in new tab"
                aria-label="Open quizzes in new tab"
              >
                <ExternalLink className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </a>

              {/* Fullscreen toggle button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                ) : (
                  <Maximize2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                )}
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-95"
                title="Close quizzes"
                aria-label="Close quizzes"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body with loading state and iframe */}
          <div className="relative flex-1 w-full bg-background overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Loading interactive quiz portal…</p>
              </div>
            )}

            <iframe
              src={QUIZ_URL}
              title="Interactive Quizzes"
              className="w-full h-full border-0 bg-background"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizModal;
