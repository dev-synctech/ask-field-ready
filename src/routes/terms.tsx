import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MizlyLogo } from "@/components/MizlyLogo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Mizly" },
      { name: "description", content: "Terms governing use of the Mizly workflow answer engine." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">v1 placeholder — pending attorney review</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mt-2">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Effective: June 2026</p>

        <section className="mt-8 space-y-5 text-sm text-foreground/85 leading-relaxed">
          <p>By using Mizly you agree to these terms. Mizly is operated by SyncTech Innovations LLC, Huntington, NY.</p>

          <div>
            <h2 className="font-display font-semibold text-foreground">Service</h2>
            <p className="mt-2">Mizly is a workflow wiki and answer engine for healthcare go-live consultants. It provides plain-language workflow answers: what to check, what to say, where to click, when to escalate. Mizly is a training and support tool. It does not replace local policy, vendor documentation, or clinical judgment.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Acceptable use</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Do not paste protected health information (PHI) into Mizly.</li>
              <li>Do not submit organization-identifying detail, credentials, or vendor screenshots.</li>
              <li>Do not use Mizly to make clinical decisions without confirming local policy.</li>
              <li>Do not resell, scrape, or republish Mizly content without written permission.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">No warranty</h2>
            <p className="mt-2">Mizly is provided "as is" without warranty of any kind. Workflow names and screens vary by organization. Always confirm local policy before acting.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Limitation of liability</h2>
            <p className="mt-2">To the maximum extent permitted by law, SyncTech Innovations LLC is not liable for indirect, incidental, or consequential damages arising from use of Mizly.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Trademarks</h2>
            <p className="mt-2">Vendor product names are trademarks of their respective owners. Mizly is independent and not affiliated with, endorsed by, sponsored by, or certified by any EHR vendor. See the <Link to="/legal" className="text-primary underline">trademark notice</Link>.</p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-foreground">Changes</h2>
            <p className="mt-2">We may update these terms. Continued use after an update means you accept the revised terms.</p>
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
