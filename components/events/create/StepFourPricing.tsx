"use client";

import { useMemo } from "react";

import PriceCard from "./PriceCard";

import { useEventWizard } from "@/context/EventWizardContext";

export default function StepFourPricing() {
  const { data, setField } = useEventWizard();

  const balance = useMemo(() => {
    return Math.max(
      0,
      data.packageAmount -
        data.advanceAmount -
        data.discount,
    );
  }, [
    data.packageAmount,
    data.advanceAmount,
    data.discount,
  ]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        Pricing & Payment
      </h2>

      <p className="mt-2 text-slate-500">
        Configure the commercial details for this event.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {/* ============================================================
            PACKAGE AMOUNT
            ============================================================ */}

        <PriceCard
  label="Package Amount"
  value={data.packageAmount}
  placeholder="0"
  onChange={(value) =>
    setField("packageAmount", value)
  }
/>

<PriceCard
  label="Advance Received"
  value={data.advanceAmount}
  placeholder="0"
  onChange={(value) =>
    setField("advanceAmount", value)
  }
/>

<PriceCard
  label="Discount"
  value={data.discount}
  placeholder="0"
  onChange={(value) =>
    setField("discount", value)
  }
/>

<PriceCard
  label="Balance Amount"
  value={balance}
  placeholder="0"
  disabled
  onChange={() => {}}
/>

        {/* ============================================================
            PAYMENT DUE DATE
            ============================================================ */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Due Date
          </label>

          <input
            type="date"
            value={data.paymentDueDate}
            onChange={(event) =>
              setField(
                "paymentDueDate",
                event.target.value,
              )
            }
            className="w-full rounded-2xl border border-slate-200 p-3"
          />
        </div>

        {/* ============================================================
            PAYMENT STATUS
            ============================================================ */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Status
          </label>

          <select
            value={data.paymentStatus}
            onChange={(event) =>
              setField(
                "paymentStatus",
                event.target.value as
                  | "pending"
                  | "advance_paid"
                  | "paid",
              )
            }
            className="w-full rounded-2xl border border-slate-200 p-3"
          >
            <option value="pending">
              Pending
            </option>

            <option value="advance_paid">
              Advance Paid
            </option>

            <option value="paid">
              Fully Paid
            </option>
          </select>
        </div>
      </div>

      {/* ================================================================
          PAYMENT SUMMARY
          ================================================================ */}

      <div className="mt-8 rounded-2xl bg-[#0A3F61]/5 p-5">

        <h3 className="font-semibold text-[#0A3F61]">
          Payment Summary
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">

          {/* TOTAL */}

          <div>
            <p className="text-sm text-slate-500">
              Total
            </p>

            <p className="text-xl font-bold">
              ₹
              {data.packageAmount.toLocaleString(
                "en-IN",
              )}
            </p>
          </div>

          {/* RECEIVED */}

          <div>
            <p className="text-sm text-slate-500">
              Received
            </p>

            <p className="text-xl font-bold text-green-600">
              ₹
              {data.advanceAmount.toLocaleString(
                "en-IN",
              )}
            </p>
          </div>

          {/* BALANCE */}

          <div>
            <p className="text-sm text-slate-500">
              Balance
            </p>

            <p className="text-xl font-bold text-orange-600">
              ₹
              {balance.toLocaleString(
                "en-IN",
              )}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}