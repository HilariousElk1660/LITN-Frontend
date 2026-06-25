import { Link } from "@tanstack/react-router";
import logo from "@/assets/litn-logo.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo.url} alt="LITN" className="h-9 w-9 rounded-md object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl tracking-tight">LITN</span>
            <span className="rounded-full bg-teal/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-teal-bright">
              Alpha
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/catalogue" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Catalogue
          </Link>
          <a href="#feedback" className="transition-colors hover:text-foreground">Feedback</a>
          <a href="#authors" className="transition-colors hover:text-foreground">Ask the Author</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-gradient-teal px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
