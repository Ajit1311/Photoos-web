import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | PhotoOS",
  description: "Terms of Service and Studio Master Subscription Agreement for PhotoOS.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PhotoOS
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <ShieldCheck className="h-4 w-4" />
            Production Terms
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <FileText className="h-3.5 w-3.5" />
            Studio SaaS Agreement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Terms of Service & Studio Agreement
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date: October 27, 2026 | Last Updated: October 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300">
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              By accessing or using PhotoOS, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations of India and your jurisdiction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Studio Accounts & Tenancy</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Photography studios are granted a non-exclusive, non-transferable subscription to manage digital assets, client proofs, and events. Studios are responsible for maintaining the confidentiality of their account credentials and ensuring that all client and event participant data is processed with lawful consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Intellectual Property Rights</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              All photography assets, watermarks, client deliverables, and studio logos remain the exclusive intellectual property of the studio or its licensors. PhotoOS claims no ownership rights over your creative assets.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Fair Use & Storage Quotas</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Storage quotas on Cloudflare R2 and compute usage for AI face-matching are governed by the active subscription tier. Automated scraping, reverse engineering, or rate-limit evasion is strictly prohibited.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">5. Governing Law & Dispute Resolution</h2>
            <p className="mt-2 text-sm text-slate-300">
              These Terms shall be governed by and construed in accordance with the laws of India, including the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023. Courts in Mumbai, India shall have exclusive jurisdiction.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
