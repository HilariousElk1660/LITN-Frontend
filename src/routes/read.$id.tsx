import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, Suspense } from "react";
// import { getBook, sampleChapter } from "@/lib/books";
import logo from "@/assets/litn-logo.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import PdfViewer from "@/components/pdf-viewer";

export const Route = createFileRoute("/read/$id")({
  ssr: false,
  loader: ({ params }) => {
   return true
  },
  // head: ({ loaderData }) => ({
  //   meta: loaderData ? [{ title: `Reading — ${loaderData.book.title}` }] : [],
  // }),
  notFoundComponent: () => <div className="p-10">Not found</div>,
  errorComponent: ({ reset }) => <button onClick={reset}>retry</button>,
  component: Reader,
});

function AccessGate({ bookId, children }: { bookId: string; children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const [state, setState] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    setState("granted")
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
  const [book, setBook] = useState(null);
  const [pageStoppedAt, setPageStoppedAt] = useState(0);
  const { id } = Route.useParams();
  const { user, loading, backendUrl } = useAuth();
 
  const fetchBook = async (bookId: string) => {
    try {
      const base = backendUrl || "http://localhost:8000";
      const res = await fetch(`${base}/read_book/${bookId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch book " + res.statusText);
      }
      
      const bookData = await res.json();
      setBook(bookData);

      const readerId = user?.id || "1dd309e3-31d0-4f53-b58a-f1d36e6a1dc4";
      const res2 = await fetch(`${base}/reading_progress?book_id=${bookId}&reader_id=${readerId}`);
      if (res2.ok) {
        const data = await res2.json();
        if (data.page_stopped_at !== undefined) {
          setPageStoppedAt(Number(data.page_stopped_at));
        }else{
          setPageStoppedAt(1);
        }
      }
    } catch (e) {
      console.error("Error fetching book:", e);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchBook(id);
    }
  }, [id, loading, user?.id, backendUrl]);
  return (
    <AccessGate bookId={"d"}>
      <ReaderInner book={book} pageStoppedAt={pageStoppedAt} book_id={id} />
    </AccessGate>
  );
}

function ReaderInner({ book, pageStoppedAt, book_id }: { book: any; pageStoppedAt: number; book_id: string }) {
  

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading reader…</div>;
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading PDF…</div>}>
      {!pageStoppedAt? <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading PDF…</div>: (
        <PdfViewer
          initialPage={pageStoppedAt}
          file={book?.pdf_file_url}
          book_id={book_id}
        />
      )}
    </Suspense>
  

  );
}
