export function ProgressChart({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-bold text-[#102A54]/75">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#EEF2F5]">
        <div
          className="progress-fill h-full rounded-full bg-gradient-to-r from-[#7BE0C3] via-[#4FB8FF] to-[#FFD95A]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
