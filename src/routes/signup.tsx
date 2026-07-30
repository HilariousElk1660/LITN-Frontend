import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { api, type AuthResponse } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — LITN" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await api.post<AuthResponse>("/auth/sign_up", {
        fullname,
        email,
        password,
      });
      api.saveSession(auth);
      toast.success("Account created. Welcome to LITN.");
      navigate({ to: "/login" });
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
        <h1 className="font-display text-3xl sm:text-4xl">Join LITN.</h1>
        <p className="mt-2 text-muted-foreground">
          A community-first reading platform. Currently in Alpha.
        </p>
        <form className="mt-10 space-y-4" onSubmit={onSubmit}>
          <input
            placeholder="Full name"
            required
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
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