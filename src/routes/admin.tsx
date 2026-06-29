import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, Check, X, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RequireAdmin } from "@/components/require-admin";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · LITN" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  ),
});

type PR = {
  id: string;
  user_email: string;
  book_id: string;
  book_title: string;
  amount: number | null;
  currency: string;
  note: string | null;
  status: "pending" | "paid" | "declined";
  created_at: string;
  reviewed_at: string | null;
};

const TABS: Array<{ key: PR["status"]; label: string; icon: typeof Clock }> = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "paid", label: "Paid", icon: Check },
  { key: "declined", label: "Declined", icon: X },
];

function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<PR["status"]>("pending");
  const [rows, setRows] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_requests")
      .select("id,user_email,book_id,book_title,amount,currency,note,status,created_at,reviewed_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as PR[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("purchase_requests_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_requests" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new as PR, ...prev.filter((r) => r.id !== (payload.new as PR).id)];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((r) => (r.id === (payload.new as PR).id ? (payload.new as PR) : r));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== (payload.old as PR).id);
            }
            return prev;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const updateStatus = async (id: string, status: PR["status"]) => {
    const { error } = await supabase
      .from("purchase_requests")
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    load();
  };

  const filtered = rows.filter((r) => r.status === tab);
  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    paid: rows.filter((r) => r.status === "paid").length,
    declined: rows.filter((r) => r.status === "declined").length,
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-teal-bright" />
          <h1 className="font-display text-4xl">Super Admin Dashboard</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Review and process book purchase requests.</p>

        <div className="mt-8 flex gap-2 border-b border-border/60">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition ${
                tab === key
                  ? "border-b-2 border-teal-bright text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs">{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-surface">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No {tab} requests.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Book</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium">{r.book_title}</div>
                      {r.note && <div className="mt-1 text-xs text-muted-foreground">{r.note}</div>}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{r.user_email}</td>
                    <td className="px-5 py-4">
                      {r.amount ? `${r.currency} ${r.amount}` : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {r.status !== "paid" && (
                          <button
                            onClick={() => updateStatus(r.id, "paid")}
                            className="rounded-full bg-gradient-teal px-3 py-1.5 text-xs font-medium text-primary-foreground"
                          >
                            Mark paid
                          </button>
                        )}
                        {r.status !== "pending" && (
                          <button
                            onClick={() => updateStatus(r.id, "pending")}
                            className="rounded-full border border-border px-3 py-1.5 text-xs"
                          >
                            Pending
                          </button>
                        )}
                        {r.status !== "declined" && (
                          <button
                            onClick={() => updateStatus(r.id, "declined")}
                            className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
