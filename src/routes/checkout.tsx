import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { createPayment } from "@/lib/payfast";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
    head: () => ({
        meta: [{ title: "Checkout — LITN" }],
    }),
    component: CheckoutPage,
});

function CheckoutPage() {
    const { backendUrl } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // TODO: replace with real order data — from route search params, cart state, or props
const order = {
  id: "order-" + Date.now(),
  itemName: "Membership — Monthly",
  amount: 149.0,
  requestId: "request-" + Date.now(),
  bookId: "placeholder-book-id",
  readerId: "placeholder-reader-id",
  readerEmail: "placeholder@example.com",
  readerName: "Placeholder Reader",
};

    async function handlePay() {
        setLoading(true);
        setError(null);
        try {
            const redirectUrl = await createPayment(String(backendUrl), {
                order_id: order.id,
                amount: order.amount,
                item_name: order.itemName,
                request_id: order.requestId,
                book_id: order.bookId,
                reader_id: order.readerId,
                reader_email: order.readerEmail,
                reader_name: order.readerName,
            });
            window.location.href = redirectUrl;
        } catch (err) {
            console.error(err);
            setError("Something went wrong starting your payment. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen">
            <SiteHeader />

            <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
                <div className="rounded-3xl border border-border/60 bg-surface p-6 sm:p-8 shadow-card">
                    <h1 className="font-display text-2xl sm:text-3xl">Checkout</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review your order before continuing to payment
                    </p>

                    <div className="mt-6 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{order.itemName}</span>
                        <span className="font-semibold text-foreground">R{order.amount.toFixed(2)}</span>
                    </div>

                    <div className="my-4 h-px bg-border/60" />

                    <div className="flex items-center justify-between text-base font-semibold">
                        <span>Total</span>
                        <span className="text-teal-bright">R{order.amount.toFixed(2)}</span>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handlePay}
                        disabled={loading}
                        className="mt-6 w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? "Redirecting to PayFast..." : "Pay with PayFast"}
                    </button>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5" /> Secured and processed by PayFast
                    </p>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}