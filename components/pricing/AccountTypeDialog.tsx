"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  UserRound,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PricingAccountType =
  | "personal"
  | "studio_owner";

type AccountTypeDialogProps = {
  open: boolean;
  onSelect: (accountType: PricingAccountType) => void;
};

const accountTypes = [
  {
    id: "personal" as const,
    title: "Personal User",
    description:
      "For photographers or individuals managing their own work and clients.",
    icon: UserRound,
    points: [
      "Personal workspace",
      "Manage your own projects",
      "Simple PhotoOS experience",
    ],
  },
  {
    id: "studio_owner" as const,
    title: "Studio Owner",
    description:
      "For photography studios managing teams, clients, events and business operations.",
    icon: Building2,
    points: [
      "Studio workspace",
      "Team and client management",
      "Business-ready PhotoOS tools",
    ],
  },
];

export function AccountTypeDialog({
  open,
  onSelect,
}: AccountTypeDialogProps) {
  const [selected, setSelected] =
    useState<PricingAccountType | null>(null);

  function handleContinue() {
    if (!selected) {
      return;
    }

    onSelect(selected);
  }

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        <div className="bg-gradient-to-br from-[#0a3f61] via-[#0d4d73] to-[#0a3550] px-6 py-8 text-white sm:px-8">
          <DialogHeader className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Welcome to PhotoOS
            </p>

            <DialogTitle className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              How will you use PhotoOS?
            </DialogTitle>

            <DialogDescription className="mt-2 max-w-xl text-sm leading-6 text-white/75">
              Choose the workspace type that best matches your needs.
              You can continue to your plans after this selection.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          {accountTypes.map((account) => {
            const Icon = account.icon;
            const isSelected = selected === account.id;

            return (
              <button
                key={account.id}
                type="button"
                onClick={() => setSelected(account.id)}
                className={[
                  "group relative rounded-2xl border p-5 text-left transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-[#0a3f61]/30",
                  isSelected
                    ? "border-[#0a3f61] bg-[#f3f8fb] shadow-md"
                    : "border-slate-200 bg-white hover:border-[#0a3f61]/40 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      isSelected
                        ? "bg-[#0a3f61] text-white"
                        : "bg-slate-100 text-[#0a3f61]",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-[#0a3f61] bg-[#0a3f61] text-white"
                        : "border-slate-300 text-transparent",
                    ].join(" ")}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {account.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {account.description}
                </p>

                <div className="mt-5 space-y-2">
                  {account.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 text-xs font-medium text-slate-600"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {point}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs leading-5 text-slate-400">
            Your selection helps us prepare the right PhotoOS workspace.
          </p>

          <button
            type="button"
            disabled={!selected}
            onClick={handleContinue}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0a3f61] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
