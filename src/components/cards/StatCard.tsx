export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
      <p className="inline-flex rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#102A54]/70">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-[#102A54]">{value}</p>
      {helper ? <p className="mt-1 text-sm font-bold text-[#4FB8FF]">{helper}</p> : null}
    </section>
  );
}
