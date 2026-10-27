"use client";

import {
  ArrowUpRight,
  CreditCard,
  ReceiptIndianRupee,
} from "lucide-react";

import {
  useDashboardContext,
} from "@/context/DashboardContext";


function formatCurrency(
  amount: number,
) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(
    amount,
  );

}


function formatDueDate(
  value: string | null,
) {

  if (
    !value
  ) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    },
  ).format(
    new Date(value),
  );

}


export default function PendingPayments() {

  const dashboard =
    useDashboardContext();


  const pendingPayments =
    dashboard.data?.metrics
      .pendingPaymentsData ??
    {
      items: [],
      total_due: 0,
      total_clients: 0,
    };


  return (

    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.04)]">

      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

              <ReceiptIndianRupee
                size={18}
              />

            </div>

            <div>

              <h2 className="font-semibold text-slate-900">

                Pending Payments

              </h2>

              <p className="mt-0.5 text-xs text-slate-500">

                {pendingPayments.total_clients} clients with outstanding balances

              </p>

            </div>

          </div>

        </div>


        <div className="text-right">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">

            Total Due

          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">

            {formatCurrency(
              Number(
                pendingPayments.total_due,
              ),
            )}

          </p>

        </div>

      </div>


      <div className="divide-y divide-slate-100">

        {
          pendingPayments.items.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                <CreditCard
                  size={20}
                />

              </div>

              <p className="mt-4 text-sm font-medium text-slate-900">

                No pending payments

              </p>

              <p className="mt-1 text-xs text-slate-500">

                All tracked payments are up to date.

              </p>

            </div>

          ) : (

            pendingPayments.items.map(
              (
                payment,
              ) => (

                <div
                  key={
                    payment.id
                  }
                  className="group flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">

                      {
                        payment.client_name
                      }

                    </p>


                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">

                      {
                        payment.invoice_number && (

                          <span>

                            Invoice #
                            {
                              payment.invoice_number
                            }

                          </span>

                        )
                      }


                      <span className="h-1 w-1 rounded-full bg-slate-300" />


                      <span>

                        Due
                        {" "}
                        {
                          formatDueDate(
                            payment.due_date,
                          )
                        }

                      </span>

                    </div>

                  </div>


                  <div className="flex items-center gap-3">

                    <div className="text-right">

                      <p className="text-sm font-bold text-slate-900">

                        {
                          formatCurrency(
                            Number(
                              payment.amount_due,
                            ),
                          )
                        }

                      </p>

                    </div>


                    <ArrowUpRight
                      size={16}
                      className="text-slate-300 transition group-hover:text-slate-700"
                    />

                  </div>

                </div>

              ),
            )

          )
        }

      </div>

    </section>

  );

}
