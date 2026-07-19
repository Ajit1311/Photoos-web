"use client";

export default function FinanceSnapshotCard() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Finance Snapshot
      </h2>

      <div className="mt-5 space-y-4">

        <div className="flex justify-between">
          <span>Total Budget</span>
          <strong>₹0</strong>
        </div>

        <div className="flex justify-between">
          <span>Received</span>
          <strong className="text-green-600">₹0</strong>
        </div>

        <div className="flex justify-between">
          <span>Balance</span>
          <strong className="text-orange-600">₹0</strong>
        </div>

      </div>
    </div>
  );
}