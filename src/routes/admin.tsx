import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  BookOpen,
  FileText,
  ImagePlus,
  Upload,
  Trash2,
  Pencil,
  Eye,
  Users,
  Check,
  X,
  Clock,
  User,
  Calendar,
  Tag,
  DollarSign,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RequireAdmin } from "@/components/require-admin";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import supported_languages from '../assets/supported_languages.json'
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · LITN" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  ),
});

type RequestRow = {
  request_id?: string;
  reader_id?: string;
  reader_name: string;
  reader_email: string;
  book_id: string;
  book_name: string;
  book_price: number | null;
  currency: string;
  note: string | null;
  status: "pending" | "paid" | "declined";
  sent_at: string;
  reviewed_at: string | null;
};

type AdminBook = {
  book_id: string;
  book_name: string;
  author_name: string;
  category: string | null;
  published_date: string | null;
  book_cover_url: string | null;
  subscription_price: number | null;
};

const REQUEST_TABS: Array<{ key: RequestRow["status"]; label: string; icon: typeof Clock }> = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "paid", label: "Paid", icon: Check },
  { key: "declined", label: "Declined", icon: X },
];

const VIEWS = [
  { key: "books", label: "Uploaded books", icon: BookOpen },
  { key: "requests", label: "Book requests", icon: FileText },
  { key: "details", label: "Admin details", icon: User },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function AdminDashboard() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewKey>("books");
  const [requestTab, setRequestTab] = useState<RequestRow["status"]>("pending");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formState, setFormState] = useState({
    bookName: "",
    authorName: "",
    publishedDate: "",
    category: "",
    price: "",
    bookCover: null as File | null,
    pdfFile: null as File | null,
  });

  const backendUrl = "http://localhost:8000";
  

  console.log("supported_languages", supported_languages);
  const loadBooks = async () => {
    if (!user) return;
    try {
     
      const res = await fetch(`${backendUrl}/admin_books?admin_id=${user?.user_id}`, {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch uploaded books");
      }
      console.log("books",data)
      setBooks((data ?? []) as AdminBook[]);
    } catch (error) {
      console.error("Failed to load books", error);
      toast.error("Unable to load uploaded books.");
    }
  };

  const loadRequests = async () => {
     try {
      setLoading(true);
      //fetching book requests
      const res = await fetch(`${backendUrl}/book_requests?admin_id=${user?.user_id}`,{
        'method': 'GET',
      })
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch book requests")
      }
      setRequests(data);
      console.log(data)
      setLoading(false);
    }catch(e){
      console.error(`Error fetching book requests: ${e}`)
      setLoading(false);
    }
  };

  const loadAll = ()=>{
    loadRequests()
    loadBooks()
  }
  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const counts = useMemo(() => {
    return {
      pending: requests.filter((request) => request.status === "pending").length,
      paid: requests.filter((request) => request.status === "paid").length,
      declined: requests.filter((request) => request.status === "declined").length,
    };
  }, [requests]);

  const bookStats = useMemo(() => {
    const map = new Map<string, { totalRequests: number; paidRequests: number }>();
    for (const request of requests) {
      const bookId = request.book_id;
      const entry = map.get(bookId) ?? { totalRequests: 0, paidRequests: 0 };
      entry.totalRequests += 1;
      if (request.status === "paid") entry.paidRequests += 1;
      map.set(bookId, entry);
    }
    return map;
  }, [requests]);

  const updateRequestStatus = async (id: string, request_details: RequestRow, status:RequestRow["status"]) => {
    try {
      const token = api.getToken()
      setLoading(true);
      const payload = {
        "request_id": request_details['request_id'],
        "status": status,
        "book_id": request_details["book_id"],
        "reader_id": request_details["reader_id"]
      }
      const res = await fetch(`${backendUrl}/update_book_request`, {
        'method': "PUT",
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        'body':JSON.stringify(payload)
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.detail || payload?.error || "Failed to update request");
      }
      toast.success("Request updated");
      await loadRequests();
    } catch (error) {
      console.error("Error updating request status", error);
      toast.error("Unable to update request status.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId:string) => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/delete_book/${bookId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.detail || payload?.error || "Failed to delete book");
      }
      toast.success("Book deleted");
      await loadRequests();
    } catch (error) {
      console.error("Error deleting book", error);
      toast.error("Unable to delete book.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (formState.pdfFile.type !== "application/pdf") {
      toast.error("Book file must be a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("admin_id", user?.user_id);
    formData.append("uploaded_by", user.email ?? "");
    formData.append("author_name", formState.authorName);
    formData.append("book_name", formState.bookName);
    formData.append("category", formState.category);
    formData.append("published_date", formState.publishedDate);
    formData.append("price", formState.price);
    formData.append("book_division_type", "full");
    formData.append("pdf_file", formState.pdfFile);

    try {
      setUploading(true);
      const res = await fetch(`${backendUrl}/create_book`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to upload book");
      }
      toast.success("Book upload started.");
      setFormState({
        bookName: "",
        authorName: "",
        publishedDate: "",
        category: "",
        price: "",
        bookCover: null,
        pdfFile: null,
      });
      await loadBooks();
    } catch (error) {
      console.error("Error uploading book", error);
      toast.error("Unable to upload book.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewBook = (book: any) =>{
    window.location.href = `/read/${book.book_id}`;
  }
  const selectedRequests = requests.filter((request) => request.status === requestTab);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          <div className="rounded-4xl border border-border/60 bg-surface p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-sm font-semibold text-teal-700">
                  <Shield className="h-4 w-4" />
                  Admin dashboard
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Manage books, requests, and admin details</h1>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  Upload new books, review subscriptions and purchase requests from readers, and keep your admin profile visible in one place.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Books uploaded</p>
                  <p className="mt-4 text-3xl font-semibold">{books.length}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Open requests</p>
                  <p className="mt-4 text-3xl font-semibold">{counts.pending}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Paid requests</p>
                  <p className="mt-4 text-3xl font-semibold">{counts.paid}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="space-y-3 rounded-3xl border border-border/60 bg-surface p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Dashboard views</h2>
              <div className="space-y-2">
                {VIEWS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                      view === key
                        ? "border border-teal-400 bg-teal-500/10 text-foreground"
                        : "text-muted-foreground hover:bg-surface"
                    }`}
                    onClick={() => setView(key)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-8">
              {view === "books" && (
                <div className="space-y-8">
                  <div className="rounded-3xl border border-border/60 bg-surface p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">Upload a new book</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Create a book record, upload cover art and PDF, and publish it for readers.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-sm font-semibold text-teal-700">
                        <Upload className="h-4 w-4" />
                        PDF upload only
                      </div>
                    </div>

                    <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                      <label className="grid gap-2 text-sm">
                        <span>Book name</span>
                        <input
                          value={formState.bookName}
                          onChange={(event) => setFormState((prev) => ({ ...prev, bookName: event.target.value }))}
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="E.g. The Next Chapter"
                          required
                        />
                      </label>
                      <label className="grid gap-2 text-sm">
                        <span>Author name</span>
                        <input
                          value={formState.authorName}
                          onChange={(event) => setFormState((prev) => ({ ...prev, authorName: event.target.value }))}
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="E.g. Jane Doe"
                          required
                        />
                      </label>
                      <label className="grid gap-2 text-sm">
                        <span>Published date</span>
                        <input
                          type="date"
                          value={formState.publishedDate}
                          onChange={(event) => setFormState((prev) => ({ ...prev, publishedDate: event.target.value }))}
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          required
                        />
                      </label>
                      <label className="grid gap-2 text-sm">
                        <span>Category</span>
                        <input
                          value={formState.category}
                          onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="E.g. Fiction"
                          required
                        />
                      </label>

                      {/* <label className="grid gap-2 text-sm">
                        <span>Current Book Translation</span>
                        <input
                          value={formState.category}
                          onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="E.g. Fiction"
                          required
                        />
                      </label> */}

                      <label className="grid gap-2 text-sm">
                        <span>Current translation</span>
                        <select
                            className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                        >
                            {Object.entries(supported_languages).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        {/* <input
                          value={formState.category}
                          onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))]
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="E.g. Fiction"
                          required
                        /> */}
                      </label>

                      <label className="grid gap-2 text-sm">
                        <span>Translate book to</span>
                        <select
                            className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                        >
                            <option value="french">French</option>
                            <option value="english">English</option>
                       
                        </select>
                        {/* <input
                          value={formState.category}
                          onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))]
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="E.g. Fiction"
                          required
                        /> */}
                      </label>
                       <label className="grid gap-2 text-sm">
                        <span>Price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.price}
                          onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                          className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-teal-400"
                          placeholder="e.g. 1000"
                          required
                        />
                      </label>
                      {/* <label className="grid gap-2 text-sm md:col-span-2">
                        <span>Upload book cover</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(event) => setFormState((prev) => ({ ...prev, bookCover: event.target.files?.[0] ?? null }))}
                          className="file:rounded-full file:border-0 file:bg-teal-500 file:px-4 file:py-2 file:text-sm file:text-white"
                          required
                        />
                      </label> */}
                      <label className="grid gap-2 text-sm">
                        <span>Upload book PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(event) => setFormState((prev) => ({ ...prev, pdfFile: event.target.files?.[0] ?? null }))}
                          className="file:rounded-full file:border-0 file:bg-teal-500 file:px-4 file:py-2 file:text-sm file:text-white"
                          required
                        />
                        <span className="text-xs text-muted-foreground">Only PDF files are accepted.</span>
                      </label>
                     
                      <div className="md:col-span-2 text-center">
                        <button
                          type="submit"
                          disabled={uploading}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {uploading ? "Uploading…" : "Create book"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-surface p-5">
                      <div>
                        <h2 className="text-xl font-semibold">Uploaded books</h2>
                        <p className="text-sm text-muted-foreground">Review the books you have added and their current performance.</p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="rounded-3xl border border-border/60 bg-background p-8 text-center text-muted-foreground">Loading books…</div>
                    ) : books.length === 0 ? (
                      <div className="rounded-3xl border border-border/60 bg-background p-8 text-center text-muted-foreground">
                        No books uploaded yet.
                      </div>
                    ) : (
                      <div className="grid gap-4 xl:grid-cols-1">
                        {books.map((book) => {
                          const stats = bookStats.get(book.book_id) ?? { totalRequests: 0, paidRequests: 0 };
                          return (
                            <article key={book.book_id} className="overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-sm">
                              <div className="flex gap-4 p-5 sm:items-center">
                                <div className="h-28 w-24 overflow-hidden rounded-3xl bg-muted">
                                  {book.book_cover_url ? (
                                    <img src={book.book_cover_url} alt={book.book_name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                      <ImagePlus className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <h3 className="text-lg font-semibold">{book.book_name}</h3>
                                      <p className="text-sm text-muted-foreground">{book.author_name}</p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                      <Tag className="h-3.5 w-3.5" />
                                      {book.category ?? "Uncategorized"}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
                                    <div className="rounded-3xl bg-background p-3">
                                      <p className="text-xs uppercase tracking-[0.18em]">Chapters</p>
                                      <p className="mt-2 text-base font-semibold">{book.subscription_price ? 0 : 0}</p>
                                    </div>
                                    <div className="rounded-3xl bg-background p-3">
                                      <p className="text-xs uppercase tracking-[0.18em]">Purchases</p>
                                      <p className="mt-2 text-base font-semibold">{stats.paidRequests}</p>
                                    </div>
                                    <div className="rounded-3xl bg-background p-3">
                                      <p className="text-xs uppercase tracking-[0.18em]">Completed</p>
                                      <p className="mt-2 text-base font-semibold">{stats.paidRequests}</p>
                                    </div>
                                    <div className="rounded-3xl bg-background p-3">
                                      <p className="text-xs uppercase tracking-[0.18em]">Price</p>
                                      <p className="mt-2 text-base font-semibold">{book.subscription_price ? `${book.subscription_price}` : "—"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 border-t border-border/60 bg-background/70 p-4">
                                <button
                                  style={{"cursor":"pointer"}}
                                  type="button"
                                  onClick={() => handleViewBook(book)}
                                  className="inline-flex items-center gap-2 rounded-3xl border border-border px-4 py-2 text-sm text-foreground transition hover:border-teal-400"
                                >
                                  <Eye className="h-4 w-4" />
                                  View book
                                </button>
                                <button
                                  style={{"cursor":"pointer"}}
                                  type="button"
                                  onClick={() => toast.success("Edit book flow not yet implemented.")}
                                  className="inline-flex items-center gap-2 rounded-3xl border border-border px-4 py-2 text-sm text-foreground transition hover:border-teal-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit book
                                </button>
                                <button
                                  style={{"cursor":"pointer"}}
                                  type="button"
                                  onClick={() => {handleDelete(book.book_id)}}
                                  className="inline-flex items-center gap-2 rounded-3xl border border-destructive/40 px-4 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete book
                                </button>
                                
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {view === "requests" && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-border/60 bg-surface p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">Book requests</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Review reader requests for your uploaded books and accept or decline them.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 border-b border-border/60">
                      {REQUEST_TABS.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setRequestTab(key)}
                          className={`flex items-center gap-2 px-4 py-3 text-sm transition ${
                            requestTab === key
                              ? "border-b-2 border-teal-bright text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                          <span className="rounded-full bg-surface px-2 py-0.5 text-xs">{counts[key]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {loading ? (
                      <div className="rounded-3xl border border-border/60 bg-background p-8 text-center text-muted-foreground">Loading requests…</div>
                    ) : selectedRequests.length === 0 ? (
                      <div className="rounded-3xl border border-border/60 bg-background p-8 text-center text-muted-foreground">
                        No {requestTab} requests.
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface">
                        <table className="w-full text-sm">
                          <thead className="bg-background/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                            <tr>
                              <th className="px-5 py-3">Book</th>
                              <th className="px-5 py-3">Reader</th>
                              <th className="px-5 py-3">Amount</th>
                              <th className="px-5 py-3">Requested</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {selectedRequests.map((request) => {
                              const requestId = request.request_id ?? request.id ?? "";
                              return (
                                <tr key={requestId}>
                                  <td className="px-5 py-4">
                                    <div className="font-medium">{request.book_name}</div>
                                    {request.note && <div className="mt-1 text-xs text-muted-foreground">{request.note}</div>}
                                  </td>
                                  <td className="px-5 py-4 text-muted-foreground">
                                    <div>{request.reader_name}</div>
                                    <div className="text-xs">{request.reader_email}</div>
                                  </td>
                                  <td className="px-5 py-4">
                                    {request.book_price != null ? `${request.currency ?? "USD"} ${request.book_price}` : <span className="text-muted-foreground">Free</span>}
                                  </td>
                                  <td className="px-5 py-4 text-muted-foreground">{new Date(request.sent_at).toLocaleDateString()}</td>
                                  <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => updateRequestStatus(requestId,request, "paid")}
                                        className="rounded-full bg-gradient-teal px-3 py-1.5 text-xs font-medium text-primary-foreground"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateRequestStatus(requestId, request,"declined")}
                                        className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {view === "details" && (
                <div className="rounded-3xl border border-border/60 bg-surface p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Admin details</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your account details are shown below for quick access.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
                      Role: <span className="font-semibold text-foreground">Admin</span>
                    </div>
                  </div>
                  <div className="mt-8 grid gap-5 lg:grid-cols-3">
                    <div className="rounded-3xl border border-border/60 bg-background p-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</p>
                      <p className="mt-3 text-lg font-semibold">{user?.user_metadata?.full_name ?? user?.email ?? "Admin"}</p>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-background p-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                      <p className="mt-3 text-lg font-semibold">{user?.email ?? "—"}</p>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-background p-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Role</p>
                      <p className="mt-3 text-lg font-semibold">Admin</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
