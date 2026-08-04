import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookOpen, ShieldCheck, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LITN — Medical training, made readable." },
      {
        name: "description",
        content:
          "LITN is a focused medical-training library: exam-oriented anatomy, pharmacology, emergency medicine and clinical review — sign in to browse the full catalogue.",
      },
      { property: "og:title", content: "LITN — Medical training, made readable." },
      {
        property: "og:description",
        content:
          "A focused medical-training library. Sign in to browse anatomy, pharmacology, emergency medicine and clinical review titles.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const {user} = useAuth()
  if (user?.email) window.location.href = "/home"
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-teal/15 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:pt-28 sm:pb-24 md:pt-40 md:pb-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs uppercase tracking-widest text-teal-bright">
            <Stethoscope className="h-3.5 w-3.5" /> Medical training library
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
            Clinical books,{" "}
            <span className="text-gradient-teal">built for study.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            LITN is a curated library of medical-training titles — anatomy, pharmacology,
            emergency medicine, cardiology and clinical review — written for students,
            interns and early-career clinicians.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="w-full rounded-full bg-gradient-teal px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-90 sm:w-auto"
            >
              Create an account
            </Link>
            <Link
              to="/login"
              className="w-full rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition hover:bg-surface/70 sm:w-auto"
            >
              Sign in to browse
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sign in to view the full catalogue and place an order.
          </p>
        </div>
      </section>

      {/* What is LITN */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<BookOpen className="h-5 w-5" />}
            title="Focused, exam-ready"
            body="Every title is written around learning objectives — high-yield summaries, case correlations, and rapid-recall notes."
          />
          <Feature
            icon={<Stethoscope className="h-5 w-5" />}
            title="Clinically grounded"
            body="Authored and reviewed by practising clinicians so the material reflects real bedside decisions, not just textbook ideals."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Simple, transparent ordering"
            body="Order a book, pay via mobile money, and get access as soon as your payment is confirmed. No subscriptions, no surprises."
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal/15 text-teal-bright">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
