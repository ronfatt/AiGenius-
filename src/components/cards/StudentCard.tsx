import { users } from "@/lib/mock-data";
import type { StudentProfile } from "@/lib/types";

export function StudentCard({ student }: { student: StudentProfile }) {
  const user = users.find((item) => item.id === student.userId);

  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[4px_4px_0_rgba(16,42,84,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#102A54]">
            {user?.name ?? student.id}
          </h3>
          <p className="text-sm font-bold capitalize text-[#102A54]/60">
            {student.actualLearningLevel} to {student.targetLearningLevel}
          </p>
        </div>
        <div className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
          {student.starCoins} coins
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#EEF2F5]">
        <div
          className="progress-fill h-full rounded-full bg-[#4FB8FF]"
          style={{ width: `${student.homeworkCompletionRate}%` }}
        />
      </div>
    </section>
  );
}
