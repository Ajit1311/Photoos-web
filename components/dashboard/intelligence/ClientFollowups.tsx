const followups = [
  {
    client: "Rahul Patil",
    reason: "Album Approval Pending",
  },
  {
    client: "ABC Industries",
    reason: "Payment Reminder",
  },
  {
    client: "Sneha Kulkarni",
    reason: "Gallery Not Viewed",
  },
];

export default function ClientFollowups() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold">
        Client Follow-ups
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Requires your attention
      </p>

      <div className="mt-6 space-y-4">

        {followups.map((item) => (

          <div
            key={item.client}
            className="rounded-2xl bg-slate-50 p-4"
          >

            <h3 className="font-semibold">
              {item.client}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {item.reason}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}