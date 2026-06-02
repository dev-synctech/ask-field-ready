import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, RotateCcw, Tags, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import {
  useTaxonomy, addTerm, removeTerm, resetCategory,
  ALL_CATEGORIES, CATEGORY_LABEL, CATEGORY_HELP,
  type TaxonomyCategory,
} from "@/lib/taxonomy";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/taxonomy")({
  head: () => ({ meta: [{ title: "Taxonomy — Mizly" }] }),
  component: TaxonomyPage,
});

function TaxonomyPage() {
  const data = useTaxonomy();

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to admin
      </Link>
      <div className="mt-2">
        <Header
          title="Taxonomy"
          subtitle="Roles, domains, phases, urgency, escalation, frequency."
        />
      </div>

      <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/80 flex gap-2">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          Taxonomy controls how Mizly routes questions, filters content, and later powers Ask retrieval.
          All terms are vendor-neutral and PHI-free.
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {ALL_CATEGORIES.map(cat => (
          <CategoryCard key={cat} category={cat} terms={data[cat]} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category, terms }: { category: TaxonomyCategory; terms: ReturnType<typeof useTaxonomy>[TaxonomyCategory] }) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    addTerm(category, value);
    setValue("");
    toast.success(`Added to ${CATEGORY_LABEL[category]}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-display font-semibold inline-flex items-center gap-2">
          <Tags className="size-4 text-primary" /> {CATEGORY_LABEL[category]}
          <span className="text-[10px] text-muted-foreground font-normal">({terms.length})</span>
        </div>
        <button
          type="button"
          onClick={() => { resetCategory(category); toast.success("Reset to seed"); }}
          className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          aria-label={`Reset ${CATEGORY_LABEL[category]} to seed`}
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{CATEGORY_HELP[category]}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {terms.map(t => (
          <li key={t.id} className="group inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px]">
            <span>{t.label}</span>
            <button
              type="button"
              onClick={() => { removeTerm(category, t.id); toast.success("Removed"); }}
              className="opacity-60 hover:opacity-100 hover:text-destructive p-0.5"
              aria-label={`Remove ${t.label}`}
            >
              <Trash2 className="size-3" />
            </button>
          </li>
        ))}
        {terms.length === 0 && (
          <li className="text-[11px] text-muted-foreground italic">No terms. Add one below or reset to seed.</li>
        )}
      </ul>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <label htmlFor={`add_${category}`} className="sr-only">Add term to {CATEGORY_LABEL[category]}</label>
        <input
          id={`add_${category}`}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`Add to ${CATEGORY_LABEL[category]}…`}
          className="h-8 flex-1 rounded-lg border border-input bg-surface-elevated px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1">
          <Plus className="size-3.5" /> Add
        </button>
      </form>
    </div>
  );
}
