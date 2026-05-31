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
    <DashboardShell title="Quiz Battle">
      <BattleArena
        pet={pets[0]}
        questions={battleQuestions}
        classCompletionRate={classCompletionRate}
      />
    </DashboardShell>
  );
}
