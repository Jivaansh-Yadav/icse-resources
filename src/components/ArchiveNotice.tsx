import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

// =============================================
// ARCHIVE NOTICE
// One-time modal telling visitors this catalogue is frozen and pointing them
// at Lambda Prep (https://lambda-prep.pages.dev).
//
// Copy + chrome are deliberately monochrome to sit inside this site's
// black-and-white system; the only flourish is a closed-book glyph that
// echoes the splash screen, plus mono "file metadata" labels.
// =============================================

const LAMBDA_PREP_URL =
  "https://lambda-prep.pages.dev/?utm_source=icse-resources-old&utm_medium=archive-notice";

const SEEN_KEY = "icse_old_archive_notice_seen";
const HIDDEN_KEY = "icse_old_archive_notice_hidden";

const ArchiveNotice = () => {
  const [open, setOpen] = useState(false);

  const dismiss = (permanent: boolean) => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
      if (permanent) localStorage.setItem(HIDDEN_KEY, "1");
    } catch (_) {
      /* ignore */
    }
  };

  useEffect(() => {
    try {
      if (localStorage.getItem(HIDDEN_KEY) === "1") return;
      if (sessionStorage.getItem(SEEN_KEY) === "1") return;
    } catch (_) {
      /* storage blocked — still show the notice */
    }

    // Wait for the splash screen to clear before interrupting the visit.
    const timer = window.setTimeout(() => setOpen(true), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="archive-notice-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-notice-title"
      onClick={() => dismiss(false)}
    >
      <div
        className="archive-notice-panel relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-7 text-card-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => dismiss(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Closed book — the splash screen's motif, now shut. */}
        <div className="archive-notice-book mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background">
          <svg width="30" height="34" viewBox="0 0 30 34" fill="none" aria-hidden="true">
            <rect x="1.75" y="1.75" width="26.5" height="30.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5.5 1.75V32.25" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10h12M10.5 15h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
          </svg>
        </div>

        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          icse-resources &middot; archived
        </p>

        <h2 id="archive-notice-title" className="mb-2.5 text-xl font-semibold tracking-tight text-foreground">
          This shelf has closed.
        </h2>

        <p className="text-sm leading-relaxed text-muted-foreground">
          No new papers are landing here, and the older folders have gone stale. The collection now
          lives on <span className="font-medium text-foreground">Lambda Prep</span> — interactive class
          hubs, lectures and revision notes that play right in the page, and one sorted catalogue for
          ICSE&nbsp;9, ICSE&nbsp;10, ISC&nbsp;11 and ISC&nbsp;12.
        </p>

        <div className="my-5 border-t border-dashed border-border" />

        <a
          href={LAMBDA_PREP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Move to Lambda Prep
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>

        <button
          type="button"
          onClick={() => dismiss(false)}
          className="mt-2 w-full rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          Stay in the archive
        </button>

        <div className="mt-4 flex items-center justify-between gap-3 empty:hidden">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 sm:inline">
            no sign-in &middot; free &middot; weekly refresh
          </span>
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="whitespace-nowrap text-[11px] text-muted-foreground underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
          >
            Don&rsquo;t show again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveNotice;
