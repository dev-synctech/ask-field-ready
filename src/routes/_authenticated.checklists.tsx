import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCheck, Check } from "lucide-react";
import { itemsByType } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/checklists")({
  head: () => ({ meta: [{ title: "Checklists — Mizly" }] }),
  component: ChecklistsPage,
});

// Mock per-checklist items (demo only).
const CHECKLIST_ITEMS: Record<string, string[]> = {
  c1: ["Badge visible", "Phone + charger", "Contact list saved", "Downtime kit in bag", "Comfortable shoes"],
  c2: ["Paper forms", "Pens (3+)", "Identity capture sheet", "Watch with seconds", "Snack + water"],
  c3: ["Scope: how many units?", "Severity: 1–4", "Screenshot policy followed", "Requester name + role", "Callback number"],
  c4: ["First name", "Last name", "DOB", "MRN if known", "Arrival time"],
};

function ChecklistsPage() {
  const checklists = itemsByType("checklist");
  const [openId, setOpen] = useState<string | null>(checklists[0]?.id ?? null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setChecked(c => ({ ...c, [k]: !c[k] }));
  const active = checklists.find(c => c.id === openId);
  const items = active ? CHECKLIST_ITEMS[active.id] ?? [] : [];
  const done = items.filter(i => checked[`${active?.id}:${i}`]).length;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Checklists" subtitle="Quick, carry-the-pager references for the moments that matter." />
      <div className="mt-6 grid md:grid-cols-[260px_1fr] gap-4">
        <div className="space-y-2">
          {checklists.map(c => {
            const active = openId === c.id;
            return (
              <button key={c.id} onClick={() => setOpen(c.id)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${active ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:bg-secondary'}`}>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <ClipboardCheck className="size-3 text-primary" /> Checklist
                </div>
                <div className="mt-1 text-sm font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{c.summary}</div>
              </button>
            );
          })}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          {active ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Checklist</div>
                  <div className="font-display font-semibold text-lg">{active.title}</div>
                </div>
                <div className="text-xs text-muted-foreground">{done}/{items.length}</div>
              </div>
              <ul className="mt-4 space-y-2">
                {items.map(i => {
                  const k = `${active.id}:${i}`;
                  const on = !!checked[k];
                  return (
                    <li key={k}>
                      <button onClick={() => toggle(k)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${on ? 'border-success/50 bg-success/10' : 'border-border hover:bg-secondary'}`}>
                        <span className={`size-5 rounded-md border flex items-center justify-center ${on ? 'bg-success border-success text-success-foreground' : 'border-border-strong'}`}>
                          {on && <Check className="size-3.5" />}
                        </span>
                        <span className={`text-sm ${on ? 'line-through text-muted-foreground' : ''}`}>{i}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Pick a checklist.</div>
          )}
        </div>
      </div>
    </div>
  );
}
