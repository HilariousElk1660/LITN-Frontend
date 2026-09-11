import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/payment/cancelled")({
    head: () => ({
        meta: [{ title: "Payment Cancelled — LITN" }],
    }),
    component: () => (
        <div className="min-h-screen">
            <SiteHeader />
            <main className="mx-auto max-w-md px-4 py-24 sm:px-6">
                <div className="rounded-3xl border border-border/60 bg-surface p-6 sm:p-8 shadow-card text-center">
                    <h1 className="font-display text-2xl sm:text-3xl text-foreground">
                        Payment Cancelled
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your payment was not completed. No charges were made.
                    </p>

                    <Link
                        to="/checkout"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-teal px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
                    >
                        Try again
                    </Link>
                </div>
            </main>
            <SiteFooter />
        </div>
    ),
});