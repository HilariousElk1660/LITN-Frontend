import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBook, sampleChapter } from "@/lib/books";
import logo from "@/assets/litn-logo.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/read/$id")({
  ssr: false,
  loader: ({ params }) => {
    const book = getBook(params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `Reading — ${loaderData.book.title}` }] : [],
  }),
  notFoundComponent: () => <div className="p-10">Not found</div>,
  errorComponent: ({ reset }) => <button onClick={reset}>retry</button>,
  component: Reader,
});

function AccessGate({ bookId, children }: { bookId: string; children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const [state, setState] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    if (loading) return;
    if (!user) return setState("denied");
    if (isAdmin) return setState("granted");
    const check = () =>
      supabase
        .from("purchase_requests")
        .select("status")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .eq("status", "paid")
        .limit(1)
        .maybeSingle()
        .then(({ data }) => setState(data ? "granted" : "denied"));
    check();
    const channel = supabase
      .channel(`pr_read_${user.id}_${bookId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_requests", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as { book_id: string };
          if (row.book_id === bookId) check();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, loading, bookId]);

  if (loading || state === "checking") {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  if (state === "denied") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Access required</h1>
        <p className="text-muted-foreground">
          {user
            ? "Your purchase request must be approved before you can read this book."
            : "Sign in and request access to read this book."}
        </p>
        <Link
          to="/book/$id"
          params={{ id: bookId }}
          className="rounded-full bg-gradient-teal px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Back to book
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

function Reader() {
  const { book } = Route.useLoaderData();
  return (
    <AccessGate bookId={book.id}>
      <ReaderInner />
    </AccessGate>
  );
}

function ReaderInner() {
  const { book } = Route.useLoaderData();
  const [chapter, setChapter] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"sepia" | "paper" | "night">("paper");
  const [tocOpen, setTocOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [query, setQuery] = useState("");

  const bgClass = {
    paper: "bg-[oklch(0.97_0.005_90)] text-[oklch(0.18_0.02_60)]",
    sepia: "bg-[oklch(0.93_0.03_75)] text-[oklch(0.22_0.03_50)]",
    night: "bg-[oklch(0.18_0.02_200)] text-[oklch(0.92_0.01_180)]",
  }[theme];

  const content = sampleChapter;
  const highlighted = query
    ? content.replace(new RegExp(`(${query})`, "gi"), `<mark style="background:oklch(0.85 0.18 85);color:inherit">$1</mark>`)
    : content;

  return (
    <div className={`min-h-screen transition-colors ${bgClass}`}>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-inherit/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/book/$id" params={{ id: book.id }} className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100">
            <img src={logo.url} alt="" className="h-6 w-6" />
            <span>← {book.title}</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={() => setTocOpen((o) => !o)} className="rounded-full px-3 py-1 text-xs opacity-70 hover:opacity-100">TOC</button>
            <button onClick={() => setBookmarked((b) => !b)} className={`rounded-full px-3 py-1 text-xs ${bookmarked ? "opacity-100 font-semibold" : "opacity-70"}`}>
              {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
            <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)} className="rounded-full bg-transparent px-2 py-1 text-xs opacity-70">
              <option value="paper">Paper</option>
              <option value="sepia">Sepia</option>
              <option value="night">Night</option>
            </select>
            <button onClick={() => setFontSize((f) => Math.max(14, f - 2))} className="px-2 text-xs opacity-70">A−</button>
            <button onClick={() => setFontSize((f) => Math.min(26, f + 2))} className="px-2 text-base opacity-70">A+</button>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this chapter…"
            className="w-full rounded-full border border-black/10 bg-white/40 px-4 py-1.5 text-sm outline-none placeholder:opacity-50"
          />
        </div>
      </header>

      {tocOpen && (
        <div className="mx-auto max-w-3xl border-b border-black/10 px-4 py-4 text-sm">
          <p className="mb-2 font-semibold uppercase tracking-widest opacity-60">Chapters</p>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {Array.from({ length: book.chapters }).map((_, i) => (
              <li key={i}>
                <button
                  onClick={() => { setChapter(i + 1); setTocOpen(false); }}
                  className={`w-full rounded-md px-2 py-1 text-left hover:bg-black/5 ${chapter === i + 1 ? "font-semibold" : "opacity-70"}`}
                >
                  {String(i + 1).padStart(2, "0")} · Chapter {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <article className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs uppercase tracking-widest opacity-60">Chapter {chapter}</p>
        <h1 className="mt-2 font-display text-4xl">{book.title}</h1>
        <div
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
          className="prose-reading mt-10 space-y-6 font-display"
          dangerouslySetInnerHTML={{
            __html: highlighted
              .split("\n\n")
              .map((p) => `<p>${p}</p>`)
              .join(""),
          }}
        />

        <div className="mt-16 flex items-center justify-between border-t border-black/10 pt-6 text-sm">
          <button
            disabled={chapter === 1}
            onClick={() => setChapter((c) => Math.max(1, c - 1))}
            className="rounded-full border border-black/15 px-4 py-2 opacity-80 disabled:opacity-30"
          >
            ← Previous chapter
          </button>
          <button
            disabled={chapter === book.chapters}
            onClick={() => setChapter((c) => Math.min(book.chapters, c + 1))}
            className="rounded-full border border-black/15 px-4 py-2 opacity-80 disabled:opacity-30"
          >
            Next chapter →
          </button>
        </div>
      </article>
    </div>
  );
}
