"use client";

import {
  Banknote,
  CircleDollarSign,
  Wallet,
} from "lucide-react";

import {
  ProjectStatCard,
} from "./ProjectStatCard";

import type {
  ProjectDto,
} from "@/types/api/project";

type ProjectFinancialCardProps = {
  project: ProjectDto;
};

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

export function ProjectFinancialCard({
  project,
}: ProjectFinancialCardProps) {

  return (

    <div className="grid gap-5 md:grid-cols-3">

      <ProjectStatCard
        title="Budget"
        value={formatCurrency(
          project.budget,
        )}
        icon={Wallet}
      />

      <ProjectStatCard
        title="Advance Received"
        value={formatCurrency(
          project.advance_amount,
        )}
        icon={CircleDollarSign}
      />

      <ProjectStatCard
        title="Balance Amount"
        value={formatCurrency(
          project.balance_amount,
        )}
        icon={Banknote}
      />

    </div>

  );

}