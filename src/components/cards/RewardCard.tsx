import type { RewardTransaction } from "@/lib/types";

export function RewardCard({ reward }: { reward: RewardTransaction }) {
  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[4px_4px_0_rgba(16,42,84,0.1)]">
      <p className="text-sm font-black text-[#102A54]">{reward.reason}</p>
      <p className="mt-2 text-sm font-bold text-[#102A54]/55">{reward.createdAt}</p>
      <p className="mt-4 inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-lg font-black text-[#102A54]">
        +{reward.xpAmount} XP · +{reward.coinAmount} coins
      </p>
    </section>
  );
}
