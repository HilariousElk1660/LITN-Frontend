import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PurchaseRequestButton } from "@/components/purchase-request-button";
import { getBook } from "@/lib/books";
import { useEffect, useState } from "react";
import { useBooks } from "@/hooks/use-books";
import { Book } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/book/$id")({
  loader: ({ params }) => {
    return true
  },
  // head: ({ loaderData }) => ({
  
  // }),
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
  const {isSuperAdmin, backendUrl} = useAuth();
  const [book,setBook] = useState({});
  const [access,setAccess] = useState(false)
  const book_id = Route.useParams().id
  const {bookRequests} = useBooks()

  const fetchBook = async () => {
    const bookData = await fetch(`${backendUrl}/book/${book_id}`)
    const bookJson = await bookData.json();
    console.log("BOOK",bookJson);

    setBook({...bookJson,"book_divisions":JSON.parse(bookJson["book_divisions"]), "stuff":[]});

  };
  useEffect(()=>{
    if (isSuperAdmin) {
      console.log("CHECK",isSuperAdmin)
      return setAccess(true)
    }
    if (!bookRequests.length) return;
    setAccess(bookRequests?.find(req => req.book_id === book_id)?.status == "paid"); 

  },[bookRequests,book,isSuperAdmin])

  useEffect(() => {
    fetchBook();
  }, []);
  console.log("book",book)
  return (
    <div className="min-h-screen">
      <SiteHeader />

     { !book.book_name ? <div style={{ height: '80vh' }} className="mt-16 text-center text-muted-foreground">Loading book details …</div> : <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
        <div className="grid gap-12 md:grid-cols-[280px_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl shadow-glow">
              <img src={book.book_cover_url} alt={book.book_name} className="w-full" />
            </div>
           {access && <Link
              to="/read/$id"
              params={{ id: book.book_id }}
              className="mt-6 flex w-full justify-center rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Read
            </Link>}
            <PurchaseRequestButton
              bookId={book.book_id}
              adminId={book.admin_id}
              bookTitle={book.book_name}
              price={book.subscription_price}
              currency={book.currency  || "R"}
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-teal-bright">{book.category}</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">{book.book_name}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="font-display text-foreground">{book.currency|| "R"} {book.subscription_price}</span>
              {/* <span>★ {book.rating}</span> */}
              <span>{book.published_date}</span>
              <span>{book.chapters} chapters</span>
              {/* <span>{book.status === "Serialised" ? "New chapter weekly" : "Complete"}</span> */}
            </div>
            {/* <p className="mt-8 max-w-2xl text-lg leading-relaxed">{book.synopsis}</p> */}
            <div className="mt-12">
              <h2 className="font-display text-2xl">Chapters</h2>   
              <ol className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-surface">
              {book.book_divisions && book.book_divisions.map((name, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span><span className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>  <span className="ml-3">{name.title}</span></span>
                    {access && <Link to='/read/$id' params={{ id: book.book_id }} search={{ chapter: name.start_page }} className="text-teal-bright hover:underline">Read</Link>}
                  </li>
              ))
              }
                {/* {book["book_divisions"].map((name, i) => (
                  <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span><span className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>  <span className="ml-3">{name}</span></span>
                    <Link to="/read/$id" params={{ id: book.book_id }} className="text-teal-bright hover:underline">Read</Link>
                  </li>
                ))} */}
              </ol>
            </div>
          </div>
        </div>
      </div>}
      <SiteFooter />
    </div>
  );
}
