import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, Crown, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { api, type AuthResponse } from "@/lib/api";

type LibraryEntry = {
  reader_book_id: string;
  book_id: string;
  book_name: string;
  author_name: string | null;
  book_cover_url: string | null;
  current_page: number;
  total_pages: number;
  current_chapter_index: number;
  total_chapters: number;
  percentage_completed: number | null;
  progress: "not_started" | "in_progress" | "done";
  last_opened: string | null;
  page_stopped_at: string | null;
  last_opened_on: string | null;
};

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Your profile — LITN" }] }),
  component: Profile,
});

function Profile() {
  const { user, isAdmin, isSuperAdmin, loading: authLoading, refresh } = useAuth();

  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [library, setLibrary] = useState<LibraryEntry[] | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<LibraryEntry[]>("/library/me")
      .then(setLibrary)
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLibraryLoading(false));
  }, [user]);

  const initials = (user?.fullname || user?.email || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const auth = await api.patch<AuthResponse>("/auth/profile", { fullname, email });
      api.saveSession(auth);
      refresh();
      toast.success("Profile updated.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.patch("/auth/password", {
        current_password: currentPassword,
        password: newPassword,
      });
      toast.success("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="font-display text-3xl sm:text-4xl">Sign in required.</h1>
          <p className="mt-2 text-muted-foreground">You need an account to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-teal text-lg font-semibold text-primary-foreground shadow-glow">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">Your profile.</h1>
            {isSuperAdmin ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-teal-bright/40 bg-teal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-teal-bright">
                <Crown className="h-3 w-3" /> Super Admin
              </span>
            ) : isAdmin ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-teal-bright/40 bg-teal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-teal-bright">
                <Shield className="h-3 w-3" /> Admin
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-muted-foreground">Manage your account details and password.</p>

        <form className="mt-10 space-y-4" onSubmit={onSaveProfile}>
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
          <button
            disabled={savingProfile}
            className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="mt-12 border-t border-border/60 pt-10">
          <h2 className="font-display text-2xl">Change password.</h2>
          <form className="mt-6 space-y-4" onSubmit={onChangePassword}>
            <input
              type="password"
              placeholder="Current password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              minLength={6}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={savingPassword}
              className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary disabled:opacity-60"
            >
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>

        <div className="mt-12 border-t border-border/60 pt-10">
          <h2 className="font-display text-2xl">Reading roadmap.</h2>
          <p className="mt-2 text-muted-foreground">Where you've left off across every book.</p>

          {libraryLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading your library…</p>
          ) : !library || library.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">You haven't started any books yet.</p>
          ) : (
            <ul className="mt-6 space-y-6">
              {library.map((entry) => {
                const pct = entry.percentage_completed ?? 0;
                const isDone = entry.progress === "done";
                return (
                  <li key={entry.reader_book_id}>
                    <Link
                      to="/read/$id"
                      params={{ id: entry.book_id }}
                      // search={{
                      //   page: entry.current_page,
                      //   chapter: entry.current_chapter_index,
                      // }}
                      className="block rounded-2xl border border-border/60 bg-surface p-5 transition hover:border-primary/60"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex items-start gap-3">
                          {entry.book_cover_url ? (
                            <img
                              src={entry.book_cover_url}
                              alt=""
                              className="h-14 w-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-border/60">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-bright" />
                              ) : entry.progress === "in_progress" ? (
                                <BookOpen className="h-4 w-4 shrink-0 text-teal-bright" />
                              ) : (
                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <p className="font-medium">{entry.book_name}</p>
                            </div>
                            {entry.author_name && (
                              <p className="mt-1 text-sm text-muted-foreground">{entry.author_name}</p>
                            )}
                          </div>
                        </div>
                        <span className="whitespace-nowrap text-sm font-medium text-teal-bright">
                          {pct}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border/60">
                        <div
                          className="h-full rounded-full bg-gradient-teal transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Page {entry.current_page} of {entry.total_pages}
                        </span>
                        <span>
                          Chapter {entry.current_chapter_index + 1} of {entry.total_chapters}
                        </span>
                        {entry.page_stopped_at && <span>Stopped at: {entry.page_stopped_at}</span>}
                        {entry.last_opened && (
                          <span>Last opened {new Date(entry.last_opened).toLocaleDateString()}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}