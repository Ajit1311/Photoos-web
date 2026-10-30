"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  SkipForward,
  Sparkles,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  getCorporateCompany,
  saveCorporateCompany,
  type CorporateCompany,
} from "@/lib/corporate/corporate-service";

function CorporateOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<1 | 2>(
    searchParams.get("step") === "compliance" ? 2 : 1
  );
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<CorporateCompany | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("IT & Software Services");
  const [companySize, setCompanySize] = useState("50-200 Employees");
  const [location, setLocation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCorporateCompany().then((c) => {
      setCompany(c);
      if (c.name && c.name !== "Enterprise Tech Solutions") {
        setCompanyName(c.name);
      }
      if (c.contact_person) setContactPerson(c.contact_person);
      if (c.phone) setPhone(c.phone);
      if (c.location) setLocation(c.location);
    });
  }, []);

  // Save Step 1 (or proceed)
  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveCorporateCompany({
        name: companyName.trim() || company?.name || "Corporate Office",
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        industry,
        company_size: companySize,
        location: location.trim() || undefined,
      });
      setCurrentStep(2);
    } catch {
      setError("Failed to save company information.");
    } finally {
      setLoading(false);
    }
  };

  // Skip Step 1
  const handleSkipStep1 = () => {
    setCurrentStep(2);
  };

  // Complete Step 2 (Legal Compliance Acceptance)
  const handleAcceptCompliance = async () => {
    if (!termsAccepted) {
      setError("Please accept the Enterprise Terms & DPDP Compliance to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveCorporateCompany({
        compliance_accepted: true,
        compliance_accepted_at: new Date().toISOString(),
        subscription: {
          plan_name: "Corporate Enterprise (7-Day Free Trial)",
          plan_code: "corp_enterprise_7d_trial",
          status: "trialing",
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 7 * 86400000).toISOString(),
          days_remaining: 7,
        },
      });

      router.push("/corporate/dashboard");
    } catch {
      setError("Unable to record compliance consent. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0A3F61] selection:text-white font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A3F61] text-white font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">PhotoOS</span>
            <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Enterprise Setup
            </span>
          </div>
        </div>

        {/* Step Indicator & Theme Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full ${currentStep === 1 ? "bg-[#0A3F61] text-white font-bold" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>
              1. Company Info
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className={`px-2.5 py-1 rounded-full ${currentStep === 2 ? "bg-[#0A3F61] text-white font-bold" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
              2. Legal & Privacy
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {currentStep === 1 ? (
              /* STEP 1: COMPANY INFO */
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-2">
                    <Sparkles className="h-3 w-3 text-[#EF8619]" />
                    Step 1 of 2 &bull; Corporate Profile
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Tell us about your Company
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Add your company details to brand your event QR standees and employee photo portals.
                  </p>
                </div>

                <form onSubmit={handleSaveStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Company / Organization Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Technologies India Pvt Ltd"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Industry Domain
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                      >
                        <option value="IT & Software Services">IT & Software Services</option>
                        <option value="Banking & Financial Services">Banking & Financial Services</option>
                        <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                        <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                        <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                        <option value="Media & Advertising">Media & Advertising</option>
                        <option value="Consulting & Professional Services">Consulting & Services</option>
                        <option value="Other">Other Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Company Employee Count
                      </label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                      >
                        <option value="1-50 Employees">1-50 Employees</option>
                        <option value="50-200 Employees">50-200 Employees</option>
                        <option value="200-1000 Employees">200-1000 Employees</option>
                        <option value="1000+ Employees">1000+ Employees (Large Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Contact Person (HR / Admin)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="e.g. Parashram Naik"
                          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Office City / Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. BKC, Mumbai or Cyber City, Gurugram"
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-sm font-semibold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save & Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipStep1}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                      <SkipForward className="h-4 w-4 text-slate-500" />
                      Skip for Now
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 2: LEGAL COMPLIANCE & PRIVACY */
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 mb-2">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Step 2 of 2 &bull; Legal & Employee Privacy Compliance
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Enterprise Legal Agreement
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PhotoOS operates under strict privacy protections for employee biometric face matching.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 space-y-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 leading-relaxed max-h-56 overflow-y-auto">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-slate-900 dark:text-white">DPDP Act 2023 Compliance:</strong> Employee face search embeddings are computed strictly for personal photo delivery during your corporate events and are never sold or shared.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-slate-900 dark:text-white">Enterprise Data Ownership:</strong> All uploaded photos, albums, and company media remain 100% the intellectual property of your organization.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-slate-900 dark:text-white">7-Day Complimentary Trial:</strong> Your enterprise account includes full access to event creation, photo indexing, and standee QR generation for 7 days.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-slate-900 dark:text-white">Right to Erasure:</strong> Any employee can request deletion of their selfie descriptor at any time via the PhotoOS guest portal.
                    </p>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 cursor-pointer transition-colors mb-6">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    I represent this organization and accept the{" "}
                    <Link href="/terms" target="_blank" className="text-[#0A3F61] dark:text-sky-400 underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" className="text-[#0A3F61] dark:text-sky-400 underline font-semibold">
                      DPDP Employee Privacy Framework
                    </Link>.
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptCompliance}
                    disabled={!termsAccepted || loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-sm font-semibold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Activating Enterprise Account...
                      </>
                    ) : (
                      <>
                        Accept & Launch Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        PhotoOS Enterprise Onboarding &bull; Secure & Confidential
      </footer>
    </div>
  );
}

export default function CorporateOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
            <span>Loading Enterprise Onboarding...</span>
          </div>
        </div>
      }
    >
      <CorporateOnboardingContent />
    </Suspense>
  );
}
