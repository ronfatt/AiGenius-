import { RewardCard } from "@/components/cards/RewardCard";
import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { rewardTransactions } from "@/lib/mock-data";

export default function RewardsPage() {
  const xpIssued = rewardTransactions.reduce(
    (total, reward) => total + reward.xpAmount,
    0,
  );
  const coinsIssued = rewardTransactions.reduce(
    (total, reward) => total + reward.coinAmount,
    0,
  );

  return (
    <DashboardShell title="Reward System" variant="teacher">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="XP issued" value={xpIssued} />
        <StatCard label="Coins issued" value={coinsIssued} />
        <StatCard label="Transactions" value={rewardTransactions.length} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {rewardTransactions.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>
    </DashboardShell>
  );
}
