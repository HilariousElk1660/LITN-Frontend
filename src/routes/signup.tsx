import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — LITN" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Welcome to LITN.");
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      return;
    }
    if (!result.redirected) navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="font-display text-4xl">Join LITN.</h1>
        <p className="mt-2 text-muted-foreground">
          A community-first reading platform. Currently in Alpha.
        </p>
        <form className="mt-10 space-y-4" onSubmit={onSubmit}>
          <input
            placeholder="Display name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={loading}
            className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <button
          onClick={onGoogle}
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm hover:border-primary"
        >
          Continue with Google
        </button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already on LITN?{" "}
          <Link to="/login" className="text-teal-bright hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
