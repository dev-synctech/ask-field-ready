import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { TRADEMARK_NOTICE } from "@/lib/legal";
import { MizlyLogo } from "@/components/MizlyLogo";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Trademark & Legal Notice — Mizly" },
      { name: "description", content: "Mizly trademark, vendor-neutrality, and legal notice." },
      { property: "og:title", content: "Trademark & Legal Notice — Mizly" },
      { property: "og:description", content: "Mizly is an independent training and field-support product. Not affiliated with EHR vendors." },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Mizly home">
            <MizlyLogo size={28} />
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <ShieldCheck className="size-3.5 text-primary" /> Vendor-neutral by design
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Trademark &amp; Legal Notice
        </h1>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-foreground/85">
          {TRADEMARK_NOTICE}
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display font-semibold">Content posture</h2>
          <ul className="mt-2 space-y-2 text-sm text-foreground/85 list-disc pl-5">
            <li>Mizly content is rewritten as original, vendor-neutral workflow guidance.</li>
            <li>No vendor logos, screenshots, manuals, or tip sheets are published in Mizly.</li>
            <li>No PHI, organization names, credentials, or links to private systems are published.</li>
            <li>Where vendor families are referenced (e.g. &ldquo;Epic-style workflows&rdquo;), the reference is descriptive only.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display font-semibold">Safety reminder for learners</h2>
          <p className="mt-2 text-sm text-foreground/85">
            Workflow names and screens may vary by organization. Always confirm local policy before acting.
          </p>
        </section>

        <div className="mt-10 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to Mizly</Link>
        </div>
      </main>
    </div>
  );
}
