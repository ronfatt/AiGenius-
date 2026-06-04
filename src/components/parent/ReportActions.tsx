"use client";

import { useState } from "react";

export function ReportActions({ summary }: { summary: string[] }) {
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    await navigator.clipboard.writeText(summary.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="print-hidden flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => window.print()}
        className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
      >
        Print / Save PDF
      </button>
      <button
        type="button"
        onClick={copySummary}
        className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-5 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
      >
        {copied ? "Copied" : "Copy parent summary"}
      </button>
    </div>
  );
}
