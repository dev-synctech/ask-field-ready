import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MizlyLogo } from "@/components/MizlyLogo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Mizly" },
      { name: "description", content: "How Mizly handles information you provide while using the workflow answer engine." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><MizlyLogo size={28} /></Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14 prose prose-sm md:prose-base">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">v1 placeholder — pending attorney review</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mt-2">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Effective: June 2026</p>

        <section className="mt-8 space-y-5 text-sm text-foreground/85 leading-relaxed">
          <p>Mizly ("we", "us") is operated by SyncTech Innovations LLC, Huntington, NY. This policy explains what information we collect when you use Mizly and how we use it.</p>

          <div>
            <h2 className="font-display font-semibold text-foreground">What we collect</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Account information you submit (name, email, organization).</li>
              <li>Founding access and contact form submissions.</li>
              <li>Questions and feedback submitted to the Ask experience.</li>
              <li>Basic usage information (pages viewed, errors, device type).</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">What we do NOT collect</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Protected health information (PHI).</li>
              <li>Patient records, organization names, or system credentials.</li>
              <li>Vendor screenshots or proprietary training content.</li>
            </ul>
            <p className="mt-2 text-muted-foreground">Please do not paste PHI or organization-identifying detail into the Ask field.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">How we use information</h2>
            <p className="mt-2">To operate the service, improve workflow answers, respond to support requests, and prioritize founding access.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Sharing</h2>
            <p className="mt-2">We do not sell personal information. We use standard infrastructure providers (hosting, database, email) under their own privacy commitments.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Your choices</h2>
            <p className="mt-2">Email <a className="text-primary underline" href="mailto:support@mizly.app">support@mizly.app</a> to request access, correction, or deletion of information you submitted.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Contact</h2>
            <p className="mt-2">SyncTech Innovations LLC · Huntington, NY · <a className="text-primary underline" href="mailto:support@mizly.app">support@mizly.app</a></p>
          </div>
        </section>
      </main>
    </div>
  );
}
