import { ShieldAlert } from "lucide-react";
import { GUARDRAIL_BULLETS } from "@/lib/legal";
import { Link } from "@tanstack/react-router";

export function GuardrailCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-xs text-foreground/85 ${className}`}>
      <div className="font-semibold flex items-center gap-2 mb-2 text-destructive">
        <ShieldAlert className="size-3.5" /> Vendor posture &amp; sanitization guardrails
      </div>
      <ul className="space-y-1.5 list-disc pl-5">
        {GUARDRAIL_BULLETS.map(b => <li key={b}>{b}</li>)}
      </ul>
      <div className="mt-2 text-[11px] text-muted-foreground">
        See the{" "}
        <Link to="/legal" className="underline hover:text-foreground">trademark &amp; legal notice</Link>{" "}
        for vendor-neutrality policy.
      </div>
    </div>
  );
}
