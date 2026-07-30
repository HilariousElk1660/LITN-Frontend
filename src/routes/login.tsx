import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { api, type AuthResponse } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — LITN" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await api.post<AuthResponse>("/auth/sign_in", { email, password });
      api.saveSession(auth);
      refresh();
      toast.success("Welcome back.");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl sm:text-4xl">Welcome back.</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to pick up where you left off.
        </p>
        <form className="mt-10 space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={loading}
            className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to LITN?{" "}
          <Link to="/signup" className="text-teal-bright hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}