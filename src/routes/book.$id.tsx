import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PurchaseRequestButton } from "@/components/purchase-request-button";
import { getBook } from "@/lib/books";

export const Route = createFileRoute("/book/$id")({
  loader: ({ params }) => {
    const book = getBook(params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.book.title} — LITN` },
          { name: "description", content: loaderData.book.synopsis },
          { property: "og:title", content: `${loaderData.book.title} by ${loaderData.book.author}` },
          { property: "og:description", content: loaderData.book.synopsis },
          { property: "og:image", content: loaderData.book.cover },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Book not found</h1>
        <Link to="/catalogue" className="mt-6 inline-flex text-teal-bright hover:underline">Back to catalogue</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen p-10 text-center">
      <p>Something went wrong.</p>
      <button onClick={reset} className="mt-4 rounded-full bg-gradient-teal px-4 py-2 text-sm">Retry</button>
    </div>
  ),
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <div className="grid gap-12 md:grid-cols-[280px_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl shadow-glow">
              <img src={book.cover} alt={book.title} className="w-full" />
            </div>
            <Link
              to="/read/$id"
              params={{ id: book.id }}
              className="mt-6 flex w-full justify-center rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start reading
            </Link>
            <PurchaseRequestButton
              bookId={book.id}
              bookTitle={book.title}
              price={book.price}
              currency={book.currency}
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-teal-bright">{book.genre} · {book.status}</div>
            <h1 className="mt-2 font-display text-5xl">{book.title}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="font-display text-foreground">{book.currency} {book.price}</span>
              <span>★ {book.rating}</span>
              <span>{book.chapters} chapters</span>
              <span>{book.status === "Serialised" ? "New chapter weekly" : "Complete"}</span>
            </div>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed">{book.synopsis}</p>

            <div className="mt-12">
              <h2 className="font-display text-2xl">Chapters</h2>
              <ol className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-surface">
                {Array.from({ length: book.chapters }).map((_, i) => (
                  <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span><span className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>  <span className="ml-3">Chapter {i + 1}</span></span>
                    <Link to="/read/$id" params={{ id: book.id }} className="text-teal-bright hover:underline">Read</Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
