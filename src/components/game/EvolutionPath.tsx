export function EvolutionPath({ stage }: { stage: number }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className={`rounded-2xl border-2 border-[#102A54] p-3 text-center text-sm font-black shadow-[3px_3px_0_rgba(16,42,84,0.12)] ${
            item <= stage ? "bg-[#7BE0C3] text-[#102A54]" : "bg-[#EEF2F5] text-[#102A54]/45"
          }`}
        >
          Stage {item + 1}
        </div>
      ))}
    </div>
  );
}
