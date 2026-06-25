import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/books";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to="/book/$id"
      params={{ id: book.id }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] uppercase tracking-wider backdrop-blur">
          {book.status}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-1 font-display text-base leading-tight">{book.title}</h3>
        <p className="text-xs text-muted-foreground">{book.author} · {book.chapters} ch</p>
      </div>
    </Link>
  );
}
