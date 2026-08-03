import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import { genres, type Book } from "@/lib/books";
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
  const { user, loading, backendUrl } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState(initialQ);
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<"All" | "Serialised" | "Complete">("All");
  const [sort, setSort] = useState<"rating" | "chapters" | "title">("rating");

  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      setError(null);

      try {
        const base = backendUrl;
        const res = await fetch(`${base}/all_books`);
        if (!res.ok) {
          throw new Error(`Failed to load books: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const mappedBooks: Book[] = (data ?? []).map((item: any) => ({
          id: item.book_id,
          title: item.book_name,
          author: item.author_name ?? "Unknown author",
          authorId: item.author_id ?? item.author_name?.toLowerCase().replace(/\s+/g, "-") ?? "unknown",
          cover: item.book_cover_url ?? "",
          genre: item.category ?? "Unknown",
          status: item.status === "Complete" ? "Complete" : "Serialised",
          chapters: item.chapters ?? item.pages ?? 0,
          rating: item.rating ?? 0,
          price: item.subscription_price ?? 0,
          currency: item.currency ?? "USD",
          synopsis: item.synopsis ?? item.description ?? "",
        }));

        setBooks(mappedBooks);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load catalogue.");
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [backendUrl]);

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
  }, [books, q, genre, status, sort]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 sm:py-32">
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
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">The Library</h1>
        <p className="mt-2 text-muted-foreground">{results.length} medical-training titles available.</p>

        <div className="mt-8 grid gap-3 rounded-2xl border border-border/60 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles or subjects…"
            className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary sm:col-span-2 xl:col-span-1"
          />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
            {genres.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
            <option>All</option><option>Serialised</option><option>Complete</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
            <option value="rating">Top rated</option>
            <option value="chapters">Most chapters</option>
            <option value="title">A–Z</option>
          </select>
        </div>

        {loadingBooks ? (
          <p className="mt-16 text-center text-muted-foreground">Loading catalogue…</p>
        ) : error ? (
          <div className="mt-16 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-900">
            <p>Unable to load books.</p>
            <p className="mt-2">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">No books match those filters yet.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
