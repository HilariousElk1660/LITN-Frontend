import { useState } from "react";
import { Search, ImagePlus, Tag, Eye, FileText, Pencil, Trash2 } from "lucide-react";

export function BookList({ allBooks, bookStats, handleViewBook, loadBookReport, handleDelete }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter books based on title, author, category, or uploader
  const filteredBooks = allBooks.filter((book) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      book.book_name?.toLowerCase().includes(query) ||
      book.author_name?.toLowerCase().includes(query) ||
      book.category?.toLowerCase().includes(query) ||
      book.uploaded_by?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, category, or uploader..."
          className="w-full rounded-3xl border border-border/60 bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 transition"
        />
      </div>

      {/* Book List Grid */}
      <div className="grid gap-4 lg:grid-cols-1">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => {
            const stats = bookStats.get(book.book_id) ?? { totalRequests: 0, paidRequests: 0 };
            return (
              <article key={book.book_id} className="overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-sm">
                <div className="flex gap-4 p-5 sm:items-center min-w-0">
                  <div className="h-28 w-24 overflow-hidden rounded-3xl bg-muted flex-shrink-0">
                    {book.book_cover_url ? (
                      <img src={book.book_cover_url} alt={book.book_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">{book.book_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{book.author_name}</p>
                        <p className="text-sm text-muted-foreground truncate"><b>Uploaded by: </b> {book.uploaded_by}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        {book.category ?? "Uncategorized"}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-2">
                      <div className="rounded-3xl bg-background p-3">
                        <p className="text-xs uppercase tracking-[0.18em]">Chapters</p>
                        <p className="mt-2 text-base font-semibold">{book.chapters}</p>
                      </div>

                      <div className="rounded-3xl bg-background p-3">
                        <p className="text-xs uppercase tracking-[0.18em]">Price</p>
                        <p className="mt-2 text-base font-semibold">
                          {book.subscription_price ? `${book.subscription_price}` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border/60 bg-background/70 p-4">
                  <button
                    type="button"
                    onClick={() => handleViewBook(book)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-border px-4 py-2 text-sm text-foreground transition hover:border-teal-400 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    View book
                  </button>
                  <button
                    type="button"
                    onClick={() => loadBookReport(book)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-border px-4 py-2 text-sm text-foreground transition hover:border-teal-400 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Generate report
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Edit book flow not yet implemented.")}
                    className="inline-flex items-center gap-2 rounded-3xl border border-border px-4 py-2 text-sm text-foreground transition hover:border-teal-400 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit book
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(book.book_id)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-destructive/40 px-4 py-2 text-sm text-destructive transition hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete book
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          /* Empty Search Results State */
          <div className="rounded-3xl border border-border/60 bg-surface p-8 text-center text-sm text-muted-foreground">
            No books found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}