"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { CorporateShell } from "@/components/corporate/CorporateShell";
import {
  getCorporateCompany,
  saveCorporateCompany,
  type CorporateCompany,
} from "@/lib/corporate/corporate-service";

export default function CorporateProfilePage() {
  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    async function load() {
      const comp = await getCorporateCompany();
      setCompany(comp);
      setName(comp.name || "");
      setContactPerson(comp.contact_person || "");
      setWorkEmail(comp.work_email || "");
      setPhone(comp.phone || "");
      setIndustry(comp.industry || "IT & Software Services");
      setCompanySize(comp.company_size || "50-200 Employees");
      setLocation(comp.location || "");
      setWebsite(comp.website || "");
      setLogoUrl(comp.logo_url || "");
      setLoading(false);
    }
    void load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await saveCorporateCompany({
        name: name.trim(),
        contact_person: contactPerson.trim(),
        work_email: workEmail.trim(),
        phone: phone.trim(),
        industry,
        company_size: companySize,
        location: location.trim(),
        website: website.trim(),
        logo_url: logoUrl.trim(),
      });
      setCompany(updated);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CorporateShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Company Profile & Enterprise Subscription
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure your corporate office branding and view your 7-day complimentary enterprise trial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Edit Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Corporate Organization Details
              </h2>

              {savedFeedback && (
                <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Company profile updated successfully!</span>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      HR / Admin Lead Contact
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Parashram Naik"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. IT & Software Services"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Office Address / City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. BKC, Bandra East, Mumbai, Maharashtra"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#072c44] transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Company Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Subscription & Compliance Sidebar Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Free Trial Card */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Free Trial Active
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {company?.subscription?.days_remaining ?? 7} Days Left
                </span>
              </div>

              <h2 className="text-xl font-bold">
                {company?.subscription?.plan_name || "Corporate Enterprise Plan"}
              </h2>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Your company has full, unrestricted access to AI Face Recognition, Reception Standee QR generation, and private photo delivery.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Unlimited Event Guest Face Searches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Branded Office Standee QR Posters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>DPDP Act 2023 Biometric Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Dedicated Enterprise Support</span>
                </div>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <ShieldCheck className="h-4 w-4 text-sky-500" />
                <span>Enterprise Legal & Privacy Status</span>
              </div>
              <p>
                Compliance accepted on:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {company?.compliance_accepted_at ? new Date(company.compliance_accepted_at).toLocaleDateString() : "Active"}
                </strong>
              </p>
              <p className="text-[11px] text-slate-500">
                All employee facial vectors are encrypted in transit and at rest in accordance with ISO 27001 and DPDP guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CorporateShell>
  );
}

