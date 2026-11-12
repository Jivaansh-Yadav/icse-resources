import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, FileText, GraduationCap, PlayCircle, X } from "lucide-react";

// =============================================
// ARCHIVE NOTICE
// Shows on every visit: this catalogue is frozen and Lambda Prep
// (https://lambda-prep.pages.dev) is the live replacement.
//
// Same sheet as the ISC 11 site uses — bottom-anchored on phones,
// centred on desktop — in this app's monochrome tokens with the hero glow.
// There is no "don't show again": the notice reappears on every reload.
// =============================================

const LAMBDA_PREP_URL =
  "https://lambda-prep.pages.dev/?utm_source=icse-resources-old&utm_medium=archive-notice";

const FEATURES = [
  { icon: GraduationCap, title: "Classes 9–12", note: "ICSE & ISC" },
  { icon: PlayCircle, title: "Video lessons", note: "Play in place" },
  { icon: FileText, title: "Sorted papers", note: "By chapter" },
];

const ArchiveNotice = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setOpen(true);
    };

    // The splash screen owns the first ~2s; queue behind it instead of
    // guessing a fixed delay, and show straight away on repeat reloads
    // where the splash is skipped.
    if (!document.querySelector(".splash-book")) {
      const timer = window.setTimeout(reveal, 400);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    const startedAt = Date.now();
    const poll = window.setInterval(() => {
      if (!document.querySelector(".splash-book") || Date.now() - startedAt > 5000) {
        window.clearInterval(poll);
        reveal();
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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
      className="archive-sheet-layer fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-sheet-title"
      onClick={() => setOpen(false)}
    >
      <div
        className="archive-sheet relative w-full max-w-xl overflow-hidden rounded-t-2xl border border-border bg-card px-5 pb-5 pt-3 text-card-foreground shadow-2xl sm:rounded-2xl sm:px-6 sm:pb-6 sm:pt-5"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Grab handle, sheet-style on phones only. */}
        <span className="archive-sheet-handle mx-auto mb-3 block h-1 w-9 rounded-full bg-border sm:hidden" aria-hidden="true" />

        {/* Glow echoing the hero's blurred orbs. */}
        <span className="archive-sheet-glow" aria-hidden="true" />

        <div className="relative flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-foreground">
            <BookOpen className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/60" aria-hidden="true" />
              Site notice
            </p>
            <h2 id="archive-sheet-title" className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              We&rsquo;ve moved to Lambda Prep.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-mr-1 -mt-1 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
          This ICSE catalogue is no longer maintained — new papers stopped arriving and the older
          folders are going stale. <span className="font-medium text-foreground">Lambda Prep</span>
          &nbsp;carries the same collection forward, plus interactive class hubs, playable lectures
          and revision notes, all sorted by subject and chapter.
        </p>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="archive-sheet-tile rounded-xl border border-border bg-background/70 px-2.5 py-2.5"
            >
              <feature.icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
              <p className="text-[12px] font-medium leading-tight text-foreground">{feature.title}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{feature.note}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            Stay here
          </button>
          <a
            href={LAMBDA_PREP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Visit Lambda Prep
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <p className="relative mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
          Free &middot; no sign-in &middot; updated weekly
        </p>
      </div>
    </div>
  );
};

export default ArchiveNotice;
