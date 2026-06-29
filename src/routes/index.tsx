import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import { books, sampleChapter } from "@/lib/books";
import heroImg from "@/assets/hero-reader.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LITN — A quieter place to read." },
      { name: "description", content: "A community-first reading platform with serialised chapters and a beautiful, focused reader." },
      { property: "og:title", content: "LITN — A quieter place to read." },
      { property: "og:description", content: "Serialised chapters and a beautiful, focused reader." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = books.slice(0, 6);
  const trending = books.slice(6, 12);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-30" width={1536} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-teal/20 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-28 pb-36 md:pt-36 md:pb-44">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs uppercase tracking-widest text-teal-bright">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-bright" /> Now in Alpha
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
              A quieter place{" "}
              <span className="text-gradient-teal">to read.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Serialised chapters, complete novels, and a reader built for one long, beautiful scroll.
              Discover your next favourite story on LITN.
            </p>

            <form
              action="/catalogue"
              className="mt-10 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface/80 p-2 shadow-card backdrop-blur"
            >
              <input
                name="q"
                placeholder="Search titles, authors, genres…"
                className="w-full bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="rounded-full bg-gradient-teal px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-90">
                Search
              </button>
            </form>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <Link to="/catalogue" className="text-foreground underline-offset-4 hover:underline">
                Browse the catalogue →
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-display text-foreground">{books.length}+</span> titles
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-display text-foreground">Weekly</span> chapter drops
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured books */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-teal-bright">Editors' picks</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Featured this week</h2>
          </div>
          <Link to="/catalogue" className="text-sm text-teal-bright hover:underline">See all →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </section>

      {/* Reading view preview */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-teal-bright">The reader</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">Built for one long, beautiful scroll.</h2>
            <p className="mt-5 text-muted-foreground">
              No page-flipping, no friction. Bookmark, search a phrase, change the font —
              your place is saved across every device.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><span className="text-teal-bright">·</span> Continuous single-scroll, optimised for mobile</li>
              <li className="flex gap-3"><span className="text-teal-bright">·</span> In-book search and chapter TOC</li>
              <li className="flex gap-3"><span className="text-teal-bright">·</span> Bookmark and resume anywhere</li>
              <li className="flex gap-3"><span className="text-teal-bright">·</span> Paper, Sepia, and Night reading themes</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-[oklch(0.96_0.01_90)] p-8 text-[oklch(0.2_0.02_60)] shadow-card md:p-12">
            <div className="text-xs uppercase tracking-widest opacity-60">Chapter 1 — The Lamp</div>
            <h3 className="mt-2 font-display text-2xl md:text-3xl">Tideglass</h3>
            <div className="mt-6 max-h-72 overflow-hidden font-display text-[15px] leading-7 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
              {sampleChapter.split("\n\n").map((p, i) => <p key={i} className="mb-4">{p}</p>)}
            </div>
            <Link to="/read/$id" params={{ id: "tideglass" }} className="mt-4 inline-flex text-sm font-medium text-[oklch(0.45_0.12_200)] hover:underline">
              Continue reading →
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-teal-bright">Trending</span>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">What readers are loving</h2>
            </div>
            <Link to="/catalogue" className="text-sm text-teal-bright hover:underline">Browse all →</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {trending.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-10 text-center md:p-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl md:text-5xl">Start reading tonight.</h2>
            <p className="mt-4 text-muted-foreground">
              Free to join. Request access to any title and dive in.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/catalogue" className="rounded-full bg-gradient-teal px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-90">
                Browse catalogue
              </Link>
              <Link to="/signup" className="rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-background/70">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
