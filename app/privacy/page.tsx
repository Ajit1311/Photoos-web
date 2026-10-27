import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, UserCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | PhotoOS",
  description:
    "PhotoOS Privacy Policy in compliance with India's Digital Personal Data Protection (DPDP) Act 2023 and global privacy standards.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
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
            DPDP Act 2023 Compliant
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <Lock className="h-3.5 w-3.5" />
            Digital Personal Data Protection (DPDP) Act, 2023 Notice
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Privacy Policy & Data Protection Notice
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date: October 27, 2026 | Last Updated: October 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300">
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <UserCheck className="h-5 w-5 text-sky-400" />
              1. Introduction & Data Fiduciary Details
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              PhotoOS (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates as a
              <strong> Data Fiduciary</strong> under India&apos;s Digital Personal Data Protection
              Act, 2023 (DPDP Act). We provide photography studio workflow, CRM, client galleries,
              and AI-powered face-matching services for professional studios and their clients (&ldquo;Data Principals&rdquo;).
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">Data Protection Officer / Grievance Officer:</p>
              <p className="mt-1">Designation: Grievance Officer & Data Protection Lead</p>
              <p>Email: privacy@photoos.io | grievance@photoos.io</p>
              <p>Response Time: Within 72 hours for all grievance redressal requests.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Categories of Personal Data Processed</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>
                <strong>Identity & Contact Data:</strong> Full name, email address, phone number, studio name, business registration data.
              </li>
              <li>
                <strong>Client & Booking Data:</strong> Event dates, photography deliverables, shoot locations, customer communications.
              </li>
              <li>
                <strong>Event Media & Assets:</strong> Photographs, raw imagery, proofs, and video deliverables uploaded by photography studios.
              </li>
              <li>
                <strong>Biometric / Facial Vector Data:</strong> Geometric face embeddings generated exclusively for guest face-search discovery, processed only with explicit affirmative consent.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> IP address, device fingerprints, login audit timestamps, and security logs.
              </li>
            </ul>
          </section>

          <section className="space-y-4 rounded-2xl border border-sky-500/20 bg-sky-950/10 p-6">
            <h2 className="text-xl font-bold text-sky-300">3. Facial Biometrics & Face-Search Notice</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Under Section 6 of the DPDP Act 2023, biometric information requires clear, unconditional, and explicit affirmative consent:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>
                <strong>Purpose Specification:</strong> Facial vectors are extracted solely to allow event attendees to find their photos in large event galleries.
              </li>
              <li>
                <strong>No Third-Party Sharing:</strong> Facial vectors are never sold, shared with advertising networks, or used to train external public foundation models.
              </li>
              <li>
                <strong>Immediate Erasure on Request:</strong> Attendees may withdraw consent or purge their biometric profile at any time through our automated Self-Service Privacy portal.
              </li>
              <li>
                <strong>Retention Limit:</strong> Biometric embeddings are automatically expired and deleted 90 days following event closure or upon studio plan termination.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Rights of the Data Principal</h2>
            <p className="text-sm text-slate-300">
              In accordance with Chapter III of the DPDP Act 2023, you have the following rights:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="font-semibold text-white">Right to Access Information</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Request a complete summary of all personal data being processed about you.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="font-semibold text-white">Right to Correction & Erasure</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Correct inaccurate personal data or request complete deletion of your account and biometric data.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="font-semibold text-white">Right of Grievance Redressal</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Direct complaint redressal within 72 hours via our designated Grievance Officer.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="font-semibold text-white">Right to Nominate</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Nominate any other individual to exercise your privacy rights in event of incapacity or death.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Security Safeguards</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              PhotoOS implements rigorous organizational and technical measures including AES-256 object encryption on Cloudflare R2, SSL/TLS 1.3 in transit, strict tenant-scoped PostgreSQL Row Level Security (RLS), and continuous rate-limiting protection.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">6. Exercise Your Rights</h2>
            <p className="mt-2 text-sm text-slate-300">
              To request a machine-readable export of your data or permanently delete your account and biometric vectors, you can use our automated API endpoints or contact our Grievance Officer:
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
              >
                <FileText className="h-4 w-4" />
                Manage Data in Dashboard
              </Link>
              <a
                href="mailto:grievance@photoos.io?subject=DPDP%20Data%20Request"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                Contact Grievance Officer
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

