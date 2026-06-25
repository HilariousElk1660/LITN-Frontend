import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — LITN" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="font-display text-4xl">Welcome back.</h1>
        <p className="mt-2 text-muted-foreground">Sign in to pick up where you left off.</p>
        <form className="mt-10 space-y-4">
          <input type="email" placeholder="Email" className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary" />
          <input type="password" placeholder="Password" className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary" />
          <button className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">Sign in</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to LITN? <Link to="/signup" className="text-teal-bright hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
