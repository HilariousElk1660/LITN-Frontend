import { Link } from "@tanstack/react-router";
import logo from "@/assets/litn-logo.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="" className="h-8 w-8 rounded-md" />
            <span className="font-display text-lg">LITN</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            A community-first reading platform for emerging and established authors.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Read</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalogue">Catalogue</Link></li>
            <li><a href="#serialised">Serialised</a></li>
            <li><a href="#new">New releases</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Community</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#authors">Ask the Author</a></li>
            <li><a href="#rooms">Book Rooms</a></li>
            <li><a href="#feedback">Feedback</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Newsletter</h4>
          <p className="mt-3 text-sm text-muted-foreground">Monthly chapter drops in your inbox.</p>
          <form className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button className="rounded-full bg-gradient-teal px-4 py-2 text-sm font-medium text-primary-foreground">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LITN. Alpha release.
      </div>
    </footer>
  );
}
