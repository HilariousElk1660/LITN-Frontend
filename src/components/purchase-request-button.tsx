import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Status = "pending" | "paid" | "declined";

export function PurchaseRequestButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("purchase_requests")
      .select("status")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setStatus((data?.status as Status) ?? null));

    const channel = supabase
      .channel(`pr_user_${user.id}_${bookId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_requests", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as { book_id: string; status: Status };
          if (row.book_id === bookId) setStatus((payload.new as any)?.status ?? null);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, bookId]);


  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/login"
        className="mt-2 flex w-full justify-center rounded-full border border-border bg-surface px-5 py-3 text-sm"
      >
        Sign in to request purchase
      </Link>
    );
  }

  if (status === "paid") {
    return (
      <div className="mt-2 w-full rounded-full border border-teal-bright/40 bg-teal/10 px-5 py-3 text-center text-sm text-teal-bright">
        ✓ Purchase approved
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="mt-2 w-full rounded-full border border-border bg-surface px-5 py-3 text-center text-sm text-muted-foreground">
        Request pending review
      </div>
    );
  }

  const request = async () => {
    setBusy(true);
    const { error } = await supabase.from("purchase_requests").insert({
      user_id: user.id,
      user_email: user.email ?? "",
      book_id: bookId,
      book_title: bookTitle,
      status: "pending",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setStatus("pending");
    toast.success("Request submitted for review");
  };

  return (
    <button
      onClick={request}
      disabled={busy}
      className="mt-2 w-full rounded-full border border-border bg-surface px-5 py-3 text-sm disabled:opacity-50"
    >
      {status === "declined" ? "Request again" : "Request to buy"}
    </button>
  );
}
