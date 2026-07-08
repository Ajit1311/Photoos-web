import { Sparkles } from "lucide-react";

export default function AIQueue() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0A3F61] to-[#155983] p-6 text-white shadow-lg">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-white/70">
            AI Queue
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            32
          </h2>

        </div>

        <Sparkles size={30} />

      </div>

      <div className="mt-6 space-y-3">

        <div className="flex justify-between text-sm">
          <span>Face Recognition</span>
          <span>18</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>OCR</span>
          <span>7</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Gallery AI</span>
          <span>7</span>
        </div>

      </div>

    </div>
  );
}