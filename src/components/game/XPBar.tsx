export function XPBar({ xp }: { xp: number }) {
  const progress = xp % 1000;

  return (
    <div>
      <div className="flex justify-between text-sm font-black text-[#102A54]">
        <span>XP</span>
        <span>{progress} / 1000</span>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#FFF7E2]">
        <div
          className="progress-fill h-full rounded-full bg-gradient-to-r from-[#FFD95A] to-[#FF6B57]"
          style={{ width: `${progress / 10}%` }}
        />
      </div>
    </div>
  );
}
