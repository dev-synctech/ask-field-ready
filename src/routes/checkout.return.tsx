import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: z.object({ session_id: z.string().optional() }).parse,
  component: ReturnPage,
});

function ReturnPage() {
  const { session_id } = Route.useSearch();
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <div className="max-w-md text-center">
        <div className="size-14 mx-auto rounded-2xl bg-success/15 text-success flex items-center justify-center">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-display font-semibold">You're in.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Payment received. Access is being activated. This usually takes a few seconds.
        </p>
        {session_id && <p className="mt-4 text-[10px] text-muted-foreground/70">Ref: {session_id.slice(0, 12)}…</p>}
        <Link to="/ask" className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium">
          Open the Ask screen
        </Link>
      </div>
    </div>
  );
}
