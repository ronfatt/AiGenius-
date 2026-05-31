import { EnglishTaskPlanner } from "@/components/teacher/EnglishTaskPlanner";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function CreateTeacherTaskPage() {
  return (
    <DashboardShell title="English Task Planner" variant="teacher">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Teacher English planner
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">
          Build a Malaysia-aligned English Quest
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#102A54]/65">
          Choose the school year, CEFR target, English skill domain, weakness
          tag, and difficulty. The quest preview updates instantly for teacher
          review before publishing.
        </p>
      </section>

      <EnglishTaskPlanner />
    </DashboardShell>
  );
}
