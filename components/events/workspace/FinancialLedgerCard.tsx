import { IndianRupee, PlusCircle, FileText } from "lucide-react";

interface Props {
  budget: number;
  advancePaid: number;
  remainingAmount: string;

  onAddPayment: () => void;
  onGenerateInvoice: () => void;
}

export default function FinancialLedgerCard({
  budget,
  advancePaid,
  remainingAmount,
  onAddPayment,
  onGenerateInvoice,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
        💰 Financial Ledger
      </h3>

      <div className="space-y-3.5 text-xs">
        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
          <span className="text-slate-500 font-medium">
            Contract Value
          </span>

          <strong className="text-slate-900 text-sm flex items-center gap-1">
            <IndianRupee size={13} />

            {budget.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl">
          <span className="text-emerald-700 font-semibold">
            Total Paid
          </span>

          <strong className="text-emerald-700 text-sm flex items-center gap-1">
            <IndianRupee size={13} />

            {advancePaid.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="flex justify-between items-center bg-rose-50/50 p-2.5 rounded-xl">
          <span className="text-rose-600 font-semibold">
            Outstanding Balance
          </span>

          <strong className="text-rose-700 text-sm flex items-center gap-1">
            <IndianRupee size={13} />

            {remainingAmount}
          </strong>
        </div>
      </div>

      <button
        onClick={onAddPayment}
        className="w-full py-3 bg-[#0A3F61] hover:bg-[#072f49] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 border border-[#0A3F61]"
      >
        <PlusCircle size={15} />

        Record New Payment Entry
      </button>

      <button
        onClick={onGenerateInvoice}
        className="w-full py-3 bg-white text-[#0A3F61] hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 border border-slate-200"
      >
        <FileText size={15} />

        Generate Invoice Summary
      </button>
    </div>
  );
}