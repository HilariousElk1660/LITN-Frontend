import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useBooks } from "@/hooks/use-books";
import { BookCard } from "@/components/book-card";
import { genres, type Book } from "@/lib/books";
import { BookOpen, GraduationCap, ArrowRight, Sparkles, Compass, Clock } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home Dashboard — LITN" },
      {
        name: "description",
        content: "Your personalized medical training dashboard on LITN.",
      },
    ],
  }),
  component: Home,
});

type LibraryEntry = {
  reader_book_id: string;
  book_id: string;
  book_name: string;
  author_name: string | null;
  book_cover_url: string | null;
  current_page: number;
  total_pages: number;
  current_chapter_index: number;
  total_chapters: number;
  percentage_completed: number | null;
  progress: "not_started" | "in_progress" | "done";
  last_opened: string | null;
  page_stopped_at: string | null;
  last_opened_on: string | null;
};

function Home() {
  const { user, loading, backendUrl } = useAuth();
  const { bookRequests, readersBooks } = useBooks();
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Unable to load titles.");
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [backendUrl]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 sm:py-32">
          <h1 className="font-display text-4xl">Access your dashboard</h1>
          <p className="mt-3 text-muted-foreground">
            Please sign in to view your learning dashboard, reading progress, and registered titles.
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

  // Get user requested/purchased books count if any
  const totalRequests = bookRequests?.length ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-6 sm:p-8 lg:p-12 mb-8">
          <div className="absolute inset-0 -z-10 bg-teal" />
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-teal/10 blur-3xl" />
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal-bright">
                <Sparkles className="h-3.5 w-3.5" /> Clinical Learning Portal
              </span> */}
              <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl">
                Welcome back, <span className="text-gradient-teal">{user?.fullname || "Colleague"}</span>.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-xl">
                Track your active reading, explore high-yield clinical materials, and access your study resources all in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-teal px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
              >
                <Compass className="h-4 w-4" /> Browse Library
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface"
              >
                View Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        {/* <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-border/60 bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">My Subscribed Books</span>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal/15 text-teal-bright">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold">{totalRequests}</span>
              <span className="ml-1 text-xs text-muted-foreground">titles requested</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Medical Specialties</span>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal/15 text-teal-bright">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold">{genres.filter(g => g !== "All").length}</span>
              <span className="ml-1 text-xs text-muted-foreground">subjects in library</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">System Language</span>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal/15 text-teal-bright">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold truncate block max-w-full">
                {user?.prefferedLanguage || "English"}
              </span>
            </div>
          </div>
        </section> */}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">Continue Reading...</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {((readersBooks as LibraryEntry[]) ?? []).length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-8 text-center bg-surface/30">
                <p className="text-sm text-muted-foreground">You don't have any books in progress.</p>
                <Link to="/catalogue" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-bright hover:underline">
                  Browse library <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              ((readersBooks as LibraryEntry[]) ?? []).slice(0, 5).map((b) => {
                const pct = b.percentage_completed ?? 0;
                return (
                  <Link
                    key={b.reader_book_id}
                    to="/read/$id"
                    params={{ id: b.book_id }}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
                      <div className="aspect-[2/3] overflow-hidden">
                        {b.book_cover_url ? (
                          <img
                            src={b.book_cover_url}
                            alt={b.book_name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-border/60">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] font-semibold text-teal-bright backdrop-blur">
                        {pct}% completed
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <h3 className="line-clamp-2 font-display text-base leading-tight font-medium">{b.book_name}</h3>
                      {b.author_name && (
                        <p className="text-xs text-muted-foreground">{b.author_name}</p>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mt-2 pt-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                          <div
                            className="h-full rounded-full bg-gradient-teal transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                          <span>Page {b.current_page} of {b.total_pages || '?'}</span>
                          <span>{pct}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>


        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">Featured Clinical Studies</h2>
              <p className="text-sm text-muted-foreground">Highly recommended anatomy, pharmacology, and clinical training titles.</p>
            </div>
            <Link to="/catalogue" className="text-teal-bright hover:underline text-sm font-medium inline-flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingBooks ? (
            <p className="text-center text-muted-foreground py-10">Loading books...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-10">Error loading books: {error}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {books.slice(0, 5).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
