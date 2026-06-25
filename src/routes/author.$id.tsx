import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import { books } from "@/lib/books";

export const Route = createFileRoute("/author/$id")({
  loader: ({ params }) => {
    const author = books.find((b) => b.authorId === params.id);
    if (!author) throw notFound();
    return { author, works: books.filter((b) => b.authorId === params.id) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.author.author} — LITN` }] : [],
  }),
  notFoundComponent: () => <div className="p-10">Author not found</div>,
  errorComponent: ({ reset }) => <button onClick={reset}>retry</button>,
  component: AuthorPage,
});

function AuthorPage() {
  const { author, works } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-20">
        <div className="flex items-center gap-6">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-teal font-display text-4xl text-primary-foreground">
            {author.author.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div>
            <h1 className="font-display text-4xl">{author.author}</h1>
            <p className="mt-1 text-muted-foreground">Author · {works.length} {works.length === 1 ? "book" : "books"} on LITN</p>
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed">
          {author.author} writes from a small room with too many windows. Their work explores memory,
          place, and the slow weather of being a person. New chapters drop on LITN every Friday.
        </p>

        <div className="mt-14">
          <h2 className="font-display text-2xl">Published works</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {works.map((b: typeof works[number]) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border/60 bg-surface p-8">
          <h2 className="font-display text-2xl">Author's Room</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ask a question. {author.author.split(" ")[0]} answers personally each week.</p>
          <form className="mt-6 flex gap-2">
            <input className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2 text-sm" placeholder="Write your question…" />
            <button className="rounded-full bg-gradient-teal px-5 py-2 text-sm font-medium text-primary-foreground">Send</button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
