import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Redirecting…
      </div>
    );
  }
  return <>{children}</>;
}
