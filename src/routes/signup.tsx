import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — LITN" }] }),
  component: Signup,
});

function Signup() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="font-display text-4xl">Join LITN.</h1>
        <p className="mt-2 text-muted-foreground">A community-first reading platform. Currently in Alpha.</p>
        <form className="mt-10 space-y-4">
          <input placeholder="Display name" className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary" />
          <input type="email" placeholder="Email" className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary" />
          <input type="password" placeholder="Password" className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary" />
          <button className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">Create account</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Google", "Facebook", "Kindle"].map((p) => (
            <button key={p} className="rounded-full border border-border bg-surface px-3 py-2 text-xs hover:border-primary">{p}</button>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already on LITN? <Link to="/login" className="text-teal-bright hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
