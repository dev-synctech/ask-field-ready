import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, Sparkles } from "lucide-react";

// TODO: REMOVE BEFORE PRODUCTION LAUNCH — demo build replaces sign-in with one-tap Enter Demo.
export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    mode: z.enum(['signin', 'signup']).optional(),
    redirect: z.string().optional(),
  }).parse,
  component: DemoEntry,
});

function DemoEntry() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-16 flex items-center">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-[11px] text-muted-foreground mb-5">
            <Sparkles className="size-3 text-primary" /> Demo preview
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Enter Mizly</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No sign-in, no payment. This preview opens the full experience — Ask, Learn, Playbooks, Scenarios, Videos, Checklists, and Admin.
          </p>
          <Link
            to="/ask"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-shadow"
          >
            Enter Demo <ArrowRight className="size-4" />
          </Link>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Phase 2 will reintroduce sign-in. Phase 4 adds payment. Not now.
          </div>
        </div>
      </div>
    </div>
  );
}
