import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { MizlyLogo } from "@/components/MizlyLogo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mizly" },
      { name: "description", content: "Get in touch with the Mizly team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
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
      <main className="max-w-2xl mx-auto px-5 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-muted-foreground">Questions, pilot interest, or feedback? Reach out — we read everything.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="size-10 rounded-md bg-primary-soft text-primary flex items-center justify-center mb-3">
            <Mail className="size-5" />
          </div>
          <div className="text-sm text-muted-foreground">Email</div>
          <a href="mailto:support@mizly.app" className="block mt-1 text-lg font-display font-semibold text-foreground hover:text-primary">support@mizly.app</a>

          <div className="mt-6 pt-5 border-t border-border text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Operated by</div>
            <div className="mt-1">SyncTech Innovations LLC</div>
            <div>Huntington, NY</div>
          </div>
        </div>

        <div className="mt-6 text-sm">
          <Link to="/" className="text-primary hover:underline">← Back to Mizly</Link>
        </div>
      </main>
    </div>
  );
}
