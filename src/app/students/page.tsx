import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getLiveWorkspaceData } from "@/lib/workspace-data";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    redirect("/login?error=Please%20login%20as%20teacher%20or%20admin.");
  }

  const data = await getLiveWorkspaceData(profile);
  const students = data?.students ?? [];
  const averageAttendance = Math.round(
    students.reduce((total, student) => total + student.attendanceRate, 0) /
      Math.max(1, students.length),
  );
  const averageHomework = Math.round(
    students.reduce((total, student) => total + student.homeworkCompletionRate, 0) /
      Math.max(1, students.length),
  );

  return (
    <DashboardShell title="Student Profiles" variant="teacher">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={students.length} />
        <StatCard label="Average attendance" value={`${averageAttendance}%`} />
        <StatCard label="Homework rate" value={`${averageHomework}%`} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {students.map((student) => (
          <section
            key={student.id}
            className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[4px_4px_0_rgba(16,42,84,0.1)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#102A54]">
                  {data?.studentNames[student.userId] ?? student.referralCode}
                </h3>
                <p className="text-sm font-bold text-[#102A54]/60">
                  {student.schoolGrade} · {student.actualLearningLevel} to {student.targetLearningLevel}
                </p>
              </div>
              <div className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
                {student.referralCode}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-black text-[#102A54]">
              <span>{student.starCoins} coins</span>
              <span>{student.totalXP} XP</span>
              <span>{student.attendanceRate}% attendance</span>
              <span>{student.homeworkCompletionRate}% homework</span>
            </div>
          </section>
        ))}
      </div>
      {!students.length ? (
        <section className="mt-5 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 text-[#102A54]">
          <h2 className="text-xl font-black">No live students yet</h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            Ask students to register, then add them by 5-letter code or assign them from Admin Setup.
          </p>
        </section>
      ) : null}
    </DashboardShell>
  );
}
