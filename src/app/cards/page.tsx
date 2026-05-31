import { CardDrawPanel } from "@/components/game/CardDrawPanel";
import { StarCoinBadge } from "@/components/game/StarCoinBadge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cards, students } from "@/lib/mock-data";

export default function CardsPage() {
  return (
    <DashboardShell title="Card Draw System">
      <div className="mb-5 flex justify-end">
        <StarCoinBadge coins={students[0].starCoins} />
      </div>
      <CardDrawPanel cards={cards} />
    </DashboardShell>
  );
}
