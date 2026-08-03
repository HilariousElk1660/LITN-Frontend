import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import { books } from "@/lib/books";

export const Route = createFileRoute("/author")({
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
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-teal font-display text-3xl text-primary-foreground sm:h-24 sm:w-24 sm:text-4xl">
            {author.author.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">{author.author}</h1>
            <p className="mt-1 text-muted-foreground">Author · {works.length} {works.length === 1 ? "book" : "books"} on LITN</p>
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed">
          {author.author} writes from a small room with too many windows. Their work explores memory,
          place, and the slow weather of being a person. New chapters drop on LITN every Friday.
        </p>

        <div className="mt-14">
          <h2 className="font-display text-2xl">Published works</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {works.map((b: typeof works[number]) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

