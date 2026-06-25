import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import { books, sampleChapter } from "@/lib/books";
import heroImg from "@/assets/hero-reader.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LITN — Read together. Meet the authors." },
      { name: "description", content: "A community-first reading platform with serialised chapters, live discussions, and direct access to authors." },
      { property: "og:title", content: "LITN — Read together. Meet the authors." },
      { property: "og:description", content: "Serialised chapters, book rooms, and authors who answer back." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = books.slice(0, 6);
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-40" width={1536} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs uppercase tracking-widest text-teal-bright">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-bright" /> Now in Alpha
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
              Read together.{" "}
              <span className="text-gradient-teal">Meet the authors.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              LITN is a community-first reading platform — serialised chapter drops, live book rooms,
              and a direct line to the people writing your next favourite story.
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
              <button className="rounded-full bg-gradient-teal px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link to="/catalogue" className="underline-offset-4 hover:text-foreground hover:underline">Browse the catalogue →</Link>
              <a href="#authors" className="underline-offset-4 hover:text-foreground hover:underline">Ask an author →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured books */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Featured this week</h2>
            <p className="mt-2 text-sm text-muted-foreground">Hand-picked stories from our editors and the community.</p>
          </div>
          <Link to="/catalogue" className="text-sm text-teal-bright hover:underline">See all</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </section>

      {/* Ask the Author */}
      <section id="authors" className="mx-auto mt-32 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-teal-bright">Author's Room</span>
              <h2 className="mt-3 font-display text-3xl md:text-5xl">Ask the author. Get a real answer.</h2>
              <p className="mt-5 text-muted-foreground">
                Every book on LITN comes with an Author's Room — a space to ask questions, share theories,
                and watch new chapters land in real time.
              </p>
              <Link to="/catalogue" className="mt-8 inline-flex rounded-full bg-gradient-teal px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">
                Explore Author Rooms
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { q: "Why did the lighthouse stay dark for seventeen years?", a: "Because the story was waiting for someone who already knew the answer.", who: "Mira Okafor" },
                { q: "Is chapter 9 the last we'll see of Ada?", a: "Not even close. She comes back in a way I owe you all an apology for.", who: "Adaeze Park" },
              ].map((m, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-background/50 p-5">
                  <p className="text-sm text-muted-foreground">Q. {m.q}</p>
                  <p className="mt-2 font-display text-base">"{m.a}"</p>
                  <p className="mt-2 text-xs text-teal-bright">— {m.who}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reading view preview */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-teal-bright">Reading view</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">Built for one long, beautiful scroll.</h2>
            <p className="mt-5 text-muted-foreground">
              No page-flipping, no friction. Bookmark, highlight, search a phrase, change the font —
              your place is saved across every device.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>· Continuous single-scroll, optimised for mobile</li>
              <li>· In-book search and chapter TOC</li>
              <li>· Bookmark and resume anywhere</li>
              <li>· Font, size, and reading colour controls</li>
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

      {/* Testimonials */}
      <section id="feedback" className="mx-auto mt-32 max-w-7xl px-6">
        <h2 className="font-display text-3xl md:text-4xl">Readers, in their own words.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { q: "It feels like a book club that never ends, with the author sitting at the table.", who: "Lerato, Cape Town" },
            { q: "I read three serials in a month. I haven't done that since I was sixteen.", who: "Owen, Bristol" },
            { q: "The Author's Room is the only DM I actually look forward to.", who: "Priya, Nairobi" },
          ].map((t, i) => (
            <figure key={i} className="rounded-2xl border border-border/60 bg-surface p-6">
              <blockquote className="font-display text-lg leading-snug">"{t.q}"</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">{t.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
