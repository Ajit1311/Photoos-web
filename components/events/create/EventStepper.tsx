const steps = [
  "Basic",
  "Client",
  "Team",
  "Pricing",
  "Gallery",
  "AI",
  "Review",
];

export default function EventStepper() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => (

          <div
            key={step}
            className="flex flex-1 items-center"
          >

            <div className="flex flex-col items-center">

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold ${
                 index <= 1
                    ? "bg-[#0A3F61] text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {index + 1}
              </div>

              <span className="mt-2 text-xs font-medium">
                {step}
              </span>

            </div>

            {index !== steps.length - 1 && (
              <div className="mx-2 h-1 flex-1 rounded bg-slate-200">
                <div
                  className={`h-full rounded ${
                    index < 1
                      ? "w-full bg-[#0A3F61]"
                      : "w-0"
                  }`}
                />
              </div>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}