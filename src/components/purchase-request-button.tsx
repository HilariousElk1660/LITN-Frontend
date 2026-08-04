import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, Copy, Info,X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PAYMENT_INFO } from "@/lib/books";
import { useBooks } from "@/hooks/use-books";
import { api } from "@/lib/api";

type Status = "pending" | "paid" | "declined";

type Props = {
  bookId: string;
  bookTitle: string;
  price: number;
  currency: string;
};

export function PurchaseRequestButton({ bookId, adminId, bookTitle, price, currency }: Props) {
  const { user, loading, backendUrl } = useAuth();
  const {bookRequests, setBookRequests} = useBooks()
  const [status, setStatus] = useState<Status | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  console.log("requests",bookRequests)
  useEffect(() => {
    if (!user) return;
    if (bookRequests){
      setStatus(bookRequests.find((book) => book.book_id == bookId)?.status)
    }

  }, [user, bookId, bookRequests]);

  if (loading) return null;
  
  if (!user) {
    return (
      <Link
        to="/login"
        className="mt-2 flex w-full justify-center rounded-full border border-border bg-surface px-5 py-3 text-sm"
      >
        Sign in to order this book
      </Link>
    );
  }

  if (status === "paid") {
    return (
      <div className="mt-2 w-full rounded-full border border-teal-bright/40 bg-teal/10 px-5 py-3 text-center text-sm text-teal-bright">
        ✓ Order approved
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="mt-2 space-y-2">
        <div className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Info className="h-4 w-4 text-teal-bright" /> Order received — awaiting payment confirmation
          </div>
          <p className="mt-2 text-muted-foreground">
            We're checking for your Mobile Money payment. Once an admin confirms it (usually {PAYMENT_INFO.reviewWindow}),
            this book unlocks automatically on your account.
          </p>
          <p className="mt-2 text-muted-foreground">
            If you haven't paid yet, send <span className="font-semibold text-foreground">{currency} {price}</span> to{" "}
            <span className="font-semibold text-foreground">{PAYMENT_INFO.number}</span> ({PAYMENT_INFO.provider})
            and use <span className="font-semibold text-foreground">{user.email}</span> as the reference.
          </p>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setBusy(true)
    const payload= {
      book_id: bookId,
      admin_id: adminId,
      reader_id: user?.user_id,
      reader_name: user?.fullname,
      reader_email: user?.email,
      book_name:bookTitle,
      book_price: price
    }
    const token = api.getToken()

    try {

      const res = await fetch(`${backendUrl}/book_request`,{
          'method':'POST',
          'headers': {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
          'body':JSON.stringify(payload)
      });

      const data = await res.json()
      console.log("NEW",data)
      if (res.ok){
        setOpen(false)
        setBookRequests([...bookRequests,data?.new_request[0]])
      }else{
        toast.error("Was unable to send book request please try again later")
        setOpen(false)
      }

    } catch(e){
      console.error("error sending book request",e)
    } finally{
      setBusy(false)
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied"),
      () => toast.error("Couldn't copy"),
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
      >
        {status === "declined" ? `Order again — ${currency} ${price}` : `Order this book — ${currency} ${price}`}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={() => setOpen(false)}  aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-5 text-sm shadow-xl">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-foreground">Order {bookTitle}</h3>
            <p className="mt-1 text-muted-foreground">
              Pay by Mobile Money — no card required. Follow the three steps below.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)} 
            className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-3">
          <div className="text-muted-foreground">Amount due</div>
          <div className="font-display text-xl text-foreground">
            {currency} {price}
          </div>
        </div>

        {/* Payment steps */}
        <ol className="mt-5 space-y-4">
          <Step
            n={1}
            title={`Send ${currency} ${price} via ${PAYMENT_INFO.provider}`}
            body={
              <div className="mt-2 space-y-2">
                <Row label="Number" value={PAYMENT_INFO.number} onCopy={() => copy(PAYMENT_INFO.number)} />
                <Row label="Account name" value={PAYMENT_INFO.accountName} />
                <Row label="Amount" value={`${currency} ${price}`} onCopy={() => copy(String(price))} />
              </div>
            }
          />
          <Step
            n={2}
            title="Use your email as the payment reference"
            body={
              <div className="mt-2">
                <Row
                  label="Reference"
                  value={user.email ?? ""}
                  onCopy={() => copy(user.email ?? "")}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  This is how we match your payment to your account. Without it, confirmation is delayed.
                </p>
              </div>
            }
          />
          <Step
            n={3}
            title="Submit your order for review"
            body={
              <p className="mt-2 text-muted-foreground">
                Tap the button below after you've sent the money. An admin will confirm your payment {PAYMENT_INFO.reviewWindow},
                and this book will unlock automatically on your account — you'll see the change here without refreshing.
              </p>
            }
          />
        </ol>

        {/* What to expect */}
        <div className="mt-5 rounded-xl border border-teal/20 bg-teal/5 p-4">
          <div className="flex items-center gap-2 text-teal-bright">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">What happens next</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Your order is created with status <span className="text-foreground">Pending</span>.</li>
            <li>• An admin verifies your Mobile Money payment (usually {PAYMENT_INFO.reviewWindow}).</li>
            <li>• Once approved, this page updates to <span className="text-foreground">Approved</span> and the reader unlocks.</li>
            <li>• If the payment can't be found, the order is marked <span className="text-foreground">Declined</span> and you can order again.</li>
            <li>• You can only read the book after your order is approved.</li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-5 w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Submitting…" : "I've paid — submit my order"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Questions about your order? Reply to the confirmation email or contact support with your reference.
        </p>

      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-bright/40 bg-teal/10 text-xs font-semibold text-teal-bright">
        {n}
      </div>
      <div className="flex-1">
        <div className="font-medium text-foreground">{title}</div>
        {body}
      </div>
    </li>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-foreground">{value}</div>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Copy className="h-3 w-3" /> Copy
        </button>
      )}
    </div>
  );
}
