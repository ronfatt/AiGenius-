import { BattleArena } from "@/components/game/BattleArena";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { battleQuestions, pets, taskSubmissions } from "@/lib/mock-data";

export default function BattlePage() {
  const completedSubmissions = taskSubmissions.filter(
    (submission) => submission.status === "reviewed",
  ).length;
  const classCompletionRate =
    taskSubmissions.length > 0 ? completedSubmissions / taskSubmissions.length : 0;

  return (
    <DashboardShell title="Quiz Battle" immersive>
      <div className="min-h-screen bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 pb-28 pt-4 text-white sm:px-6 lg:p-6 lg:pb-8">
        <BattleArena
          pet={pets[0]}
          questions={battleQuestions}
          classCompletionRate={classCompletionRate}
        />
      </div>
    </DashboardShell>
  );
}
