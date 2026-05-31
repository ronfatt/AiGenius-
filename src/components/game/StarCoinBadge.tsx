export function StarCoinBadge({ coins }: { coins: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-3 py-2 text-center text-xs font-black text-[#102A54] shadow-[3px_3px_0_#102A54] sm:rounded-full sm:px-4 sm:text-sm">
      {coins} <span className="ml-1 hidden sm:inline">Star</span> Coins
    </span>
  );
}
