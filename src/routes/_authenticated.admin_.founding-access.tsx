import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Building2, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { Header } from "./_authenticated.learn";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin_/founding-access")({
  head: () => ({ meta: [{ title: "Founding Access — Mizly Admin" }] }),
  component: FoundingAccessPage,
});

type Row = {
  id: string;
  email: string;
  firm: string | null;
  next_golive: string | null;
  pain: string | null;
  status: string;
  created_at: string;
};

const STATUS_CLS: Record<string, string> = {
  new: "bg-primary-soft text-primary",
  contacted: "bg-warning/15 text-warning",
  pilot: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground",
};

function FoundingAccessPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("founding_access_requests")
      .select("id,email,firm,next_golive,pain,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setError(error.message);
    } else {
      setRows((data as Row[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function setStatus(id: string, status: string) {
    const prev = rows;
    setRows(prev.map(r => r.id === id ? { ...r, status } : r));
    const { error } = await supabase.from("founding_access_requests").update({ status }).eq("id", id);
    if (error) {
      setRows(prev);
      toast.error("Update failed");
    } else {
      toast.success(`Marked ${status}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Header title="Founding access requests" subtitle="People who asked for early access to Mizly." />
        <button onClick={() => void load()} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive inline-flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Could not load submissions</div>
            <div className="mt-0.5 text-foreground/70">{error}. Admin sign-in is required to view requests.</div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && rows.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface">
            <div className="font-display font-semibold">No requests yet</div>
            <div className="text-sm text-muted-foreground mt-1">Submissions from the landing page will appear here.</div>
          </div>
        )}
        {rows.map(r => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CLS[r.status] ?? "bg-secondary text-secondary-foreground"}`}>{r.status}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Mail className="size-3.5 text-muted-foreground" /> {r.email}
                </div>
                {r.firm && (
                  <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="size-3" /> {r.firm}
                  </div>
                )}
                {r.next_golive && (
                  <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3" /> Next go-live: {r.next_golive}
                  </div>
                )}
                {r.pain && (
                  <div className="mt-1.5 text-xs text-foreground/80 rounded-lg bg-secondary/60 px-3 py-2">
                    <span className="font-medium">Pain: </span>{r.pain}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["contacted", "pilot", "archived"] as const).map(s => (
                  <button key={s} onClick={() => void setStatus(r.id, s)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
