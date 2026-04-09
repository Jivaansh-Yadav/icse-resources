import { useState, useEffect, useCallback } from "react";
import { BookOpen, GraduationCap, Moon, Sun, Search, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import FileExplorer from "@/components/FileExplorer";
import SearchModal from "@/components/SearchModal";

// ---------------------
// TYPE: folder/file tree structure used by the JSON data
// ---------------------
interface FileNode {
  name: string;
  type: "folder" | "file";
  id?: string;
  children?: FileNode[];
}

// =============================================
// MAIN PAGE COMPONENT
// =============================================
const Index = () => {
  const { theme, toggle } = useTheme();
  const [cisceData, setCisceData] = useState<FileNode | null>(null);
  const [studyData, setStudyData] = useState<FileNode | null>(null);
  const [activeExplorer, setActiveExplorer] = useState<"cisce" | "study" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Show splash only once per browser session
  const [splashState, setSplashState] = useState<"playing" | "exiting" | "done">(() =>
    sessionStorage.getItem("splashShown") ? "done" : "playing"
  );

  // Fetch the two JSON data files on mount
  useEffect(() => {
    fetch("/data/cisce-resources.json").then((r) => r.json()).then(setCisceData);
    fetch("/data/study-materials.json").then((r) => r.json()).then(setStudyData);
  }, []);

  // After the loading bar animation finishes (~1.5s), start exit
  const handleBarEnd = useCallback(() => {
    setTimeout(() => {
      setSplashState("exiting");
      // After exit animation (0.35s), hide splash
      setTimeout(() => {
        setSplashState("done");
        sessionStorage.setItem("splashShown", "true");
      }, 350);
    }, 250);
  }, []);

  // Listen for the bar animation ending
  useEffect(() => {
    if (splashState !== "playing") return;
    const bar = document.getElementById("splash-bar");
    if (!bar) return;
    const handler = () => handleBarEnd();
    bar.addEventListener("animationend", handler);
    return () => bar.removeEventListener("animationend", handler);
  }, [splashState, handleBarEnd]);

  const activeData =
    activeExplorer === "cisce" ? cisceData :
      activeExplorer === "study" ? studyData :
        null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">

      {/* ==================== SPLASH SCREEN ====================
           All animation is driven by CSS classes in index.css.
           EDIT: See the @keyframes in index.css to change timing/effects.
      */}
      {splashState !== "done" && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background ${splashState === "exiting" ? "splash-exit" : ""}`}>

          {/* --- Animated Book (CSS-only, theme-aware) --- */}
          <div className="splash-book">
            <div
              className="w-40 h-40 flex items-center justify-center"
              style={{ perspective: "600px", perspectiveOrigin: "50% 95%" }}>

              <div
                className="relative"
                style={{
                  width: 90,
                  height: 80,
                  transformStyle: "preserve-3d",
                  transform: "translateX(35px) rotateX(12deg)"
                }}>

                {/* Back cover (static) */}
                <svg className="absolute" width="60" height="80" viewBox="0 0 60 80" fill="none">
                  <rect x="1" y="1" width="58" height="78" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  {/* Spine line removed for cleaner centered look */}
                </svg>

                {/* Page 3 (innermost — flips last) */}
                <div className="absolute book-page-3" style={{ width: 56, height: 74, left: 0, top: 3, transformOrigin: "left center" }}>
                  <svg width="56" height="74" viewBox="0 0 56 74" fill="none">
                    <rect x="1" y="1" width="54" height="72" rx="1" stroke="currentColor" strokeWidth="1" />
                    <line x1="8" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                    <line x1="8" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                    <line x1="8" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                  </svg>
                </div>

                {/* Page 2 */}
                <div className="absolute book-page-2" style={{ width: 56, height: 74, left: 0, top: 3, transformOrigin: "left center" }}>
                  <svg width="56" height="74" viewBox="0 0 56 74" fill="none">
                    <rect x="1" y="1" width="54" height="72" rx="1" stroke="currentColor" strokeWidth="1" />
                    <line x1="8" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                    <line x1="8" y1="26" x2="38" y2="26" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                  </svg>
                </div>

                {/* Page 1 (flips first after cover) */}
                <div className="absolute book-page-1" style={{ width: 56, height: 74, left: 0, top: 3, transformOrigin: "left center" }}>
                  <svg width="56" height="74" viewBox="0 0 56 74" fill="none">
                    <rect x="1" y="1" width="54" height="72" rx="1" stroke="currentColor" strokeWidth="1" />
                    <line x1="8" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                    <line x1="8" y1="28" x2="40" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                    <line x1="8" y1="36" x2="48" y2="36" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                  </svg>
                </div>

                {/* Front cover (opens first) */}
                <div className="absolute book-cover" style={{ width: 60, height: 80, left: 0, top: 0, transformOrigin: "left center" }}>
                  <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                    <rect x="1" y="1" width="58" height="78" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="14" y1="30" x2="46" y2="30" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                    <line x1="18" y1="38" x2="42" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <line x1="22" y1="46" x2="38" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <p className="splash-title mt-6 text-xl font-semibold tracking-tight text-foreground text-center">
            ICSE Resources
          </p>

          <div id="splash-bar" className="splash-bar mt-3" />
        </div>
      )}

      {/* ==================== ANIMATED BACKGROUND BLOBS ==================== */}
      {/* These are decorative floating blobs. EDIT: Change sizes, positions, or colors below. */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10 blur-3xl animate-pulse" style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-[0.07] blur-3xl animate-pulse" style={{ background: "hsl(var(--primary) / 0.7)", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-[0.05] blur-3xl animate-pulse" style={{ background: "hsl(var(--accent))", animationDelay: "4s" }} />
      </div>

      {/* ==================== TOP-RIGHT CONTROLS ==================== */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="p-3 rounded-full bg-card border border-border shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform"
          aria-label="Search files"
          title="Search (Ctrl+K)"
        >
          <Search className="h-5 w-5 text-foreground" />
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-3 rounded-full bg-card border border-border shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Moon className="h-5 w-5 text-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* ==================== HERO / HEADING ==================== */}
      <div className="text-center mb-12 animate-fade-in">
        {/* EDIT THIS TEXT to change the main heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          ICSE Resources
        </h1>
        {/* EDIT THIS TEXT to change the subtitle */}
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your one-stop hub for ICSE Study Materials, Papers, and Resources.
        </p>
      </div>

      {/* ==================== RESOURCE CARDS ==================== */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center animate-fade-in" style={{ animationDelay: "0.15s" }}>

        {/* --- Card 1: CISCE Resources --- */}
        {/* EDIT: Change the title, description, or icon below */}
        <div
          className="group w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
          onClick={() => setActiveExplorer("cisce")}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">CISCE Resources</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Official syllabus, specimen papers, and previous year papers for ICSE.
            </p>
            <button
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium
                         md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                         transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={(e) => { e.stopPropagation(); setActiveExplorer("cisce"); }}
            >
              Explore
            </button>
          </div>
        </div>

        {/* --- Card 2: Study Materials --- */}
        {/* EDIT: Change the title, description, or icon below */}
        <div
          className="group w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
          onClick={() => setActiveExplorer("study")}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Study Materials</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curated notes, guides, and reference materials to ace your exams.
            </p>
            <button
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium
                         md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                         transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={(e) => { e.stopPropagation(); setActiveExplorer("study"); }}
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* ==================== FILE EXPLORER MODAL ==================== */}
      {activeExplorer && activeData && (
        <FileExplorer data={activeData} onClose={() => setActiveExplorer(null)} />
      )}

      {/* ==================== SEARCH MODAL ==================== */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ==================== FLOATING FOOTER ==================== */}
      {/* EDIT: Change the links/URLs below */}
      <SocialFooter />

    </div>
  );
};

// =============================================
// SOCIAL FOOTER — floating icons for Reddit, Discord, GitHub, and Google Drive
// =============================================
const SocialFooter = () => {
  const { theme } = useTheme();
  const [modal, setModal] = useState<"reddit" | "discord" | "github" | "google-drive" | null>(null);

  return (
    <>
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-6 py-3 rounded-full bg-card/80 backdrop-blur-md shadow-lg border border-border/50">
        {/* Reddit */}
        <button onClick={() => setModal("reddit")} className="p-2 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all" title="Reddit">
          <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
        </button>
        {/* Discord */}
        <button onClick={() => setModal("discord")} className="p-2 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all" title="Discord">
          <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
        </button>
        {/* GitHub */}
        <a href="https://github.com/Jivaansh-Yadav/icse-resources" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all" title="GitHub Repository">
          <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
        </a>
        {/* Google Drive */}
        <a href="https://drive.google.com/drive/folders/1CkUuGnUR3idrhEBxgiV5U9fFf5RjbZQK" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all" title="Google Drive Folder">
          <svg className="h-5 w-5 text-foreground" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.997 12.536L.742 8.93L4.8 1.715h4.51l4.057 7.214l-2.254 3.607z" />
            <path d="M4.798 1.715l4.509 7.214" />
            <path d="M13.368 8.932H5.023" />
            <path d="M2.997 12.536l4.058-7.214" />
          </svg>
        </a>
      </footer>

      {/* ==================== REDDIT MODAL ==================== */}
      {modal === "reddit" && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModal(null)} />
          <div className="fixed z-[90] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm animate-scale-in">
            <div className="rounded-2xl border border-border bg-card shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Reddit</h3>
                <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-accent"><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">

                <a href="https://reddit.com/r/ICSE" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:bg-accent/40 hover:shadow-md transition-all text-center">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  <span className="text-sm font-medium text-foreground">r/ICSE</span>
                  <span className="text-xs text-muted-foreground">Join the ICSE community on Reddit</span>
                </a>
                <a href="https://reddit.com/u/Appropriate-Cow-3178" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:bg-accent/40 hover:shadow-md transition-all text-center">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  <span className="text-sm font-medium text-foreground">u/Appropriate-Cow-3178</span>
                  <span className="text-xs text-muted-foreground">View the Developer's Reddit profile</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== DISCORD MODAL ==================== */}
      {modal === "discord" && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModal(null)} />
          <div className="fixed z-[90] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg animate-scale-in">
            <div className="rounded-2xl border border-border bg-card shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Discord</h3>
                <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-accent"><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
              
                <a href="https://discord.gg/xGD8SnvuKX" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:bg-accent/40 hover:shadow-md transition-all text-center">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
                  <span className="text-sm font-medium text-foreground">ICSEcord</span>
                  <span className="text-xs text-muted-foreground">Join the ICSEcord Server on Discord. Some resources have been downloaded from this server</span>
                </a>
                <a href="https://discord.com/users/1444382978896560240" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:bg-accent/40 hover:shadow-md transition-all text-center">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  <span className="text-sm font-medium text-foreground">Developer</span>
                  <span className="text-xs text-muted-foreground">View the Developer's Discord profile</span>
                </a>
              </div>
              <div className="mt-4 flex justify-center">
                <iframe
                  src={`https://discord.com/widget?id=1175417452935520316&theme=${theme}`}
                  width="350"
                  height="300"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="rounded-lg border border-border"
                ></iframe>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Index;
