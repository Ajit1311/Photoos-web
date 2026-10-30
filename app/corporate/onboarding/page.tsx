"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Globe,
  Loader2,
  Mail,
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

  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("Technology & Software");
  const [companySize, setCompanySize] = useState("50-200 Employees");
  const [location, setLocation] = useState("");

  useEffect(() => {
    void getCorporateCompany().then((c) => {
      setCompany(c);
      if (c.name && !c.name.startsWith("corp_")) {
        setCompanyName(c.name);
      }
      if (c.contact_person) setContactPerson(c.contact_person);
      if (c.phone) setPhone(c.phone);
      if (c.location) setLocation(c.location);
    });
  }, []);

  const handleSaveAndCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Please enter your Company Name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveCorporateCompany({
        name: companyName.trim(),
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        industry,
        company_size: companySize,
        location: location.trim() || undefined,
      });

      router.push("/corporate/events/new");
    } catch {
      setError("Failed to save company information. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToDashboard = async () => {
    setLoading(true);
    try {
      if (companyName.trim()) {
        await saveCorporateCompany({
          name: companyName.trim(),
        });
      }
      router.push("/corporate/dashboard");
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
              Company Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Legal Compliant
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="px-2.5 py-1 rounded-full bg-[#0A3F61] text-white font-bold">
              Company Details
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-2">
                <Sparkles className="h-3 w-3" />
                Step 2 &bull; Corporate Office Profile
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Set Up Your Company Profile
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                This information will appear on your office event Standee QRs and employee gallery headers.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveAndCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Contact Person (HR / People Team)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
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
                      placeholder="e.g. +91 98765 43210"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Office Location / Headquarters
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Baner, Pune, Maharashtra"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  >
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="Financial & Banking Services">Financial & Banking Services</option>
                    <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                    <option value="Manufacturing & Retail">Manufacturing & Retail</option>
                    <option value="Consulting & Professional">Consulting & Professional</option>
                    <option value="Education & EdTech">Education & EdTech</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  >
                    <option value="10-50 Employees">10-50 Employees</option>
                    <option value="50-200 Employees">50-200 Employees</option>
                    <option value="200-1,000 Employees">200-1,000 Employees</option>
                    <option value="1,000+ Employees">1,000+ Employees</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-sm font-semibold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Save & Create First Event
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleSkipToDashboard()}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1"
                >
                  Skip for Now & Go to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        © {new Date().getFullYear()} PhotoOS &bull; Enterprise Corporate Edition
      </footer>
    </div>
  );
}

export default function CorporateOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
            <span>Loading Corporate Setup...</span>
          </div>
        </div>
      }
    >
      <CorporateOnboardingContent />
    </Suspense>
  );
}
