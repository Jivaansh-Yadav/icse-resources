import React, { useCallback, useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";

export type SocialModalType = "reddit" | "discord" | null;

export interface SocialModalsProps {
  activeModal: SocialModalType;
  onClose: () => void;
}

/**
 * SOCIAL MODALS ISLAND
 * Provides interactive dialogs for connecting with the ICSE Reddit & Discord communities,
 * including embedded Discord live server widget and developer contact profiles.
 */
export const SocialModals: React.FC<SocialModalsProps> = ({ activeModal, onClose }) => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, [activeModal]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModal) {
        e.preventDefault();
        onClose();
      }
    },
    [activeModal, onClose]
  );

  useEffect(() => {
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeModal, handleKeyDown]);

  if (!activeModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Reddit Dialog */}
      {activeModal === "reddit" && (
        <div
          className="fixed z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-label="Reddit Community"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <RedditIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Reddit Community</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://reddit.com/r/ICSE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:bg-accent/40 hover:border-primary/30 transition-all text-left group"
              >
                <RedditIcon className="h-8 w-8 text-primary shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">r/ICSE</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground block truncate">
                    Join 15,000+ students on Reddit
                  </span>
                </div>
              </a>

              <a
                href="https://reddit.com/u/Appropriate-Cow-3178"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:bg-accent/40 hover:border-primary/30 transition-all text-left group"
              >
                <RedditUserIcon className="h-8 w-8 text-primary shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">u/Appropriate-Cow-3178</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground block truncate">
                    Developer's Reddit profile
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Discord Dialog */}
      {activeModal === "discord" && (
        <div
          className="fixed z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-md animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-label="Discord Community"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <DiscordIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Discord Community</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              <a
                href="https://discord.gg/xGD8SnvuKX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 rounded-xl border border-border bg-background hover:bg-accent/40 transition-all text-center group"
              >
                <DiscordIcon className="h-6 w-6 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Join ICSEcord</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">Community Server</span>
              </a>

              <a
                href="https://discord.com/users/1444382978896560240"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 rounded-xl border border-border bg-background hover:bg-accent/40 transition-all text-center group"
              >
                <RedditUserIcon className="h-6 w-6 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Developer Discord</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">Send a message</span>
              </a>
            </div>

            {/* Embedded Discord Live Widget */}
            <div className="w-full flex justify-center">
              <iframe
                src={`https://discord.com/widget?id=1175417452935520316&theme=${theme}`}
                width="100%"
                height="280"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="rounded-xl border border-border shadow-inner bg-background"
                title="ICSEcord Live Discord Widget"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// SVG helper icons
const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
  </svg>
);

const RedditUserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

export default SocialModals;
