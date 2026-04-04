import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const NotFound = () => {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">

      {/* ==================== ANIMATED BACKGROUND BLOBS ==================== */}
      {/* These are decorative floating blobs. EDIT: Change sizes, positions, or colors below. */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10 blur-3xl animate-pulse" style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-[0.07] blur-3xl animate-pulse" style={{ background: "hsl(var(--primary) / 0.7)", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-[0.05] blur-3xl animate-pulse" style={{ background: "hsl(var(--accent))", animationDelay: "4s" }} />
      </div>

      {/* ==================== THEME TOGGLE (top-right corner) ==================== */}
      <button
        onClick={toggle}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-card border border-border shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Moon className="h-5 w-5 text-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* ==================== HERO / HEADING ==================== */}
      <div className="text-center mb-12 animate-fade-in">
        {/* EDIT THIS TEXT to change the main heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          404
        </h1>
        {/* EDIT THIS TEXT to change the subtitle */}
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Oops! Page not found
        </p>
      </div>

      {/* ==================== 404 CONTENT ==================== */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center animate-fade-in" style={{ animationDelay: "0.15s" }}>

        {/* --- 404 Card --- */}
        <div className="group w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The page you're looking for doesn't exist. Let's get you back to exploring ICSE resources.
            </p>
            <a
              href="/"
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium
                         md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                         transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
