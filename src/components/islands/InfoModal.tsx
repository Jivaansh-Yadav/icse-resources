import React, { useState, useEffect, useCallback } from "react";
import { Info, GitCommit, ExternalLink, X, BookOpen, ShieldCheck, Loader2 } from "lucide-react";

export interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const GITHUB_REPO = "Jivaansh-Yadav/icse-resources";
const DEVELOPER_NAME = "Jivaansh Yadav";

interface CommitInfo {
  message: string;
  date: string;
  sha: string;
  author: string;
  url: string;
}

/**
 * INFO MODAL ISLAND
 * Displays project overview, developer credits, curriculum mission,
 * and live GitHub commit history fetched from the public repository.
 */
export const InfoModal: React.FC<InfoModalProps> = ({ open, onClose }) => {
  const [commit, setCommit] = useState<CommitInfo | null>(null);
  const [loadingCommit, setLoadingCommit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest commit when opened
  useEffect(() => {
    if (open && !commit && !loadingCommit) {
      setLoadingCommit(true);
      setError(null);
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`)
        .then((r) => {
          if (!r.ok) throw new Error(`GitHub API error ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const c = data[0];
            setCommit({
              message: c.commit.message,
              date: c.commit.author.date,
              sha: (c.sha || "").substring(0, 7),
              author: c.commit.author.name,
              url: c.html_url,
            });
          }
          setLoadingCommit(false);
        })
        .catch((e) => {
          setError(e.message || "Failed to load commit data");
          setLoadingCommit(false);
        });
    }
  }, [open, commit, loadingCommit]);

  // Escape key handler
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

  const formattedDate = commit?.date
    ? new Date(commit.date).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="fixed z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="About this site"
      >
        <div className="rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">About ICSE Resources</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mission & Overview */}
          <div className="space-y-3 mb-5 text-sm text-muted-foreground leading-relaxed">
            <p>
              Developed with dedication by{" "}
              <span className="font-semibold text-foreground">{DEVELOPER_NAME}</span> for ICSE Class 10 students.
            </p>
            <p>
              Our mission is to provide an open, lightning-fast, and comprehensive library of ICSE examination
              materials, specimen question papers, analysis of pupil performance, and subject revision notes without
              paywalls or restrictive barriers.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">6,500+ Curated Files</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">CISCE Aligned</span>
            </div>
          </div>

          {/* Latest Git Commit Card */}
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <GitCommit className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Latest Repository Commit
              </span>
            </div>

            {loadingCommit && (
              <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Checking GitHub repository for latest updates…</span>
              </div>
            )}

            {error && (
              <div className="py-2 text-xs text-destructive">
                Could not fetch commit history: {error}
              </div>
            )}

            {commit && (
              <>
                <p className="text-sm text-foreground font-medium mb-1.5 break-words line-clamp-2">
                  {commit.message.split("\n")[0]}
                </p>
                <div className="text-xs text-muted-foreground space-y-1 mb-3">
                  <p>
                    Author: <span className="text-foreground">{commit.author}</span> ·{" "}
                    <span className="font-mono px-1 py-0.5 rounded bg-muted text-foreground">
                      {commit.sha}
                    </span>
                  </p>
                  <p>
                    Timestamp: <span className="text-foreground">{formattedDate}</span>
                  </p>
                </div>
                <a
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                >
                  View on GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoModal;
