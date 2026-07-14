import {
  CreditCard,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const payments = [
  {
    client: "Rahul Patil",
    event: "Rahul & Priya Wedding",
    amount: "₹45,000",
    due: "Today",
    priority: "High",
  },
  {
    client: "ABC Industries",
    event: "Corporate Shoot",
    amount: "₹18,000",
    due: "Tomorrow",
    priority: "Medium",
  },
  {
    client: "Sneha Kulkarni",
    event: "Birthday Event",
    amount: "₹12,500",
    due: "2 Days",
    priority: "Low",
  },
  {
    client: "Patil Family",
    event: "Family Photoshoot",
    amount: "₹30,000",
    due: "3 Days",
    priority: "Medium",
  },
];

function badge(priority: string) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-600";

    case "Medium":
      return "bg-orange-100 text-orange-600";

    default:
      return "bg-green-100 text-green-600";
  }
}

export default function PendingPayments() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Pending Payments
          </h2>

          <p className="mt-2 text-slate-500">
            Outstanding client payments requiring attention.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-50">

          View All

          <ChevronRight size={16} />

        </button>

      </div>

      <div className="space-y-4">

        {payments.map((payment) => (

          <div
            key={`${payment.client}-${payment.event}`}
            className="rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:border-[#0A3F61]/20 hover:shadow-md"
          >

            <div className="flex items-start justify-between">

              <div>

                <h3 className="font-semibold text-slate-900">
                  {payment.client}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {payment.event}
                </p>

              </div>

              <span
                className={`rounded-full px-3 py-2 text-xs font-semibold ${badge(
                  payment.priority
                )}`}
              >
                {payment.priority}
              </span>

            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                  <CreditCard size={18} />

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Amount Due
                  </p>

                  <h4 className="font-bold text-slate-900">
                    {payment.amount}
                  </h4>

                </div>

              </div>

              <div className="flex items-center gap-2 text-orange-600">

                <AlertTriangle size={18} />

                <span className="font-medium">
                  {payment.due}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}