import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import { books, genres } from "@/lib/books";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/catalogue")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  head: () => ({
    meta: [
      { title: "Library — LITN" },
      { name: "description", content: "Browse the full LITN medical-training library — anatomy, pharmacology, emergency medicine, cardiology, surgery and internal medicine." },
    ],
  }),
  component: Catalogue,
});

function Catalogue() {
  const { q: initialQ } = Route.useSearch();
  const { user, loading } = useAuth();
  const [q, setQ] = useState(initialQ);
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<"All" | "Serialised" | "Complete">("All");
  const [sort, setSort] = useState<"rating" | "chapters" | "title">("rating");

  const results = useMemo(() => {
    return books
      .filter((b) =>
        (genre === "All" || b.genre === genre) &&
        (status === "All" || b.status === status) &&
        (q === "" || `${b.title} ${b.genre}`.toLowerCase().includes(q.toLowerCase()))
      )
      .sort((a, b) => {
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "chapters") return b.chapters - a.chapters;
        return a.title.localeCompare(b.title);
      });
  }, [q, genre, status, sort]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <h1 className="font-display text-4xl">Sign in to view the library</h1>
          <p className="mt-3 text-muted-foreground">
            The full LITN medical-training library is available to signed-in members. Create a free account or sign in to browse every title.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="rounded-full bg-gradient-teal px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow">
              Sign in
            </Link>
            <Link to="/signup" className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground">
              Create account
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
        <h1 className="font-display text-4xl md:text-5xl">The Catalogue</h1>
        <p className="mt-2 text-muted-foreground">{results.length} books, and counting.</p>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface p-4 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, authors…"
            className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
            {genres.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
            <option>All</option><option>Serialised</option><option>Complete</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
            <option value="rating">Top rated</option>
            <option value="chapters">Most chapters</option>
            <option value="title">A–Z</option>
          </select>
        </div>

        {results.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">No books match those filters yet.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
