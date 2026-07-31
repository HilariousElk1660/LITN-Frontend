import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo1.png";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Crown, ChevronDown, LogOut, User, Menu, X } from "lucide-react";

export function SiteHeader() {
  const { user, isAdmin, isSuperAdmin, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const initials = (user?.fullname || user?.email || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        setMobileNavOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="" className="h-12 w-12 rounded-md object-contain sm:h-[90px] sm:w-[90px]" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>
            Home
          </Link>
          <Link to="/catalogue" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Catalogue
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-teal-bright transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              Admin
            </Link>
          )}
        </nav>

        <div className="relative ml-auto flex items-center gap-2" ref={mobileNavRef}>
          {loading ? null : user ? (
            <>
              {/* {isSuperAdmin ? (
                <span className="hidden items-center gap-1 rounded-full border border-teal-bright/40 bg-teal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-teal-bright sm:inline-flex">
                  <Crown className="h-3 w-3" /> Super Admin
                </span>
              ) : isAdmin ? (
                <span className="hidden items-center gap-1 rounded-full border border-teal-bright/40 bg-teal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-teal-bright sm:inline-flex">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              ) : null} */}

              {/* Profile dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-sm text-muted-foreground transition hover:border-border hover:text-foreground"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-teal text-[11px] font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden sm:inline">{user.email}</span>
                  <ChevronDown
                    className={`hidden h-3.5 w-3.5 transition-transform sm:inline ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border/60 bg-background/95 shadow-lg backdrop-blur-xl"
                  >
                    <div className="border-b border-border/60 px-4 py-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.fullname || "My account"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Shield className="h-4 w-4" />
                          Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-border/60 py-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-teal px-3 py-2 text-xs font-medium text-primary-foreground shadow-glow transition hover:opacity-90 sm:px-4 sm:py-2 sm:text-sm"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface/80 text-foreground transition hover:border-primary md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {mobileNavOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border/60 bg-background/95 shadow-lg backdrop-blur-xl md:hidden">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-sm font-medium text-foreground">Navigate</p>
                <p className="text-xs text-muted-foreground">Quick links and account actions</p>
              </div>
              <div className="flex flex-col py-2">
                <Link
                  to="/"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Home
                </Link>
                <Link
                  to="/catalogue"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Catalogue
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className="px-4 py-2 text-sm text-teal-bright transition hover:bg-muted hover:text-foreground"
                  >
                    Admin
                  </Link>
                )}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileNavOpen(false)}
                      className="px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileNavOpen(false)}
                      className="px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}